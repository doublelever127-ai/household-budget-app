import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, spacing } from "../constants/theme";
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
  const softToneColor = transaction.type === "income" ? colors.incomeSoft : colors.expenseSoft;
  const categoryName = category?.name ?? "삭제된 카테고리";
  const categoryIcon = getCategoryIcon(categoryName, transaction.type);

  return (
    <Pressable accessibilityRole={onEdit ? "button" : undefined} onPress={onEdit} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <View style={[styles.iconBubble, { backgroundColor: softToneColor }]}>
            <Text style={styles.categoryIcon}>{categoryIcon}</Text>
          </View>
          <View style={styles.textColumn}>
            <Text numberOfLines={1} style={styles.category}>
              {categoryName}
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
      {transaction.paymentMethod || onEdit || onDelete ? (
        <View style={styles.bottomRow}>
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.payment}>
            {transaction.paymentMethod ?? "결제수단 없음"}
          </Text>
          <View style={styles.actionRow}>
            {onEdit ? (
              <PrimaryButton
                accessibilityLabel={`${categoryName} 수정`}
                label="수정"
                variant="ghost"
                onPress={onEdit}
                style={styles.actionButton}
              />
            ) : null}
            {onDelete ? (
              <PrimaryButton
                accessibilityLabel={`${categoryName} 삭제`}
                label="삭제"
                variant="danger"
                onPress={onDelete}
                style={styles.deleteButton}
              />
            ) : null}
          </View>
        </View>
      ) : null}
    </Pressable>
  );
};

const expenseIcons: Record<string, string> = {
  식비: "🍽",
  교통: "🚌",
  쇼핑: "🛍",
  주거: "🏠",
  통신: "📱",
  의료: "🏥",
  교육: "📚",
  문화: "🎬",
  보험: "🛡",
  저축: "💰",
  기타: "🧾",
};

const incomeIcons: Record<string, string> = {
  급여: "💼",
  부수입: "✨",
  용돈: "💵",
  투자수익: "📈",
  기타: "🧾",
};

const getCategoryIcon = (name: string, type: Transaction["type"]) => {
  const icons = type === "income" ? incomeIcons : expenseIcons;
  const match = Object.entries(icons).find(([keyword]) => name.includes(keyword));

  return match?.[1] ?? (type === "income" ? "💵" : "🧾");
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.card,
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
  iconBubble: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 42,
    justifyContent: "center",
    marginRight: spacing.sm,
    width: 42,
  },
  categoryIcon: {
    fontSize: 20,
  },
  textColumn: {
    flex: 1,
  },
  category: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  meta: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "800",
    maxWidth: 150,
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
  actionRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  actionButton: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  deleteButton: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
});
