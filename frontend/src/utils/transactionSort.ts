import { categories } from '../data/categories';
import type { Transaction } from '../data/transactions';

type SortKey = 'date' | 'merchant' | 'category' | 'amount';
type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export interface SortOption {
  value: string;
  /** Plain-language label shown in the Sort by menu. */
  label: string;
  sort: SortState;
}

export const sortOptions: SortOption[] = [
  { value: 'date-desc', label: 'Newest first', sort: { key: 'date', direction: 'desc' } },
  { value: 'date-asc', label: 'Oldest first', sort: { key: 'date', direction: 'asc' } },
  { value: 'amount-desc', label: 'Highest amount', sort: { key: 'amount', direction: 'desc' } },
  { value: 'amount-asc', label: 'Lowest amount', sort: { key: 'amount', direction: 'asc' } },
  { value: 'merchant-asc', label: 'Merchant A to Z', sort: { key: 'merchant', direction: 'asc' } },
  { value: 'category-asc', label: 'Category A to Z', sort: { key: 'category', direction: 'asc' } },
];

export const defaultSortValue = 'date-desc';

export function findSort(value: string): SortState {
  return (sortOptions.find((option) => option.value === value) ?? sortOptions[0]).sort;
}

/** Amounts are compared by size, so income and spending are ranked together. */
export function sortTransactions(transactions: Transaction[], sort: SortState): Transaction[] {
  const factor = sort.direction === 'asc' ? 1 : -1;

  return [...transactions].sort((a, b) => {
    switch (sort.key) {
      case 'date':
        return a.date.localeCompare(b.date) * factor;
      case 'merchant':
        return a.merchant.localeCompare(b.merchant) * factor;
      case 'category':
        return (
          categories[a.categoryId].label.localeCompare(categories[b.categoryId].label) * factor
        );
      case 'amount':
        return (a.amount - b.amount) * factor;
    }
  });
}
