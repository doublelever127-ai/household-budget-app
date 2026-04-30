import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { CalendarDatePicker } from "../components/CalendarDatePicker";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { SegmentedControl } from "../components/SegmentedControl";
import { colors, radius, spacing } from "../constants/theme";
import { TransactionsStackParamList } from "../navigation/types";
import { useLedgerStore } from "../store/useLedgerStore";
import { Category, TransactionType } from "../types";
import {
  formatDateInput,
  getDefaultTransactionDate,
  getMonthStartDateInput,
  getTodayDateInput,
  shiftDateInput,
  toDateInputValue,
} from "../utils/date";
import { formatAmountInput, validateAmountInput } from "../utils/format";
import { buildTransactionInput } from "../utils/validation";

type TransactionFormProps = NativeStackScreenProps<
  TransactionsStackParamList,
  "TransactionForm"
>;

const typeOptions = [
  { label: "지출", value: "expense" },
  { label: "수입", value: "income" },
] as const;

interface QuickPreset {
  label: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  memo: string;
  paymentMethod: string;
}

const quickPresets: QuickPreset[] = [
  {
    label: "월급",
    type: "income",
    amount: 3200000,
    categoryId: "income-salary",
    memo: "월급",
    paymentMethod: "주거래 계좌",
  },
  {
    label: "부수입",
    type: "income",
    amount: 200000,
    categoryId: "income-side",
    memo: "부수입",
    paymentMethod: "보조 계좌",
  },
  {
    label: "상여금",
    type: "income",
    amount: 500000,
    categoryId: "income-bonus",
    memo: "상여금",
    paymentMethod: "주거래 계좌",
  },
  {
    label: "환급",
    type: "income",
    amount: 80000,
    categoryId: "income-refund",
    memo: "환급",
    paymentMethod: "주거래 계좌",
  },
  {
    label: "점심",
    type: "expense",
    amount: 12000,
    categoryId: "expense-food",
    memo: "점심 식사",
    paymentMethod: "체크카드",
  },
  {
    label: "교통비",
    type: "expense",
    amount: 55000,
    categoryId: "expense-transport",
    memo: "교통비",
    paymentMethod: "교통카드",
  },
  {
    label: "월세/관리비",
    type: "expense",
    amount: 850000,
    categoryId: "expense-housing",
    memo: "월세/관리비",
    paymentMethod: "자동이체",
  },
  {
    label: "통신비",
    type: "expense",
    amount: 69000,
    categoryId: "expense-mobile",
    memo: "통신비",
    paymentMethod: "자동이체",
  },
  {
    label: "보험료",
    type: "expense",
    amount: 130000,
    categoryId: "expense-insurance",
    memo: "보험료",
    paymentMethod: "자동이체",
  },
  {
    label: "적금",
    type: "expense",
    amount: 500000,
    categoryId: "expense-saving",
    memo: "적금",
    paymentMethod: "자동이체",
  },
];

export const TransactionFormScreen = ({ navigation, route }: TransactionFormProps) => {
  const transactionId = route.params?.transactionId;
  const formScrollRef = useRef<ScrollView>(null);
  const {
    transactions,
    categories,
    addTransaction,
    updateTransaction,
    selectedMonth,
  } = useLedgerStore();
  const editingTransaction = transactions.find((transaction) => transaction.id === transactionId);

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => getDefaultTransactionDate(selectedMonth));
  const [categoryId, setCategoryId] = useState("");
  const [memo, setMemo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editingTransaction ? "거래 수정" : "거래 추가" });
  }, [editingTransaction, navigation]);

  useEffect(() => {
    if (!editingTransaction) {
      return;
    }

    setType(editingTransaction.type);
    setAmount(formatAmountInput(String(editingTransaction.amount)));
    setDate(toDateInputValue(editingTransaction.date));
    setCategoryId(editingTransaction.categoryId);
    setMemo(editingTransaction.memo ?? "");
    setPaymentMethod(editingTransaction.paymentMethod ?? "");
  }, [editingTransaction]);

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  );
  const visiblePresets = useMemo(
    () => quickPresets.filter((preset) => preset.type === type),
    [type],
  );
  const amountValidation = useMemo(() => validateAmountInput(amount), [amount]);

  const scrollToLowerFields = () => {
    setTimeout(() => {
      formScrollRef.current?.scrollToEnd({ animated: true });
    }, 250);
  };

  useEffect(() => {
    if (categoryId && !visibleCategories.some((category) => category.id === categoryId)) {
      setCategoryId("");
    }
  }, [categoryId, visibleCategories]);

  const handleAmountChange = (value: string) => {
    setAmount(formatAmountInput(value));
  };

  const handleDateChange = (value: string) => {
    setDate(formatDateInput(value));
  };

  const handleSave = async () => {
    const result = buildTransactionInput({
      type,
      amount,
      date,
      categoryId,
      memo,
      paymentMethod,
    });

    if (result.errors.length || !result.input) {
      Alert.alert("입력 확인", result.errors.join("\n"));
      return;
    }

    setIsSaving(true);
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, result.input);
      } else {
        await addTransaction(result.input);
      }
      navigation.goBack();
    } catch {
      Alert.alert("저장 실패", "거래 내역을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    setAmount("");
    setCategoryId("");
    setMemo("");
    setPaymentMethod("");
  };

  const applyPreset = (preset: QuickPreset) => {
    setType(preset.type);
    setAmount(formatAmountInput(String(preset.amount)));
    setCategoryId(preset.categoryId);
    setMemo(preset.memo);
    setPaymentMethod(preset.paymentMethod);
  };

  return (
    <Screen scrollRef={formScrollRef}>
      <Field label="유형">
        <SegmentedControl
          onChange={handleTypeChange}
          options={[...typeOptions]}
          value={type}
        />
      </Field>

      <Field label="빠른 입력 예시">
        <View style={styles.presetHeader}>
          <Text style={styles.helperText}>
            자주 쓰는 항목 예시입니다. 필요한 경우에만 열어 사용하세요.
          </Text>
          <Pressable
            accessibilityLabel={`빠른 입력 예시 ${isPresetOpen ? "접기" : "열기"}`}
            accessibilityRole="button"
            onPress={() => setIsPresetOpen((current) => !current)}
            style={styles.presetToggle}
          >
            <Text style={styles.presetToggleText}>{isPresetOpen ? "접기" : "열기"}</Text>
          </Pressable>
        </View>
        {isPresetOpen ? (
          <View style={styles.presetGrid}>
            {visiblePresets.map((preset) => (
              <Pressable
                accessibilityRole="button"
                key={preset.label}
                onPress={() => applyPreset(preset)}
                style={styles.presetButton}
              >
                <Text style={styles.presetLabel}>{preset.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </Field>

      <Field label="금액">
        <TextInput
          accessibilityHint="숫자만 입력하면 천 단위 콤마는 자동으로 표시됩니다."
          accessibilityLabel="금액"
          keyboardType="number-pad"
          onChangeText={handleAmountChange}
          placeholder="예: 12000"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          value={amount}
        />
        <Text style={styles.helperText}>숫자만 입력하면 콤마는 자동으로 붙습니다.</Text>
        {amount && !amountValidation.valid ? (
          <Text style={styles.errorText}>{amountValidation.error}</Text>
        ) : null}
      </Field>

      <Field label="날짜">
        <View style={styles.dateInputRow}>
          <TextInput
            accessibilityLabel="날짜"
            autoCapitalize="none"
            keyboardType="number-pad"
            maxLength={10}
            onChangeText={handleDateChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.mutedText}
            style={[styles.input, styles.dateInput]}
            value={date}
          />
          <Pressable
            accessibilityLabel="달력 열기"
            accessibilityRole="button"
            onPress={() => setIsCalendarOpen(true)}
            style={styles.calendarButton}
          >
            <Text style={styles.calendarButtonText}>달력</Text>
          </Pressable>
        </View>
        <View style={styles.dateButtonRow}>
          <DateQuickButton
            label="오늘"
            onPress={() => setDate(getTodayDateInput())}
          />
          <DateQuickButton
            label="선택 월 1일"
            onPress={() => setDate(getMonthStartDateInput(selectedMonth))}
          />
          <DateQuickButton label="전날" onPress={() => setDate(shiftDateInput(date, -1))} />
          <DateQuickButton label="다음 날" onPress={() => setDate(shiftDateInput(date, 1))} />
        </View>
        <CalendarDatePicker
          defaultMonth={selectedMonth}
          onClose={() => setIsCalendarOpen(false)}
          onSelect={setDate}
          value={date}
          visible={isCalendarOpen}
        />
      </Field>

      <Field label="카테고리">
        <View style={styles.categoryGrid}>
          {visibleCategories.map((category) => (
            <CategoryButton
              active={category.id === categoryId}
              category={category}
              key={category.id}
              onPress={() => setCategoryId(category.id)}
            />
          ))}
        </View>
      </Field>

      <Field label="메모">
        <TextInput
          accessibilityLabel="메모"
          onFocus={scrollToLowerFields}
          onChangeText={setMemo}
          placeholder="예: 점심 식사"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          value={memo}
        />
      </Field>

      <Field label="결제수단 또는 계좌명">
        <TextInput
          accessibilityLabel="결제수단 또는 계좌명"
          onFocus={scrollToLowerFields}
          onChangeText={setPaymentMethod}
          placeholder="예: 체크카드, 주거래 계좌"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          value={paymentMethod}
        />
      </Field>

      <PrimaryButton
        label="저장"
        loading={isSaving}
        onPress={handleSave}
        style={styles.saveButton}
      />
    </Screen>
  );
};

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

const Field = ({ label, children }: FieldProps) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

interface DateQuickButtonProps {
  label: string;
  onPress: () => void;
}

const DateQuickButton = ({ label, onPress }: DateQuickButtonProps) => (
  <Pressable accessibilityRole="button" onPress={onPress} style={styles.dateButton}>
    <Text style={styles.dateButtonText}>{label}</Text>
  </Pressable>
);

interface CategoryButtonProps {
  category: Category;
  active: boolean;
  onPress: () => void;
}

const CategoryButton = ({ category, active, onPress }: CategoryButtonProps) => (
  <Pressable
    accessibilityLabel={`${category.name}${active ? ", 선택됨" : ""}`}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    onPress={onPress}
    style={[styles.categoryButton, active && styles.activeCategoryButton]}
  >
    <View style={[styles.categoryDot, { backgroundColor: category.color ?? colors.primary }]} />
    <Text style={[styles.categoryText, active && styles.activeCategoryText]}>
      {category.name}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  dateInputRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  dateInput: {
    flex: 1,
  },
  calendarButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  calendarButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  dateButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dateButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  dateButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  errorText: {
    color: colors.expense,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  helperText: {
    color: colors.mutedText,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  presetHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  presetButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  presetToggle: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  presetToggleText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  presetLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  categoryButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  activeCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryDot: {
    borderRadius: 5,
    height: 10,
    marginRight: spacing.xs,
    width: 10,
  },
  categoryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  activeCategoryText: {
    color: "#FFFFFF",
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
