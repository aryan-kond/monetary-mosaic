import type { CategoryId } from '../data/categories';
import type { Transaction } from '../data/transactions';
import { addMonths } from './calendar';
import { daysBetween, shiftIsoDate } from './formatDate';
import { ruleKey } from './merchantRules';
import { median } from './stats';
export type Cadence = 'weekly' | 'monthly';

export interface Payment {
  /** YYYY-MM-DD. */
  date: string;
  amount: number;
}

export interface RecurringPattern {
  /** The key a person's "not recurring" choice is stored under. */
  key: string;
  merchant: string;
  categoryId: CategoryId;
  cadence: Cadence;
  /** The middle amount of the payments seen. */
  typical: number;
  min: number;
  max: number;
  /** True when every payment is within 5% of the typical amount. */
  fixedAmount: boolean;
  /** Oldest first. */
  payments: Payment[];
  lastDate: string;
  /** A prediction, not a fact: the last payment plus one gap. */
  nextDate: string;
  /** Three or more payments in a clear rhythm is "likely". Two is only "possible". */
  confidence: 'likely' | 'possible';
}

/** Gaps between payments, in days, that count as a steady rhythm. */
const MONTHLY_GAP = { min: 26, max: 35 };
const WEEKLY_GAP = { min: 6, max: 8 };
/**
 * Payments further than this from the typical amount are not a regular bill. With only two
 * payments there is little to go on, so they have to be closer.
 */
const AMOUNT_TOLERANCE = { threeOrMore: 0.4, two: 0.15 };
/** Payments within this of the typical amount count as one fixed amount. */
const FIXED_TOLERANCE = 0.05;

function cadenceOf(payments: Payment[]): Cadence | null {
  const gaps = payments
    .slice(1)
    .map((payment, index) => daysBetween(payments[index].date, payment.date));
  const allWithin = (range: { min: number; max: number }) =>
    gaps.every((gap) => gap >= range.min && gap <= range.max);

  if (allWithin(MONTHLY_GAP)) return 'monthly';
  if (payments.length >= 3 && allWithin(WEEKLY_GAP)) return 'weekly';
  return null;
}

/**
 * Looks for money going out to the same merchant at a steady rhythm, such as every month, with
 * similar amounts. This is an inference from the transactions, so it can be wrong. "Other"
 * (cash and transfers) is skipped because those are rarely regular bills.
 */
export function detectRecurring(transactions: Transaction[]): RecurringPattern[] {
  const groups = new Map<string, Transaction[]>();
  for (const transaction of transactions) {
    if (transaction.direction !== 'out' || transaction.categoryId === 'other') continue;
    const key = ruleKey(transaction.merchant);
    groups.set(key, [...(groups.get(key) ?? []), transaction]);
  }

  const patterns: RecurringPattern[] = [];

  for (const [key, list] of groups) {
    if (list.length < 2) continue;

    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    const payments = sorted.map(({ date, amount }) => ({ date, amount }));
    const cadence = cadenceOf(payments);
    if (!cadence) continue;

    const amounts = payments.map((payment) => payment.amount);
    const typical = median(amounts);
    const tolerance = payments.length >= 3 ? AMOUNT_TOLERANCE.threeOrMore : AMOUNT_TOLERANCE.two;
    if (!amounts.every((amount) => Math.abs(amount - typical) / typical <= tolerance)) continue;

    const last = sorted[sorted.length - 1];
    patterns.push({
      key,
      merchant: last.merchant,
      categoryId: last.categoryId,
      cadence,
      typical,
      min: Math.min(...amounts),
      max: Math.max(...amounts),
      fixedAmount: amounts.every(
        (amount) => Math.abs(amount - typical) / typical <= FIXED_TOLERANCE,
      ),
      payments,
      lastDate: last.date,
      nextDate: cadence === 'monthly' ? addMonths(last.date, 1) : shiftIsoDate(last.date, 7),
      confidence: payments.length >= 3 ? 'likely' : 'possible',
    });
  }

  return patterns.sort((a, b) => a.nextDate.localeCompare(b.nextDate));
}

/** What the pattern costs in an average month. Weekly payments are 52 a year, over 12 months. */
export function monthlyEquivalent(pattern: RecurringPattern): number {
  return pattern.cadence === 'monthly' ? pattern.typical : (pattern.typical * 52) / 12;
}
