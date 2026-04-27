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
  accessibilityLabel?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const PrimaryButton = ({
  label,
  onPress,
  accessibilityLabel,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}: PrimaryButtonProps) => (
  <Pressable
    accessibilityLabel={accessibilityLabel ?? label}
    accessibilityRole="button"
    disabled={disabled || loading}
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      styles[variant],
      pressed && styles.pressed,
      disabled && styles.dimmed,
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
    borderRadius: radius.lg,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primaryDark,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.borderSoft,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: colors.expenseSoft,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
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
  pressed: {
    opacity: 0.82,
  },
  dimmed: {
    opacity: 0.55,
  },
});
