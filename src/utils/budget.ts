import { BudgetInput } from "../types";
import { validateAmountInput } from "./format";

export type BudgetAmountValidationResult =
  | { valid: true; amount: number }
  | { valid: false; error: string };

export interface CategoryBudgetValidationResult {
  items: NonNullable<BudgetInput["categoryBudgets"]>;
  errors: Record<string, string>;
  total: number;
}

export const validateBudgetAmountInput = (
  value: string,
  emptyMessage = "예산을 입력해 주세요.",
): BudgetAmountValidationResult => {
  const result = validateAmountInput(value);

  if (result.valid) {
    return result;
  }

  if (!value.trim()) {
    return { valid: false, error: emptyMessage };
  }

  if (result.error.includes("숫자와 콤마")) {
    return { valid: false, error: "예산에는 숫자와 콤마만 입력할 수 있습니다." };
  }

  return { valid: false, error: "예산은 0보다 큰 정수로 입력해 주세요." };
};

export const buildCategoryBudgetInputs = (
  values: Record<string, string>,
): CategoryBudgetValidationResult => {
  const items: NonNullable<BudgetInput["categoryBudgets"]> = [];
  const errors: Record<string, string> = {};

  Object.entries(values).forEach(([categoryId, value]) => {
    if (!value.trim()) {
      return;
    }

    const result = validateBudgetAmountInput(value);

    if (result.valid) {
      items.push({ categoryId, amount: result.amount });
      return;
    }

    errors[categoryId] = result.error;
  });

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return { items, errors, total };
};

export const isCategoryBudgetOverTotal = (categoryBudgetTotal: number, totalBudget: number) =>
  categoryBudgetTotal > totalBudget;
