import { StyleSheet, View } from "react-native";

import { colors, radius } from "../constants/theme";

interface ProgressBarProps {
  value: number;
  tone?: "primary" | "income" | "expense" | "warning";
}

const toneColors = {
  primary: colors.primary,
  income: colors.income,
  expense: colors.expense,
  warning: colors.warning,
};

export const ProgressBar = ({ value, tone = "primary" }: ProgressBarProps) => (
  <View style={styles.track}>
    <View
      style={[
        styles.fill,
        {
          backgroundColor: toneColors[tone],
          width: `${Math.min(Math.max(value, 0), 100)}%`,
        },
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.borderSoft,
    borderRadius: radius.full,
    height: 10,
    overflow: "hidden",
  },
  fill: {
    borderRadius: radius.full,
    height: "100%",
  },
});
