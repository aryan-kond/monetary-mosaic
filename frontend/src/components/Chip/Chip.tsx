import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import './Chip.css';

interface ChipProps {
  /** Semantic tones always need a label or icon. Never rely on color alone. */
  tone?: 'neutral' | 'positive' | 'warning' | 'negative';
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}

export function Chip({ tone = 'neutral', icon: Icon, className, children }: ChipProps) {
  const classes = ['chip', `chip--${tone}`, Icon && 'chip--with-icon', className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {Icon && <Icon size={16} strokeWidth={2} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}
