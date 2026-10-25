import type { CategoryId } from './categories';

export interface Transaction {
  id: string;
  merchant: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  categoryId: CategoryId;
  /** Always positive. `direction` says whether money went out or came in. */
  amount: number;
  direction: 'out' | 'in';
  /** True when the category was assigned automatically with low confidence. */
  needsReview?: boolean;
}

/** Sample transactions. Their amounts match the daily totals for 21–25 Oct in the trend chart. */
export const recentTransactions: Transaction[] = [
  {
    id: 't1',
    merchant: 'Zomato',
    date: '2026-10-25',
    categoryId: 'dining',
    amount: 620,
    direction: 'out',
  },
  {
    id: 't2',
    merchant: 'BigBasket',
    date: '2026-10-25',
    categoryId: 'groceries',
    amount: 1180,
    direction: 'out',
  },
  {
    id: 't3',
    merchant: 'Uber',
    date: '2026-10-24',
    categoryId: 'transport',
    amount: 340,
    direction: 'out',
  },
  {
    id: 't4',
    merchant: 'Starbucks',
    date: '2026-10-24',
    categoryId: 'dining',
    amount: 740,
    direction: 'out',
  },
  {
    id: 't5',
    merchant: 'Metro card recharge',
    date: '2026-10-23',
    categoryId: 'transport',
    amount: 430,
    direction: 'out',
  },
  {
    id: 't6',
    merchant: 'Apollo Pharmacy',
    date: '2026-10-22',
    categoryId: 'health',
    amount: 575,
    direction: 'out',
  },
  {
    id: 't7',
    merchant: 'Amazon',
    date: '2026-10-22',
    categoryId: 'shopping',
    amount: 1000,
    direction: 'out',
    needsReview: true,
  },
  {
    id: 't8',
    merchant: 'Mobile recharge',
    date: '2026-10-21',
    categoryId: 'bills',
    amount: 610,
    direction: 'out',
  },
];
