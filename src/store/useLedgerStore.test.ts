import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_CATEGORIES } from "../constants/categories";
import { Budget, Category, Transaction } from "../types";
import {
  CATEGORY_DUPLICATE_ERROR,
  useLedgerStore,
} from "./useLedgerStore";

const storageMocks = vi.hoisted(() => ({
  loadTransactions: vi.fn<() => Promise<Transaction[] | null>>(),
  saveTransactions: vi.fn<(transactions: Transaction[]) => Promise<void>>(),
  loadCategories: vi.fn<() => Promise<Category[] | null>>(),
  saveCategories: vi.fn<(categories: Category[]) => Promise<void>>(),
  loadBudgets: vi.fn<() => Promise<Budget[] | null>>(),
  saveBudgets: vi.fn<(budgets: Budget[]) => Promise<void>>(),
  loadDeletedDefaultCategoryIds: vi.fn<() => Promise<string[] | null>>(),
  saveDeletedDefaultCategoryIds: vi.fn<(categoryIds: string[]) => Promise<void>>(),
  clearAll: vi.fn<() => Promise<void>>(),
}));

vi.mock("../services/storageService", () => ({
  storageService: storageMocks,
}));

const resetStore = () => {
  useLedgerStore.setState({
    transactions: [],
    categories: DEFAULT_CATEGORIES,
    budgets: [],
    deletedDefaultCategoryIds: [],
    selectedMonth: "2026-04",
    isReady: false,
    isLoading: false,
    error: undefined,
  });
};

describe("ledger store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMocks.loadTransactions.mockResolvedValue(null);
    storageMocks.loadCategories.mockResolvedValue(null);
    storageMocks.loadBudgets.mockResolvedValue(null);
    storageMocks.loadDeletedDefaultCategoryIds.mockResolvedValue(null);
    storageMocks.saveTransactions.mockResolvedValue();
    storageMocks.saveCategories.mockResolvedValue();
    storageMocks.saveBudgets.mockResolvedValue();
    storageMocks.saveDeletedDefaultCategoryIds.mockResolvedValue();
    storageMocks.clearAll.mockResolvedValue();
    resetStore();
  });

  it("선택 월을 전역 상태로 변경한다", () => {
    useLedgerStore.getState().setSelectedMonth("2026-03");

    expect(useLedgerStore.getState().selectedMonth).toBe("2026-03");
  });

  it("같은 타입의 중복 카테고리 추가를 막는다", async () => {
    await expect(
      useLedgerStore
        .getState()
        .addCategory({ name: " 식비 ", type: "expense", color: "#000000" }),
    ).rejects.toThrow(CATEGORY_DUPLICATE_ERROR);

    expect(storageMocks.saveCategories).not.toHaveBeenCalled();
    expect(
      useLedgerStore
        .getState()
        .categories.filter(
          (category) => category.type === "expense" && category.name === "식비",
        ),
    ).toHaveLength(1);
  });

  it("다른 타입의 같은 카테고리 이름은 허용한다", async () => {
    await useLedgerStore
      .getState()
      .addCategory({ name: " 식비 ", type: "income", color: "#000000" });

    expect(
      useLedgerStore
        .getState()
        .categories.some(
          (category) => category.type === "income" && category.name === "식비",
        ),
    ).toBe(true);
    expect(storageMocks.saveCategories).toHaveBeenCalledOnce();
  });

  it("카테고리 수정 시 다른 카테고리와 이름이 겹치면 저장하지 않는다", async () => {
    await expect(
      useLedgerStore
        .getState()
        .updateCategory("expense-transport", {
          name: "식비",
          type: "expense",
          color: "#000000",
        }),
    ).rejects.toThrow(CATEGORY_DUPLICATE_ERROR);

    expect(storageMocks.saveCategories).not.toHaveBeenCalled();
  });

  it("카테고리 수정 시 자기 자신의 이름은 그대로 저장할 수 있다", async () => {
    await useLedgerStore
      .getState()
      .updateCategory("expense-food", {
        name: " 식비 ",
        type: "expense",
        color: "#F97316",
      });

    const category = useLedgerStore
      .getState()
      .categories.find((item) => item.id === "expense-food");

    expect(category?.name).toBe("식비");
    expect(storageMocks.saveCategories).toHaveBeenCalledOnce();
  });

  it("삭제된 기본 카테고리 id를 저장한다", async () => {
    await useLedgerStore.getState().deleteCategory("expense-food");

    expect(useLedgerStore.getState().deletedDefaultCategoryIds).toContain("expense-food");
    expect(storageMocks.saveDeletedDefaultCategoryIds).toHaveBeenCalledWith([
      "expense-food",
    ]);
  });

  it("load 이후 삭제된 기본 카테고리를 재생성하지 않는다", async () => {
    storageMocks.loadCategories.mockResolvedValue(
      DEFAULT_CATEGORIES.filter((category) => category.id !== "expense-food"),
    );
    storageMocks.loadDeletedDefaultCategoryIds.mockResolvedValue(["expense-food"]);

    await useLedgerStore.getState().loadData();

    expect(useLedgerStore.getState().deletedDefaultCategoryIds).toEqual([
      "expense-food",
    ]);
    expect(
      useLedgerStore
        .getState()
        .categories.some((category) => category.id === "expense-food"),
    ).toBe(false);
  });
});
