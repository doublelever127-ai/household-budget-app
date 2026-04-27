import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { enableScreens } from "react-native-screens";

import { colors } from "../constants/theme";
import { BudgetScreen } from "../screens/BudgetScreen";
import { CategoryScreen } from "../screens/CategoryScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { StatisticsScreen } from "../screens/StatisticsScreen";
import { TransactionFormScreen } from "../screens/TransactionFormScreen";
import { TransactionListScreen } from "../screens/TransactionListScreen";
import { RootTabParamList, TransactionsStackParamList } from "./types";

const Tab = createBottomTabNavigator<RootTabParamList>();
const TransactionStack = createNativeStackNavigator<TransactionsStackParamList>();

enableScreens();

const headerOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerTitleStyle: { color: colors.text, fontWeight: "800" as const },
};

const TransactionsNavigator = () => (
  <TransactionStack.Navigator screenOptions={headerOptions}>
    <TransactionStack.Screen
      component={TransactionListScreen}
      name="TransactionList"
      options={{ title: "거래 내역" }}
    />
    <TransactionStack.Screen
      component={TransactionFormScreen}
      name="TransactionForm"
      options={{ title: "거래 추가" }}
    />
  </TransactionStack.Navigator>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator
      detachInactiveScreens
      screenOptions={{
        freezeOnBlur: true,
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarIcon: ({ color, focused }) => (
          <View
            style={[
              styles.tabIndicator,
              { borderColor: color },
              focused && { backgroundColor: color },
            ]}
          />
        ),
        tabBarIconStyle: { marginTop: 6 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
        tabBarStyle: {
          borderTopColor: colors.border,
          height: 76,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen component={HomeScreen} name="Home" options={{ title: "홈" }} />
      <Tab.Screen component={TransactionsNavigator} name="TransactionsTab" options={{ title: "거래" }} />
      <Tab.Screen component={CategoryScreen} name="Categories" options={{ title: "카테고리" }} />
      <Tab.Screen component={BudgetScreen} name="Budget" options={{ title: "예산" }} />
      <Tab.Screen component={StatisticsScreen} name="Statistics" options={{ title: "통계" }} />
      <Tab.Screen component={SettingsScreen} name="Settings" options={{ title: "설정" }} />
    </Tab.Navigator>
  </NavigationContainer>
);

const styles = StyleSheet.create({
  tabIndicator: {
    borderRadius: 5,
    borderWidth: 2,
    height: 10,
    width: 10,
  },
});
