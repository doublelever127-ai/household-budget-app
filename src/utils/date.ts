import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isValid,
  parseISO,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";

export const getCurrentMonth = () => format(new Date(), "yyyy-MM");

export const getTodayDateInput = (baseDate = new Date()) =>
  format(baseDate, "yyyy-MM-dd");

export const getDefaultTransactionDate = (
  selectedMonth: string,
  baseDate = new Date(),
) => {
  const currentMonth = format(baseDate, "yyyy-MM");

  if (selectedMonth === currentMonth) {
    return getTodayDateInput(baseDate);
  }

  return `${selectedMonth}-01`;
};

export const getMonthStartDateInput = (month: string) => `${month}-01`;

export const formatDateInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const year = digits.slice(0, 4);
  const month = digits.slice(4, 6);
  const day = digits.slice(6, 8);

  return [year, month, day].filter(Boolean).join("-");
};

export const shiftDateInput = (date: string, amount: number) => {
  if (!isValidDateInput(date)) {
    return date;
  }

  return format(addDays(parseISO(fromDateInputValue(date)), amount), "yyyy-MM-dd");
};

export const toMonth = (date: Date | string) => {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, "yyyy-MM");
};

export const shiftMonth = (month: string, amount: number) => {
  const monthDate = parseISO(`${month}-01T00:00:00.000Z`);
  return format(addMonths(monthDate, amount), "yyyy-MM");
};

export const getPreviousMonths = (baseMonth: string, count: number) => {
  const baseDate = parseISO(`${baseMonth}-01T00:00:00.000Z`);
  return Array.from({ length: count }, (_, index) =>
    format(subMonths(baseDate, count - index - 1), "yyyy-MM"),
  );
};

export const getRemainingDaysInMonth = (month: string, baseDate = new Date()) => {
  const monthDate = parseISO(`${month}-01`);
  const currentMonth = format(baseDate, "yyyy-MM");

  if (month < currentMonth) {
    return 0;
  }

  if (month > currentMonth) {
    return endOfMonth(monthDate).getDate();
  }

  return Math.max(differenceInCalendarDays(endOfMonth(baseDate), baseDate) + 1, 0);
};

export const formatKoreanMonth = (month: string) =>
  format(parseISO(`${month}-01T00:00:00.000Z`), "yyyy년 M월", { locale: ko });

export const formatKoreanShortMonth = (month: string) =>
  format(parseISO(`${month}-01T00:00:00.000Z`), "M월", { locale: ko });

export const formatKoreanDate = (date: string) =>
  format(parseISO(date), "M월 d일", { locale: ko });

export const toDateInputValue = (date: string) => {
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, "yyyy-MM-dd") : "";
};

export const fromDateInputValue = (date: string) => `${date}T00:00:00.000Z`;

export const isValidDateInput = (date: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  return isValid(parseISO(fromDateInputValue(date)));
};
