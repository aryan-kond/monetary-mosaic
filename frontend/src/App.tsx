import { useState } from 'react';
import { AppShell } from './components/AppShell/AppShell';
import { primaryNav, utilityNav, type NavId } from './components/Sidebar/navItems';
import './App.css';

const allNavItems = [...primaryNav, ...utilityNav];

export default function App() {
  const [activeId, setActiveId] = useState<NavId>('overview');
  const activeItem = allNavItems.find((item) => item.id === activeId) ?? primaryNav[0];

  return (
    <AppShell activeId={activeId} onNavigate={setActiveId}>
      <h1 className="page-title">{activeItem.label}</h1>
      <p className="page-placeholder">This screen will be built in a later step.</p>
    </AppShell>
  );
}
