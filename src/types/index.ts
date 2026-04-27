export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  categoryId: string;
  memo?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  date: string;
  categoryId: string;
  memo?: string;
  paymentMethod?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
}

export interface BudgetCategoryAmount {
  categoryId: string;
  amount: number;
}

export interface Budget {
  id: string;
  month: string;
  totalBudget: number;
  categoryBudgets?: BudgetCategoryAmount[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetInput {
  month: string;
  totalBudget: number;
  categoryBudgets?: BudgetCategoryAmount[];
}

export interface CategoryExpenseSummary {
  categoryId: string;
  categoryName: string;
  total: number;
  color?: string;
  rate: number;
}

export interface CategoryBudgetUsage {
  categoryId: string;
  categoryName: string;
  color?: string;
  budget: number;
  expense: number;
  remaining: number;
  usage: number;
  overBudget: boolean;
}

export type TransactionFilterType = "all" | TransactionType;
