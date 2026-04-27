import AsyncStorage from "@react-native-async-storage/async-storage";

import { Budget, Category, Transaction } from "../types";

const STORAGE_KEYS = {
  transactions: "ledger.transactions",
  categories: "ledger.categories",
  budgets: "ledger.budgets",
  deletedDefaultCategoryIds: "ledger.deletedDefaultCategoryIds",
};

const loadJson = async <T>(key: string): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
};

const saveJson = async <T>(key: string, data: T) => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
};

export const storageService = {
  loadTransactions: () => loadJson<Transaction[]>(STORAGE_KEYS.transactions),
  saveTransactions: (transactions: Transaction[]) =>
    saveJson(STORAGE_KEYS.transactions, transactions),
  loadCategories: () => loadJson<Category[]>(STORAGE_KEYS.categories),
  saveCategories: (categories: Category[]) => saveJson(STORAGE_KEYS.categories, categories),
  loadBudgets: () => loadJson<Budget[]>(STORAGE_KEYS.budgets),
  saveBudgets: (budgets: Budget[]) => saveJson(STORAGE_KEYS.budgets, budgets),
  loadDeletedDefaultCategoryIds: () =>
    loadJson<string[]>(STORAGE_KEYS.deletedDefaultCategoryIds),
  saveDeletedDefaultCategoryIds: (categoryIds: string[]) =>
    saveJson(STORAGE_KEYS.deletedDefaultCategoryIds, categoryIds),
  clearAll: () => AsyncStorage.multiRemove(Object.values(STORAGE_KEYS)),
};
