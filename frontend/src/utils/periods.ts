import type { Transaction } from '../data/transactions';
import { daysBetween } from './formatDate';

/** Transactions dated within `days` days, starting at `startDate`. */
export function transactionsInPeriod(
  transactions: Transaction[],
  startDate: string,
  days: number,
): Transaction[] {
  return transactions.filter((transaction) => {
    const offset = daysBetween(startDate, transaction.date);
    return offset >= 0 && offset < days;
  });
}

/** Spending for each day of the period, starting at day 1. Income is not counted. */
export function dailySpendingFor(
  transactions: Transaction[],
  startDate: string,
  days: number,
): number[] {
  const totals = Array.from({ length: days }, () => 0);

  for (const transaction of transactions) {
    if (transaction.direction !== 'out') continue;
    const offset = daysBetween(startDate, transaction.date);
    if (offset >= 0 && offset < days) totals[offset] += transaction.amount;
  }

  return totals;
}

export function totalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((transaction) => transaction.direction === 'in')
    .reduce((total, transaction) => total + transaction.amount, 0);
}
