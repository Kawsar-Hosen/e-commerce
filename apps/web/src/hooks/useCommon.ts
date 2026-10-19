import { useEffect, useMemo, useRef, useState } from 'react';
import { formatCountdown, getCountdownParts } from '@shobdox/shared-utils';

/** Small, dependency-free hooks shared across the app. */

/** Tracks a CSS media query, e.g. `useMediaQuery('(min-width: 1024px)')`. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const list = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(list.matches);
    list.addEventListener('change', handler);
    return () => list.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 640px)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** Debounces a rapidly changing value (search input). */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/** Locks background scrolling while a modal/sheet is open. */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.dataset['scrollLocked'];
    document.body.dataset['scrollLocked'] = 'true';
    return () => {
      if (previous === undefined) delete document.body.dataset['scrollLocked'];
      else document.body.dataset['scrollLocked'] = previous;
    };
  }, [locked]);
}

export interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
  label: string;
}

/** Ticking countdown for flash sales, in Bangla digits. */
export function useCountdown(target?: string): Countdown {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [target]);

  return useMemo(() => {
    if (!target) return { hours: 0, minutes: 0, seconds: 0, done: true, label: '' };

    const parts = getCountdownParts(target, new Date(now));
    return {
      hours: parts.hours,
      minutes: parts.minutes,
      seconds: parts.seconds,
      done: parts.isComplete,
      label: parts.isComplete ? 'শেষ হয়েছে' : formatCountdown(target, new Date(now), true),
    };
  }, [target, now]);
}

/** Set of ids the shopper has toggled on a listing, for micro-animations. */
export function useRecentPulse(ids: string[], duration = 900): Record<string, true> {
  const [pulses, setPulses] = useState<Record<string, true>>({});
  const previous = useRef<string[]>([]);

  useEffect(() => {
    const added = ids.filter((id) => !previous.current.includes(id));
    previous.current = ids;
    if (added.length === 0) return;

    setPulses((current) => {
      const next = { ...current };
      for (const id of added) next[id] = true;
      return next;
    });

    const timer = window.setTimeout(() => {
      setPulses((current) => {
        const next = { ...current };
        for (const id of added) delete next[id];
        return next;
      });
    }, duration);

    return () => window.clearTimeout(timer);
  }, [ids, duration]);

  return pulses;
}

/** Calls `onEscape` when Escape is pressed — used by drawers and modals. */
export function useEscapeKey(enabled: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, onEscape]);
}

/** Copy-to-clipboard with a transient "copied" flag. */
export function useCopyToClipboard(resetMs = 1_800): { copied: boolean; copy: (value: string) => void } {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), resetMs);
    return () => window.clearTimeout(timer);
  }, [copied, resetMs]);

  return {
    copied,
    copy: (value: string) => {
      void navigator.clipboard?.writeText(value).then(() => setCopied(true));
    },
  };
}
