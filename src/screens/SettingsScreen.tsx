import { Alert, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { colors, radius, spacing } from "../constants/theme";
import { useLedgerStore } from "../store/useLedgerStore";

export const SettingsScreen = () => {
  const {
    transactions,
    categories,
    budgets,
    resetData,
    seedSampleData,
  } = useLedgerStore();

  const confirmReset = () => {
    Alert.alert("데이터 초기화", "모든 거래, 카테고리, 예산 데이터를 초기화할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "초기화",
        style: "destructive",
        onPress: () => {
          void resetData();
        },
      },
    ]);
  };

  const confirmSeed = () => {
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

  return (
    <Screen>
      <Text style={styles.title}>설정</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>데이터</Text>
        <View style={styles.statRow}>
          <Text style={styles.label}>거래 내역</Text>
          <Text style={styles.value}>{transactions.length}개</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.label}>카테고리</Text>
          <Text style={styles.value}>{categories.length}개</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.label}>예산</Text>
          <Text style={styles.value}>{budgets.length}개</Text>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <PrimaryButton label="샘플 데이터 생성" onPress={confirmSeed} />
        <PrimaryButton label="데이터 초기화" onPress={confirmReset} variant="danger" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>앱 정보</Text>
        <Text style={styles.description}>
          개인의 월별 수입과 지출, 예산 사용률, 카테고리별 소비 흐름을 확인하는 가계부 MVP입니다.
        </Text>
        <Text style={styles.meta}>React Native · Expo · TypeScript · AsyncStorage · Zustand</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: spacing.md,
  },
  statRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "700",
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  buttonGroup: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  description: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  meta: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.md,
  },
});
