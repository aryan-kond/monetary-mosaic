import { categories, type CategoryId } from '../data/categories';
import type { Transaction } from '../data/transactions';
import { shiftIsoDate } from './formatDate';

export type DateRange = 'all' | '7d' | '14d';

export interface Filters {
  query: string;
  categoryId: CategoryId | 'all';
  dateRange: DateRange;
}

export const emptyFilters: Filters = { query: '', categoryId: 'all', dateRange: 'all' };

const RANGE_DAYS = { '7d': 7, '14d': 14 } as const;

export function hasActiveFilters(filters: Filters): boolean {
  return filters.query.trim() !== '' || filters.categoryId !== 'all' || filters.dateRange !== 'all';
}

/** First day included by a date range, counting back from the most recent transaction. */
export function rangeStart(range: DateRange, latestDate: string): string | null {
  if (range === 'all') return null;
  return shiftIsoDate(latestDate, -(RANGE_DAYS[range] - 1));
}

/**
 * Text searches match the merchant or category name. A search made only of digits, commas, or ₹
 * matches amounts instead, so "1,180" and "1180" both find ₹1,180.
 */
export function filterTransactions(
  transactions: Transaction[],
  filters: Filters,
  latestDate: string,
): Transaction[] {
  const query = filters.query.trim().toLowerCase();
  const digits = query.replace(/\D/g, '');
  const isAmountSearch = digits !== '' && /^[\d,.\s₹]+$/.test(query);
  const start = rangeStart(filters.dateRange, latestDate);

  return transactions.filter((transaction) => {
    if (filters.categoryId !== 'all' && transaction.categoryId !== filters.categoryId) return false;
    if (start && transaction.date < start) return false;
    if (query === '') return true;
    if (isAmountSearch) return String(transaction.amount).includes(digits);
    return (
      transaction.merchant.toLowerCase().includes(query) ||
      categories[transaction.categoryId].label.toLowerCase().includes(query)
    );
  });
}
