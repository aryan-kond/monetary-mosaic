import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { AppShell } from './components/AppShell/AppShell';
import { Button } from './components/Button/Button';
import { PageHeader } from './components/PageHeader/PageHeader';
import { primaryNav, utilityNav, type NavId } from './components/Sidebar/navItems';
import { UndoToast } from './components/UndoToast/UndoToast';
import { reportingPeriod } from './data/mockData';
import { transactions as sampleTransactions } from './data/transactions';
import { describeChange, useTransactionEdits } from './hooks/useTransactionEdits';
import { ImportPage } from './pages/Import/ImportPage';
import { OverviewPage } from './pages/Overview/OverviewPage';
import { TransactionsPage } from './pages/Transactions/TransactionsPage';
import './App.css';

const allNavItems = [...primaryNav, ...utilityNav];

export default function App() {
  const [activeId, setActiveId] = useState<NavId>('overview');
  /** The import flow lives inside Transactions, so this only matters on that screen. */
  const [importing, setImporting] = useState(false);
  const { transactions, rules, lastChange, saveTransaction, undo, dismiss } =
    useTransactionEdits(sampleTransactions);

  const activeItem = allNavItems.find((item) => item.id === activeId) ?? primaryNav[0];
  const isOverview = activeId === 'overview';
  const isTransactions = activeId === 'transactions';
  const showImport = isTransactions && importing;
  const showsSampleData = (isOverview || isTransactions) && !showImport;

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
    if (showImport) return <ImportPage />;

    switch (activeId) {
      case 'overview':
        return (
          <OverviewPage
            transactions={transactions}
            onViewAllTransactions={() => navigate('transactions')}
          />
        );
      case 'transactions':
        return (
          <TransactionsPage
            transactions={transactions}
            rules={rules}
            onSaveTransaction={saveTransaction}
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
      <AppShell activeId={activeId} onNavigate={navigate}>
        <PageHeader
          title={showImport ? 'Import statement' : activeItem.label}
          period={showsSampleData ? reportingPeriod.label : undefined}
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
