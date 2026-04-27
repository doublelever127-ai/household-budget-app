import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { EmptyState } from "../components/EmptyState";
import { MonthSelector } from "../components/MonthSelector";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { SectionHeader } from "../components/SectionHeader";
import { StatCard } from "../components/StatCard";
import { TransactionItem } from "../components/TransactionItem";
import { colors, radius, spacing } from "../constants/theme";
import { RootTabParamList } from "../navigation/types";
import { useLedgerStore } from "../store/useLedgerStore";
import {
  findBudgetByMonth,
  getBudgetRemaining,
  getBudgetUsage,
  getDailyAvailableBudget,
  getMonthlyBalance,
  getMonthlyExpense,
  getMonthlyIncome,
  getMonthlyTransactions,
  getRecentTransactions,
  getTopExpenseCategory,
} from "../utils/calculations";
import { getRemainingDaysInMonth } from "../utils/date";
import { formatCurrency, formatPercent } from "../utils/format";

type HomeNavigation = BottomTabNavigationProp<RootTabParamList, "Home">;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeNavigation>();
  const { transactions, categories, budgets, selectedMonth, setSelectedMonth } =
    useLedgerStore();
  const month = selectedMonth;

  const summary = useMemo(() => {
    const income = getMonthlyIncome(transactions, month);
    const expense = getMonthlyExpense(transactions, month);
    const balance = getMonthlyBalance(transactions, month);
    const budget = findBudgetByMonth(budgets, month);
    const usage = getBudgetUsage(expense, budget?.totalBudget);
    const remainingBudget = getBudgetRemaining(expense, budget?.totalBudget);
    const remainingDays = getRemainingDaysInMonth(month);
    const dailyAvailableBudget = getDailyAvailableBudget(remainingBudget, remainingDays);
    const topCategory = getTopExpenseCategory(transactions, categories, month);
    const recentTransactions = getRecentTransactions(
      getMonthlyTransactions(transactions, month),
      5,
    );

    return {
      income,
      expense,
      balance,
      budget,
      usage,
      remainingBudget,
      remainingDays,
      dailyAvailableBudget,
      topCategory,
      recentTransactions,
    };
  }, [budgets, categories, month, transactions]);

  const goToTransactionForm = () => {
    navigation.navigate("TransactionsTab", {
      screen: "TransactionForm",
      params: {},
    });
  };

  const goToTransactions = () => {
    navigation.navigate("TransactionsTab", { screen: "TransactionList" });
  };

  const goToBudget = () => {
    navigation.navigate("Budget");
  };

  const budgetCaption = summary.budget
    ? `${formatCurrency(summary.expense)} / ${formatCurrency(summary.budget.totalBudget)}`
    : "이번 달 예산을 설정해 보세요.";

  return (
    <Screen>
      <MonthSelector month={month} onChange={setSelectedMonth} />

      <View style={styles.grid}>
        <StatCard title="총수입" value={formatCurrency(summary.income)} tone="income" />
        <StatCard title="총지출" value={formatCurrency(summary.expense)} tone="expense" />
      </View>
      <View style={styles.grid}>
        <StatCard
          caption={summary.balance >= 0 ? "흑자 흐름입니다." : "지출 점검이 필요합니다."}
          title="잔액"
          tone={summary.balance >= 0 ? "income" : "expense"}
          value={formatCurrency(summary.balance)}
        />
        <StatCard
          caption={summary.topCategory ? `${summary.topCategory.categoryName} 지출이 가장 큽니다.` : "아직 지출이 없습니다."}
          title="최다 지출 카테고리"
          tone="warning"
          value={summary.topCategory ? formatCurrency(summary.topCategory.total) : "-"}
        />
      </View>

      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <Text style={styles.cardTitle}>예산 사용률</Text>
          <Text style={[styles.usage, summary.usage > 100 && styles.overBudget]}>
            {formatPercent(summary.usage)}
          </Text>
        </View>
        <ProgressBar value={summary.usage} tone={summary.usage > 100 ? "expense" : "primary"} />
        <Text style={styles.caption}>{budgetCaption}</Text>
        {summary.budget && summary.usage > 100 ? (
          <Text style={styles.warning}>예산을 초과했습니다. 이번 달 지출을 확인해 주세요.</Text>
        ) : null}
      </View>

      <View style={styles.cashFlowCard}>
        <View style={styles.budgetHeader}>
          <Text style={styles.cardTitle}>월말까지 사용 가능액</Text>
          {!summary.budget ? (
            <Text accessibilityRole="button" onPress={goToBudget} style={styles.linkText}>
              예산 설정
            </Text>
          ) : null}
        </View>
        {summary.budget ? (
          <View style={styles.cashFlowGrid}>
            <CashFlowItem
              label="남은 예산"
              tone={summary.remainingBudget >= 0 ? "income" : "expense"}
              value={formatCurrency(summary.remainingBudget)}
            />
            <CashFlowItem label="남은 일수" value={`${summary.remainingDays}일`} />
            <CashFlowItem
              label="하루 가능액"
              tone={summary.dailyAvailableBudget > 0 ? "income" : "expense"}
              value={formatCurrency(summary.dailyAvailableBudget)}
            />
          </View>
        ) : (
          <Text style={styles.caption}>
            예산을 설정하면 월말까지 하루에 얼마를 써도 되는지 계산합니다.
          </Text>
        )}
      </View>

      <SectionHeader action="전체 보기" onActionPress={goToTransactions} title="최근 거래 내역" />
      {summary.recentTransactions.length ? (
        summary.recentTransactions.map((transaction) => (
          <TransactionItem
            categories={categories}
            key={transaction.id}
            transaction={transaction}
            onEdit={() =>
              navigation.navigate("TransactionsTab", {
                screen: "TransactionForm",
                params: { transactionId: transaction.id },
              })
            }
          />
        ))
      ) : (
        <EmptyState
          actionLabel="거래 추가"
          description="첫 거래를 추가해 보세요."
          onActionPress={goToTransactionForm}
          title="아직 등록된 거래가 없습니다."
        />
      )}

      {summary.recentTransactions.length ? (
        <PrimaryButton label="거래 추가" onPress={goToTransactionForm} style={styles.addButton} />
      ) : null}
    </Screen>
  );
};

interface CashFlowItemProps {
  label: string;
  value: string;
  tone?: "neutral" | "income" | "expense";
}

const CashFlowItem = ({ label, value, tone = "neutral" }: CashFlowItemProps) => (
  <View style={styles.cashFlowItem}>
    <Text style={styles.cashFlowLabel}>{label}</Text>
    <Text
      adjustsFontSizeToFit
      minimumFontScale={0.72}
      numberOfLines={1}
      style={[
        styles.cashFlowValue,
        tone === "income" && styles.incomeText,
        tone === "expense" && styles.expenseText,
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  budgetCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  cashFlowCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  budgetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  usage: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "800",
  },
  overBudget: {
    color: colors.expense,
  },
  caption: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  warning: {
    color: colors.expense,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  cashFlowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  cashFlowItem: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    flexGrow: 1,
    width: "48%",
    minHeight: 72,
    padding: spacing.sm,
  },
  cashFlowLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
  cashFlowValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  incomeText: {
    color: colors.income,
  },
  expenseText: {
    color: colors.expense,
  },
  addButton: {
    marginTop: spacing.lg,
  },
});
