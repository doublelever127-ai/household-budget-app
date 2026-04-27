import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { MonthSelector } from "../components/MonthSelector";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { colors, radius, spacing } from "../constants/theme";
import { useLedgerStore } from "../store/useLedgerStore";
import {
  findBudgetByMonth,
  getBudgetRemaining,
  getBudgetUsage,
  getCategoryBudgetUsages,
  getDailyAvailableBudget,
  getMonthlyExpense,
} from "../utils/calculations";
import { getRemainingDaysInMonth } from "../utils/date";
import { formatCurrency, formatPercent } from "../utils/format";

export const BudgetScreen = () => {
  const {
    budgets,
    categories,
    transactions,
    saveBudget,
    selectedMonth,
    setSelectedMonth,
  } = useLedgerStore();
  const month = selectedMonth;
  const [totalBudget, setTotalBudget] = useState("");
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});

  const budget = useMemo(() => findBudgetByMonth(budgets, month), [budgets, month]);
  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories],
  );
  const monthlyExpense = useMemo(
    () => getMonthlyExpense(transactions, month),
    [month, transactions],
  );
  const usage = getBudgetUsage(monthlyExpense, budget?.totalBudget);
  const remainingBudget = getBudgetRemaining(monthlyExpense, budget?.totalBudget);
  const remainingDays = getRemainingDaysInMonth(month);
  const dailyAvailableBudget = getDailyAvailableBudget(remainingBudget, remainingDays);
  const categoryBudgetUsages = useMemo(
    () => getCategoryBudgetUsages(transactions, categories, budget, month),
    [budget, categories, month, transactions],
  );
  const categoryUsageMap = new Map(
    categoryBudgetUsages.map((item) => [item.categoryId, item]),
  );

  useEffect(() => {
    setTotalBudget(budget ? String(budget.totalBudget) : "");
    const nextCategoryBudgets: Record<string, string> = {};
    budget?.categoryBudgets?.forEach((item) => {
      nextCategoryBudgets[item.categoryId] = String(item.amount);
    });
    setCategoryBudgets(nextCategoryBudgets);
  }, [budget, month]);

  const handleSave = async () => {
    const parsedTotalBudget = Number(totalBudget.replace(/,/g, "").trim());
    if (!totalBudget.trim()) {
      Alert.alert("입력 확인", "월간 총예산을 입력해 주세요.");
      return;
    }

    if (!Number.isFinite(parsedTotalBudget) || parsedTotalBudget <= 0) {
      Alert.alert("입력 확인", "월간 총예산은 0보다 큰 숫자로 입력해 주세요.");
      return;
    }

    const parsedCategoryBudgets = Object.entries(categoryBudgets)
      .map(([categoryId, value]) => ({
        categoryId,
        amount: Number(value.replace(/,/g, "").trim()),
      }))
      .filter((item) => Number.isFinite(item.amount) && item.amount > 0);

    try {
      await saveBudget({
        month,
        totalBudget: parsedTotalBudget,
        categoryBudgets: parsedCategoryBudgets,
      });
      Alert.alert("저장 완료", "예산을 저장했습니다.");
    } catch {
      Alert.alert("저장 실패", "예산을 저장하지 못했습니다.");
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>예산 설정</Text>
      <MonthSelector month={month} onChange={setSelectedMonth} />

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>이번 달 예산 사용률</Text>
          <Text style={[styles.usage, usage > 100 && styles.overUsage]}>
            {formatPercent(usage)}
          </Text>
        </View>
        <ProgressBar value={usage} tone={usage > 100 ? "expense" : "primary"} />
        <Text style={styles.caption}>
          {budget
            ? `${formatCurrency(monthlyExpense)} / ${formatCurrency(budget.totalBudget)}`
            : "이번 달 예산을 설정해 보세요."}
        </Text>

        {budget ? (
          <View style={styles.cashFlowGrid}>
            <BudgetMetric
              label="남은 예산"
              tone={remainingBudget >= 0 ? "income" : "expense"}
              value={formatCurrency(remainingBudget)}
            />
            <BudgetMetric label="남은 일수" value={`${remainingDays}일`} />
            <BudgetMetric
              label="하루 가능액"
              tone={dailyAvailableBudget > 0 ? "income" : "expense"}
              value={formatCurrency(dailyAvailableBudget)}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>월간 총예산</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setTotalBudget}
          placeholder="예: 1800000"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          value={totalBudget}
        />

        <Text style={styles.sectionTitle}>카테고리별 예산</Text>
        {expenseCategories.map((category) => {
          const usageItem = categoryUsageMap.get(category.id);

          return (
            <View key={category.id} style={styles.categoryBudgetRow}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryDot, { backgroundColor: category.color ?? colors.primary }]} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={(value) =>
                    setCategoryBudgets((current) => ({ ...current, [category.id]: value }))
                  }
                  placeholder="0"
                  placeholderTextColor={colors.mutedText}
                  style={styles.categoryInput}
                  value={categoryBudgets[category.id] ?? ""}
                />
              </View>
              {usageItem ? (
                <View style={styles.categoryUsage}>
                  <ProgressBar
                    value={usageItem.usage}
                    tone={usageItem.overBudget ? "expense" : "primary"}
                  />
                  <Text style={[styles.categoryUsageText, usageItem.overBudget && styles.overUsage]}>
                    {formatCurrency(usageItem.expense)} / {formatCurrency(usageItem.budget)}
                    {" · "}
                    {formatPercent(usageItem.usage)}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}

        <PrimaryButton label="저장" onPress={handleSave} style={styles.saveButton} />
      </View>
    </Screen>
  );
};

interface BudgetMetricProps {
  label: string;
  value: string;
  tone?: "neutral" | "income" | "expense";
}

const BudgetMetric = ({ label, value, tone = "neutral" }: BudgetMetricProps) => (
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

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  summaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  usage: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "800",
  },
  overUsage: {
    color: colors.expense,
  },
  caption: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  cashFlowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    flexGrow: 1,
    width: "48%",
    minHeight: 72,
    padding: spacing.sm,
  },
  metricLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
  metricValue: {
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
  form: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  categoryBudgetRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  categoryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryInfo: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
  },
  categoryDot: {
    borderRadius: 5,
    height: 10,
    marginRight: spacing.sm,
    width: 10,
  },
  categoryName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  categoryInput: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    minHeight: 42,
    paddingHorizontal: spacing.sm,
    textAlign: "right",
    width: 130,
  },
  categoryUsage: {
    marginTop: spacing.sm,
  },
  categoryUsageText: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
    marginTop: spacing.xs,
    textAlign: "right",
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});
