import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";

import { colors, layout, radius } from "../constants/theme";
import { AssetScreen } from "../screens/AssetScreen";
import { BudgetScreen } from "../screens/BudgetScreen";
import { CategoryScreen } from "../screens/CategoryScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { MoreScreen } from "../screens/MoreScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { StatisticsScreen } from "../screens/StatisticsScreen";
import { TransactionFormScreen } from "../screens/TransactionFormScreen";
import { TransactionListScreen } from "../screens/TransactionListScreen";
import { MoreStackParamList, RootTabParamList, TransactionsStackParamList } from "./types";

const Tab = createBottomTabNavigator<RootTabParamList>();
const TransactionStack = createNativeStackNavigator<TransactionsStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

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
      options={{ title: "기록" }}
    />
    <TransactionStack.Screen
      component={TransactionFormScreen}
      name="TransactionForm"
      options={{ title: "거래 추가" }}
    />
  </TransactionStack.Navigator>
);

const MoreNavigator = () => (
  <MoreStack.Navigator screenOptions={headerOptions}>
    <MoreStack.Screen
      component={MoreScreen}
      name="MoreHome"
      options={{ title: "더보기" }}
    />
    <MoreStack.Screen
      component={BudgetScreen}
      name="Budget"
      options={{ title: "예산 설정" }}
    />
    <MoreStack.Screen
      component={CategoryScreen}
      name="Categories"
      options={{ title: "카테고리 관리" }}
    />
    <MoreStack.Screen
      component={SettingsScreen}
      name="Settings"
      options={{ title: "앱 정보" }}
    />
  </MoreStack.Navigator>
);

const tabIcons: Record<keyof RootTabParamList, string> = {
  Home: "🏠",
  TransactionsTab: "🧾",
  Assets: "💎",
  Statistics: "📊",
  More: "☰",
};

export const AppNavigator = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTabletWidth = width >= layout.tabletBreakpoint;
  const bottomPadding = Math.max(10, insets.bottom || 0);

  return (
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
        tabBarStyle: [
          {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSoft,
          height: 72 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          },
          isTabletWidth && styles.tabletTabBar,
        ],
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
          tabBarAccessibilityLabel: "기록",
          title: "기록",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="TransactionsTab" />,
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
        component={StatisticsScreen}
        name="Statistics"
        options={{
          tabBarAccessibilityLabel: "분석",
          title: "분석",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Statistics" />,
        }}
      />
      <Tab.Screen
        component={MoreNavigator}
        name="More"
        options={{
          tabBarAccessibilityLabel: "더보기",
          title: "더보기",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="More" />,
        }}
      />
    </Tab.Navigator>
  </NavigationContainer>
  );
};

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
  tabletTabBar: {
    alignSelf: "center",
    borderColor: colors.borderSoft,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxWidth: layout.maxContentWidth,
    width: "100%",
  },
});
