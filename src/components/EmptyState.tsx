import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../constants/theme";
import { PrimaryButton } from "./PrimaryButton";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  icon?: string;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onActionPress,
  icon = "🧾",
}: EmptyStateProps) => (
  <View style={styles.container}>
    <View style={styles.iconBubble}>
      <Text style={styles.icon}>{icon}</Text>
    </View>
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.description}>{description}</Text> : null}
    {actionLabel && onActionPress ? (
      <PrimaryButton label={actionLabel} onPress={onActionPress} style={styles.button} />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
  },
  iconBubble: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    height: 48,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 48,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  button: {
    marginTop: spacing.lg,
    width: "100%",
  },
});
