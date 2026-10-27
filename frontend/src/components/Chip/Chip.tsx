import type { ReactNode } from 'react';
import './Chip.css';

/** Every chip has the same width, so labels must stay short. Put longer detail beside the chip. */
const MAX_LABEL_LENGTH = 12;

interface ChipProps {
  /** Semantic tones always need a label. Never rely on color alone. */
  tone?: 'neutral' | 'positive' | 'warning' | 'negative';
  className?: string;
  children: ReactNode;
}

export function Chip({ tone = 'neutral', className, children }: ChipProps) {
  if (import.meta.env.DEV && typeof children === 'string' && children.length > MAX_LABEL_LENGTH) {
    console.warn(
      `Chip label "${children}" is ${children.length} characters. ` +
        `Keep chip labels to ${MAX_LABEL_LENGTH} or fewer and put detail beside the chip.`,
    );
  }

  const classes = ['chip', `chip--${tone}`, className].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
}
