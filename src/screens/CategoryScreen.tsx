import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { SectionHeader } from "../components/SectionHeader";
import { SegmentedControl } from "../components/SegmentedControl";
import { CATEGORY_COLORS } from "../constants/categories";
import { colors, radius, spacing } from "../constants/theme";
import { CATEGORY_DUPLICATE_ERROR, useLedgerStore } from "../store/useLedgerStore";
import { Category, TransactionType } from "../types";

const typeOptions = [
  { label: "지출", value: "expense" },
  { label: "수입", value: "income" },
] as const;

export const CategoryScreen = () => {
  const {
    categories,
    transactions,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useLedgerStore();
  const [editingId, setEditingId] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [color, setColor] = useState(CATEGORY_COLORS[0]);

  const incomeCategories = useMemo(
    () => categories.filter((category) => category.type === "income"),
    [categories],
  );
  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories],
  );

  const resetForm = () => {
    setEditingId(undefined);
    setName("");
    setType("expense");
    setColor(CATEGORY_COLORS[0]);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setType(category.type);
    setColor(category.color ?? CATEGORY_COLORS[0]);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("입력 확인", "카테고리 이름을 입력해 주세요.");
      return;
    }

    try {
      if (editingId) {
        await updateCategory(editingId, { name: trimmedName, type, color });
      } else {
        await addCategory({ name: trimmedName, type, color });
      }
      resetForm();
    } catch (error) {
      if (error instanceof Error && error.message === CATEGORY_DUPLICATE_ERROR) {
        Alert.alert("입력 확인", CATEGORY_DUPLICATE_ERROR);
        return;
      }

      Alert.alert("저장 실패", "카테고리를 저장하지 못했습니다.");
    }
  };

  const confirmDelete = (category: Category) => {
    const isUsed = transactions.some((transaction) => transaction.categoryId === category.id);
    const message = isUsed
      ? "이미 거래 내역에서 사용 중인 카테고리입니다. 삭제하면 기존 거래에는 삭제된 카테고리로 표시됩니다. 삭제할까요?"
      : "이 카테고리를 삭제할까요?";

    Alert.alert("카테고리 삭제", message, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          void deleteCategory(category.id);
          if (editingId === category.id) {
            resetForm();
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <Text style={styles.title}>카테고리 관리</Text>

      <View style={styles.form}>
        <Text style={styles.formTitle}>{editingId ? "카테고리 수정" : "카테고리 추가"}</Text>
        <SegmentedControl onChange={setType} options={[...typeOptions]} value={type} />
        <TextInput
          onChangeText={setName}
          placeholder="카테고리 이름"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          value={name}
        />
        <View style={styles.colorRow}>
          {CATEGORY_COLORS.map((item) => (
            <Pressable
              accessibilityLabel={`${item} 색상`}
              accessibilityRole="button"
              key={item}
              onPress={() => setColor(item)}
              style={[
                styles.colorSwatch,
                { backgroundColor: item },
                color === item && styles.selectedColor,
              ]}
            />
          ))}
        </View>
        <View style={styles.formButtons}>
          {editingId ? (
            <PrimaryButton label="취소" onPress={resetForm} variant="secondary" style={styles.formButton} />
          ) : null}
          <PrimaryButton
            label={editingId ? "수정" : "추가"}
            onPress={handleSave}
            style={styles.formButton}
          />
        </View>
      </View>

      <SectionHeader title="지출 카테고리" />
      {expenseCategories.map((category) => (
        <CategoryRow
          category={category}
          key={category.id}
          onDelete={() => confirmDelete(category)}
          onEdit={() => startEdit(category)}
        />
      ))}

      <SectionHeader title="수입 카테고리" />
      {incomeCategories.map((category) => (
        <CategoryRow
          category={category}
          key={category.id}
          onDelete={() => confirmDelete(category)}
          onEdit={() => startEdit(category)}
        />
      ))}
    </Screen>
  );
};

interface CategoryRowProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoryRow = ({ category, onEdit, onDelete }: CategoryRowProps) => (
  <View style={styles.categoryRow}>
    <View style={styles.categoryInfo}>
      <View style={[styles.categoryDot, { backgroundColor: category.color ?? colors.primary }]} />
      <View>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryMeta}>{category.isDefault ? "기본 카테고리" : "사용자 카테고리"}</Text>
      </View>
    </View>
    <View style={styles.rowButtons}>
      <PrimaryButton label="수정" onPress={onEdit} variant="secondary" style={styles.smallButton} />
      <PrimaryButton label="삭제" onPress={onDelete} variant="danger" style={styles.smallButton} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: spacing.lg,
  },
  form: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  formTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  colorSwatch: {
    borderColor: "transparent",
    borderRadius: radius.md,
    borderWidth: 3,
    height: 34,
    width: 34,
  },
  selectedColor: {
    borderColor: colors.text,
  },
  formButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  formButton: {
    flex: 1,
  },
  categoryRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  categoryInfo: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
  },
  categoryDot: {
    borderRadius: 6,
    height: 12,
    marginRight: spacing.sm,
    width: 12,
  },
  categoryName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  categoryMeta: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 2,
  },
  rowButtons: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  smallButton: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
});
