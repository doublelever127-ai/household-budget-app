import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppCard } from "../components/AppCard";
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
  findSnapshotByMonth,
  getNetWorth,
  getNetWorthChange,
  getRecentNetWorthSnapshots,
  getTotalAssets,
  getTotalLiabilities,
} from "../utils/assets";
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
  const {
    transactions,
    categories,
    budgets,
    assetAccounts,
    liabilityAccounts,
    netWorthSnapshots,
    selectedMonth,
    setSelectedMonth,
    seedSampleData,
  } = useLedgerStore();
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
    const totalAssets = getTotalAssets(assetAccounts);
    const totalLiabilities = getTotalLiabilities(liabilityAccounts);
    const netWorth = getNetWorth(assetAccounts, liabilityAccounts);
    const currentSnapshot = findSnapshotByMonth(netWorthSnapshots, month);
    const previousSnapshots = getRecentNetWorthSnapshots(netWorthSnapshots).filter(
      (snapshot) => snapshot.month < month,
    );
    const previousSnapshot = previousSnapshots[previousSnapshots.length - 1];
    const netWorthChange = getNetWorthChange(currentSnapshot, previousSnapshot);
    const hasPreviousNetWorthSnapshot = Boolean(currentSnapshot && previousSnapshot);

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
      totalAssets,
      totalLiabilities,
      netWorth,
      currentSnapshot,
      netWorthChange,
      hasPreviousNetWorthSnapshot,
    };
  }, [assetAccounts, budgets, categories, liabilityAccounts, month, netWorthSnapshots, transactions]);

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

  const goToAssets = () => {
    navigation.navigate("Assets");
  };

  const confirmSeedSampleData = () => {
    Alert.alert("샘플 데이터 생성", "현재 데이터를 샘플 데이터로 교체할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "생성",
        onPress: () => {
          void seedSampleData();
        },
      },
    ]);
  };

  const budgetCaption = summary.budget
    ? `${formatCurrency(summary.expense)} / ${formatCurrency(summary.budget.totalBudget)}`
    : "이번 달 예산을 설정해 보세요.";
  const dashboardTone = summary.budget && summary.usage > 100 ? colors.expense : colors.primary;

  return (
    <Screen>
      <MonthSelector month={month} onChange={setSelectedMonth} />

      <AppCard
        accentColor={summary.netWorth >= 0 ? colors.income : colors.expense}
        style={styles.netWorthCard}
      >
        <View style={styles.budgetHeader}>
          <Text style={styles.cardTitle}>내 순자산</Text>
          <Text accessibilityRole="button" onPress={goToAssets} style={styles.linkText}>
            자산 관리
          </Text>
        </View>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          numberOfLines={1}
          style={[styles.netWorthValue, summary.netWorth >= 0 ? styles.incomeText : styles.expenseText]}
        >
          {formatCurrency(summary.netWorth)}
        </Text>
        <View style={styles.dashboardMetricRow}>
          <DashboardMetric
            label="자산"
            tone="income"
            value={formatCurrency(summary.totalAssets)}
          />
          <DashboardMetric
            label="부채"
            tone="expense"
            value={formatCurrency(summary.totalLiabilities)}
          />
        </View>
        <Text style={styles.dashboardCaption}>
          {summary.currentSnapshot
            ? summary.hasPreviousNetWorthSnapshot
              ? `저장된 기준으로 지난달보다 ${formatCurrency(summary.netWorthChange)} 변동`
              : "이번 달 스냅샷은 저장됐습니다. 지난달 기록이 쌓이면 변화를 볼 수 있습니다."
            : "자산 화면에서 이번 달 스냅샷을 저장하면 성장 추이를 볼 수 있습니다."}
        </Text>
      </AppCard>

      <AppCard accentColor={dashboardTone} style={styles.dashboardCard}>
        <Text style={styles.dashboardEyebrow}>이번 달 잔액</Text>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          numberOfLines={1}
          style={[
            styles.dashboardBalance,
            summary.balance >= 0 ? styles.incomeText : styles.expenseText,
          ]}
        >
          {formatCurrency(summary.balance)}
        </Text>
        <View style={styles.dashboardMetricRow}>
          <DashboardMetric label="수입" tone="income" value={formatCurrency(summary.income)} />
          <DashboardMetric label="지출" tone="expense" value={formatCurrency(summary.expense)} />
        </View>
        <View style={styles.dashboardBudgetRow}>
          <Text style={styles.dashboardBudgetLabel}>예산 사용률</Text>
          <Text style={[styles.dashboardBudgetValue, summary.usage > 100 && styles.expenseText]}>
            {formatPercent(summary.usage)}
          </Text>
        </View>
        <ProgressBar value={summary.usage} tone={summary.usage > 100 ? "expense" : "primary"} />
        <Text style={styles.dashboardCaption}>{budgetCaption}</Text>
      </AppCard>

      <View style={styles.quickActionRow}>
        <PrimaryButton
          accessibilityLabel="오늘 거래 기록"
          label="+ 오늘 기록"
          onPress={goToTransactionForm}
          style={styles.quickActionButton}
        />
        <PrimaryButton
          accessibilityLabel="예산 설정"
          label="예산 설정"
          onPress={goToBudget}
          style={styles.quickActionButton}
          variant="secondary"
        />
      </View>

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

      <AppCard style={styles.budgetCard}>
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
      </AppCard>

      <AppCard style={styles.cashFlowCard}>
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
      </AppCard>

      {!transactions.length ? (
        <AppCard style={styles.startGuideCard}>
          <Text style={styles.cardTitle}>처음 시작하기</Text>
          <Text style={styles.startGuideText}>
            첫 거래를 등록하고, 이번 달 예산을 설정하면 사용률과 남은 금액을 바로 확인할 수 있습니다.
          </Text>
          <View style={styles.startGuideButtons}>
            <PrimaryButton label="첫 거래 등록" onPress={goToTransactionForm} />
            <PrimaryButton label="예산 설정" onPress={goToBudget} variant="secondary" />
            <PrimaryButton
              label="샘플 데이터 생성"
              onPress={confirmSeedSampleData}
              variant="ghost"
            />
          </View>
        </AppCard>
      ) : null}

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
          actionLabel="첫 거래 추가"
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

interface DashboardMetricProps {
  label: string;
  value: string;
  tone: "income" | "expense";
}

const DashboardMetric = ({ label, value, tone }: DashboardMetricProps) => (
  <View style={styles.dashboardMetric}>
    <Text style={styles.dashboardMetricLabel}>{label}</Text>
    <Text
      adjustsFontSizeToFit
      minimumFontScale={0.76}
      numberOfLines={1}
      style={[
        styles.dashboardMetricValue,
        tone === "income" ? styles.incomeText : styles.expenseText,
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  dashboardCard: {
    marginBottom: spacing.md,
    paddingLeft: spacing.lg,
  },
  netWorthCard: {
    marginBottom: spacing.md,
    paddingLeft: spacing.lg,
  },
  netWorthValue: {
    fontSize: 32,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  dashboardEyebrow: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "800",
  },
  dashboardBalance: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  dashboardMetricRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dashboardMetric: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.md,
    flex: 1,
    padding: spacing.sm,
  },
  dashboardMetricLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  dashboardMetricValue: {
    fontSize: 16,
    fontWeight: "900",
  },
  dashboardBudgetRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  dashboardBudgetLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  dashboardBudgetValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
  },
  dashboardCaption: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  quickActionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickActionButton: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  budgetCard: {
    marginTop: spacing.sm,
  },
  cashFlowCard: {
    marginTop: spacing.sm,
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
  startGuideCard: {
    marginTop: spacing.sm,
  },
  startGuideText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  startGuideButtons: {
    gap: spacing.sm,
    marginTop: spacing.md,
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
