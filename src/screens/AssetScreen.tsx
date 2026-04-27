import { ReactNode, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppCard } from "../components/AppCard";
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { SectionHeader } from "../components/SectionHeader";
import { colors, radius, spacing } from "../constants/theme";
import { useLedgerStore } from "../store/useLedgerStore";
import { AssetAccount, AssetType, LiabilityAccount, LiabilityType } from "../types";
import {
  findSnapshotByMonth,
  getLiquidAssets,
  getNetWorth,
  getNetWorthChange,
  getRecentNetWorthSnapshots,
  getSavingsRate,
  getTotalAssets,
  getTotalLiabilities,
} from "../utils/assets";
import { getMonthlyExpense, getMonthlyIncome } from "../utils/calculations";
import {
  AmountInputValidationResult,
  formatAmountInput,
  formatCurrency,
  formatPercent,
  validateAmountInput,
} from "../utils/format";

const assetTypeLabels: Record<AssetType, string> = {
  cash: "현금",
  bank: "입출금통장",
  savings: "예금/적금",
  investment: "투자",
  pension: "연금",
  deposit: "보증금",
  realEstate: "부동산",
  other: "기타",
};

const liabilityTypeLabels: Record<LiabilityType, string> = {
  creditCard: "카드 예정액",
  loan: "대출",
  mortgage: "주택담보대출",
  rentDepositLoan: "전세대출",
  studentLoan: "학자금대출",
  minusAccount: "마이너스통장",
  other: "기타",
};

const assetTypeOptions = Object.entries(assetTypeLabels) as [AssetType, string][];
const liabilityTypeOptions = Object.entries(liabilityTypeLabels) as [LiabilityType, string][];

const validateAssetAmountInput = (
  value: string,
  emptyMessage: string,
): AmountInputValidationResult => {
  const result = validateAmountInput(value);

  if (result.valid) {
    return result;
  }

  if (!value.trim()) {
    return { valid: false, error: emptyMessage };
  }

  return result;
};

export const AssetScreen = () => {
  const {
    transactions,
    selectedMonth,
    assetAccounts,
    liabilityAccounts,
    netWorthSnapshots,
    addAssetAccount,
    updateAssetAccount,
    deleteAssetAccount,
    addLiabilityAccount,
    updateLiabilityAccount,
    deleteLiabilityAccount,
    saveNetWorthSnapshot,
  } = useLedgerStore();

  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("bank");
  const [assetBalance, setAssetBalance] = useState("");
  const [assetMemo, setAssetMemo] = useState("");
  const [editingAssetId, setEditingAssetId] = useState<string | undefined>();
  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);

  const [liabilityName, setLiabilityName] = useState("");
  const [liabilityType, setLiabilityType] = useState<LiabilityType>("creditCard");
  const [liabilityBalance, setLiabilityBalance] = useState("");
  const [liabilityInterestRate, setLiabilityInterestRate] = useState("");
  const [liabilityMemo, setLiabilityMemo] = useState("");
  const [editingLiabilityId, setEditingLiabilityId] = useState<string | undefined>();
  const [isLiabilityFormOpen, setIsLiabilityFormOpen] = useState(false);

  const totalAssets = useMemo(() => getTotalAssets(assetAccounts), [assetAccounts]);
  const totalLiabilities = useMemo(
    () => getTotalLiabilities(liabilityAccounts),
    [liabilityAccounts],
  );
  const netWorth = useMemo(
    () => getNetWorth(assetAccounts, liabilityAccounts),
    [assetAccounts, liabilityAccounts],
  );
  const monthlyIncome = useMemo(
    () => getMonthlyIncome(transactions, selectedMonth),
    [selectedMonth, transactions],
  );
  const monthlyExpense = useMemo(
    () => getMonthlyExpense(transactions, selectedMonth),
    [selectedMonth, transactions],
  );
  const savingsRate = getSavingsRate(monthlyIncome, monthlyExpense);
  const liquidAssets = getLiquidAssets(assetAccounts);
  const currentSnapshot = findSnapshotByMonth(netWorthSnapshots, selectedMonth);
  const previousSnapshots = getRecentNetWorthSnapshots(netWorthSnapshots).filter(
    (snapshot) => snapshot.month < selectedMonth,
  );
  const previousSnapshot = previousSnapshots[previousSnapshots.length - 1];
  const netWorthChange = getNetWorthChange(currentSnapshot, previousSnapshot);
  const hasPreviousSnapshot = Boolean(currentSnapshot && previousSnapshot);
  const recentSnapshots = getRecentNetWorthSnapshots(netWorthSnapshots, 12);
  const maxSnapshotValue = Math.max(
    1,
    ...recentSnapshots.map((snapshot) => Math.abs(snapshot.netWorth)),
  );

  const resetAssetForm = () => {
    setAssetName("");
    setAssetType("bank");
    setAssetBalance("");
    setAssetMemo("");
    setEditingAssetId(undefined);
    setIsAssetFormOpen(false);
  };

  const resetLiabilityForm = () => {
    setLiabilityName("");
    setLiabilityType("creditCard");
    setLiabilityBalance("");
    setLiabilityInterestRate("");
    setLiabilityMemo("");
    setEditingLiabilityId(undefined);
    setIsLiabilityFormOpen(false);
  };

  const handleAssetSave = async () => {
    const balanceResult = validateAssetAmountInput(assetBalance, "자산 금액을 입력해 주세요.");
    if (!assetName.trim()) {
      Alert.alert("입력 확인", "자산 이름을 입력해 주세요.");
      return;
    }
    if (!balanceResult.valid) {
      Alert.alert("입력 확인", balanceResult.error);
      return;
    }

    const input = {
      name: assetName,
      type: assetType,
      balance: balanceResult.amount,
      memo: assetMemo,
    };

    try {
      if (editingAssetId) {
        await updateAssetAccount(editingAssetId, input);
      } else {
        await addAssetAccount(input);
      }
      resetAssetForm();
    } catch {
      Alert.alert("저장 실패", "자산 정보를 저장하지 못했습니다.");
    }
  };

  const handleLiabilitySave = async () => {
    const balanceResult = validateAssetAmountInput(
      liabilityBalance,
      "부채 잔액을 입력해 주세요.",
    );
    if (!liabilityName.trim()) {
      Alert.alert("입력 확인", "부채 이름을 입력해 주세요.");
      return;
    }
    if (!balanceResult.valid) {
      Alert.alert("입력 확인", balanceResult.error);
      return;
    }

    const parsedInterestRate = liabilityInterestRate.trim()
      ? Number(liabilityInterestRate.trim())
      : undefined;
    if (
      parsedInterestRate !== undefined &&
      (!Number.isFinite(parsedInterestRate) || parsedInterestRate < 0)
    ) {
      Alert.alert("입력 확인", "금리는 0 이상의 숫자로 입력해 주세요.");
      return;
    }

    const input = {
      name: liabilityName,
      type: liabilityType,
      balance: balanceResult.amount,
      interestRate: parsedInterestRate,
      memo: liabilityMemo,
    };

    try {
      if (editingLiabilityId) {
        await updateLiabilityAccount(editingLiabilityId, input);
      } else {
        await addLiabilityAccount(input);
      }
      resetLiabilityForm();
    } catch {
      Alert.alert("저장 실패", "부채 정보를 저장하지 못했습니다.");
    }
  };

  const handleSnapshotSave = () => {
    Alert.alert(
      "순자산 스냅샷 저장",
      `${selectedMonth} 기준 순자산을 저장할까요?\n같은 월 기록이 있으면 현재 값으로 업데이트됩니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "저장",
          onPress: () => {
            void saveNetWorthSnapshot(selectedMonth);
          },
        },
      ],
    );
  };

  const confirmDeleteAsset = (account: AssetAccount) => {
    Alert.alert("자산 삭제", `${account.name} 자산을 삭제할까요?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          void deleteAssetAccount(account.id);
        },
      },
    ]);
  };

  const confirmDeleteLiability = (account: LiabilityAccount) => {
    Alert.alert("부채 삭제", `${account.name} 부채를 삭제할까요?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          void deleteLiabilityAccount(account.id);
        },
      },
    ]);
  };

  const editAsset = (account: AssetAccount) => {
    setEditingAssetId(account.id);
    setAssetName(account.name);
    setAssetType(account.type);
    setAssetBalance(formatAmountInput(String(account.balance)));
    setAssetMemo(account.memo ?? "");
    setIsAssetFormOpen(true);
  };

  const editLiability = (account: LiabilityAccount) => {
    setEditingLiabilityId(account.id);
    setLiabilityName(account.name);
    setLiabilityType(account.type);
    setLiabilityBalance(formatAmountInput(String(account.balance)));
    setLiabilityInterestRate(account.interestRate?.toString() ?? "");
    setLiabilityMemo(account.memo ?? "");
    setIsLiabilityFormOpen(true);
  };

  return (
    <Screen>
      <Text style={styles.title}>자산</Text>

      <AppCard accentColor={netWorth >= 0 ? colors.income : colors.expense} style={styles.summaryCard}>
        <Text style={styles.eyebrow}>내 순자산</Text>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          numberOfLines={1}
          style={[styles.netWorth, netWorth >= 0 ? styles.incomeText : styles.expenseText]}
        >
          {formatCurrency(netWorth)}
        </Text>
        <View style={styles.summaryGrid}>
          <SummaryMetric label="총자산" tone="income" value={formatCurrency(totalAssets)} />
          <SummaryMetric label="총부채" tone="expense" value={formatCurrency(totalLiabilities)} />
          <SummaryMetric label="이번 달 저축률" value={formatPercent(savingsRate)} />
          <SummaryMetric label="현금성 자산" value={formatCurrency(liquidAssets)} />
        </View>
        {currentSnapshot ? (
          <Text style={[styles.changeText, netWorthChange >= 0 ? styles.incomeText : styles.expenseText]}>
            {hasPreviousSnapshot
              ? `저장된 기준으로 지난달보다 ${formatCurrency(netWorthChange)} 변동`
              : "이번 달 스냅샷이 저장됐습니다. 다음 달부터 변화 추이를 비교할 수 있습니다."}
          </Text>
        ) : (
          <Text style={styles.caption}>
            한 달에 한 번 스냅샷을 저장하면 순자산이 커지는 흐름을 볼 수 있습니다.
          </Text>
        )}
        <PrimaryButton
          label="이번 달 순자산 저장"
          onPress={handleSnapshotSave}
          style={styles.snapshotButton}
        />
      </AppCard>

      <SectionHeader title="최근 순자산 추이" />
      <AppCard>
        {recentSnapshots.length ? (
          recentSnapshots.map((snapshot) => (
            <SnapshotRow
              key={snapshot.id}
              maxValue={maxSnapshotValue}
              month={snapshot.month}
              value={snapshot.netWorth}
            />
          ))
        ) : (
          <Text style={styles.caption}>스냅샷을 저장하면 월별 순자산 추이가 여기에 표시됩니다.</Text>
        )}
      </AppCard>

      <AppCard style={styles.entryCard}>
        <Text style={styles.cardTitle}>자산 정보 입력</Text>
        <Text style={styles.caption}>
          자산과 부채를 입력하면 순자산과 현금성 자산을 더 정확하게 볼 수 있습니다.
        </Text>
        <View style={styles.entryButtonRow}>
          <PrimaryButton
            label={isAssetFormOpen ? "자산 입력 접기" : "+ 자산 추가"}
            onPress={() => {
              if (isAssetFormOpen) {
                resetAssetForm();
              } else {
                setIsAssetFormOpen(true);
              }
            }}
            style={styles.entryButton}
          />
          <PrimaryButton
            label={isLiabilityFormOpen ? "부채 입력 접기" : "+ 부채 추가"}
            onPress={() => {
              if (isLiabilityFormOpen) {
                resetLiabilityForm();
              } else {
                setIsLiabilityFormOpen(true);
              }
            }}
            style={styles.entryButton}
            variant="secondary"
          />
        </View>
      </AppCard>

      {isAssetFormOpen ? (
        <>
          <SectionHeader title={editingAssetId ? "자산 수정" : "자산 추가"} />
          <AppCard>
            <AccountForm
              amount={assetBalance}
              amountLabel="자산 금액"
              amountPlaceholder="금액 예: 1000000"
              memo={assetMemo}
              memoLabel="자산 메모"
              name={assetName}
              nameLabel="자산 이름"
              namePlaceholder="이름 예: 입출금통장"
              onAmountChange={(value) => setAssetBalance(formatAmountInput(value))}
              onCancel={resetAssetForm}
              onMemoChange={setAssetMemo}
              onNameChange={setAssetName}
              onSave={handleAssetSave}
              saveLabel={editingAssetId ? "자산 수정" : "자산 추가"}
              typeLabelPrefix="자산 유형"
              typeOptions={assetTypeOptions}
              selectedType={assetType}
              onTypeChange={setAssetType}
            />
          </AppCard>
        </>
      ) : null}

      <SectionHeader title="자산 목록" />
      {assetAccounts.length ? (
        assetAccounts.map((account) => (
          <AccountItem
            key={account.id}
            amount={account.balance}
            memo={account.memo}
            name={account.name}
            onDelete={() => confirmDeleteAsset(account)}
            onEdit={() => editAsset(account)}
            tone="income"
            typeLabel={assetTypeLabels[account.type]}
          />
        ))
      ) : (
        <EmptyState
          icon="💰"
          title="등록된 자산이 없습니다."
          description="입출금통장, 적금, 투자 자산 등을 직접 입력해 보세요."
          actionLabel="자산 입력하기"
          onActionPress={() => setIsAssetFormOpen(true)}
        />
      )}

      {isLiabilityFormOpen ? (
        <>
          <SectionHeader title={editingLiabilityId ? "부채 수정" : "부채 추가"} />
          <AppCard>
            <AccountForm
              amount={liabilityBalance}
              amountLabel="부채 잔액"
              amountPlaceholder="잔액 예: 500000"
              extraInput={
                <TextInput
                  accessibilityLabel="금리"
                  keyboardType="decimal-pad"
                  onChangeText={setLiabilityInterestRate}
                  placeholder="금리 선택 입력 예: 3.5"
                  placeholderTextColor={colors.mutedText}
                  style={styles.input}
                  value={liabilityInterestRate}
                />
              }
              memo={liabilityMemo}
              memoLabel="부채 메모"
              name={liabilityName}
              nameLabel="부채 이름"
              namePlaceholder="이름 예: 카드 예정 결제액"
              onAmountChange={(value) => setLiabilityBalance(formatAmountInput(value))}
              onCancel={resetLiabilityForm}
              onMemoChange={setLiabilityMemo}
              onNameChange={setLiabilityName}
              onSave={handleLiabilitySave}
              saveLabel={editingLiabilityId ? "부채 수정" : "부채 추가"}
              typeLabelPrefix="부채 유형"
              typeOptions={liabilityTypeOptions}
              selectedType={liabilityType}
              onTypeChange={setLiabilityType}
            />
          </AppCard>
        </>
      ) : null}

      <SectionHeader title="부채 목록" />
      {liabilityAccounts.length ? (
        liabilityAccounts.map((account) => (
          <AccountItem
            key={account.id}
            amount={account.balance}
            memo={account.memo}
            name={account.name}
            onDelete={() => confirmDeleteLiability(account)}
            onEdit={() => editLiability(account)}
            tone="expense"
            typeLabel={liabilityTypeLabels[account.type]}
          />
        ))
      ) : (
        <EmptyState
          icon="🧾"
          title="등록된 부채가 없습니다."
          description="카드 예정 결제액, 대출 잔액 등을 입력하면 순자산을 더 정확히 볼 수 있습니다."
          actionLabel="부채 입력하기"
          onActionPress={() => setIsLiabilityFormOpen(true)}
        />
      )}
    </Screen>
  );
};

interface SummaryMetricProps {
  label: string;
  value: string;
  tone?: "income" | "expense" | "neutral";
}

const SummaryMetric = ({ label, value, tone = "neutral" }: SummaryMetricProps) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text
      adjustsFontSizeToFit
      minimumFontScale={0.75}
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

interface AccountFormProps<T extends string> {
  name: string;
  selectedType: T;
  amount: string;
  memo: string;
  nameLabel: string;
  namePlaceholder: string;
  amountLabel: string;
  amountPlaceholder: string;
  memoLabel: string;
  typeLabelPrefix: string;
  typeOptions: [T, string][];
  saveLabel: string;
  extraInput?: ReactNode;
  onNameChange: (value: string) => void;
  onTypeChange: (value: T) => void;
  onAmountChange: (value: string) => void;
  onMemoChange: (value: string) => void;
  onSave: () => void;
  onCancel?: () => void;
}

const AccountForm = <T extends string>({
  name,
  selectedType,
  amount,
  memo,
  nameLabel,
  namePlaceholder,
  amountLabel,
  amountPlaceholder,
  memoLabel,
  typeLabelPrefix,
  typeOptions,
  saveLabel,
  extraInput,
  onNameChange,
  onTypeChange,
  onAmountChange,
  onMemoChange,
  onSave,
  onCancel,
}: AccountFormProps<T>) => (
  <View style={styles.form}>
    <TextInput
      accessibilityLabel={nameLabel}
      onChangeText={onNameChange}
      placeholder={namePlaceholder}
      placeholderTextColor={colors.mutedText}
      style={styles.input}
      value={name}
    />
    <View style={styles.chipGrid}>
      {typeOptions.map(([value, label]) => {
        const active = selectedType === value;
        return (
          <Pressable
            accessibilityLabel={`${typeLabelPrefix} ${label}${active ? ", 선택됨" : ""}`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={value}
            onPress={() => onTypeChange(value)}
            style={[styles.typeChip, active && styles.activeTypeChip]}
          >
            <Text style={[styles.typeChipText, active && styles.activeTypeChipText]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
    <TextInput
      accessibilityHint="숫자만 입력하면 천 단위 콤마는 자동으로 표시됩니다."
      accessibilityLabel={amountLabel}
      keyboardType="number-pad"
      onChangeText={onAmountChange}
      placeholder={amountPlaceholder}
      placeholderTextColor={colors.mutedText}
      style={styles.input}
      value={amount}
    />
    {extraInput}
    <TextInput
      accessibilityLabel={memoLabel}
      onChangeText={onMemoChange}
      placeholder="메모 선택 입력"
      placeholderTextColor={colors.mutedText}
      style={styles.input}
      value={memo}
    />
    <View style={styles.formButtonRow}>
      {onCancel ? (
        <PrimaryButton label="취소" onPress={onCancel} style={styles.formButton} variant="ghost" />
      ) : null}
      <PrimaryButton label={saveLabel} onPress={onSave} style={styles.formButton} />
    </View>
  </View>
);

interface AccountItemProps {
  name: string;
  typeLabel: string;
  amount: number;
  tone: "income" | "expense";
  memo?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const AccountItem = ({
  name,
  typeLabel,
  amount,
  tone,
  memo,
  onEdit,
  onDelete,
}: AccountItemProps) => (
  <AppCard style={styles.accountCard}>
    <View style={styles.accountHeader}>
      <View style={styles.accountText}>
        <Text numberOfLines={1} style={styles.accountName}>{name}</Text>
        <Text numberOfLines={1} style={styles.accountMeta}>
          {typeLabel}
          {memo ? ` · ${memo}` : ""}
        </Text>
      </View>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        numberOfLines={1}
        style={[styles.accountAmount, tone === "income" ? styles.incomeText : styles.expenseText]}
      >
        {formatCurrency(amount)}
      </Text>
    </View>
    <View style={styles.accountActions}>
      <PrimaryButton
        accessibilityLabel={`${name} 수정`}
        label="수정"
        onPress={onEdit}
        style={styles.smallButton}
        variant="ghost"
      />
      <PrimaryButton
        accessibilityLabel={`${name} 삭제`}
        label="삭제"
        onPress={onDelete}
        style={styles.smallButton}
        variant="danger"
      />
    </View>
  </AppCard>
);

interface SnapshotRowProps {
  month: string;
  value: number;
  maxValue: number;
}

const SnapshotRow = ({ month, value, maxValue }: SnapshotRowProps) => (
  <View style={styles.snapshotRow}>
    <View style={styles.snapshotHeader}>
      <Text style={styles.snapshotMonth}>{month}</Text>
      <Text style={[styles.snapshotValue, value >= 0 ? styles.incomeText : styles.expenseText]}>
        {formatCurrency(value)}
      </Text>
    </View>
    <ProgressBar value={(Math.abs(value) / maxValue) * 100} tone={value >= 0 ? "income" : "expense"} />
  </View>
);

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: spacing.lg,
  },
  summaryCard: {
    paddingLeft: spacing.lg,
  },
  eyebrow: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "800",
  },
  netWorth: {
    fontSize: 34,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.md,
    flexGrow: 1,
    minHeight: 72,
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
  caption: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  changeText: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: spacing.sm,
  },
  snapshotButton: {
    marginTop: spacing.md,
  },
  entryCard: {
    marginTop: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  entryButtonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  entryButton: {
    flex: 1,
  },
  form: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  typeChip: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  activeTypeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "800",
  },
  activeTypeChipText: {
    color: "#FFFFFF",
  },
  formButtonRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  formButton: {
    flex: 1,
  },
  accountCard: {
    marginBottom: spacing.sm,
  },
  accountHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  accountText: {
    flex: 1,
  },
  accountName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  accountMeta: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  accountAmount: {
    fontSize: 16,
    fontWeight: "900",
    maxWidth: 150,
    textAlign: "right",
  },
  accountActions: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "flex-end",
    marginTop: spacing.sm,
  },
  smallButton: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  snapshotRow: {
    marginBottom: spacing.md,
  },
  snapshotHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  snapshotMonth: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  snapshotValue: {
    fontSize: 13,
    fontWeight: "900",
  },
  incomeText: {
    color: colors.income,
  },
  expenseText: {
    color: colors.expense,
  },
});
