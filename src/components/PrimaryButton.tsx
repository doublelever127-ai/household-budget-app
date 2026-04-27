import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { colors, radius, spacing } from "../constants/theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const PrimaryButton = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}: PrimaryButtonProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled || loading}
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      styles[variant],
      (pressed || disabled) && styles.dimmed,
      style,
    ]}
  >
    {loading ? <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : colors.primary} /> : null}
    {!loading ? <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text> : null}
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
  },
  danger: {
    backgroundColor: colors.expenseSoft,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
  primaryLabel: {
    color: "#FFFFFF",
  },
  secondaryLabel: {
    color: colors.primary,
  },
  dangerLabel: {
    color: colors.expense,
  },
  ghostLabel: {
    color: colors.primary,
  },
  dimmed: {
    opacity: 0.7,
  },
});
