import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../constants/theme";
import { AppCard } from "./AppCard";

interface StatCardProps {
  title: string;
  value: string;
  caption?: string;
  tone?: "neutral" | "income" | "expense" | "warning";
}

const toneColors = {
  neutral: colors.primary,
  income: colors.income,
  expense: colors.expense,
  warning: colors.warning,
};

const toneBackgrounds = {
  neutral: colors.primarySoft,
  income: colors.incomeSoft,
  expense: colors.expenseSoft,
  warning: colors.warningSoft,
};

export const StatCard = ({ title, value, caption, tone = "neutral" }: StatCardProps) => (
  <AppCard accentColor={toneColors[tone]} style={styles.card}>
    <View style={[styles.badge, { backgroundColor: toneBackgrounds[tone] }]}>
      <Text style={[styles.badgeText, { color: toneColors[tone] }]}>{title}</Text>
    </View>
    <Text style={[styles.value, { color: toneColors[tone] }]}>{value}</Text>
    {caption ? <Text style={styles.caption}>{caption}</Text> : null}
  </AppCard>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 108,
    paddingLeft: spacing.lg,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "800",
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
  },
  caption: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.xs,
  },
});
