import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../constants/theme";

interface SectionHeaderProps {
  title: string;
  action?: string;
  onActionPress?: () => void;
}

export const SectionHeader = ({ title, action, onActionPress }: SectionHeaderProps) => (
  <View style={styles.row}>
    <Text style={styles.title}>{title}</Text>
    {action ? (
      <Text accessibilityRole="button" onPress={onActionPress} style={styles.action}>
        {action}
      </Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  action: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
});
