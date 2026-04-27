import { TransactionType } from "../types";

export const formatCurrency = (amount: number) =>
  `${Math.round(amount).toLocaleString("ko-KR")}원`;

export const formatSignedCurrency = (amount: number, type: TransactionType) =>
  `${type === "income" ? "+" : "-"}${formatCurrency(amount)}`;

export const formatPercent = (value: number) => `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;

const plainIntegerPattern = /^\d+$/;
const commaIntegerPattern = /^\d{1,3}(,\d{3})+$/;
const validAmountPattern = /^(?:\d+|\d{1,3}(?:,\d{3})+)$/;

export const formatAmountInput = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (!plainIntegerPattern.test(trimmed) && !commaIntegerPattern.test(trimmed)) {
    return value;
  }

  return Number(trimmed.replace(/,/g, "")).toLocaleString("ko-KR");
};

export type AmountInputValidationResult =
  | { valid: true; amount: number }
  | { valid: false; error: string };

export const validateAmountInput = (value: string): AmountInputValidationResult => {
  const trimmed = value.trim();

  if (!trimmed) {
    return { valid: false, error: "금액을 입력해 주세요." };
  }

  if (!validAmountPattern.test(trimmed)) {
    return {
      valid: false,
      error: "금액에는 숫자와 천 단위 콤마만 입력할 수 있습니다.",
    };
  }

  const amount = Number(trimmed.replace(/,/g, ""));

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return { valid: false, error: "금액은 0보다 큰 정수로 입력해 주세요." };
  }

  return { valid: true, amount };
};

export const parseAmountInput = (value: string) => {
  const result = validateAmountInput(value);

  return result.valid ? result.amount : undefined;
};
