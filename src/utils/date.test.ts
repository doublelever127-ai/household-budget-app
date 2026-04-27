import { describe, expect, it } from "vitest";

import {
  formatDateInput,
  getDefaultTransactionDate,
  getMonthStartDateInput,
  shiftDateInput,
} from "./date";

describe("date utils", () => {
  it("숫자로 입력한 날짜를 YYYY-MM-DD 형식으로 정리한다", () => {
    expect(formatDateInput("20260427")).toBe("2026-04-27");
    expect(formatDateInput("2026년04월27일")).toBe("2026-04-27");
  });

  it("선택 월이 현재 월이면 오늘 날짜를 기본값으로 사용한다", () => {
    const baseDate = new Date(2026, 3, 27);

    expect(getDefaultTransactionDate("2026-04", baseDate)).toBe("2026-04-27");
  });

  it("선택 월이 현재 월이 아니면 선택 월 1일을 기본값으로 사용한다", () => {
    const baseDate = new Date(2026, 3, 27);

    expect(getDefaultTransactionDate("2026-03", baseDate)).toBe("2026-03-01");
  });

  it("날짜를 하루씩 이동한다", () => {
    expect(shiftDateInput("2026-04-01", -1)).toBe("2026-03-31");
    expect(shiftDateInput("2026-04-30", 1)).toBe("2026-05-01");
  });

  it("선택 월의 첫날 입력값을 만든다", () => {
    expect(getMonthStartDateInput("2026-04")).toBe("2026-04-01");
  });
});
