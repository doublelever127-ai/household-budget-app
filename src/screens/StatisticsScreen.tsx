import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "../components/AppCard";
import { EmptyState } from "../components/EmptyState";
import { MonthSelector } from "../components/MonthSelector";
import { Screen } from "../components/Screen";
import { SectionHeader } from "../components/SectionHeader";
import { colors, radius, spacing } from "../constants/theme";
import { useLedgerStore } from "../store/useLedgerStore";
import {
  getCategoryExpenseSummary,
  getMonthlyExpense,
  getMonthlyIncome,
} from "../utils/calculations";
import { formatKoreanShortMonth, getPreviousMonths } from "../utils/date";
import { formatCurrency, formatPercent } from "../utils/format";

export const StatisticsScreen = () => {
  const { transactions, categories, selectedMonth, setSelectedMonth } = useLedgerStore();
  const month = selectedMonth;

  const monthlyComparison = useMemo(() => {
    const months = getPreviousMonths(month, 6);
    return months.map((item) => ({
      month: item,
      income: getMonthlyIncome(transactions, item),
      expense: getMonthlyExpense(transactions, item),
    }));
  }, [month, transactions]);

  const recentTrend = useMemo(() => {
    const months = getPreviousMonths(month, 3);
    return months.map((item) => ({
      month: item,
      expense: getMonthlyExpense(transactions, item),
    }));
  }, [month, transactions]);

  const categorySummary = useMemo(
    () => getCategoryExpenseSummary(transactions, categories, month),
    [categories, month, transactions],
  );

  const maxMonthlyValue = Math.max(
    1,
    ...monthlyComparison.flatMap((item) => [item.income, item.expense]),
  );
  const maxTrendValue = Math.max(1, ...recentTrend.map((item) => item.expense));
  const hasStatisticsData =
    monthlyComparison.some((item) => item.income > 0 || item.expense > 0) ||
    recentTrend.some((item) => item.expense > 0) ||
    categorySummary.length > 0;

  return (
    <Screen>
      <Text style={styles.title}>통계</Text>
      <MonthSelector month={month} onChange={setSelectedMonth} />

      {!hasStatisticsData ? (
        <EmptyState
          icon="📊"
          title="통계로 볼 데이터가 없습니다."
          description="거래를 추가하면 월별 비교와 지출 추이를 확인할 수 있습니다."
        />
      ) : (
        <>

          <SectionHeader title="월별 수입/지출 비교" />
          <AppCard style={styles.card}>
            {monthlyComparison.map((item) => (
              <ComparisonRow
                expense={item.expense}
                income={item.income}
                key={item.month}
                maxValue={maxMonthlyValue}
                monthLabel={formatKoreanShortMonth(item.month)}
              />
            ))}
          </AppCard>

          <SectionHeader title="카테고리별 지출 비중" />
          {categorySummary.length ? (
            <AppCard style={styles.card}>
              {categorySummary.map((item) => (
                <BarRow
                  color={item.color ?? colors.expense}
                  key={item.categoryId}
                  label={item.categoryName}
                  rightText={`${formatCurrency(item.total)} · ${formatPercent(item.rate)}`}
                  value={item.rate}
                />
              ))}
            </AppCard>
          ) : (
            <EmptyState
              icon="🧾"
              title="이번 달 지출 데이터가 없습니다."
              description="거래를 추가하면 카테고리별 비중을 볼 수 있습니다."
            />
          )}

          <SectionHeader title="최근 3개월 지출 추이" />
          <AppCard style={styles.card}>
            {recentTrend.map((item) => (
              <BarRow
                color={colors.expense}
                key={item.month}
                label={formatKoreanShortMonth(item.month)}
                rightText={formatCurrency(item.expense)}
                value={(item.expense / maxTrendValue) * 100}
              />
            ))}
          </AppCard>
        </>
      )}
    </Screen>
  );
};

interface ComparisonRowProps {
  monthLabel: string;
  income: number;
  expense: number;
  maxValue: number;
}

const ComparisonRow = ({ monthLabel, income, expense, maxValue }: ComparisonRowProps) => (
  <View style={styles.comparisonRow}>
    <Text style={styles.monthLabel}>{monthLabel}</Text>
    <View style={styles.comparisonBars}>
      <MiniBar color={colors.income} value={(income / maxValue) * 100} />
      <MiniBar color={colors.expense} value={(expense / maxValue) * 100} />
    </View>
    <View style={styles.amountColumn}>
      <Text style={styles.incomeText}>{formatCurrency(income)}</Text>
      <Text style={styles.expenseText}>{formatCurrency(expense)}</Text>
    </View>
  </View>
);

interface BarRowProps {
  label: string;
  rightText: string;
  value: number;
  color: string;
}

const BarRow = ({ label, rightText, value, color }: BarRowProps) => (
  <View style={styles.barRow}>
    <View style={styles.barHeader}>
      <Text style={styles.barLabel}>{label}</Text>
      <Text style={styles.barValue}>{rightText}</Text>
    </View>
    <View style={styles.track}>
      <View style={[styles.fill, { backgroundColor: color, width: `${Math.min(value, 100)}%` }]} />
    </View>
  </View>
);

interface MiniBarProps {
  value: number;
  color: string;
}

const MiniBar = ({ value, color }: MiniBarProps) => (
  <View style={styles.miniTrack}>
    <View style={[styles.miniFill, { backgroundColor: color, width: `${Math.min(value, 100)}%` }]} />
  </View>
);

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.sm,
  },
  comparisonRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  monthLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    width: 38,
  },
  comparisonBars: {
    flex: 1,
    gap: spacing.xs,
  },
  amountColumn: {
    alignItems: "flex-end",
    width: 96,
  },
  incomeText: {
    color: colors.income,
    fontSize: 12,
    fontWeight: "800",
  },
  expenseText: {
    color: colors.expense,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  miniTrack: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.full,
    height: 10,
    overflow: "hidden",
  },
  miniFill: {
    borderRadius: radius.full,
    height: "100%",
  },
  barRow: {
    marginBottom: spacing.md,
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  barLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  barValue: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
  },
  track: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.full,
    height: 12,
    overflow: "hidden",
  },
  fill: {
    borderRadius: radius.full,
    height: "100%",
  },
});
