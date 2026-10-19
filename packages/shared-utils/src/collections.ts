/** Small, dependency-free collection and async helpers used by both apps. */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = [];
  if (step === 0) return result;
  for (let value = start; step > 0 ? value < end : value > end; value += step) result.push(value);
  return result;
}

export function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export function uniqueBy<T, K>(values: T[], keyOf: (value: T) => K): T[] {
  const seen = new Set<K>();
  return values.filter((value) => {
    const key = keyOf(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function groupBy<T, K extends string | number>(values: T[], keyOf: (value: T) => K): Record<K, T[]> {
  return values.reduce<Record<string, T[]>>((accumulator, value) => {
    const key = String(keyOf(value));
    (accumulator[key] ??= []).push(value);
    return accumulator;
  }, {}) as Record<K, T[]>;
}

export function sumBy<T>(values: T[], valueOf: (value: T) => number): number {
  return values.reduce((total, value) => total + valueOf(value), 0);
}

export function averageBy<T>(values: T[], valueOf: (value: T) => number): number {
  if (values.length === 0) return 0;
  return sumBy(values, valueOf) / values.length;
}

export function maxBy<T>(values: T[], valueOf: (value: T) => number): T | undefined {
  return values.reduce<T | undefined>(
    (best, value) => (best === undefined || valueOf(value) > valueOf(best) ? value : best),
    undefined,
  );
}

export function minBy<T>(values: T[], valueOf: (value: T) => number): T | undefined {
  return values.reduce<T | undefined>(
    (best, value) => (best === undefined || valueOf(value) < valueOf(best) ? value : best),
    undefined,
  );
}

export function chunk<T>(values: T[], size: number): T[][] {
  if (size <= 0) return [values];
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

/** Percentage of `total` that `part` represents, guarding against divide-by-zero. */
export function percentOf(part: number, total: number, decimals = 0): number {
  if (total === 0) return 0;
  const factor = 10 ** decimals;
  return Math.round((part / total) * 100 * factor) / factor;
}

/** Percentage change between two periods. `previous = 0` yields `current > 0 ? 100 : 0`. */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function roundTo(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Sorts a copy of `values` by several keys, in priority order. */
export function sortBy<T>(
  values: T[],
  comparators: Array<(a: T, b: T) => number>,
): T[] {
  return [...values].sort((a, b) => {
    for (const compare of comparators) {
      const result = compare(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}

export function compareNumbers(a: number, b: number, direction: 'asc' | 'desc' = 'asc'): number {
  return direction === 'asc' ? a - b : b - a;
}

export function compareStrings(a: string, b: string, direction: 'asc' | 'desc' = 'asc'): number {
  const result = a.localeCompare(b, 'bn');
  return direction === 'asc' ? result : -result;
}

/**
 * Deterministic PRNG (mulberry32). The demo dataset and every "random"
 * analytics figure use it so refreshes and tests stay reproducible.
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic shuffle — keeps "featured" rails stable between renders. */
export function seededShuffle<T>(values: T[], seed: number): T[] {
  const random = createSeededRandom(seed);
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = result[index] as T;
    result[index] = result[swapIndex] as T;
    result[swapIndex] = current;
  }
  return result;
}

export function pickRandom<T>(values: T[], random: () => number = Math.random): T | undefined {
  if (values.length === 0) return undefined;
  return values[Math.floor(random() * values.length)];
}

/** Stable ids for locally created demo rows. */
export function createId(prefix: string, random: () => number = Math.random): string {
  const stamp = Date.now().toString(36).slice(-5);
  const suffix = Math.floor(random() * 1_679_616).toString(36).padStart(4, '0');
  return `${prefix}-${stamp}${suffix}`;
}

/** Zero-padded, human-readable demo order numbers: `SDX-DEMO-000123`. */
export function createOrderNumber(sequence: number, prefix = 'SDX-DEMO'): string {
  return `${prefix}-${String(sequence).padStart(6, '0')}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simulated network latency so loading states are visible in the demo. */
export function simulateLatency(minMs = 180, maxMs = 520): Promise<number> {
  const latency = Math.round(minMs + Math.random() * (maxMs - minMs));
  return sleep(latency).then(() => latency);
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs = 250,
): ((...args: Args) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
  };
  return debounced;
}

export function throttle<Args extends unknown[]>(fn: (...args: Args) => void, waitMs = 200) {
  let lastCall = 0;
  return (...args: Args) => {
    const now = Date.now();
    if (now - lastCall < waitMs) return;
    lastCall = now;
    fn(...args);
  };
}

/** Case-insensitive, order-independent comparison used by filter equality checks. */
export function areStringArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

/** Deep-ish clone for plain JSON-shaped mock data. */
export function cloneDeep<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Applies a partial patch to one row of an array keyed by `id`. */
export function patchById<T extends { id: string }>(rows: T[], id: string, patch: Partial<T>): T[] {
  return rows.map((row) => (row.id === id ? { ...row, ...patch } : row));
}

export function removeById<T extends { id: string }>(rows: T[], id: string): T[] {
  return rows.filter((row) => row.id !== id);
}

export function upsertById<T extends { id: string }>(rows: T[], row: T): T[] {
  const exists = rows.some((candidate) => candidate.id === row.id);
  return exists ? rows.map((candidate) => (candidate.id === row.id ? row : candidate)) : [row, ...rows];
}

/** Returns the first value that is not `undefined`/`null`/`''`. */
export function firstNonEmpty<T>(...values: Array<T | undefined | null>): T | undefined {
  return values.find((value): value is T => value !== undefined && value !== null && value !== '');
}
