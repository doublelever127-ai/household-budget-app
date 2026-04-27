import { AssetAccount, LiabilityAccount, NetWorthSnapshot } from "../types";

export const getTotalAssets = (assetAccounts: AssetAccount[]) =>
  assetAccounts.reduce((sum, account) => sum + account.balance, 0);

export const getTotalLiabilities = (liabilityAccounts: LiabilityAccount[]) =>
  liabilityAccounts.reduce((sum, account) => sum + account.balance, 0);

export const getNetWorth = (
  assetAccounts: AssetAccount[],
  liabilityAccounts: LiabilityAccount[],
) => getTotalAssets(assetAccounts) - getTotalLiabilities(liabilityAccounts);

export const getNetWorthChange = (
  currentSnapshot: NetWorthSnapshot | undefined,
  previousSnapshot: NetWorthSnapshot | undefined,
) => {
  if (!currentSnapshot || !previousSnapshot) {
    return 0;
  }

  return currentSnapshot.netWorth - previousSnapshot.netWorth;
};

export const getSavingsRate = (monthlyIncome: number, monthlyExpense: number) => {
  if (monthlyIncome <= 0) {
    return 0;
  }

  const savedAmount = monthlyIncome - monthlyExpense;

  return Math.round((savedAmount / monthlyIncome) * 1000) / 10;
};

export const getLiquidAssets = (assetAccounts: AssetAccount[]) =>
  assetAccounts
    .filter((account) => ["cash", "bank", "savings"].includes(account.type))
    .reduce((sum, account) => sum + account.balance, 0);

export const getEmergencyFundCoverage = (
  liquidAssets: number,
  monthlyEssentialExpense: number,
) => {
  if (liquidAssets <= 0 || monthlyEssentialExpense <= 0) {
    return 0;
  }

  return Math.round((liquidAssets / monthlyEssentialExpense) * 10) / 10;
};

export const sortSnapshotsByMonthDesc = (snapshots: NetWorthSnapshot[]) =>
  [...snapshots].sort((a, b) => b.month.localeCompare(a.month));

export const getRecentNetWorthSnapshots = (
  snapshots: NetWorthSnapshot[],
  limit = 12,
) => sortSnapshotsByMonthDesc(snapshots).slice(0, limit).reverse();

export const findSnapshotByMonth = (snapshots: NetWorthSnapshot[], month: string) =>
  snapshots.find((snapshot) => snapshot.month === month);
