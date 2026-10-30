import type { BudgetCategoryId } from '../data/budgets';
import { categories, type CategoryId } from '../data/categories';
import type { Transaction } from '../data/transactions';
import { projectMonthEnd } from './forecast';
import { dailySpendingFor } from './periods';

export type BudgetState = 'on-track' | 'nearing' | 'over';

/** From this share of a limit onward, spending is "nearing" it. */
const NEARING_PERCENT = 80;

/** Threshold states are explicit: under 80% on track, 80 to 100% nearing, above 100% over. */
export function budgetState(percentUsed: number): BudgetState {
  if (percentUsed > 100) return 'over';
  if (percentUsed >= NEARING_PERCENT) return 'nearing';
  return 'on-track';
}

/** The words and tone for each state. Red is kept for spending that has really gone over. */
export const budgetStateInfo: Record<
  BudgetState,
  {
    label: string;
    tone: 'positive' | 'warning' | 'negative';
    progressTone?: 'warning' | 'negative';
  }
> = {
  'on-track': { label: 'On track', tone: 'positive' },
  nearing: { label: 'Nearing limit', tone: 'warning', progressTone: 'warning' },
  over: { label: 'Over budget', tone: 'negative', progressTone: 'negative' },
};

export interface BudgetRow {
  categoryId: BudgetCategoryId;
  /** Null when no limit is set. */
  limit: number | null;
  /** Actual spending so far this period. */
  spent: number;
  percentUsed: number | null;
  /** Limit minus spending. Negative once the limit is passed. */
  remaining: number | null;
  state: BudgetState | null;
  /** Estimated spending by the end of the month. Null without enough data. */
  projected: number | null;
  /** True when the estimate passes the limit although spending has not yet. */
  projectedOver: boolean;
}

interface PeriodInfo {
  startDate: string;
  days: number;
  daysInMonth: number;
}

const budgetCategories = (Object.keys(categories) as CategoryId[]).filter(
  (id): id is BudgetCategoryId => id !== 'income',
);

/** One row per spending category. Categories closest to, or past, their limit come first. */
export function buildBudgetRows(
  inPeriod: Transaction[],
  period: PeriodInfo,
  limits: Partial<Record<BudgetCategoryId, number>>,
): BudgetRow[] {
  const rows = budgetCategories.map((categoryId): BudgetRow => {
    const own = inPeriod.filter((transaction) => transaction.categoryId === categoryId);
    const daily = dailySpendingFor(own, period.startDate, period.days);
    const spent = daily.reduce((total, amount) => total + amount, 0);
    const limit = limits[categoryId] ?? null;
    const projected = projectMonthEnd(daily, period.daysInMonth)?.projectedTotal ?? null;
    const percentUsed = limit === null ? null : (spent / limit) * 100;
    const state = percentUsed === null ? null : budgetState(percentUsed);

    return {
      categoryId,
      limit,
      spent,
      percentUsed,
      remaining: limit === null ? null : limit - spent,
      state,
      projected,
      projectedOver: limit !== null && projected !== null && projected > limit && state !== 'over',
    };
  });

  return rows.sort((a, b) => {
    if (a.percentUsed !== null && b.percentUsed !== null) return b.percentUsed - a.percentUsed;
    if (a.percentUsed !== null) return -1;
    if (b.percentUsed !== null) return 1;
    return b.spent - a.spent;
  });
}
