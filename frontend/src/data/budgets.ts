import type { CategoryId } from './categories';

/** Categories that can have a limit. Income is not spending. */
export type BudgetCategoryId = Exclude<CategoryId, 'income'>;

export const defaultMonthlyBudget = 65000;

/** Starting limits in rupees. Categories left out have no limit. */
export const defaultCategoryLimits: Partial<Record<BudgetCategoryId, number>> = {
  housing: 21000,
  groceries: 11000,
  dining: 5000,
  shopping: 5500,
  transport: 5000,
  bills: 4500,
  health: 2500,
  other: 6500,
};
