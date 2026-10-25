import {
  ArrowLeftRight,
  LayoutDashboard,
  Lightbulb,
  PiggyBank,
  Repeat,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type NavId = 'overview' | 'transactions' | 'budgets' | 'recurring' | 'insights' | 'settings';

export interface NavItem {
  id: NavId;
  label: string;
  icon: LucideIcon;
}

export const primaryNav: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budgets', icon: PiggyBank },
  { id: 'recurring', label: 'Recurring', icon: Repeat },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
];

/** Utility links sit at the bottom, separated from primary navigation. */
export const utilityNav: NavItem[] = [
  { id: 'settings', label: 'Settings and data', icon: Settings },
];
