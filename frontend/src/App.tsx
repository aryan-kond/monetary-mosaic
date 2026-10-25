import { useState } from 'react';
import { Upload } from 'lucide-react';
import { AppShell } from './components/AppShell/AppShell';
import { Button } from './components/Button/Button';
import { PageHeader } from './components/PageHeader/PageHeader';
import { primaryNav, utilityNav, type NavId } from './components/Sidebar/navItems';
import { reportingPeriod } from './data/mockData';
import { OverviewPage } from './pages/Overview/OverviewPage';
import './App.css';

const allNavItems = [...primaryNav, ...utilityNav];

export default function App() {
  const [activeId, setActiveId] = useState<NavId>('overview');
  const activeItem = allNavItems.find((item) => item.id === activeId) ?? primaryNav[0];
  const isOverview = activeId === 'overview';

  return (
    <AppShell activeId={activeId} onNavigate={setActiveId}>
      <PageHeader
        title={activeItem.label}
        period={isOverview ? reportingPeriod.label : undefined}
        sampleData={isOverview}
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
      {isOverview ? (
        <OverviewPage />
      ) : (
        <p className="page-placeholder">This screen will be built in a later step.</p>
      )}
    </AppShell>
  );
}
