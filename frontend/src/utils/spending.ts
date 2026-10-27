import type { CategoryId } from '../data/categories';
import type { Transaction } from '../data/transactions';

export interface CategorySpend {
  categoryId: CategoryId;
  amount: number;
}

/** Adds up money going out, by category. Income is not spending, so it is left out. */
export function spendingByCategory(transactions: Transaction[]): CategorySpend[] {
  const totals = new Map<CategoryId, number>();

  for (const transaction of transactions) {
    if (transaction.direction !== 'out') continue;
    totals.set(
      transaction.categoryId,
      (totals.get(transaction.categoryId) ?? 0) + transaction.amount,
    );
  }

  return Array.from(totals, ([categoryId, amount]) => ({ categoryId, amount }));
}
