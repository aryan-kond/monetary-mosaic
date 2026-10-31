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
  /** Set on transactions that came from an import, so the import can be undone. */
  importId?: string;
  /** True for the example transactions and for imports of the sample statement. */
  isSample?: boolean;
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
 * Sample transactions, newest first. October adds up to the figures on the Overview, September
 * is the same days last month for comparisons, and August gives the repeating payments a third
 * data point.
 */
const rows: Row[] = [
  ['t1', '2026-10-25', 'Zomato', 'dining', 620],
  ['t2', '2026-10-25', 'BigBasket', 'groceries', 1180],
  ['t3', '2026-10-24', 'Uber', 'transport', 340],
  ['t4', '2026-10-24', 'Starbucks', 'dining', 740],
  ['t5', '2026-10-23', 'Metro card recharge', 'transport', 430],
  ['t6', '2026-10-22', 'Amazon', 'shopping', 1000, 'review'],
  ['t7', '2026-10-22', 'Swiggy', 'dining', 575],
  ['t8', '2026-10-21', 'Uber', 'transport', 610],
  ['t9', '2026-10-20', 'Uber', 'transport', 800],
  ['t10', '2026-10-20', 'Paytm wallet top-up', 'other', 1690, 'review'],
  ['t11', '2026-10-19', 'Reliance Fresh', 'groceries', 340],
  ['t12', '2026-10-18', 'ATM withdrawal', 'other', 1860],
  ['t13', '2026-10-17', 'Starbucks', 'dining', 980],
  ['t14', '2026-10-16', 'Cash withdrawal', 'other', 795, 'review'],
  ['t15', '2026-10-15', 'Cult.fit', 'health', 1500],
  ['t16', '2026-10-15', 'Amazon', 'shopping', 720, 'review'],
  ['t17', '2026-10-15', 'Uber', 'transport', 190],
  ['t18', '2026-10-14', 'DMart', 'groceries', 1120],
  ['t19', '2026-10-13', 'Electricity bill', 'bills', 550],
  ['t20', '2026-10-13', 'BigBasket', 'groceries', 745],
  ['t21', '2026-10-13', 'Cash withdrawal', 'other', 535, 'review'],
  ['t22', '2026-10-12', 'DMart', 'groceries', 690],
  ['t23', '2026-10-11', 'BigBasket', 'groceries', 640],
  ['t24', '2026-10-10', 'DMart', 'groceries', 2395],
  ['t25', '2026-10-10', 'Zomato', 'dining', 1125],
  ['t26', '2026-10-09', 'DMart', 'groceries', 560],
  ['t27', '2026-10-08', 'Jio', 'bills', 800],
  ['t28', '2026-10-08', 'Chaayos', 'dining', 1080],
  ['t29', '2026-10-07', 'Uber', 'transport', 490],
  ['t30', '2026-10-07', 'MedPlus', 'health', 420],
  ['t31', '2026-10-06', 'Zepto', 'groceries', 780],
  ['t32', '2026-10-05', 'Netflix', 'bills', 650],
  ['t33', '2026-10-05', 'Flipkart', 'shopping', 2000, 'review'],
  ['t34', '2026-10-04', 'Metro card recharge', 'transport', 820],
  ['t35', '2026-10-03', 'Broadband', 'bills', 1240],
  ['t36', '2026-10-02', 'Myntra', 'shopping', 1250],
  ['t37', '2026-10-01', 'Rent payment', 'housing', 16000],
  ['t38', '2026-10-01', 'Salary credit', 'income', 125000],
  ['s1', '2026-09-25', 'Croma', 'shopping', 1380],
  ['s2', '2026-09-25', 'Metro card recharge', 'transport', 520],
  ['s3', '2026-09-24', 'Pizza Hut', 'dining', 820],
  ['s4', '2026-09-23', 'Zepto', 'groceries', 2130],
  ['s5', '2026-09-22', 'Zepto', 'groceries', 980],
  ['s6', '2026-09-21', 'Indian Oil', 'transport', 900],
  ['s7', '2026-09-21', 'ATM withdrawal', 'other', 340],
  ['s8', '2026-09-20', 'Amazon', 'shopping', 650],
  ['s9', '2026-09-19', 'Swiggy', 'dining', 1130],
  ['s10', '2026-09-19', 'Apollo Pharmacy', 'health', 480],
  ['s11', '2026-09-19', 'Paytm wallet top-up', 'other', 1260],
  ['s12', '2026-09-18', 'Barbeque Nation', 'dining', 400],
  ['s13', '2026-09-18', 'Rapido', 'transport', 730],
  ['s14', '2026-09-17', 'Flipkart', 'shopping', 1510],
  ['s15', '2026-09-17', 'Ola', 'transport', 100],
  ['s16', '2026-09-16', 'Reliance Fresh', 'groceries', 820],
  ['s17', '2026-09-15', 'Cult.fit', 'health', 1500],
  ['s18', '2026-09-15', 'Croma', 'shopping', 480],
  ['s19', '2026-09-14', 'UPI transfer', 'other', 1230],
  ['s20', '2026-09-13', 'Electricity bill', 'bills', 410],
  ['s21', '2026-09-13', 'MedPlus', 'health', 180],
  ['s22', '2026-09-12', 'Blinkit', 'groceries', 2280],
  ['s23', '2026-09-12', 'Indian Oil', 'transport', 880],
  ['s24', '2026-09-11', 'ATM withdrawal', 'other', 1150],
  ['s25', '2026-09-10', 'Zepto', 'groceries', 880],
  ['s26', '2026-09-09', 'Pizza Hut', 'dining', 1340],
  ['s27', '2026-09-09', 'ATM withdrawal', 'other', 2000],
  ['s28', '2026-09-08', 'Jio', 'bills', 800],
  ['s29', '2026-09-08', 'Indian Oil', 'transport', 570],
  ['s30', '2026-09-07', 'DMart', 'groceries', 360],
  ['s31', '2026-09-06', 'ATM withdrawal', 'other', 1820],
  ['s32', '2026-09-05', 'Netflix', 'bills', 650],
  ['s33', '2026-09-05', 'Amazon', 'shopping', 1580],
  ['s34', '2026-09-04', 'BigBasket', 'groceries', 910],
  ['s35', '2026-09-03', 'Broadband', 'bills', 1240],
  ['s36', '2026-09-03', 'Barbeque Nation', 'dining', 650],
  ['s37', '2026-09-02', 'DMart', 'groceries', 1040],
  ['s38', '2026-09-01', 'Rent payment', 'housing', 16000],
  ['s39', '2026-09-01', 'Salary credit', 'income', 125000],
  ['a1', '2026-08-13', 'Electricity bill', 'bills', 490],
  ['a2', '2026-08-08', 'Jio', 'bills', 800],
  ['a3', '2026-08-05', 'Netflix', 'bills', 650],
  ['a4', '2026-08-03', 'Broadband', 'bills', 1240],
  ['a5', '2026-08-01', 'Rent payment', 'housing', 16000],
  ['a6', '2026-08-01', 'Salary credit', 'income', 125000],
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
    isSample: true,
  }),
);
