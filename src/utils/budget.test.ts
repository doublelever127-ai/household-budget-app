import { describe, expect, it } from "vitest";

import {
  buildCategoryBudgetInputs,
  isCategoryBudgetOverTotal,
  validateBudgetAmountInput,
} from "./budget";

describe("budget utils", () => {
  it("예산 입력값을 양의 정수로 검증한다", () => {
    expect(validateBudgetAmountInput("1000")).toEqual({ valid: true, amount: 1000 });
    expect(validateBudgetAmountInput("1,000")).toEqual({ valid: true, amount: 1000 });
  });

  it("잘못된 예산 입력을 거부한다", () => {
    const invalidInputs = ["-100", "12.5", "100원", "₩1000", "abc100", "1e5", "0", ""];

    invalidInputs.forEach((input) => {
      expect(validateBudgetAmountInput(input).valid).toBe(false);
    });
  });

  it("카테고리별 예산의 잘못된 입력을 조용히 삭제하지 않고 오류로 반환한다", () => {
    const result = buildCategoryBudgetInputs({
      "expense-food": "1000",
      "expense-shopping": "12.5",
      "expense-transport": "",
    });

    expect(result.items).toEqual([{ categoryId: "expense-food", amount: 1000 }]);
    expect(result.errors["expense-shopping"]).toBeTruthy();
    expect(result.errors["expense-transport"]).toBeUndefined();
  });

  it("카테고리별 예산 합계가 총예산을 초과하는지 계산한다", () => {
    expect(isCategoryBudgetOverTotal(120000, 100000)).toBe(true);
    expect(isCategoryBudgetOverTotal(90000, 100000)).toBe(false);
  });
});
