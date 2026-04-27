import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard } from "../components/AppCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { colors, radius, spacing } from "../constants/theme";
import { MoreStackParamList } from "../navigation/types";
import { useLedgerStore } from "../store/useLedgerStore";

type MoreScreenProps = NativeStackScreenProps<MoreStackParamList, "MoreHome">;

export const MoreScreen = ({ navigation }: MoreScreenProps) => {
  const {
    transactions,
    categories,
    budgets,
    assetAccounts,
    liabilityAccounts,
    seedSampleData,
    resetData,
  } = useLedgerStore();

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

  const confirmReset = () => {
    Alert.alert(
      "데이터 초기화",
      "저장된 거래, 예산, 카테고리, 자산 데이터를 초기화합니다. 계속할까요?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "초기화",
          style: "destructive",
          onPress: () => {
            void resetData();
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <Text style={styles.title}>더보기</Text>

      <AppCard style={styles.card}>
        <Text style={styles.cardTitle}>관리 메뉴</Text>
        <MenuItem
          description="월간 총예산과 카테고리별 예산을 설정합니다."
          icon="💰"
          label="예산 설정"
          onPress={() => navigation.navigate("Budget")}
        />
        <MenuItem
          description="수입/지출 카테고리를 추가하거나 수정합니다."
          icon="🏷"
          label="카테고리 관리"
          onPress={() => navigation.navigate("Categories")}
        />
        <MenuItem
          description="앱 정보와 현재 데이터 개수를 확인합니다."
          icon="ℹ️"
          label="앱 정보"
          onPress={() => navigation.navigate("Settings")}
        />
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.cardTitle}>현재 데이터</Text>
        <DataRow label="거래" value={`${transactions.length}개`} />
        <DataRow label="카테고리" value={`${categories.length}개`} />
        <DataRow label="예산" value={`${budgets.length}개`} />
        <DataRow label="자산" value={`${assetAccounts.length}개`} />
        <DataRow label="부채" value={`${liabilityAccounts.length}개`} />
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.cardTitle}>테스트와 초기화</Text>
        <Text style={styles.description}>
          앱을 먼저 둘러보고 싶다면 샘플 데이터를 생성해 보세요. 데이터 초기화는 복구할 수
          없으니 필요한 경우에만 사용하세요.
        </Text>
        <View style={styles.buttonGroup}>
          <PrimaryButton label="샘플 데이터 생성" onPress={confirmSeed} />
          <PrimaryButton label="데이터 초기화" onPress={confirmReset} variant="danger" />
        </View>
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.cardTitle}>데이터 관련 주의사항</Text>
        <Text style={styles.description}>
          이 앱은 데이터를 기기와 브라우저의 로컬 저장소에 저장합니다. 앱 삭제, 브라우저
          저장소 삭제, 기기 초기화가 발생하면 데이터가 사라질 수 있습니다.
        </Text>
        <Text style={styles.description}>
          현재 버전은 클라우드 동기화와 백업/복원 기능을 제공하지 않습니다.
        </Text>
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.cardTitle}>개인정보 및 출시 안내</Text>
        <Text style={styles.description}>
          자산 가계부는 사용자가 직접 입력한 거래, 예산, 자산, 부채 데이터를 외부 서버로 보내지
          않고 기기 안에 저장하는 방식으로 설계되어 있습니다.
        </Text>
        <Text style={styles.description}>
          금융 계정 비밀번호, 주민등록번호, 카드 전체 번호, 인증번호처럼 민감한 인증 정보는
          메모나 이름 입력란에 저장하지 마세요.
        </Text>
        <Text style={styles.description}>
          Google Play 출시 전에는 개인정보처리방침, Data safety, 실제 기기 테스트, 폐쇄 테스트
          절차를 별도로 확인해야 합니다.
        </Text>
      </AppCard>
    </Screen>
  );
};

interface MenuItemProps {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
}

const MenuItem = ({ icon, label, description, onPress }: MenuItemProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={styles.menuItem}
  >
    <Text style={styles.menuIcon}>{icon}</Text>
    <View style={styles.menuText}>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuDescription}>{description}</Text>
    </View>
    <Text style={styles.menuChevron}>›</Text>
  </Pressable>
);

interface DataRowProps {
  label: string;
  value: string;
}

const DataRow = ({ label, value }: DataRowProps) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={styles.dataValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  menuItem: {
    alignItems: "center",
    borderBottomColor: colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 66,
    paddingVertical: spacing.sm,
  },
  menuIcon: {
    fontSize: 22,
    width: 32,
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  menuDescription: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  menuChevron: {
    color: colors.subtleText,
    fontSize: 24,
    fontWeight: "900",
  },
  dataRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  dataLabel: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "800",
  },
  dataValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  description: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  buttonGroup: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
