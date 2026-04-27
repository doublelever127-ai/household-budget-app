import { TransactionInput, TransactionType } from "../types";
import { fromDateInputValue, isValidDateInput } from "./date";
import { validateAmountInput } from "./format";

export interface TransactionFormValues {
  type: TransactionType;
  amount: string;
  date: string;
  categoryId: string;
  memo?: string;
  paymentMethod?: string;
}

export const buildTransactionInput = (values: TransactionFormValues) => {
  const errors: string[] = [];
  const amountResult = validateAmountInput(values.amount);

  if (values.type !== "income" && values.type !== "expense") {
    errors.push("유형은 수입 또는 지출 중 하나여야 합니다.");
  }

  if (!amountResult.valid) {
    errors.push(amountResult.error);
  }

  if (!values.date.trim()) {
    errors.push("날짜를 입력해 주세요.");
  } else if (!isValidDateInput(values.date.trim())) {
    errors.push("날짜는 YYYY-MM-DD 형식으로 입력해 주세요.");
  }

  if (!values.categoryId) {
    errors.push("카테고리를 선택해 주세요.");
  }

  if (errors.length || !amountResult.valid) {
    return { errors, input: undefined };
  }

  const input: TransactionInput = {
    type: values.type,
    amount: amountResult.amount,
    date: fromDateInputValue(values.date.trim()),
    categoryId: values.categoryId,
    memo: values.memo,
    paymentMethod: values.paymentMethod,
  };

  return { errors, input };
};
