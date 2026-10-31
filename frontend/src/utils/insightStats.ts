import type { BudgetCategoryId } from '../data/budgets';
import { categories, type CategoryId } from '../data/categories';
import type { Transaction } from '../data/transactions';
import { weekdayIndex } from './calendar';
import { formatCurrency } from './formatCurrency';
import { daysBetween, formatShortDate, shiftIsoDate, weekdayNames } from './formatDate';
import { ruleKey } from './merchantRules';
import { dailySpendingFor } from './periods';
import { spendingByCategory } from './spending';
import { median } from './stats';

export interface CategoryChange {
  categoryId: BudgetCategoryId;
  current: number;
  previous: number;
  /** Current minus previous. Positive means more spending. */
  change: number;
  /** Null when there was nothing last month to compare with. */
  changePercent: number | null;
}

/** Spending by category in two periods, with the biggest changes first. */
export function compareCategories(
  current: Transaction[],
  previous: Transaction[],
): CategoryChange[] {
  const now = new Map(spendingByCategory(current).map((row) => [row.categoryId, row.amount]));
  const before = new Map(spendingByCategory(previous).map((row) => [row.categoryId, row.amount]));
  const ids = new Set<CategoryId>([...now.keys(), ...before.keys()]);

  return [...ids]
    .filter((id): id is BudgetCategoryId => id !== 'income')
    .map((id) => {
      const currentAmount = now.get(id) ?? 0;
      const previousAmount = before.get(id) ?? 0;
      return {
        categoryId: id,
        current: currentAmount,
        previous: previousAmount,
        change: currentAmount - previousAmount,
        changePercent:
          previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : null,
      };
    })
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

export interface WeekdayAverage {
  /** 0 for Monday through 6 for Sunday. */
  index: number;
  label: string;
  /** Average spending on this day of the week. */
  average: number;
  /** How many of this weekday are in the period. */
  days: number;
}

/** Average everyday spending for each day of the week. Rent is left out, since it hits one day. */
export function weekdayAverages(
  inPeriod: Transaction[],
  period: { startDate: string; days: number },
): WeekdayAverage[] {
  const everyday = inPeriod.filter((transaction) => transaction.categoryId !== 'housing');
  const daily = dailySpendingFor(everyday, period.startDate, period.days);
  const totals = Array.from({ length: 7 }, () => 0);
  const counts = Array.from({ length: 7 }, () => 0);

  daily.forEach((amount, offset) => {
    const weekday = weekdayIndex(shiftIsoDate(period.startDate, offset));
    totals[weekday] += amount;
    counts[weekday] += 1;
  });

  return weekdayNames.map((name, index) => ({
    index,
    label: name.long,
    average: counts[index] > 0 ? totals[index] / counts[index] : 0,
    days: counts[index],
  }));
}

export interface MerchantTotal {
  key: string;
  merchant: string;
  total: number;
  payments: number;
}

/** The merchants that took the most money. Rent is left out, since it would always lead. */
export function topMerchants(inPeriod: Transaction[], limit: number): MerchantTotal[] {
  const groups = new Map<string, MerchantTotal>();

  for (const transaction of inPeriod) {
    if (transaction.direction !== 'out' || transaction.categoryId === 'housing') continue;
    const key = ruleKey(transaction.merchant);
    const group = groups.get(key);
    if (group) {
      group.total += transaction.amount;
      group.payments += 1;
    } else {
      groups.set(key, {
        key,
        merchant: transaction.merchant,
        total: transaction.amount,
        payments: 1,
      });
    }
  }

  return [...groups.values()].sort((a, b) => b.total - a.total).slice(0, limit);
}

export interface UnusualItem {
  transaction: Transaction;
  kind: 'large' | 'repeat';
  /** Plain words on why this was picked out. */
  reason: string;
}

/** A payment this many times the usual amount for its category is worth a look. */
const LARGE_FACTOR = 2.5;
/** Small payments are never flagged, however large they are next to a tiny usual amount. */
const LARGE_FLOOR = 1000;
/** Without this many other payments in the category, "usual" means little. */
const MIN_OTHERS = 5;
/** The same amount to the same merchant within this many days looks like a double charge. */
const REPEAT_WINDOW_DAYS = 2;
/** Fixed bills are regular by nature, so they are not compared with other payments. */
const NOT_COMPARED = new Set<CategoryId>(['housing', 'bills', 'income']);

/**
 * Picks out payments in the period that are worth a look: unusually large for their category,
 * or the same amount paid to the same merchant twice in a row. This is a prompt to check, not a
 * judgment. Newest first.
 */
export function findUnusual(all: Transaction[], inPeriod: Transaction[]): UnusualItem[] {
  const spending = all.filter((transaction) => transaction.direction === 'out');
  const found = new Map<string, UnusualItem>();

  for (const transaction of inPeriod) {
    if (transaction.direction !== 'out' || NOT_COMPARED.has(transaction.categoryId)) continue;

    const others = spending
      .filter((other) => other.categoryId === transaction.categoryId && other.id !== transaction.id)
      .map((other) => other.amount);
    if (others.length < MIN_OTHERS) continue;

    const usual = median(others);
    if (transaction.amount >= LARGE_FLOOR && transaction.amount >= usual * LARGE_FACTOR) {
      const times = (transaction.amount / usual).toFixed(1);
      found.set(transaction.id, {
        transaction,
        kind: 'large',
        reason: `About ${times} times your usual ${categories[transaction.categoryId].label.toLowerCase()} payment, which is typically ${formatCurrency(usual)}.`,
      });
    }
  }

  const groups = new Map<string, Transaction[]>();
  for (const transaction of inPeriod) {
    if (transaction.direction !== 'out' || transaction.categoryId === 'housing') continue;
    const key = `${ruleKey(transaction.merchant)}|${transaction.amount}`;
    groups.set(key, [...(groups.get(key) ?? []), transaction]);
  }

  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach((transaction, index) => {
      const earlier = sorted[index - 1];
      if (!earlier || found.has(transaction.id)) return;
      if (daysBetween(earlier.date, transaction.date) > REPEAT_WINDOW_DAYS) return;
      found.set(transaction.id, {
        transaction,
        kind: 'repeat',
        reason: `The same amount, ${formatCurrency(transaction.amount)}, was paid to ${transaction.merchant} on ${formatShortDate(earlier.date)} and ${formatShortDate(transaction.date)}. Worth checking it is not a double charge.`,
      });
    });
  }

  return [...found.values()].sort((a, b) => b.transaction.date.localeCompare(a.transaction.date));
}
