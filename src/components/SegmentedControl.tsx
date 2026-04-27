import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../constants/theme";

export interface SegmentOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) => (
  <View style={styles.container}>
    {options.map((option) => {
      const active = option.value === value;

      return (
        <Pressable
          accessibilityLabel={`${option.label}${active ? ", 선택됨" : ""}`}
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          key={option.value}
          onPress={() => onChange(option.value)}
          style={[styles.option, active && styles.activeOption]}
        >
          <Text style={[styles.label, active && styles.activeLabel]}>{option.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    padding: spacing.xs,
  },
  option: {
    alignItems: "center",
    borderRadius: radius.sm,
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
  },
  activeOption: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "700",
  },
  activeLabel: {
    color: "#FFFFFF",
  },
});
