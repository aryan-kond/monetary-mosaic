import { useState } from 'react';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { EditTransactionDialog } from '../../components/EditTransactionDialog/EditTransactionDialog';
import { SearchField } from '../../components/Field/SearchField';
import { SelectField, type SelectOption } from '../../components/Field/SelectField';
import { TransactionsTable } from '../../components/TransactionsTable/TransactionsTable';
import { categories, type CategoryId } from '../../data/categories';
import type { ReportingPeriod } from '../../utils/reportingPeriod';
import type { Transaction } from '../../data/transactions';
import type { TransactionDetails } from '../../hooks/useTransactionEdits';
import { formatShortDate } from '../../utils/formatDate';
import {
  emptyFilters,
  filterTransactions,
  hasActiveFilters,
  rangeStart,
  type DateRange,
  type Filters,
} from '../../utils/transactionFilters';
import {
  defaultSortValue,
  findSort,
  sortOptions,
  sortTransactions,
} from '../../utils/transactionSort';
import './TransactionsPage.css';

const PAGE_SIZE = 25;

const categoryOptions: SelectOption[] = [
  { value: 'all', label: 'All categories' },
  ...(Object.keys(categories) as CategoryId[]).map((id) => ({
    value: id,
    label: categories[id].label,
  })),
];

const dateOptions: SelectOption[] = [
  { value: 'all', label: 'All dates' },
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
];

interface TransactionsPageProps {
  transactions: Transaction[];
  period: ReportingPeriod | null;
  rules: Record<string, CategoryId>;
  onSaveTransaction: (
    transactionId: string,
    details: TransactionDetails,
    rememberRule: boolean,
  ) => void;
  /** Starts the import flow. Used when there are no transactions at all. */
  onImportStatement: () => void;
}

export function TransactionsPage({
  transactions,
  period,
  rules,
  onSaveTransaction,
  onImportStatement,
}: TransactionsPageProps) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sortValue, setSortValue] = useState(defaultSortValue);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // The transaction being edited is copied when the dialog opens, so its content stays steady
  // while the dialog fades out after saving.
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSession, setDialogSession] = useState(0);

  if (transactions.length === 0) {
    return (
      <div className="txn-page">
        <Card title="All transactions" description="No transactions yet.">
          <div className="txn-empty">
            <p className="txn-empty__title">There is nothing here yet</p>
            <p className="txn-empty__text">
              Import a CSV statement from your bank to see your transactions.
            </p>
            <Button onClick={onImportStatement}>Import statement</Button>
          </div>
        </Card>
      </div>
    );
  }

  const hasSampleData = transactions.some((transaction) => transaction.isSample);

  // Date ranges count back from the most recent transaction.
  const latestDate = transactions.reduce(
    (latest, transaction) => (transaction.date > latest ? transaction.date : latest),
    '',
  );

  const matches = sortTransactions(
    filterTransactions(transactions, filters, latestDate),
    findSort(sortValue),
  );
  const visible = matches.slice(0, visibleCount);
  const filtersActive = hasActiveFilters(filters);
  const dateStart = latestDate ? rangeStart(filters.dateRange, latestDate) : null;

  // Any change to the filters or the sort starts the list again from the top.
  const updateFilters = (changes: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...changes }));
    setVisibleCount(PAGE_SIZE);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setVisibleCount(PAGE_SIZE);
  };

  const updateSort = (value: string) => {
    setSortValue(value);
    setVisibleCount(PAGE_SIZE);
  };

  const openEditor = (transaction: Transaction) => {
    setEditing(transaction);
    setDialogSession((session) => session + 1);
    setDialogOpen(true);
  };

  const closeEditor = () => setDialogOpen(false);

  const saveEditor = (details: TransactionDetails, rememberRule: boolean) => {
    if (editing) onSaveTransaction(editing.id, details, rememberRule);
    setDialogOpen(false);
  };

  const summary = filtersActive
    ? `${matches.length} of ${transactions.length} transactions match`
    : `${transactions.length} transactions`;
  const rangeNote = dateStart
    ? `, from ${formatShortDate(dateStart)} to ${formatShortDate(latestDate)}`
    : '';

  return (
    <div className="txn-page">
      <Card
        title="All transactions"
        description={`${hasSampleData ? 'Sample data. ' : ''}Categories are assigned automatically, and every detail can be corrected.`}
      >
        <div className="txn-toolbar">
          <SearchField
            label="Search"
            value={filters.query}
            placeholder="Search merchant, category, or amount"
            onChange={(query) => updateFilters({ query })}
          />
          <SelectField
            label="Category"
            value={filters.categoryId}
            options={categoryOptions}
            onChange={(value) => updateFilters({ categoryId: value as Filters['categoryId'] })}
          />
          <SelectField
            label="Date range"
            value={filters.dateRange}
            options={dateOptions}
            onChange={(value) => updateFilters({ dateRange: value as DateRange })}
          />
          <SelectField
            label="Sort by"
            value={sortValue}
            options={sortOptions}
            onChange={updateSort}
          />
        </div>

        <div className="txn-results">
          <p role="status">
            {summary}
            {rangeNote}
          </p>
          {filtersActive && matches.length > 0 && (
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="txn-empty">
            <p className="txn-empty__title">No transactions match your filters</p>
            <p className="txn-empty__text">
              Try a different merchant, category, or date range, or clear the filters.
            </p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <TransactionsTable transactions={visible} caption="Transactions" onEdit={openEditor} />
            {matches.length > visible.length && (
              <div className="txn-more">
                <p>
                  Showing {visible.length} of {matches.length}
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  Show {Math.min(PAGE_SIZE, matches.length - visible.length)} more
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {period && (
        <EditTransactionDialog
          open={dialogOpen}
          session={dialogSession}
          transaction={editing}
          rules={rules}
          period={period}
          onClose={closeEditor}
          onSave={saveEditor}
        />
      )}
    </div>
  );
}
