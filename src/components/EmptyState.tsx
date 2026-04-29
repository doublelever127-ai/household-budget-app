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
  icon = "✨",
}: EmptyStateProps) => (
  <View style={styles.container}>
    <View style={[styles.decorationDot, styles.decorationDotLeft]} />
    <View style={[styles.decorationDot, styles.decorationDotRight]} />
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
    backgroundColor: colors.playfulSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
    padding: spacing.xl,
  },
  decorationDot: {
    borderRadius: radius.full,
    position: "absolute",
  },
  decorationDotLeft: {
    backgroundColor: colors.blushSoft,
    height: 54,
    left: -18,
    top: -18,
    width: 54,
  },
  decorationDotRight: {
    backgroundColor: colors.mintSoft,
    bottom: -22,
    height: 68,
    right: -22,
    width: 68,
  },
  iconBubble: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.warningSoft,
    borderRadius: radius.full,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 56,
  },
  icon: {
    fontSize: 26,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  description: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  button: {
    marginTop: spacing.lg,
    width: "100%",
  },
});
