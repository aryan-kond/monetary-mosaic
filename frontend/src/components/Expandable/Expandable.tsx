import type { ReactNode } from 'react';
import './Expandable.css';

interface ExpandableProps {
  open: boolean;
  /** Give the content its own space above it, since a closed Expandable takes none. */
  children: ReactNode;
}

/**
 * Content that slides open and closed. While closed it is inert, so it cannot be focused, read
 * by a screen reader, or filled in by a password manager.
 */
export function Expandable({ open, children }: ExpandableProps) {
  return (
    <div className={open ? 'expandable expandable--open' : 'expandable'}>
      <div className="expandable__inner" inert={!open}>
        {children}
      </div>
    </div>
  );
}
