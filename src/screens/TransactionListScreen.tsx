import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { EmptyState } from "../components/EmptyState";
import { MonthSelector } from "../components/MonthSelector";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { SegmentedControl } from "../components/SegmentedControl";
import { TransactionItem } from "../components/TransactionItem";
import { DEFAULT_CATEGORIES } from "../constants/categories";
import { colors, radius, spacing } from "../constants/theme";
import { TransactionsStackParamList } from "../navigation/types";
import { useLedgerStore } from "../store/useLedgerStore";
import { Category, Transaction, TransactionFilterType } from "../types";
import { getMonthlyTransactions } from "../utils/calculations";
import { getTodayDateInput, shiftDateInput, toDateInputValue } from "../utils/date";

type TransactionListNavigation = NativeStackNavigationProp<
  TransactionsStackParamList,
  "TransactionList"
>;

const typeOptions = [
  { label: "전체", value: "all" },
  { label: "수입", value: "income" },
  { label: "지출", value: "expense" },
] as const;

const getCategoryFilterLabel = (
  category: Category,
  typeFilter: TransactionFilterType,
) => {
  if (typeFilter !== "all") {
    return category.name;
  }

  return `${category.type === "income" ? "수입" : "지출"} ${category.name}`;
};

const categoryOrder = new Map(
  DEFAULT_CATEGORIES.map((category, index) => [category.id, index]),
);

const sortCategoriesForFilter = (categories: Category[]) =>
  [...categories].sort((a, b) => {
    const typeCompare =
      (a.type === "expense" ? 0 : 1) - (b.type === "expense" ? 0 : 1);
    if (typeCompare !== 0) {
      return typeCompare;
    }

    return (categoryOrder.get(a.id) ?? 999) - (categoryOrder.get(b.id) ?? 999);
  });

type TransactionListItem =
  | { id: string; type: "header"; title: string }
  | { id: string; type: "transaction"; transaction: Transaction };

const getTransactionGroupTitle = (date: string) => {
  const dateInput = toDateInputValue(date);
  const today = getTodayDateInput();
  const yesterday = shiftDateInput(today, -1);

  if (dateInput === today) {
    return "오늘";
  }

  if (dateInput === yesterday) {
    return "어제";
  }

  return dateInput;
};

const buildTransactionListItems = (transactions: Transaction[]): TransactionListItem[] => {
  const items: TransactionListItem[] = [];
  let currentTitle = "";

  transactions.forEach((transaction) => {
    const title = getTransactionGroupTitle(transaction.date);
    if (title !== currentTitle) {
      currentTitle = title;
      items.push({ id: `header-${title}`, type: "header", title });
    }
    items.push({ id: transaction.id, type: "transaction", transaction });
  });

  return items;
};

export const TransactionListScreen = () => {
  const navigation = useNavigation<TransactionListNavigation>();
  const {
    transactions,
    categories,
    deleteTransaction,
    selectedMonth,
    setSelectedMonth,
  } = useLedgerStore();
  const month = selectedMonth;
  const [typeFilter, setTypeFilter] = useState<TransactionFilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (typeFilter === "all") {
      return sortCategoriesForFilter(categories);
    }

    return sortCategoriesForFilter(
      categories.filter((category) => category.type === typeFilter),
    );
  }, [categories, typeFilter]);
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const visibleTransactions = useMemo(() => {
    const monthly = getMonthlyTransactions(transactions, month);
    const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase("ko-KR");

    return monthly.filter((transaction) => {
      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      const matchesCategory =
        categoryFilter === "all" || transaction.categoryId === categoryFilter;
      const categoryName = categoryMap.get(transaction.categoryId)?.name ?? "삭제된 카테고리";
      const searchableText = [
        categoryName,
        transaction.memo,
        transaction.paymentMethod,
        transaction.type === "income" ? "수입" : "지출",
        String(transaction.amount),
        transaction.amount.toLocaleString("ko-KR"),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("ko-KR");

      const matchesSearch =
        !normalizedSearchQuery || searchableText.includes(normalizedSearchQuery);

      return matchesType && matchesCategory && matchesSearch;
    });
  }, [categoryFilter, categoryMap, month, searchQuery, transactions, typeFilter]);
  const listItems = useMemo(
    () => buildTransactionListItems(visibleTransactions),
    [visibleTransactions],
  );

  const hasActiveFilters =
    typeFilter !== "all" || categoryFilter !== "all" || Boolean(searchQuery.trim());

  const handleTypeChange = (value: TransactionFilterType) => {
    setTypeFilter(value);
    setCategoryFilter("all");
  };

  const resetFilters = () => {
    setTypeFilter("all");
    setCategoryFilter("all");
    setSearchQuery("");
  };

  const confirmDelete = (id: string) => {
    Alert.alert("거래 삭제", "이 거래 내역을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          void deleteTransaction(id);
        },
      },
    ]);
  };

  const openForm = (transactionId?: string) => {
    navigation.navigate("TransactionForm", transactionId ? { transactionId } : undefined);
  };

  const renderListItem = ({ item }: { item: TransactionListItem }) => {
    if (item.type === "header") {
      return <Text style={styles.dateHeader}>{item.title}</Text>;
    }

    return (
      <TransactionItem
        categories={categories}
        onDelete={() => confirmDelete(item.transaction.id)}
        onEdit={() => openForm(item.transaction.id)}
        transaction={item.transaction}
      />
    );
  };

  const header = (
    <View>
      <MonthSelector month={month} onChange={setSelectedMonth} />
      <SegmentedControl
        onChange={handleTypeChange}
        options={[...typeOptions]}
        value={typeFilter}
      />

      <ScrollView
        contentContainerStyle={styles.categoryRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <CategoryChip
          active={categoryFilter === "all"}
          label="전체 카테고리"
          onPress={() => setCategoryFilter("all")}
        />
        {filteredCategories.map((category) => (
          <CategoryChip
            active={categoryFilter === category.id}
            category={category}
            key={category.id}
            label={getCategoryFilterLabel(category, typeFilter)}
            onPress={() => setCategoryFilter(category.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.searchBox}>
        <TextInput
          accessibilityLabel="거래 검색"
          onChangeText={setSearchQuery}
          placeholder="메모, 카테고리, 결제수단, 금액 검색"
          placeholderTextColor={colors.mutedText}
          style={styles.searchInput}
          value={searchQuery}
        />
        {searchQuery ? (
          <Pressable
            accessibilityLabel="검색어 지우기"
            accessibilityRole="button"
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>검색 초기화</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.filterSummaryRow}>
        <Text style={styles.resultText}>검색 결과 {visibleTransactions.length}건</Text>
        {hasActiveFilters ? (
          <Pressable
            accessibilityLabel="필터 초기화"
            accessibilityRole="button"
            onPress={resetFilters}
            style={styles.resetFilterButton}
          >
            <Text style={styles.resetFilterText}>필터 초기화</Text>
          </Pressable>
        ) : null}
      </View>

      <PrimaryButton label="거래 추가" onPress={() => openForm()} style={styles.addButton} />
    </View>
  );

  return (
    <Screen scroll={false}>
      <FlatList
        ListEmptyComponent={
          <EmptyState
            actionLabel="첫 거래 추가"
            description="필터나 검색어를 바꾸거나 새 거래를 등록해 보세요."
            onActionPress={() => openForm()}
            title="아직 등록된 거래가 없습니다."
          />
        }
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
        data={listItems}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={renderListItem}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};

interface CategoryChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  category?: Category;
}

const CategoryChip = ({ label, active, onPress, category }: CategoryChipProps) => (
  <Pressable
    accessibilityLabel={`${label}${active ? ", 선택됨" : ""}`}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    onPress={onPress}
    style={[styles.chip, active && styles.activeChip]}
  >
    {category?.color ? <View style={[styles.chipDot, { backgroundColor: category.color }]} /> : null}
    <Text style={[styles.chipText, active && styles.activeChipText]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  categoryRow: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  chip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipDot: {
    borderRadius: 5,
    height: 10,
    marginRight: spacing.xs,
    width: 10,
  },
  chipText: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "700",
  },
  activeChipText: {
    color: "#FFFFFF",
  },
  addButton: {
    marginBottom: spacing.lg,
  },
  searchBox: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 15,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  clearButton: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  clearButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  filterSummaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  resetFilterButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  resetFilterText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  resultText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  dateHeader: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
});
