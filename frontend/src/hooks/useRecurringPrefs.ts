import { useState } from 'react';

/** Payments the person marked "not recurring". Kept in memory like the rest of the prototype. */
export function useRecurringPrefs() {
  const [hidden, setHidden] = useState<string[]>([]);

  const hide = (key: string) =>
    setHidden((current) => (current.includes(key) ? current : [...current, key]));
  const restoreAll = () => setHidden([]);

  return { hidden, hide, restoreAll };
}
