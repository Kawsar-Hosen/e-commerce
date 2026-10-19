/**
 * Minimal style joiner — the native equivalent of the web app's `cn()`.
 *
 * React Native already accepts falsy entries inside style arrays, so this helper
 * simply drops them and keeps the call sites readable.
 */

export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}

/** Keeps only the truthy flags — handy for `style={[base, ...flags]}`. */
export function compact<T>(values: Array<T | false | null | undefined>): T[] {
  return values.filter((value): value is T => Boolean(value));
}
