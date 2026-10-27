import { useState } from 'react';
import { categories, type CategoryId } from '../data/categories';
import type { Transaction } from '../data/transactions';

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
  before: Transaction;
  after: TransactionDetails;
  /** Present when the person chose to remember this category for the merchant. */
  rule?: { key: string; previous?: CategoryId };
}

export const ruleKey = (merchant: string) => merchant.trim().toLowerCase();

const listFormat = new Intl.ListFormat('en-IN', { style: 'long', type: 'conjunction' });

/** Plain-language confirmation shown after a change. */
export function describeChange({ before, after, rule }: TransactionEdit): string {
  const changed: string[] = [];
  if (before.merchant !== after.merchant) changed.push('merchant');
  if (before.date !== after.date) changed.push('date');
  if (before.amount !== after.amount) changed.push('amount');
  if (before.categoryId !== after.categoryId) changed.push('category');

  const label = categories[after.categoryId].label;
  let base: string;
  if (changed.length === 0) {
    base = `Confirmed ${label} for ${after.merchant}.`;
  } else if (changed.length === 1 && changed[0] === 'category') {
    base = `Moved ${after.merchant} to ${label}.`;
  } else {
    base = `Updated ${listFormat.format(changed)} for ${after.merchant}.`;
  }

  return rule ? `${base} Future ${after.merchant} transactions will use ${label}.` : base;
}

/**
 * Holds the transactions and the remembered merchant rules in memory. A saved edit marks the
 * transaction as reviewed, and the last change can be undone.
 */
export function useTransactionEdits(initial: Transaction[]) {
  const [transactions, setTransactions] = useState(initial);
  const [rules, setRules] = useState<Record<string, CategoryId>>({});
  const [lastChange, setLastChange] = useState<TransactionEdit | null>(null);

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
    setLastChange({
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

  return { transactions, rules, lastChange, saveTransaction, undo, dismiss };
}
