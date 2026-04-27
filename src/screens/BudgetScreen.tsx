import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { AppCard } from "../components/AppCard";
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
import {
  buildCategoryBudgetInputs,
  isCategoryBudgetOverTotal,
  validateBudgetAmountInput,
} from "../utils/budget";
import { getRemainingDaysInMonth } from "../utils/date";
import { formatAmountInput, formatCurrency, formatPercent } from "../utils/format";

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
  const totalBudgetValidation = useMemo(
    () => validateBudgetAmountInput(totalBudget, "월간 총예산을 입력해 주세요."),
    [totalBudget],
  );
  const categoryBudgetValidation = useMemo(
    () => buildCategoryBudgetInputs(categoryBudgets),
    [categoryBudgets],
  );
  const categoryBudgetsOverTotal =
    totalBudgetValidation.valid &&
    isCategoryBudgetOverTotal(categoryBudgetValidation.total, totalBudgetValidation.amount);
  const categoryUsageMap = new Map(
    categoryBudgetUsages.map((item) => [item.categoryId, item]),
  );

  useEffect(() => {
    setTotalBudget(budget ? formatAmountInput(String(budget.totalBudget)) : "");
    const nextCategoryBudgets: Record<string, string> = {};
    budget?.categoryBudgets?.forEach((item) => {
      nextCategoryBudgets[item.categoryId] = formatAmountInput(String(item.amount));
    });
    setCategoryBudgets(nextCategoryBudgets);
  }, [budget, month]);

  const saveValidatedBudget = async (
    parsedTotalBudget: number,
    parsedCategoryBudgets: typeof categoryBudgetValidation.items,
  ) => {
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

  const handleSave = async () => {
    const totalResult = validateBudgetAmountInput(totalBudget, "월간 총예산을 입력해 주세요.");
    if (!totalResult.valid) {
      Alert.alert("입력 확인", totalResult.error);
      return;
    }

    const categoryResult = buildCategoryBudgetInputs(categoryBudgets);
    const categoryErrors = Object.entries(categoryResult.errors);

    if (categoryErrors.length) {
      const categoryErrorText = categoryErrors
        .map(([categoryId, error]) => {
          const categoryName =
            categories.find((category) => category.id === categoryId)?.name ?? "카테고리";
          return `${categoryName}: ${error}`;
        })
        .join("\n");

      Alert.alert("입력 확인", categoryErrorText);
      return;
    }

    if (isCategoryBudgetOverTotal(categoryResult.total, totalResult.amount)) {
      Alert.alert(
        "예산 합계 확인",
        "카테고리별 예산 합계가 월간 총예산을 초과했습니다.\n그래도 저장하시겠어요?",
        [
          { text: "취소", style: "cancel" },
          {
            text: "저장",
            onPress: () => {
              void saveValidatedBudget(totalResult.amount, categoryResult.items);
            },
          },
        ],
      );
      return;
    }

    await saveValidatedBudget(totalResult.amount, categoryResult.items);
  };

  const handleTotalBudgetChange = (value: string) => {
    setTotalBudget(formatAmountInput(value));
  };

  const handleCategoryBudgetChange = (categoryId: string, value: string) => {
    setCategoryBudgets((current) => ({
      ...current,
      [categoryId]: formatAmountInput(value),
    }));
  };

  return (
    <Screen>
      <Text style={styles.title}>예산 설정</Text>
      <MonthSelector month={month} onChange={setSelectedMonth} />

      <AppCard style={styles.summaryCard}>
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
      </AppCard>

      <AppCard style={styles.form}>
        <Text style={styles.label}>월간 총예산</Text>
        <TextInput
          accessibilityHint="숫자만 입력하면 천 단위 콤마는 자동으로 표시됩니다."
          accessibilityLabel="월간 총예산"
          keyboardType="number-pad"
          onChangeText={handleTotalBudgetChange}
          placeholder="예: 1800000"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          value={totalBudget}
        />
        <Text style={styles.helperText}>숫자만 입력하면 콤마는 자동으로 붙습니다.</Text>
        {totalBudget && !totalBudgetValidation.valid ? (
          <Text style={styles.errorText}>{totalBudgetValidation.error}</Text>
        ) : null}

        <Text style={styles.sectionTitle}>카테고리별 예산</Text>
        <Text style={styles.helperText}>카테고리별 예산은 선택 사항입니다.</Text>
        {categoryBudgetsOverTotal ? (
          <Text style={styles.warningText}>
            카테고리별 예산 합계가 월간 총예산을 초과했습니다.
          </Text>
        ) : null}
        {expenseCategories.map((category) => {
          const usageItem = categoryUsageMap.get(category.id);
          const categoryError = categoryBudgetValidation.errors[category.id];

          return (
            <View key={category.id} style={styles.categoryBudgetRow}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryDot, { backgroundColor: category.color ?? colors.primary }]} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <TextInput
                  accessibilityLabel={`${category.name} 예산`}
                  keyboardType="number-pad"
                  onChangeText={(value) => handleCategoryBudgetChange(category.id, value)}
                  placeholder="예: 50000"
                  placeholderTextColor={colors.mutedText}
                  style={styles.categoryInput}
                  value={categoryBudgets[category.id] ?? ""}
                />
              </View>
              {categoryError ? <Text style={styles.errorText}>{categoryError}</Text> : null}
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
      </AppCard>
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
    marginBottom: spacing.lg,
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
  errorText: {
    color: colors.expense,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  helperText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  warningText: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
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
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
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
    borderBottomColor: colors.borderSoft,
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
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
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
