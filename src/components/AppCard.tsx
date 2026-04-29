import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius, shadows, spacing } from "../constants/theme";

interface AppCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accentColor?: string;
}

export const AppCard = ({ children, style, accentColor }: AppCardProps) => (
  <View style={[styles.card, style]}>
    {accentColor ? <View style={[styles.accent, { backgroundColor: accentColor }]} /> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.card,
  },
  accent: {
    borderBottomRightRadius: radius.full,
    borderTopRightRadius: radius.full,
    bottom: spacing.md,
    left: 0,
    position: "absolute",
    top: spacing.md,
    width: 4,
  },
});
