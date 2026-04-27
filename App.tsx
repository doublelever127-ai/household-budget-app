import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors, spacing } from "./src/constants/theme";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { useLedgerStore } from "./src/store/useLedgerStore";

export default function App() {
  const isReady = useLedgerStore((state) => state.isReady);
  const isLoading = useLedgerStore((state) => state.isLoading);
  const error = useLedgerStore((state) => state.error);
  const loadData = useLedgerStore((state) => state.loadData);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (!isReady || isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>가계부 데이터를 불러오는 중입니다.</Text>
          <StatusBar style="dark" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  loadingText: {
    color: colors.mutedText,
    fontSize: 15,
    marginTop: spacing.md,
  },
  errorBanner: {
    backgroundColor: colors.expense,
    bottom: 0,
    left: 0,
    padding: spacing.md,
    position: "absolute",
    right: 0,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});
