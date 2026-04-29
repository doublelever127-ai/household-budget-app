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
import { TransactionItem } from "../components/TransactionItem";
import { colors, radius, spacing } from "../constants/theme";
import { RootTabParamList } from "../navigation/types";
import { useLedgerStore } from "../store/useLedgerStore";
import {
  findSnapshotByMonth,
  getNetWorth,
  getNetWorthChange,
  getRecentNetWorthSnapshots,
  getSavingsRate,
  getTotalAssets,
  getTotalLiabilities,
} from "../utils/assets";
import {
  findBudgetByMonth,
  getBudgetUsage,
  getMonthlyBalance,
  getMonthlyExpense,
  getMonthlyIncome,
  getMonthlyTransactions,
  getRecentTransactions,
  getTopExpenseCategory,
} from "../utils/calculations";
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
    saveNetWorthSnapshot,
  } = useLedgerStore();
  const month = selectedMonth;

  const summary = useMemo(() => {
    const income = getMonthlyIncome(transactions, month);
    const expense = getMonthlyExpense(transactions, month);
    const balance = getMonthlyBalance(transactions, month);
    const budget = findBudgetByMonth(budgets, month);
    const usage = getBudgetUsage(expense, budget?.totalBudget);
    const topCategory = getTopExpenseCategory(transactions, categories, month);
    const recentTransactions = getRecentTransactions(
      getMonthlyTransactions(transactions, month),
      5,
    );
    const totalAssets = getTotalAssets(assetAccounts);
    const totalLiabilities = getTotalLiabilities(liabilityAccounts);
    const netWorth = getNetWorth(assetAccounts, liabilityAccounts);
    const savingsRate = getSavingsRate(income, expense);
    const currentSnapshot = findSnapshotByMonth(netWorthSnapshots, month);
    const previousSnapshots = getRecentNetWorthSnapshots(netWorthSnapshots).filter(
      (snapshot) => snapshot.month < month,
    );
    const previousSnapshot = previousSnapshots[previousSnapshots.length - 1];
    const netWorthChange = getNetWorthChange(currentSnapshot, previousSnapshot);

    return {
      income,
      expense,
      balance,
      budget,
      usage,
      topCategory,
      recentTransactions,
      totalAssets,
      totalLiabilities,
      netWorth,
      savingsRate,
      currentSnapshot,
      previousSnapshot,
      netWorthChange,
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
    navigation.navigate("More", { screen: "Budget" });
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

  const confirmSnapshotSave = () => {
    Alert.alert("순자산 스냅샷 저장", `${month} 기준 순자산을 저장할까요?`, [
      { text: "취소", style: "cancel" },
      {
        text: "저장",
        onPress: () => {
          void saveNetWorthSnapshot(month);
        },
      },
    ]);
  };

  const balanceSentence =
    summary.balance >= 0
      ? `이번 달은 아직 ${formatCurrency(summary.balance)} 남았습니다.`
      : `이번 달은 지출이 수입보다 ${formatCurrency(Math.abs(summary.balance))} 많습니다.`;
  const budgetSentence = summary.budget
    ? `예산의 ${formatPercent(summary.usage)}를 사용했습니다.`
    : "예산을 설정하면 이번 달 사용률을 바로 볼 수 있습니다.";
  const netWorthSentence = summary.currentSnapshot
    ? summary.previousSnapshot
      ? `저장된 기준으로 지난달보다 ${formatCurrency(summary.netWorthChange)} 변동했습니다.`
      : "이번 달 순자산 스냅샷은 저장됐습니다. 다음 달부터 비교할 수 있습니다."
    : "순자산 스냅샷을 저장하면 지난달과 비교할 수 있습니다.";
  const categorySentence = summary.topCategory
    ? `이번 달 가장 많이 쓴 카테고리는 ${summary.topCategory.categoryName}입니다.`
    : "아직 이번 달 지출 카테고리 데이터가 없습니다.";
  const needsStartGuide =
    transactions.length === 0 || assetAccounts.length === 0 || netWorthSnapshots.length === 0;

  return (
    <Screen>
      <MonthSelector month={month} onChange={setSelectedMonth} />
      <FriendlyNote />

      <AppCard
        accentColor={summary.balance >= 0 ? colors.income : colors.expense}
        style={styles.heroCard}
      >
        <Text style={styles.eyebrow}>이번 달 돈 상태</Text>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          numberOfLines={1}
          style={[styles.heroValue, summary.balance >= 0 ? styles.incomeText : styles.expenseText]}
        >
          {formatCurrency(summary.balance)}
        </Text>
        <Text style={styles.heroSentence}>{balanceSentence}</Text>

        <View style={styles.metricGrid}>
          <Metric label="순자산" tone={summary.netWorth >= 0 ? "income" : "expense"} value={formatCurrency(summary.netWorth)} />
          <Metric label="수입" tone="income" value={formatCurrency(summary.income)} />
          <Metric label="지출" tone="expense" value={formatCurrency(summary.expense)} />
          <Metric label="저축률" value={formatPercent(summary.savingsRate)} />
        </View>

        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>예산 사용률</Text>
          <Text style={[styles.progressValue, summary.usage > 100 && styles.expenseText]}>
            {formatPercent(summary.usage)}
          </Text>
        </View>
        <ProgressBar value={summary.usage} tone={summary.usage > 100 ? "expense" : "primary"} />
        <Text style={styles.caption}>{budgetSentence}</Text>
      </AppCard>

      <AppCard style={styles.actionCard}>
        <Text style={styles.cardTitle}>오늘의 추천 행동</Text>
        <Text style={styles.caption}>{netWorthSentence}</Text>
        <View style={styles.actionGrid}>
          <PrimaryButton label="+ 오늘 기록" onPress={goToTransactionForm} style={styles.actionButton} />
          <PrimaryButton label="예산 설정" onPress={goToBudget} style={styles.actionButton} variant="secondary" />
          <PrimaryButton label="자산 입력" onPress={goToAssets} style={styles.actionButton} variant="secondary" />
          <PrimaryButton
            label="스냅샷 저장"
            onPress={confirmSnapshotSave}
            style={styles.actionButton}
            variant="ghost"
          />
        </View>
      </AppCard>

      <AppCard style={summary.usage > 100 ? styles.alertCard : styles.insightCard}>
        <Text style={styles.cardTitle}>이번 달 해석</Text>
        <Text style={styles.insightText}>{categorySentence}</Text>
        <Text style={styles.insightText}>
          {summary.usage > 100
            ? "예산을 초과했습니다. 기록 화면에서 큰 지출을 먼저 확인해 보세요."
            : budgetSentence}
        </Text>
      </AppCard>

      {needsStartGuide ? (
        <AppCard style={styles.startGuideCard}>
          <Text style={styles.cardTitle}>처음 시작하기</Text>
          <Text style={styles.startGuideText}>
            처음 시작하려면 첫 거래를 등록하고, 예산과 자산을 입력해 보세요. 앱을 먼저
            둘러보고 싶다면 샘플 데이터를 생성할 수 있습니다.
          </Text>
          <View style={styles.startGuideButtons}>
            <PrimaryButton label="첫 거래 추가" onPress={goToTransactionForm} />
            <PrimaryButton label="예산 설정" onPress={goToBudget} variant="secondary" />
            <PrimaryButton label="자산 입력" onPress={goToAssets} variant="secondary" />
            <PrimaryButton
              label="샘플 데이터 생성"
              onPress={confirmSeedSampleData}
              variant="ghost"
            />
          </View>
        </AppCard>
      ) : null}

      <SectionHeader action="전체 보기" onActionPress={goToTransactions} title="최근 기록" />
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
          description="오늘 쓴 돈이나 받은 돈을 먼저 기록해 보세요."
          onActionPress={goToTransactionForm}
          title="아직 등록된 거래가 없습니다."
        />
      )}
    </Screen>
  );
};

interface MetricProps {
  label: string;
  value: string;
  tone?: "neutral" | "income" | "expense";
}

const Metric = ({ label, value, tone = "neutral" }: MetricProps) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text
      adjustsFontSizeToFit
      minimumFontScale={0.72}
      numberOfLines={1}
      style={[
        styles.metricValue,
        tone === "income" && styles.incomeText,
        tone === "expense" && styles.expenseText,
      ]}
    >
      {value}
    </Text>
  </View>
);

const FriendlyNote = () => (
  <View style={styles.friendlyNote}>
    <View style={styles.friendlyIconBubble}>
      <Text style={styles.friendlyIcon}>✨</Text>
    </View>
    <View style={styles.friendlyTextBox}>
      <Text style={styles.friendlyTitle}>오늘도 돈 흐름을 살짝 정리해봐요</Text>
      <Text style={styles.friendlyDescription}>
        작은 기록이 쌓이면 이번 달 자산 흐름이 더 선명해져요.
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  friendlyNote: {
    alignItems: "center",
    backgroundColor: colors.playfulSoft,
    borderColor: colors.warningSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  friendlyIconBubble: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  friendlyIcon: {
    fontSize: 22,
  },
  friendlyTextBox: {
    flex: 1,
  },
  friendlyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  friendlyDescription: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  heroCard: {
    marginBottom: spacing.md,
    paddingLeft: spacing.lg,
  },
  eyebrow: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "800",
  },
  heroValue: {
    fontSize: 36,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  heroSentence: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.md,
    flexGrow: 1,
    minHeight: 68,
    padding: spacing.sm,
    width: "48%",
  },
  metricLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "800",
  },
  metricValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  progressLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  progressValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
  },
  actionCard: {
    marginBottom: spacing.md,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flexGrow: 1,
    minWidth: "45%",
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  caption: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  insightCard: {
    marginBottom: spacing.md,
  },
  alertCard: {
    borderColor: colors.expense,
    marginBottom: spacing.md,
  },
  insightText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  startGuideCard: {
    marginBottom: spacing.md,
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
  incomeText: {
    color: colors.income,
  },
  expenseText: {
    color: colors.expense,
  },
});
