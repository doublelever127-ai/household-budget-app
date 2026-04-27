import { subMonths, format } from "date-fns";

import { DEFAULT_CATEGORIES } from "../constants/categories";
import { AssetAccount, Budget, Category, LiabilityAccount, NetWorthSnapshot, Transaction } from "../types";

const makeId = (prefix: string, index: number) => `${prefix}-sample-${index}`;

const toIsoDate = (month: string, day: number) =>
  `${month}-${String(day).padStart(2, "0")}T00:00:00.000Z`;

export const createSampleData = (baseDate = new Date()) => {
  const months = Array.from({ length: 3 }, (_, index) =>
    format(subMonths(baseDate, 2 - index), "yyyy-MM"),
  );
  const now = baseDate.toISOString();

  const transactions: Transaction[] = months.flatMap((month, monthIndex) => [
    {
      id: makeId("income", monthIndex),
      type: "income",
      amount: 3200000 + monthIndex * 120000,
      date: toIsoDate(month, 1),
      categoryId: "income-salary",
      memo: "월급",
      paymentMethod: "주거래 계좌",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("side", monthIndex),
      type: "income",
      amount: 180000 + monthIndex * 30000,
      date: toIsoDate(month, 12),
      categoryId: "income-side",
      memo: "프리랜스 정산",
      paymentMethod: "보조 계좌",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("food", monthIndex),
      type: "expense",
      amount: 420000 + monthIndex * 25000,
      date: toIsoDate(month, 5),
      categoryId: "expense-food",
      memo: "식비와 장보기",
      paymentMethod: "체크카드",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("transport", monthIndex),
      type: "expense",
      amount: 98000 + monthIndex * 4000,
      date: toIsoDate(month, 8),
      categoryId: "expense-transport",
      memo: "대중교통",
      paymentMethod: "교통카드",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("shopping", monthIndex),
      type: "expense",
      amount: 250000 + monthIndex * 50000,
      date: toIsoDate(month, 15),
      categoryId: "expense-shopping",
      memo: "생활용품",
      paymentMethod: "신용카드",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("housing", monthIndex),
      type: "expense",
      amount: 850000,
      date: toIsoDate(month, 20),
      categoryId: "expense-housing",
      memo: "월세",
      paymentMethod: "자동이체",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("culture", monthIndex),
      type: "expense",
      amount: 78000 + monthIndex * 12000,
      date: toIsoDate(month, 24),
      categoryId: "expense-culture",
      memo: "영화와 도서",
      paymentMethod: "신용카드",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("insurance", monthIndex),
      type: "expense",
      amount: 130000,
      date: toIsoDate(month, 10),
      categoryId: "expense-insurance",
      memo: "보험료",
      paymentMethod: "자동이체",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("saving", monthIndex),
      type: "expense",
      amount: 500000,
      date: toIsoDate(month, 2),
      categoryId: "expense-saving",
      memo: "적금",
      paymentMethod: "자동이체",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const budgets: Budget[] = months.map((month, index) => ({
    id: makeId("budget", index),
    month,
    totalBudget: 1800000,
    categoryBudgets: [
      { categoryId: "expense-food", amount: 500000 },
      { categoryId: "expense-transport", amount: 120000 },
      { categoryId: "expense-shopping", amount: 300000 },
      { categoryId: "expense-housing", amount: 900000 },
      { categoryId: "expense-culture", amount: 120000 },
      { categoryId: "expense-insurance", amount: 150000 },
      { categoryId: "expense-saving", amount: 500000 },
    ],
    createdAt: now,
    updatedAt: now,
  }));

  const assetAccounts: AssetAccount[] = [
    {
      id: makeId("asset-bank", 0),
      name: "입출금통장",
      type: "bank",
      balance: 3200000,
      memo: "생활비 계좌",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("asset-saving", 1),
      name: "정기적금",
      type: "savings",
      balance: 9500000,
      memo: "비상금",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("asset-investment", 2),
      name: "투자 계좌",
      type: "investment",
      balance: 7800000,
      memo: "ETF",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("asset-pension", 3),
      name: "연금",
      type: "pension",
      balance: 12000000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("asset-deposit", 4),
      name: "보증금",
      type: "deposit",
      balance: 20000000,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const liabilityAccounts: LiabilityAccount[] = [
    {
      id: makeId("liability-card", 0),
      name: "카드 예정 결제액",
      type: "creditCard",
      balance: 760000,
      memo: "다음 결제일",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("liability-loan", 1),
      name: "전세대출",
      type: "rentDepositLoan",
      balance: 5000000,
      interestRate: 3.6,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const netWorthSnapshots: NetWorthSnapshot[] = months.map((month, index) => {
    const totalAssets = 48500000 + index * 1000000;
    const totalLiabilities = 6400000 - index * 320000;

    return {
      id: makeId("net-worth", index),
      month,
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      createdAt: now,
      updatedAt: now,
    };
  });

  return {
    categories: DEFAULT_CATEGORIES.map((category) => ({ ...category })),
    transactions,
    budgets,
    assetAccounts,
    liabilityAccounts,
    netWorthSnapshots,
  } satisfies {
    categories: Category[];
    transactions: Transaction[];
    budgets: Budget[];
    assetAccounts: AssetAccount[];
    liabilityAccounts: LiabilityAccount[];
    netWorthSnapshots: NetWorthSnapshot[];
  };
};
