import { Category } from "../types";

const DEFAULT_CREATED_AT = "2026-01-01T00:00:00.000Z";

export const CATEGORY_COLORS = [
  "#2563EB",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#0891B2",
  "#BE123C",
  "#4B5563",
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: "expense-food", name: "식비", type: "expense", color: "#F97316", icon: "food", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "expense-transport", name: "교통", type: "expense", color: "#0EA5E9", icon: "transport", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "expense-shopping", name: "쇼핑", type: "expense", color: "#EC4899", icon: "shopping", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "expense-housing", name: "주거", type: "expense", color: "#64748B", icon: "home", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "expense-mobile", name: "통신", type: "expense", color: "#14B8A6", icon: "phone", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "expense-medical", name: "의료", type: "expense", color: "#EF4444", icon: "medical", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "expense-education", name: "교육", type: "expense", color: "#8B5CF6", icon: "education", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "expense-culture", name: "문화", type: "expense", color: "#22C55E", icon: "culture", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "expense-insurance", name: "보험", type: "expense", color: "#2563EB", icon: "insurance", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "expense-saving", name: "저축", type: "expense", color: "#059669", icon: "saving", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "expense-etc", name: "기타", type: "expense", color: "#6B7280", icon: "etc", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: "income-salary", name: "급여", type: "income", color: "#16A34A", icon: "salary", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "income-side", name: "부수입", type: "income", color: "#0284C7", icon: "side", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "income-allowance", name: "용돈", type: "income", color: "#CA8A04", icon: "allowance", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "income-investment", name: "투자수익", type: "income", color: "#7C3AED", icon: "investment", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "income-bonus", name: "상여금", type: "income", color: "#0891B2", icon: "bonus", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "income-refund", name: "환급", type: "income", color: "#0F766E", icon: "refund", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
  { id: "income-etc", name: "기타", type: "income", color: "#4B5563", icon: "etc", isDefault: true, createdAt: DEFAULT_CREATED_AT, updatedAt: DEFAULT_CREATED_AT },
];

export const DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];
