import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../constants/theme";
import { Category, Transaction } from "../types";
import { formatKoreanDate } from "../utils/date";
import { formatSignedCurrency } from "../utils/format";
import { PrimaryButton } from "./PrimaryButton";

interface TransactionItemProps {
  transaction: Transaction;
  categories: Category[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TransactionItem = ({
  transaction,
  categories,
  onEdit,
  onDelete,
}: TransactionItemProps) => {
  const category = categories.find((item) => item.id === transaction.categoryId);
  const toneColor = transaction.type === "income" ? colors.income : colors.expense;

  return (
    <Pressable accessibilityRole={onEdit ? "button" : undefined} onPress={onEdit} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <View style={[styles.dot, { backgroundColor: category?.color ?? toneColor }]} />
          <View style={styles.textColumn}>
            <Text numberOfLines={1} style={styles.category}>
              {category?.name ?? "삭제된 카테고리"}
            </Text>
            <Text ellipsizeMode="tail" numberOfLines={1} style={styles.meta}>
              {formatKoreanDate(transaction.date)}
              {transaction.memo ? ` · ${transaction.memo}` : ""}
            </Text>
          </View>
        </View>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.78}
          numberOfLines={1}
          style={[styles.amount, { color: toneColor }]}
        >
          {formatSignedCurrency(transaction.amount, transaction.type)}
        </Text>
      </View>
      {transaction.paymentMethod || onDelete ? (
        <View style={styles.bottomRow}>
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.payment}>
            {transaction.paymentMethod ?? "결제수단 없음"}
          </Text>
          {onDelete ? (
            <PrimaryButton label="삭제" variant="ghost" onPress={onDelete} style={styles.deleteButton} />
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  left: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    paddingRight: spacing.sm,
  },
  dot: {
    borderRadius: 5,
    height: 10,
    marginRight: spacing.sm,
    width: 10,
  },
  textColumn: {
    flex: 1,
  },
  category: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  meta: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: "800",
    maxWidth: 132,
    textAlign: "right",
  },
  bottomRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  payment: {
    color: colors.mutedText,
    flex: 1,
    fontSize: 12,
    paddingRight: spacing.sm,
  },
  deleteButton: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
});
