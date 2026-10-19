import { useEffect, useState } from 'react';

/**
 * Delays a rapidly changing value — used by the search field so typing a Bangla
 * query does not run the full match pipeline on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
