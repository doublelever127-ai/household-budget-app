import { create } from "zustand";

import { DEFAULT_CATEGORIES } from "../constants/categories";
import { storageService } from "../services/storageService";
import {
  AssetAccount,
  AssetAccountInput,
  Budget,
  BudgetInput,
  Category,
  CategoryInput,
  LiabilityAccount,
  LiabilityAccountInput,
  NetWorthSnapshot,
  Transaction,
  TransactionInput,
} from "../types";
import { getNetWorth, getTotalAssets, getTotalLiabilities } from "../utils/assets";
import { getCurrentMonth } from "../utils/date";
import { createSampleData } from "../utils/sampleData";

export const CATEGORY_DUPLICATE_ERROR = "이미 같은 이름의 카테고리가 있습니다.";

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeOptionalText = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeCategoryName = (name: string) => name.trim().toLocaleLowerCase("ko-KR");

const hasDuplicateCategoryName = (
  categories: Category[],
  input: CategoryInput,
  excludeId?: string,
) => {
  const normalizedName = normalizeCategoryName(input.name);

  return categories.some(
    (category) =>
      category.id !== excludeId &&
      category.type === input.type &&
      normalizeCategoryName(category.name) === normalizedName,
  );
};

const getDeletedDefaultCategoryIds = (
  currentIds: string[],
  category: Category | undefined,
) => {
  if (!category?.isDefault) {
    return currentIds;
  }

  return currentIds.includes(category.id) ? currentIds : [...currentIds, category.id];
};

const removeDeletedDefaultReferences = <T extends { categoryId: string }>(
  items: T[] | undefined,
  deletedDefaultCategoryIds: string[],
) => items?.filter((item) => !deletedDefaultCategoryIds.includes(item.categoryId));

interface LedgerState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  assetAccounts: AssetAccount[];
  liabilityAccounts: LiabilityAccount[];
  netWorthSnapshots: NetWorthSnapshot[];
  deletedDefaultCategoryIds: string[];
  selectedMonth: string;
  isReady: boolean;
  isLoading: boolean;
  error?: string;
  setSelectedMonth: (month: string) => void;
  loadData: () => Promise<void>;
  addTransaction: (input: TransactionInput) => Promise<void>;
  updateTransaction: (id: string, input: TransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (input: CategoryInput) => Promise<void>;
  updateCategory: (id: string, input: CategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveBudget: (input: BudgetInput) => Promise<void>;
  addAssetAccount: (input: AssetAccountInput) => Promise<void>;
  updateAssetAccount: (id: string, input: AssetAccountInput) => Promise<void>;
  deleteAssetAccount: (id: string) => Promise<void>;
  addLiabilityAccount: (input: LiabilityAccountInput) => Promise<void>;
  updateLiabilityAccount: (id: string, input: LiabilityAccountInput) => Promise<void>;
  deleteLiabilityAccount: (id: string) => Promise<void>;
  saveNetWorthSnapshot: (month: string) => Promise<void>;
  resetData: () => Promise<void>;
  seedSampleData: () => Promise<void>;
}

export const useLedgerStore = create<LedgerState>((set, get) => ({
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
  assetAccounts: [],
  liabilityAccounts: [],
  netWorthSnapshots: [],
  deletedDefaultCategoryIds: [],
  selectedMonth: getCurrentMonth(),
  isReady: false,
  isLoading: false,
  error: undefined,

  setSelectedMonth: (selectedMonth) => {
    set({ selectedMonth });
  },

  loadData: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const [
        transactions,
        categories,
        budgets,
        deletedDefaultCategoryIds,
        assetAccounts,
        liabilityAccounts,
        netWorthSnapshots,
      ] = await Promise.all([
        storageService.loadTransactions(),
        storageService.loadCategories(),
        storageService.loadBudgets(),
        storageService.loadDeletedDefaultCategoryIds(),
        storageService.loadAssetAccounts(),
        storageService.loadLiabilityAccounts(),
        storageService.loadNetWorthSnapshots(),
      ]);

      const storedCategories = categories ?? [];
      const storedDeletedDefaultCategoryIds = deletedDefaultCategoryIds ?? [];
      const missingDefaultCategories = DEFAULT_CATEGORIES.filter(
        (defaultCategory) =>
          !storedDeletedDefaultCategoryIds.includes(defaultCategory.id) &&
          !storedCategories.some((category) => category.id === defaultCategory.id),
      );
      const nextCategories = [...storedCategories, ...missingDefaultCategories];
      if (!categories || missingDefaultCategories.length) {
        await storageService.saveCategories(nextCategories);
      }

      set({
        transactions: transactions ?? [],
        categories: nextCategories,
        budgets: budgets ?? [],
        assetAccounts: assetAccounts ?? [],
        liabilityAccounts: liabilityAccounts ?? [],
        netWorthSnapshots: netWorthSnapshots ?? [],
        deletedDefaultCategoryIds: storedDeletedDefaultCategoryIds,
        isReady: true,
        isLoading: false,
      });
    } catch {
      set({
        isReady: true,
        isLoading: false,
        error: "데이터를 불러오지 못했습니다.",
      });
    }
  },

  addTransaction: async (input) => {
    const now = new Date().toISOString();
    const transaction: Transaction = {
      ...input,
      id: createId("transaction"),
      memo: normalizeOptionalText(input.memo),
      paymentMethod: normalizeOptionalText(input.paymentMethod),
      createdAt: now,
      updatedAt: now,
    };
    const transactions = [transaction, ...get().transactions];
    await storageService.saveTransactions(transactions);
    set({ transactions });
  },

  updateTransaction: async (id, input) => {
    const now = new Date().toISOString();
    const transactions = get().transactions.map((transaction) =>
      transaction.id === id
        ? {
            ...transaction,
            ...input,
            memo: normalizeOptionalText(input.memo),
            paymentMethod: normalizeOptionalText(input.paymentMethod),
            updatedAt: now,
          }
        : transaction,
    );
    await storageService.saveTransactions(transactions);
    set({ transactions });
  },

  deleteTransaction: async (id) => {
    const transactions = get().transactions.filter((transaction) => transaction.id !== id);
    await storageService.saveTransactions(transactions);
    set({ transactions });
  },

  addCategory: async (input) => {
    if (hasDuplicateCategoryName(get().categories, input)) {
      throw new Error(CATEGORY_DUPLICATE_ERROR);
    }

    const categoryInput = { ...input, name: input.name.trim() };
    const now = new Date().toISOString();
    const category: Category = {
      ...categoryInput,
      id: createId("category"),
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };
    const categories = [...get().categories, category];
    await storageService.saveCategories(categories);
    set({ categories });
  },

  updateCategory: async (id, input) => {
    if (hasDuplicateCategoryName(get().categories, input, id)) {
      throw new Error(CATEGORY_DUPLICATE_ERROR);
    }

    const categoryInput = { ...input, name: input.name.trim() };
    const now = new Date().toISOString();
    const categories = get().categories.map((category) =>
      category.id === id ? { ...category, ...categoryInput, updatedAt: now } : category,
    );
    await storageService.saveCategories(categories);
    set({ categories });
  },

  deleteCategory: async (id) => {
    const category = get().categories.find((item) => item.id === id);
    const categories = get().categories.filter((category) => category.id !== id);
    const budgets = get().budgets.map((budget) => ({
      ...budget,
      categoryBudgets: budget.categoryBudgets?.filter((item) => item.categoryId !== id),
    }));
    const deletedDefaultCategoryIds = getDeletedDefaultCategoryIds(
      get().deletedDefaultCategoryIds,
      category,
    );
    await Promise.all([
      storageService.saveCategories(categories),
      storageService.saveBudgets(budgets),
      storageService.saveDeletedDefaultCategoryIds(deletedDefaultCategoryIds),
    ]);
    set({ categories, budgets, deletedDefaultCategoryIds });
  },

  saveBudget: async (input) => {
    const now = new Date().toISOString();
    const existing = get().budgets.find((budget) => budget.month === input.month);
    const budget: Budget = existing
      ? { ...existing, ...input, updatedAt: now }
      : {
          ...input,
          id: createId("budget"),
          createdAt: now,
          updatedAt: now,
        };
    const budgets = existing
      ? get().budgets.map((item) => (item.id === budget.id ? budget : item))
      : [...get().budgets, budget];
    await storageService.saveBudgets(budgets);
    set({ budgets });
  },

  addAssetAccount: async (input) => {
    const now = new Date().toISOString();
    const assetAccount: AssetAccount = {
      ...input,
      id: createId("asset"),
      name: input.name.trim(),
      memo: normalizeOptionalText(input.memo),
      createdAt: now,
      updatedAt: now,
    };
    const assetAccounts = [...get().assetAccounts, assetAccount];
    await storageService.saveAssetAccounts(assetAccounts);
    set({ assetAccounts });
  },

  updateAssetAccount: async (id, input) => {
    const now = new Date().toISOString();
    const assetAccounts = get().assetAccounts.map((assetAccount) =>
      assetAccount.id === id
        ? {
            ...assetAccount,
            ...input,
            name: input.name.trim(),
            memo: normalizeOptionalText(input.memo),
            updatedAt: now,
          }
        : assetAccount,
    );
    await storageService.saveAssetAccounts(assetAccounts);
    set({ assetAccounts });
  },

  deleteAssetAccount: async (id) => {
    const assetAccounts = get().assetAccounts.filter((assetAccount) => assetAccount.id !== id);
    await storageService.saveAssetAccounts(assetAccounts);
    set({ assetAccounts });
  },

  addLiabilityAccount: async (input) => {
    const now = new Date().toISOString();
    const liabilityAccount: LiabilityAccount = {
      ...input,
      id: createId("liability"),
      name: input.name.trim(),
      memo: normalizeOptionalText(input.memo),
      createdAt: now,
      updatedAt: now,
    };
    const liabilityAccounts = [...get().liabilityAccounts, liabilityAccount];
    await storageService.saveLiabilityAccounts(liabilityAccounts);
    set({ liabilityAccounts });
  },

  updateLiabilityAccount: async (id, input) => {
    const now = new Date().toISOString();
    const liabilityAccounts = get().liabilityAccounts.map((liabilityAccount) =>
      liabilityAccount.id === id
        ? {
            ...liabilityAccount,
            ...input,
            name: input.name.trim(),
            memo: normalizeOptionalText(input.memo),
            updatedAt: now,
          }
        : liabilityAccount,
    );
    await storageService.saveLiabilityAccounts(liabilityAccounts);
    set({ liabilityAccounts });
  },

  deleteLiabilityAccount: async (id) => {
    const liabilityAccounts = get().liabilityAccounts.filter(
      (liabilityAccount) => liabilityAccount.id !== id,
    );
    await storageService.saveLiabilityAccounts(liabilityAccounts);
    set({ liabilityAccounts });
  },

  saveNetWorthSnapshot: async (month) => {
    const now = new Date().toISOString();
    const { assetAccounts, liabilityAccounts, netWorthSnapshots } = get();
    const existing = netWorthSnapshots.find((snapshot) => snapshot.month === month);
    const snapshot: NetWorthSnapshot = existing
      ? {
          ...existing,
          totalAssets: getTotalAssets(assetAccounts),
          totalLiabilities: getTotalLiabilities(liabilityAccounts),
          netWorth: getNetWorth(assetAccounts, liabilityAccounts),
          updatedAt: now,
        }
      : {
          id: createId("net-worth"),
          month,
          totalAssets: getTotalAssets(assetAccounts),
          totalLiabilities: getTotalLiabilities(liabilityAccounts),
          netWorth: getNetWorth(assetAccounts, liabilityAccounts),
          createdAt: now,
          updatedAt: now,
        };
    const snapshots = existing
      ? netWorthSnapshots.map((item) => (item.id === snapshot.id ? snapshot : item))
      : [...netWorthSnapshots, snapshot];
    await storageService.saveNetWorthSnapshots(snapshots);
    set({ netWorthSnapshots: snapshots });
  },

  resetData: async () => {
    await storageService.clearAll();
    await storageService.saveCategories(DEFAULT_CATEGORIES);
    set({
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      budgets: [],
      assetAccounts: [],
      liabilityAccounts: [],
      netWorthSnapshots: [],
      deletedDefaultCategoryIds: [],
      error: undefined,
      isReady: true,
    });
  },

  seedSampleData: async () => {
    const sampleData = createSampleData();
    const deletedDefaultCategoryIds = get().deletedDefaultCategoryIds;
    const transactions = sampleData.transactions.filter(
      (transaction) => !deletedDefaultCategoryIds.includes(transaction.categoryId),
    );
    const categories = sampleData.categories.filter(
      (category) => !deletedDefaultCategoryIds.includes(category.id),
    );
    const budgets = sampleData.budgets.map((budget) => ({
      ...budget,
      categoryBudgets: removeDeletedDefaultReferences(
        budget.categoryBudgets,
        deletedDefaultCategoryIds,
      ),
    }));
    await Promise.all([
      storageService.saveTransactions(transactions),
      storageService.saveCategories(categories),
      storageService.saveBudgets(budgets),
      storageService.saveAssetAccounts(sampleData.assetAccounts),
      storageService.saveLiabilityAccounts(sampleData.liabilityAccounts),
      storageService.saveNetWorthSnapshots(sampleData.netWorthSnapshots),
    ]);
    set({
      transactions,
      categories,
      budgets,
      assetAccounts: sampleData.assetAccounts,
      liabilityAccounts: sampleData.liabilityAccounts,
      netWorthSnapshots: sampleData.netWorthSnapshots,
      error: undefined,
      isReady: true,
    });
  },
}));
