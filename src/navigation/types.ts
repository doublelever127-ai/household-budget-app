import { NavigatorScreenParams } from "@react-navigation/native";

export type TransactionsStackParamList = {
  TransactionList: undefined;
  TransactionForm: { transactionId?: string } | undefined;
};

export type MoreStackParamList = {
  MoreHome: undefined;
  Budget: undefined;
  Categories: undefined;
  Settings: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  TransactionsTab: NavigatorScreenParams<TransactionsStackParamList>;
  Assets: undefined;
  Statistics: undefined;
  More: NavigatorScreenParams<MoreStackParamList> | undefined;
};
