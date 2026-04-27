import { NavigatorScreenParams } from "@react-navigation/native";

export type TransactionsStackParamList = {
  TransactionList: undefined;
  TransactionForm: { transactionId?: string } | undefined;
};

export type RootTabParamList = {
  Home: undefined;
  TransactionsTab: NavigatorScreenParams<TransactionsStackParamList>;
  Categories: undefined;
  Budget: undefined;
  Statistics: undefined;
  Settings: undefined;
};
