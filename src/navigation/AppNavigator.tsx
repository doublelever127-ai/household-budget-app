import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { enableScreens } from "react-native-screens";

import { colors, radius } from "../constants/theme";
import { AssetScreen } from "../screens/AssetScreen";
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

const tabIcons: Record<keyof RootTabParamList, string> = {
  Home: "🏠",
  TransactionsTab: "🧾",
  Assets: "💎",
  Categories: "🏷",
  Budget: "💰",
  Statistics: "📊",
  Settings: "⚙️",
};

export const AppNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator
      detachInactiveScreens
      screenOptions={{
        freezeOnBlur: true,
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarIconStyle: { marginTop: 5 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "800", marginBottom: 7 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSoft,
          height: 82,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        component={HomeScreen}
        name="Home"
        options={{
          tabBarAccessibilityLabel: "홈",
          title: "홈",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Home" />,
        }}
      />
      <Tab.Screen
        component={TransactionsNavigator}
        name="TransactionsTab"
        options={{
          tabBarAccessibilityLabel: "거래",
          title: "거래",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="TransactionsTab" />,
        }}
      />
      <Tab.Screen
        component={CategoryScreen}
        name="Categories"
        options={{
          tabBarAccessibilityLabel: "카테고리",
          title: "카테고리",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Categories" />,
        }}
      />
      <Tab.Screen
        component={AssetScreen}
        name="Assets"
        options={{
          tabBarAccessibilityLabel: "자산",
          title: "자산",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Assets" />,
        }}
      />
      <Tab.Screen
        component={BudgetScreen}
        name="Budget"
        options={{
          tabBarAccessibilityLabel: "예산",
          title: "예산",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Budget" />,
        }}
      />
      <Tab.Screen
        component={StatisticsScreen}
        name="Statistics"
        options={{
          tabBarAccessibilityLabel: "통계",
          title: "통계",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Statistics" />,
        }}
      />
      <Tab.Screen
        component={SettingsScreen}
        name="Settings"
        options={{
          tabBarAccessibilityLabel: "설정",
          title: "설정",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Settings" />,
        }}
      />
    </Tab.Navigator>
  </NavigationContainer>
);

interface TabIconProps {
  focused: boolean;
  name: keyof RootTabParamList;
}

const TabIcon = ({ focused, name }: TabIconProps) => (
  <View
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    style={[styles.iconPill, focused && styles.activeIconPill]}
  >
    <Text accessible={false} style={styles.tabIcon}>
      {tabIcons[name]}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  iconPill: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 30,
    justifyContent: "center",
    width: 44,
  },
  activeIconPill: {
    backgroundColor: colors.primarySoft,
  },
  tabIcon: {
    fontSize: 17,
  },
});
