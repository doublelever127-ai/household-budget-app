import { describe, expect, it } from "vitest";

import { Category, Transaction } from "../types";
import {
  getBudgetUsage,
  getBudgetRemaining,
  getCategoryExpenseSummary,
  getCategoryBudgetUsages,
  getDailyAvailableBudget,
  getMonthlyBalance,
  getMonthlyExpense,
  getMonthlyIncome,
  getMonthlyTransactions,
} from "./calculations";

const categories: Category[] = [
  {
    id: "income-salary",
    name: "급여",
    type: "income",
    isDefault: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "expense-food",
    name: "식비",
    type: "expense",
    color: "#F97316",
    isDefault: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "expense-transport",
    name: "교통",
    type: "expense",
    color: "#0EA5E9",
    isDefault: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const transactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    amount: 3000000,
    date: "2026-04-01T00:00:00.000Z",
    categoryId: "income-salary",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "2",
    type: "expense",
    amount: 120000,
    date: "2026-04-03T00:00:00.000Z",
    categoryId: "expense-food",
    createdAt: "2026-04-03T00:00:00.000Z",
    updatedAt: "2026-04-03T00:00:00.000Z",
  },
  {
    id: "3",
    type: "expense",
    amount: 80000,
    date: "2026-04-08T00:00:00.000Z",
    categoryId: "expense-transport",
    createdAt: "2026-04-08T00:00:00.000Z",
    updatedAt: "2026-04-08T00:00:00.000Z",
  },
  {
    id: "4",
    type: "expense",
    amount: 30000,
    date: "2026-03-25T00:00:00.000Z",
    categoryId: "expense-food",
    createdAt: "2026-03-25T00:00:00.000Z",
    updatedAt: "2026-03-25T00:00:00.000Z",
  },
];

describe("calculation utils", () => {
  it("월별 거래를 필터링한다", () => {
    const result = getMonthlyTransactions(transactions, "2026-04");

    expect(result).toHaveLength(3);
    expect(result.map((transaction) => transaction.id)).toEqual(["3", "2", "1"]);
  });

  it("월별 수입 합계를 계산한다", () => {
    expect(getMonthlyIncome(transactions, "2026-04")).toBe(3000000);
  });

  it("월별 지출 합계를 계산한다", () => {
    expect(getMonthlyExpense(transactions, "2026-04")).toBe(200000);
  });

  it("월별 잔액을 계산한다", () => {
    expect(getMonthlyBalance(transactions, "2026-04")).toBe(2800000);
  });

  it("카테고리별 지출 요약을 계산한다", () => {
    const result = getCategoryExpenseSummary(transactions, categories, "2026-04");

    expect(result).toEqual([
      {
        categoryId: "expense-food",
        categoryName: "식비",
        color: "#F97316",
        total: 120000,
        rate: 60,
      },
      {
        categoryId: "expense-transport",
        categoryName: "교통",
        color: "#0EA5E9",
        total: 80000,
        rate: 40,
      },
    ]);
  });

  it("예산 사용률을 계산한다", () => {
    expect(getBudgetUsage(450000, 900000)).toBe(50);
    expect(getBudgetUsage(100000, 0)).toBe(0);
  });

  it("남은 예산과 하루 사용 가능액을 계산한다", () => {
    expect(getBudgetRemaining(200000, 900000)).toBe(700000);
    expect(getBudgetRemaining(950000, 900000)).toBe(-50000);
    expect(getDailyAvailableBudget(700000, 7)).toBe(100000);
    expect(getDailyAvailableBudget(-10000, 7)).toBe(0);
  });

  it("카테고리별 예산 사용률을 계산한다", () => {
    const result = getCategoryBudgetUsages(
      transactions,
      categories,
      {
        id: "budget-1",
        month: "2026-04",
        totalBudget: 500000,
        categoryBudgets: [
          { categoryId: "expense-food", amount: 100000 },
          { categoryId: "expense-transport", amount: 100000 },
        ],
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-01T00:00:00.000Z",
      },
      "2026-04",
    );

    expect(result).toEqual([
      {
        categoryId: "expense-food",
        categoryName: "식비",
        color: "#F97316",
        budget: 100000,
        expense: 120000,
        remaining: -20000,
        usage: 120,
        overBudget: true,
      },
      {
        categoryId: "expense-transport",
        categoryName: "교통",
        color: "#0EA5E9",
        budget: 100000,
        expense: 80000,
        remaining: 20000,
        usage: 80,
        overBudget: false,
      },
    ]);
  });
});
