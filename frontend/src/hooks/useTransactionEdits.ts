import { useMemo, useRef, useState } from 'react';
import { categories, type CategoryId } from '../data/categories';
import type { Transaction } from '../data/transactions';
import { formatCurrency } from '../utils/formatCurrency';
import { formatShortDate } from '../utils/formatDate';
import { ruleKey } from '../utils/merchantRules';

export { ruleKey };

/** The details a person can edit. */
export interface TransactionDetails {
  merchant: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** In rupees, always positive. */
  amount: number;
  categoryId: CategoryId;
}

/** A category the person asked us to remember for a merchant. */
export interface SavedRule {
  merchant: string;
  categoryId: CategoryId;
}

/** What was changed last, kept so the change can be undone. */
export interface TransactionEdit {
  /** Increases with every edit, so the toast can tell two similar edits apart. */
  id: number;
  before: Transaction;
  after: TransactionDetails;
  /** Present when the person chose to remember this category for the merchant. */
  rule?: { key: string; previous?: SavedRule };
}

/** One line of import history. */
export interface ImportRecord {
  id: string;
  fileName: string;
  /** ISO timestamp. */
  importedAt: string;
  imported: number;
  skippedDuplicates: number;
  /** Rows left out because they could not be read. */
  excluded: number;
  isSample: boolean;
  /** Set when the import was undone. */
  undoneAt?: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'importId' | 'isSample'>;

export interface ImportInput {
  fileName: string;
  isSample: boolean;
  rows: NewTransaction[];
  skippedDuplicates: number;
  excluded: number;
}

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
 * Holds the transactions, remembered merchant rules, and import history in memory. A saved edit
 * marks the transaction as reviewed, and the last edit can be undone. Imports can be undone too.
 */
export function useTransactionEdits(initial: Transaction[]) {
  const [transactions, setTransactions] = useState(initial);
  const [ruleList, setRuleList] = useState<Record<string, SavedRule>>({});
  const [history, setHistory] = useState<ImportRecord[]>([]);
  const [lastChange, setLastChange] = useState<TransactionEdit | null>(null);
  const editCount = useRef(0);
  const importCount = useRef(0);

  /** The simple merchant-to-category map that the edit and import screens use. */
  const rules = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(ruleList).map(([key, rule]) => [key, rule.categoryId]),
      ) as Record<string, CategoryId>,
    [ruleList],
  );

  /** The same rules as a list, with their merchant names, for the Settings screen. */
  const savedRules = useMemo(
    () => Object.entries(ruleList).map(([key, rule]) => ({ key, ...rule })),
    [ruleList],
  );

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
      setRuleList((current) => ({
        ...current,
        [key]: { merchant: details.merchant, categoryId: details.categoryId },
      }));
    }
    editCount.current += 1;
    setLastChange({
      id: editCount.current,
      before: target,
      after: details,
      rule: rememberRule ? { key, previous: ruleList[key] } : undefined,
    });
  };

  const undo = () => {
    if (!lastChange) return;
    const { before, rule } = lastChange;

    setTransactions((list) =>
      list.map((transaction) => (transaction.id === before.id ? before : transaction)),
    );
    if (rule) {
      setRuleList((current) => {
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

  /** Adds the imported transactions and records the import in the history. */
  const importTransactions = (input: ImportInput) => {
    importCount.current += 1;
    const importId = `import-${importCount.current}`;

    const added: Transaction[] = input.rows.map((row, index) => ({
      ...row,
      id: `${importId}-${index + 1}`,
      importId,
      isSample: input.isSample,
    }));

    setTransactions((list) => [...list, ...added]);
    setHistory((list) => [
      ...list,
      {
        id: importId,
        fileName: input.fileName,
        importedAt: new Date().toISOString(),
        imported: input.rows.length,
        skippedDuplicates: input.skippedDuplicates,
        excluded: input.excluded,
        isSample: input.isSample,
      },
    ]);
  };

  /** Removes everything an import added, and marks it as undone in the history. */
  const undoImport = (importId: string) => {
    setTransactions((list) => list.filter((transaction) => transaction.importId !== importId));
    setHistory((list) =>
      list.map((record) =>
        record.id === importId ? { ...record, undoneAt: new Date().toISOString() } : record,
      ),
    );
    setLastChange(null);
  };

  /** Removes the example transactions, and the history of importing the sample statement. */
  const removeSampleData = () => {
    setTransactions((list) => list.filter((transaction) => !transaction.isSample));
    setHistory((list) => list.filter((record) => !record.isSample));
    setLastChange(null);
  };

  const removeRule = (key: string) => {
    setRuleList((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  return {
    transactions,
    rules,
    savedRules,
    history,
    lastChange,
    saveTransaction,
    undo,
    dismiss,
    importTransactions,
    undoImport,
    removeSampleData,
    removeRule,
  };
}
