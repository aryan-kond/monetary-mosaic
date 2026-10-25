export interface MonthEndForecast {
  /** Actual spending so far. */
  spentSoFar: number;
  /** Average daily spending over the recent window, rounded to the nearest ₹10. */
  dailyAverage: number;
  /** How many recent days the average is based on. */
  windowDays: number;
  remainingDays: number;
  /** Estimated spending for the remaining days. */
  estimatedRemaining: number;
  /** Spent so far plus the estimate. */
  projectedTotal: number;
}

/** A forecast on very little data would be misleading, so we ask for at least a week. */
const MINIMUM_DAYS = 7;

/**
 * Simple, explainable estimate: the remaining days are spent at the average daily rate of
 * the last `windowDays` days. One-off bills that have not happened yet are not included.
 * Returns null when there is not enough data.
 */
export function projectMonthEnd(
  dailySoFar: number[],
  daysInMonth: number,
  windowDays = 14,
): MonthEndForecast | null {
  const daysElapsed = dailySoFar.length;
  if (daysElapsed < MINIMUM_DAYS) return null;

  const recent = dailySoFar.slice(-windowDays);
  const average = recent.reduce((total, amount) => total + amount, 0) / recent.length;
  const dailyAverage = Math.round(average / 10) * 10;
  const remainingDays = Math.max(daysInMonth - daysElapsed, 0);
  const spentSoFar = dailySoFar.reduce((total, amount) => total + amount, 0);
  const estimatedRemaining = dailyAverage * remainingDays;

  return {
    spentSoFar,
    dailyAverage,
    windowDays: recent.length,
    remainingDays,
    estimatedRemaining,
    projectedTotal: spentSoFar + estimatedRemaining,
  };
}
