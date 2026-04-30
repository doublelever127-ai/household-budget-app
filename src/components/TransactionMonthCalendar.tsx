import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { colors, radius, spacing } from "../constants/theme";
import { Transaction } from "../types";
import { toDateInputValue } from "../utils/date";
import { formatCurrency } from "../utils/format";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

interface DailySummary {
  income: number;
  expense: number;
  count: number;
}

interface TransactionMonthCalendarProps {
  month: string;
  onSelectDate: (date: string) => void;
  selectedDate: string;
  transactions: Transaction[];
}

const getCompactAmount = (amount: number) => {
  if (amount >= 10000) {
    const manWon = Math.round((amount / 10000) * 10) / 10;
    const formatted =
      manWon % 1 === 0 ? manWon.toFixed(0) : manWon.toFixed(1);

    return `${formatted}만`;
  }

  return formatCurrency(amount);
};

export const TransactionMonthCalendar = ({
  month,
  onSelectDate,
  selectedDate,
  transactions,
}: TransactionMonthCalendarProps) => {
  const monthDate = useMemo(() => parseISO(`${month}-01T00:00:00.000Z`), [month]);

  const days = useMemo(() => {
    const firstVisibleDay = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
    const lastVisibleDay = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });

    return eachDayOfInterval({ start: firstVisibleDay, end: lastVisibleDay });
  }, [monthDate]);

  const summaryByDate = useMemo(() => {
    const summaries = new Map<string, DailySummary>();

    transactions.forEach((transaction) => {
      const date = toDateInputValue(transaction.date);
      const current = summaries.get(date) ?? { income: 0, expense: 0, count: 0 };

      summaries.set(date, {
        income: current.income + (transaction.type === "income" ? transaction.amount : 0),
        expense: current.expense + (transaction.type === "expense" ? transaction.amount : 0),
        count: current.count + 1,
      });
    });

    return summaries;
  }, [transactions]);

  return (
    <View style={styles.container}>
      <View style={styles.weekRow}>
        {weekdays.map((weekday) => (
          <Text key={weekday} style={styles.weekday}>
            {weekday}
          </Text>
        ))}
      </View>

      <View style={styles.dayGrid}>
        {days.map((day) => {
          const dateValue = format(day, "yyyy-MM-dd");
          const summary = summaryByDate.get(dateValue);
          const isSelected = dateValue === selectedDate;
          const isCurrentMonth = isSameMonth(day, monthDate);

          return (
            <Pressable
              accessibilityLabel={`${format(day, "M월 d일")}${
                summary
                  ? `, 지출 ${formatCurrency(summary.expense)}, 수입 ${formatCurrency(summary.income)}`
                  : ", 거래 없음"
              }${isSelected ? ", 선택됨" : ""}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={dateValue}
              onPress={() => onSelectDate(dateValue)}
              style={[
                styles.dayCell,
                !isCurrentMonth && styles.outsideDayCell,
                isSelected && styles.selectedDayCell,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  !isCurrentMonth && styles.outsideDayText,
                  isSelected && styles.selectedDayText,
                ]}
              >
                {format(day, "d")}
              </Text>
              {summary?.expense ? (
                <Text
                  numberOfLines={1}
                  style={[styles.amountText, styles.expenseText, isSelected && styles.selectedDayText]}
                >
                  -{getCompactAmount(summary.expense)}
                </Text>
              ) : null}
              {summary?.income ? (
                <Text
                  numberOfLines={1}
                  style={[styles.amountText, styles.incomeText, isSelected && styles.selectedDayText]}
                >
                  +{getCompactAmount(summary.income)}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  weekday: {
    color: colors.mutedText,
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: "flex-start",
    minHeight: 72,
    padding: spacing.xs,
    width: "14.2857%",
  },
  outsideDayCell: {
    backgroundColor: colors.surfaceSoft,
    opacity: 0.5,
  },
  selectedDayCell: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    opacity: 1,
  },
  dayNumber: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: spacing.xs,
  },
  outsideDayText: {
    color: colors.subtleText,
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  amountText: {
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 14,
  },
  expenseText: {
    color: colors.expense,
  },
  incomeText: {
    color: colors.income,
  },
});
