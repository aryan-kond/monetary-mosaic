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

type Row = [
  id: string,
  date: string,
  merchant: string,
  categoryId: CategoryId,
  amount: number,
  flag?: 'review',
];

/**
 * Sample transactions, newest first. Spending adds up to the daily and category figures on
 * the Overview, and the salary credit matches Total Income.
 */
const rows: Row[] = [
  ['t1', '2026-10-25', 'Zomato', 'dining', 620],
  ['t2', '2026-10-25', 'BigBasket', 'groceries', 1180],
  ['t3', '2026-10-24', 'Uber', 'transport', 340],
  ['t4', '2026-10-24', 'Starbucks', 'dining', 740],
  ['t5', '2026-10-23', 'Metro card recharge', 'transport', 430],
  ['t6', '2026-10-22', 'Apollo Pharmacy', 'health', 575],
  ['t7', '2026-10-22', 'Amazon', 'shopping', 1000, 'review'],
  ['t8', '2026-10-21', 'Mobile recharge', 'bills', 610],
  ['t9', '2026-10-20', 'Blinkit', 'groceries', 2100],
  ['t10', '2026-10-20', 'Starbucks', 'dining', 290],
  ['t11', '2026-10-20', 'Indian Oil', 'transport', 100],
  ['t12', '2026-10-19', 'Pizza Hut', 'dining', 340],
  ['t13', '2026-10-18', 'Blinkit', 'groceries', 1710],
  ['t14', '2026-10-18', 'Uber', 'transport', 150],
  ['t15', '2026-10-17', 'UPI transfer', 'other', 980, 'review'],
  ['t16', '2026-10-16', 'Indian Oil', 'transport', 795],
  ['t17', '2026-10-15', 'BigBasket', 'groceries', 1230],
  ['t18', '2026-10-15', 'Amazon', 'shopping', 1080, 'review'],
  ['t19', '2026-10-15', 'Metro card recharge', 'transport', 100],
  ['t20', '2026-10-14', 'Zomato', 'dining', 220],
  ['t21', '2026-10-14', 'Metro card recharge', 'transport', 900],
  ['t22', '2026-10-13', 'Electricity bill', 'bills', 300],
  ['t23', '2026-10-13', 'UPI transfer', 'other', 1530, 'review'],
  ['t24', '2026-10-12', 'BigBasket', 'groceries', 300],
  ['t25', '2026-10-12', 'Cult.fit', 'health', 390],
  ['t26', '2026-10-11', 'Ola', 'transport', 640],
  ['t27', '2026-10-10', 'Water bill', 'bills', 1200],
  ['t28', '2026-10-10', 'Cult.fit', 'health', 520],
  ['t29', '2026-10-10', 'UPI transfer', 'other', 1800],
  ['t30', '2026-10-09', 'Uber', 'transport', 125],
  ['t31', '2026-10-09', 'Practo', 'health', 435],
  ['t32', '2026-10-08', 'Swiggy', 'dining', 1310],
  ['t33', '2026-10-08', 'ATM withdrawal', 'other', 570, 'review'],
  ['t34', '2026-10-07', 'Starbucks', 'dining', 200],
  ['t35', '2026-10-07', 'Mobile recharge', 'bills', 710],
  ['t36', '2026-10-06', 'Reliance Fresh', 'groceries', 680],
  ['t37', '2026-10-06', 'Uber', 'transport', 100],
  ['t38', '2026-10-05', 'BigBasket', 'groceries', 1250],
  ['t39', '2026-10-05', 'Barbeque Nation', 'dining', 1400],
  ['t40', '2026-10-04', 'Croma', 'shopping', 400],
  ['t41', '2026-10-04', 'Electricity bill', 'bills', 420],
  ['t42', '2026-10-03', 'Myntra', 'shopping', 1240, 'review'],
  ['t43', '2026-10-02', 'Decathlon', 'shopping', 1250],
  ['t44', '2026-10-01', 'Rent payment', 'housing', 16000],
  ['t45', '2026-10-01', 'Salary credit', 'income', 125000],
];

export const transactions: Transaction[] = rows.map(
  ([id, date, merchant, categoryId, amount, flag]): Transaction => ({
    id,
    date,
    merchant,
    categoryId,
    amount,
    direction: categoryId === 'income' ? 'in' : 'out',
    needsReview: flag === 'review',
  }),
);

/** The most recent transaction date. Date ranges are counted back from here. */
export const latestTransactionDate = transactions.reduce(
  (latest, transaction) => (transaction.date > latest ? transaction.date : latest),
  '',
);

/** The latest few, shown on the Overview. */
export const recentTransactions = transactions.slice(0, 8);
