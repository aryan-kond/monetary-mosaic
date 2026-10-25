export type CategoryId =
  'housing' | 'groceries' | 'dining' | 'shopping' | 'transport' | 'bills' | 'health' | 'other';

export interface Category {
  label: string;
  /** Stable color. Reuse it in charts, legends, and category chips so it never changes. */
  color: string;
}

/**
 * Category colors avoid the interaction blue and the semantic green, amber, and red.
 * Color is supporting only: every category is also named in text.
 */
export const categories: Record<CategoryId, Category> = {
  housing: { label: 'Rent & housing', color: '#5B4BB7' },
  groceries: { label: 'Groceries', color: '#0E8A8A' },
  dining: { label: 'Dining out', color: '#B8458F' },
  shopping: { label: 'Shopping', color: '#C2662D' },
  transport: { label: 'Transport', color: '#4F6D8F' },
  bills: { label: 'Bills & utilities', color: '#8A7A24' },
  health: { label: 'Health', color: '#7A3FA0' },
  other: { label: 'Other', color: '#788397' },
};
