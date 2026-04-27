import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../constants/theme";
import { formatKoreanMonth, shiftMonth } from "../utils/date";

interface MonthSelectorProps {
  month: string;
  onChange: (month: string) => void;
}

export const MonthSelector = ({ month, onChange }: MonthSelectorProps) => (
  <View style={styles.container}>
    <Pressable
      accessibilityLabel="이전 달"
      accessibilityRole="button"
      onPress={() => onChange(shiftMonth(month, -1))}
      style={styles.navButton}
    >
      <Text style={styles.navText}>‹</Text>
    </Pressable>
    <Text style={styles.month}>{formatKoreanMonth(month)}</Text>
    <Pressable
      accessibilityLabel="다음 달"
      accessibilityRole="button"
      onPress={() => onChange(shiftMonth(month, 1))}
      style={styles.navButton}
    >
      <Text style={styles.navText}>›</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    padding: spacing.xs,
  },
  navButton: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  navText: {
    color: colors.primary,
    fontSize: 28,
    lineHeight: 30,
  },
  month: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
});
