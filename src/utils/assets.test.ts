import { describe, expect, it } from "vitest";

import { AssetAccount, LiabilityAccount, NetWorthSnapshot } from "../types";
import {
  findSnapshotByMonth,
  getEmergencyFundCoverage,
  getLiquidAssets,
  getNetWorth,
  getNetWorthChange,
  getRecentNetWorthSnapshots,
  getSavingsRate,
  getTotalAssets,
  getTotalLiabilities,
} from "./assets";

const assets: AssetAccount[] = [
  {
    id: "asset-1",
    name: "입출금통장",
    type: "bank",
    balance: 2500000,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "asset-2",
    name: "연금",
    type: "pension",
    balance: 10000000,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  },
];

const liabilities: LiabilityAccount[] = [
  {
    id: "liability-1",
    name: "카드 예정 결제액",
    type: "creditCard",
    balance: 500000,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  },
];

const snapshots: NetWorthSnapshot[] = [
  {
    id: "snapshot-1",
    month: "2026-03",
    totalAssets: 11000000,
    totalLiabilities: 700000,
    netWorth: 10300000,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "snapshot-2",
    month: "2026-04",
    totalAssets: 12500000,
    totalLiabilities: 500000,
    netWorth: 12000000,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  },
];

describe("asset utils", () => {
  it("총자산, 총부채, 순자산을 계산한다", () => {
    expect(getTotalAssets(assets)).toBe(12500000);
    expect(getTotalLiabilities(liabilities)).toBe(500000);
    expect(getNetWorth(assets, liabilities)).toBe(12000000);
  });

  it("순자산 변화와 최근 스냅샷을 계산한다", () => {
    expect(getNetWorthChange(snapshots[1], snapshots[0])).toBe(1700000);
    expect(findSnapshotByMonth(snapshots, "2026-04")?.netWorth).toBe(12000000);
    expect(getRecentNetWorthSnapshots(snapshots, 1)).toEqual([snapshots[1]]);
  });

  it("저축률과 비상금 커버 기간을 계산한다", () => {
    expect(getSavingsRate(3000000, 2100000)).toBe(30);
    expect(getSavingsRate(0, 2100000)).toBe(0);
    expect(getLiquidAssets(assets)).toBe(2500000);
    expect(getEmergencyFundCoverage(2500000, 1000000)).toBe(2.5);
  });
});
