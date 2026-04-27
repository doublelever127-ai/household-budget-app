import {
  Budget,
  Category,
  CategoryBudgetUsage,
  CategoryExpenseSummary,
  Transaction,
} from "../types";

const sortTransactionsDesc = (transactions: Transaction[]) =>
  [...transactions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return b.createdAt.localeCompare(a.createdAt);
  });

export const getMonthlyTransactions = (
  transactions: Transaction[],
  month: string,
) => sortTransactionsDesc(transactions.filter((transaction) => transaction.date.startsWith(month)));

export const getMonthlyIncome = (transactions: Transaction[], month: string) =>
  getMonthlyTransactions(transactions, month)
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

export const getMonthlyExpense = (transactions: Transaction[], month: string) =>
  getMonthlyTransactions(transactions, month)
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

export const getMonthlyBalance = (transactions: Transaction[], month: string) =>
  getMonthlyIncome(transactions, month) - getMonthlyExpense(transactions, month);

export const getCategoryExpenseSummary = (
  transactions: Transaction[],
  categories: Category[],
  month: string,
): CategoryExpenseSummary[] => {
  const monthlyExpenses = getMonthlyTransactions(transactions, month).filter(
    (transaction) => transaction.type === "expense",
  );
  const totalExpense = monthlyExpenses.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const totals = new Map<string, number>();

  monthlyExpenses.forEach((transaction) => {
    totals.set(transaction.categoryId, (totals.get(transaction.categoryId) ?? 0) + transaction.amount);
  });

  return [...totals.entries()]
    .map(([categoryId, total]) => {
      const category = categoryMap.get(categoryId);

      return {
        categoryId,
        categoryName: category?.name ?? "삭제된 카테고리",
        total,
        color: category?.color,
        rate: totalExpense > 0 ? Math.round((total / totalExpense) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
};

export const getTopExpenseCategory = (
  transactions: Transaction[],
  categories: Category[],
  month: string,
) => getCategoryExpenseSummary(transactions, categories, month)[0];

export const getBudgetUsage = (expense: number, budget?: number | null) => {
  if (!budget || budget <= 0) {
    return 0;
  }

  return Math.round((expense / budget) * 1000) / 10;
};

export const getBudgetRemaining = (expense: number, budget?: number | null) => {
  if (!budget || budget <= 0) {
    return 0;
  }

  return budget - expense;
};

export const getDailyAvailableBudget = (
  remainingBudget: number,
  remainingDays: number,
) => {
  if (remainingBudget <= 0 || remainingDays <= 0) {
    return 0;
  }

  return Math.floor(remainingBudget / remainingDays);
};

export const getCategoryBudgetUsages = (
  transactions: Transaction[],
  categories: Category[],
  budget: Budget | undefined,
  month: string,
): CategoryBudgetUsage[] => {
  if (!budget?.categoryBudgets?.length) {
    return [];
  }

  const expenseSummary = getCategoryExpenseSummary(transactions, categories, month);
  const expenseMap = new Map(
    expenseSummary.map((item) => [item.categoryId, item.total]),
  );
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  return budget.categoryBudgets
    .filter((item) => item.amount > 0)
    .map((item) => {
      const category = categoryMap.get(item.categoryId);
      const expense = expenseMap.get(item.categoryId) ?? 0;
      const remaining = item.amount - expense;
      const usage = getBudgetUsage(expense, item.amount);

      return {
        categoryId: item.categoryId,
        categoryName: category?.name ?? "삭제된 카테고리",
        color: category?.color,
        budget: item.amount,
        expense,
        remaining,
        usage,
        overBudget: usage > 100,
      };
    })
    .sort((a, b) => b.usage - a.usage);
};

export const getRecentTransactions = (
  transactions: Transaction[],
  limit: number,
) => sortTransactionsDesc(transactions).slice(0, limit);

export const findBudgetByMonth = (budgets: Budget[], month: string) =>
  budgets.find((budget) => budget.month === month);
