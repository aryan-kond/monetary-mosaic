import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { AppShell } from './components/AppShell/AppShell';
import { Button } from './components/Button/Button';
import { PageHeader } from './components/PageHeader/PageHeader';
import { primaryNav, utilityNav, type NavId } from './components/Sidebar/navItems';
import { UndoToast } from './components/UndoToast/UndoToast';
import { transactions as sampleTransactions } from './data/transactions';
import { describeChange, useTransactionEdits } from './hooks/useTransactionEdits';
import { ImportPage } from './pages/Import/ImportPage';
import { OverviewPage } from './pages/Overview/OverviewPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { TransactionsPage } from './pages/Transactions/TransactionsPage';
import { getReportingPeriod } from './utils/reportingPeriod';
import { useBudgets } from './hooks/useBudgets';
import { BudgetsPage } from './pages/Budgets/BudgetsPage';
import { useRecurringPrefs } from './hooks/useRecurringPrefs';
import { RecurringPage } from './pages/Recurring/RecurringPage';
import './App.css';

const allNavItems = [...primaryNav, ...utilityNav];

export default function App() {
  const [activeId, setActiveId] = useState<NavId>('overview');
  /** The import flow lives inside Transactions, so this only matters on that screen. */
  const [importing, setImporting] = useState(false);
  const {
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
  } = useTransactionEdits(sampleTransactions);
  const { monthlyBudget, setMonthlyBudget, categoryLimits, setCategoryLimit } = useBudgets();
  const {
    hidden: hiddenRecurring,
    hide: hideRecurring,
    restoreAll: restoreRecurring,
  } = useRecurringPrefs();

  // The Overview covers the month of the latest transaction, so edits and imports can move it.
  const period = getReportingPeriod(transactions);
  const hasSampleData = transactions.some((transaction) => transaction.isSample);

  const activeItem = allNavItems.find((item) => item.id === activeId) ?? primaryNav[0];
  const isOverview = activeId === 'overview';
  const isTransactions = activeId === 'transactions';
  const showImport = isTransactions && importing;
  const showsData =
    isOverview || isTransactions || activeId === 'budgets' || activeId === 'recurring';
  const showsSampleData = showsData && !showImport && hasSampleData;

  // Any move to another screen starts at the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeId, importing]);

  const navigate = (id: NavId) => {
    setActiveId(id);
    setImporting(false);
  };

  const startImport = () => {
    setActiveId('transactions');
    setImporting(true);
  };

  const renderPage = () => {
    if (showImport) {
      return (
        <ImportPage
          transactions={transactions}
          rules={rules}
          onImport={importTransactions}
          onViewTransactions={() => setImporting(false)}
        />
      );
    }

    switch (activeId) {
      case 'overview':
        return (
          <OverviewPage
            transactions={transactions}
            period={period}
            monthlyBudget={monthlyBudget}
            onViewAllTransactions={() => navigate('transactions')}
          />
        );
      case 'transactions':
        return (
          <TransactionsPage
            transactions={transactions}
            period={period}
            rules={rules}
            onSaveTransaction={saveTransaction}
            onImportStatement={startImport}
          />
        );

      case 'budgets':
        return (
          <BudgetsPage
            transactions={transactions}
            period={period}
            monthlyBudget={monthlyBudget}
            categoryLimits={categoryLimits}
            onMonthlyBudgetChange={setMonthlyBudget}
            onCategoryLimitChange={setCategoryLimit}
          />
        );

      case 'recurring':
        return (
          <RecurringPage
            transactions={transactions}
            period={period}
            hiddenKeys={hiddenRecurring}
            onHide={hideRecurring}
            onRestoreAll={restoreRecurring}
          />
        );

      case 'settings':
        return (
          <SettingsPage
            transactions={transactions}
            history={history}
            rules={savedRules}
            onUndoImport={undoImport}
            onRemoveSample={removeSampleData}
            onRemoveRule={removeRule}
          />
        );
      default:
        return <p className="page-placeholder">This screen will be built in a later step.</p>;
    }
  };

  const renderAction = () => {
    if (showImport) {
      return (
        <Button variant="secondary" onClick={() => setImporting(false)}>
          Back to transactions
        </Button>
      );
    }
    if (isOverview || isTransactions) {
      return (
        <Button icon={<Upload size={18} strokeWidth={1.75} />} onClick={startImport}>
          Import statement
        </Button>
      );
    }
    return undefined;
  };

  return (
    <>
      <AppShell
        activeId={activeId}
        onNavigate={navigate}
        dataNote={
          hasSampleData
            ? { title: 'Sample data', text: 'Figures shown are examples, not from a bank account.' }
            : {
                title: 'Your imported data',
                text: 'From the files you uploaded. Nothing is connected to a bank.',
              }
        }
      >
        <PageHeader
          title={showImport ? 'Import statement' : activeItem.label}
          period={showsData && !showImport && period ? period.label : undefined}
          sampleData={showsSampleData}
          action={renderAction()}
        />
        {renderPage()}
      </AppShell>
      <UndoToast
        message={lastChange ? describeChange(lastChange) : null}
        messageId={lastChange?.id ?? null}
        onUndo={undo}
        onDismiss={dismiss}
      />
    </>
  );
}
