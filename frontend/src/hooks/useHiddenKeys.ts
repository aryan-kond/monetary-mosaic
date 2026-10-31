import { useState } from 'react';

/** Items a person chose to hide, such as "not recurring" payments. Kept in memory for now. */
export function useHiddenKeys() {
  const [hidden, setHidden] = useState<string[]>([]);

  const hide = (key: string) =>
    setHidden((current) => (current.includes(key) ? current : [...current, key]));
  const restoreAll = () => setHidden([]);

  return { hidden, hide, restoreAll };
}
