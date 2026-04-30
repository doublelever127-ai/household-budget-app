import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ko } from "date-fns/locale";

import { colors, radius, shadows, spacing } from "../constants/theme";
import { fromDateInputValue, isValidDateInput } from "../utils/date";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarDatePickerProps {
  defaultMonth: string;
  onClose: () => void;
  onSelect: (date: string) => void;
  value: string;
  visible: boolean;
}

export const CalendarDatePicker = ({
  defaultMonth,
  onClose,
  onSelect,
  value,
  visible,
}: CalendarDatePickerProps) => {
  const [calendarMonth, setCalendarMonth] = useState(defaultMonth);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (isValidDateInput(value)) {
      setCalendarMonth(format(parseISO(fromDateInputValue(value)), "yyyy-MM"));
      return;
    }

    setCalendarMonth(defaultMonth);
  }, [defaultMonth, value, visible]);

  const monthDate = useMemo(
    () => parseISO(`${calendarMonth}-01T00:00:00.000Z`),
    [calendarMonth],
  );

  const selectedDate = useMemo(
    () => (isValidDateInput(value) ? parseISO(fromDateInputValue(value)) : null),
    [value],
  );

  const days = useMemo(() => {
    const firstVisibleDay = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
    const lastVisibleDay = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });

    return eachDayOfInterval({ start: firstVisibleDay, end: lastVisibleDay });
  }, [monthDate]);

  const handleSelect = (day: Date) => {
    onSelect(format(day, "yyyy-MM-dd"));
    onClose();
  };

  const shiftCalendarMonth = (amount: number) => {
    setCalendarMonth(format(addMonths(monthDate, amount), "yyyy-MM"));
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="달력 닫기"
          accessibilityRole="button"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.card}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="이전 달"
              accessibilityRole="button"
              onPress={() => shiftCalendarMonth(-1)}
              style={styles.monthButton}
            >
              <Text style={styles.monthButtonText}>‹</Text>
            </Pressable>
            <Text style={styles.monthTitle}>
              {format(monthDate, "yyyy년 M월", { locale: ko })}
            </Text>
            <Pressable
              accessibilityLabel="다음 달"
              accessibilityRole="button"
              onPress={() => shiftCalendarMonth(1)}
              style={styles.monthButton}
            >
              <Text style={styles.monthButtonText}>›</Text>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {weekdays.map((weekday) => (
              <Text key={weekday} style={styles.weekday}>
                {weekday}
              </Text>
            ))}
          </View>

          <View style={styles.dayGrid}>
            {days.map((day) => {
              const dateValue = format(day, "yyyy-MM-dd");
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isCurrentMonth = isSameMonth(day, monthDate);

              return (
                <Pressable
                  accessibilityLabel={`${format(day, "M월 d일", { locale: ko })}${
                    isSelected ? ", 선택됨" : ""
                  }`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  key={dateValue}
                  onPress={() => handleSelect(day)}
                  style={[
                    styles.dayButton,
                    !isCurrentMonth && styles.outsideDayButton,
                    isSelected && styles.selectedDayButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !isCurrentMonth && styles.outsideDayText,
                      isSelected && styles.selectedDayText,
                    ]}
                  >
                    {format(day, "d")}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>닫기</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => handleSelect(new Date())}
              style={styles.todayButton}
            >
              <Text style={styles.todayText}>오늘 선택</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.42)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    maxWidth: 420,
    padding: spacing.lg,
    width: "100%",
    ...shadows.floating,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  monthButton: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  monthButtonText: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 32,
  },
  monthTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  weekday: {
    color: colors.mutedText,
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayButton: {
    alignItems: "center",
    aspectRatio: 1,
    justifyContent: "center",
    width: "14.2857%",
  },
  outsideDayButton: {
    opacity: 0.42,
  },
  selectedDayButton: {
    opacity: 1,
  },
  dayText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 34,
    minWidth: 34,
    textAlign: "center",
  },
  outsideDayText: {
    color: colors.subtleText,
  },
  selectedDayText: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    color: "#FFFFFF",
    overflow: "hidden",
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "flex-end",
    marginTop: spacing.lg,
  },
  cancelButton: {
    alignItems: "center",
    borderRadius: radius.full,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: spacing.lg,
  },
  cancelText: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "900",
  },
  todayButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: spacing.lg,
  },
  todayText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
