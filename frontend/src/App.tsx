import { useState } from 'react';
import { Upload } from 'lucide-react';
import { AppShell } from './components/AppShell/AppShell';
import { Button } from './components/Button/Button';
import { PageHeader } from './components/PageHeader/PageHeader';
import { primaryNav, utilityNav, type NavId } from './components/Sidebar/navItems';
import { UndoToast } from './components/UndoToast/UndoToast';
import { reportingPeriod } from './data/mockData';
import { transactions as sampleTransactions } from './data/transactions';
import { describeChange, useTransactionEdits } from './hooks/useTransactionEdits';
import { OverviewPage } from './pages/Overview/OverviewPage';
import { TransactionsPage } from './pages/Transactions/TransactionsPage';
import './App.css';

const allNavItems = [...primaryNav, ...utilityNav];

export default function App() {
  const [activeId, setActiveId] = useState<NavId>('overview');
  const { transactions, rules, lastChange, saveTransaction, undo, dismiss } =
    useTransactionEdits(sampleTransactions);

  const activeItem = allNavItems.find((item) => item.id === activeId) ?? primaryNav[0];
  const isOverview = activeId === 'overview';
  const showsSampleData = isOverview || activeId === 'transactions';

  const renderPage = () => {
    switch (activeId) {
      case 'overview':
        return (
          <OverviewPage
            transactions={transactions}
            onViewAllTransactions={() => setActiveId('transactions')}
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

  return (
    <>
      <AppShell activeId={activeId} onNavigate={setActiveId}>
        <PageHeader
          title={activeItem.label}
          period={showsSampleData ? reportingPeriod.label : undefined}
          sampleData={showsSampleData}
          action={
            isOverview ? (
              <Button
                icon={<Upload size={18} strokeWidth={1.75} />}
                onClick={() => setActiveId('transactions')}
              >
                Import statement
              </Button>
            ) : undefined
          }
        />
        {renderPage()}
      </AppShell>
      <UndoToast
        message={lastChange ? describeChange(lastChange) : null}
        onUndo={undo}
        onDismiss={dismiss}
      />
    </>
  );
}
