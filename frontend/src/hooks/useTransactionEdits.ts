import { useRef, useState } from 'react';
import { categories, type CategoryId } from '../data/categories';
import type { Transaction } from '../data/transactions';
import { formatCurrency } from '../utils/formatCurrency';
import { formatShortDate } from '../utils/formatDate';
import { ruleKey } from '../utils/merchantRules';

/** The details a person can edit. */
export interface TransactionDetails {
  merchant: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** Whole rupees, always positive. */
  amount: number;
  categoryId: CategoryId;
}

/** What was changed last, kept so the change can be undone. */
export interface TransactionEdit {
  /** Increases with every edit, so the toast can tell two similar edits apart. */
  id: number;
  before: Transaction;
  after: TransactionDetails;
  /** Present when the person chose to remember this category for the merchant. */
  rule?: { key: string; previous?: CategoryId };
}

export { ruleKey };

const listFormat = new Intl.ListFormat('en-IN', { style: 'long', type: 'conjunction' });

/** Plain-language confirmation that says what changed. */
export function describeChange({ before, after, rule }: TransactionEdit): string {
  const changed: string[] = [];
  if (before.merchant !== after.merchant) changed.push('merchant');
  if (before.date !== after.date) changed.push('date');
  if (before.amount !== after.amount) changed.push('amount');
  if (before.categoryId !== after.categoryId) changed.push('category');

  const newLabel = categories[after.categoryId].label;
  let base: string;

  if (changed.length === 0) {
    base = before.needsReview
      ? `Confirmed ${newLabel} for ${after.merchant}.`
      : `Kept ${newLabel} for ${after.merchant}.`;
  } else if (changed.length > 1) {
    base = `Updated ${after.merchant}: ${listFormat.format(changed)}.`;
  } else {
    switch (changed[0]) {
      case 'merchant':
        base = `Renamed ${before.merchant} to ${after.merchant}.`;
        break;
      case 'date':
        base = `${after.merchant} date changed from ${formatShortDate(before.date)} to ${formatShortDate(after.date)}.`;
        break;
      case 'amount':
        base = `${after.merchant} amount changed from ${formatCurrency(before.amount)} to ${formatCurrency(after.amount)}.`;
        break;
      default:
        base = `${after.merchant} moved from ${categories[before.categoryId].label} to ${newLabel}.`;
    }
  }

  return rule ? `${base} Future ${after.merchant} transactions will use ${newLabel}.` : base;
}

/**
 * Holds the transactions and the remembered merchant rules in memory. A saved edit marks the
 * transaction as reviewed, and the last change can be undone.
 */
export function useTransactionEdits(initial: Transaction[]) {
  const [transactions, setTransactions] = useState(initial);
  const [rules, setRules] = useState<Record<string, CategoryId>>({});
  const [lastChange, setLastChange] = useState<TransactionEdit | null>(null);
  const editCount = useRef(0);
  const importedCount = useRef(0);

  /** Adds imported transactions. Each one gets its own id. */
  const addTransactions = (incoming: Omit<Transaction, 'id'>[]) => {
    const added = incoming.map((transaction) => {
      importedCount.current += 1;
      return { ...transaction, id: `imp-${importedCount.current}` };
    });
    setTransactions((list) => [...list, ...added]);
  };

  const saveTransaction = (
    transactionId: string,
    details: TransactionDetails,
    rememberRule: boolean,
  ) => {
    const target = transactions.find((transaction) => transaction.id === transactionId);
    if (!target) return;
    const key = ruleKey(details.merchant);

    setTransactions((list) =>
      list.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, ...details, needsReview: false }
          : transaction,
      ),
    );
    if (rememberRule) {
      setRules((current) => ({ ...current, [key]: details.categoryId }));
    }
    editCount.current += 1;
    setLastChange({
      id: editCount.current,
      before: target,
      after: details,
      rule: rememberRule ? { key, previous: rules[key] } : undefined,
    });
  };

  const undo = () => {
    if (!lastChange) return;
    const { before, rule } = lastChange;

    setTransactions((list) =>
      list.map((transaction) => (transaction.id === before.id ? before : transaction)),
    );
    if (rule) {
      setRules((current) => {
        const next = { ...current };
        if (rule.previous) {
          next[rule.key] = rule.previous;
        } else {
          delete next[rule.key];
        }
        return next;
      });
    }
    setLastChange(null);
  };

  const dismiss = () => setLastChange(null);

  return { transactions, rules, lastChange, saveTransaction, addTransactions, undo, dismiss };
}
