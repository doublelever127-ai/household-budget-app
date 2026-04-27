import { describe, expect, it } from "vitest";

import { formatAmountInput, parseAmountInput, validateAmountInput } from "./format";

describe("format utils", () => {
  it("금액 입력값에 천 단위 콤마를 표시한다", () => {
    expect(formatAmountInput("1000")).toBe("1,000");
    expect(formatAmountInput("1,000")).toBe("1,000");
    expect(formatAmountInput("12000")).toBe("12,000");
    expect(formatAmountInput("1,234,567")).toBe("1,234,567");
  });

  it("잘못된 금액 입력은 다른 숫자로 조용히 바꾸지 않는다", () => {
    expect(formatAmountInput("-100")).toBe("-100");
    expect(formatAmountInput("12.5")).toBe("12.5");
    expect(formatAmountInput("100원")).toBe("100원");
    expect(formatAmountInput("abc100")).toBe("abc100");
    expect(formatAmountInput("1e5")).toBe("1e5");
  });

  it("올바른 금액 입력을 숫자로 파싱한다", () => {
    expect(parseAmountInput("1000")).toBe(1000);
    expect(parseAmountInput("1,000")).toBe(1000);
  });

  it("잘못된 금액 입력을 거부한다", () => {
    const invalidInputs = ["-100", "+100", "12.5", "100원", "₩1000", "abc100", "1e5", "", "0"];

    invalidInputs.forEach((input) => {
      expect(validateAmountInput(input).valid).toBe(false);
      expect(parseAmountInput(input)).toBeUndefined();
    });
  });
});
