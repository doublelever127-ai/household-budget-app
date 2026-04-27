import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../constants/theme";

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

export const StatCard = ({ title, value, caption, tone = "neutral" }: StatCardProps) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <Text style={[styles.value, { color: toneColors[tone] }]}>{value}</Text>
    {caption ? <Text style={styles.caption}>{caption}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 96,
    padding: spacing.md,
  },
  title: {
    color: colors.mutedText,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
  },
  caption: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
