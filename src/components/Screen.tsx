import { ReactNode } from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, layout, spacing } from "../constants/theme";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const Screen = ({ children, scroll = true, contentContainerStyle }: ScreenProps) => {
  const { width } = useWindowDimensions();
  const isTabletWidth = width >= layout.tabletBreakpoint;
  const horizontalPadding = isTabletWidth ? spacing.xl : spacing.lg;
  const frameStyle = [
    styles.frame,
    isTabletWidth && styles.tabletFrame,
    { paddingHorizontal: horizontalPadding },
    contentContainerStyle,
  ];

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.centeredContent}>
          <View style={[frameStyle, styles.flexFrame]}>{children}</View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={frameStyle}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContent: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: spacing.xl * 2,
    width: "100%",
  },
  frame: {
    width: "100%",
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  tabletFrame: {
    maxWidth: layout.maxContentWidth,
  },
  flexFrame: {
    flex: 1,
  },
});
