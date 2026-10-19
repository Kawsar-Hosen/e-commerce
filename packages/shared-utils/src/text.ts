import { fromBanglaDigits } from './currency';

/**
 * Bangla-aware text helpers.
 *
 * Bengali script uses combining marks and zero-width joiners, and shoppers type
 * the same word several different ways. Search therefore folds both the query
 * and the haystack through `normalizeSearchText` before comparing.
 */

/** Characters that carry no meaning for matching. */
const ZERO_WIDTH = /[\u200B-\u200D\uFEFF\u00AD]/g;

/** Bengali vowel signs that are interchangeable in casual typing. */
const VOWEL_FOLDS: Array<[RegExp, string]> = [
  [/ী/g, 'ি'],
  [/ূ/g, 'ু'],
  [/ৈ/g, 'ে'],
  [/ৌ/g, 'ো'],
  [/ৗ/g, 'ৗ'],
  [/ৎ/g, 'ত'],
  [/ঙ/g, 'ং'],
  [/ঞ/g, 'ন'],
];

/** Nukta forms that users frequently type without the nukta. */
const NUKTA_FOLDS: Array<[RegExp, string]> = [
  [/ড়/g, 'ড'],
  [/ঢ়/g, 'ঢ'],
  [/য়/g, 'য'],
];

/**
 * Normalises a string for searching: Unicode NFC, zero-width removal, Bangla
 * digit folding, vowel-sign folding, lower-casing and whitespace collapsing.
 */
export function normalizeSearchText(input: string): string {
  if (!input) return '';
  let text = input.normalize('NFC').replace(ZERO_WIDTH, '').toLowerCase();

  for (const [pattern, replacement] of VOWEL_FOLDS) text = text.replace(pattern, replacement);
  for (const [pattern, replacement] of NUKTA_FOLDS) text = text.replace(pattern, replacement);

  text = fromBanglaDigits(text);

  return text
    // The class mixes Bangla punctuation with ASCII symbols; escaping `[` and
    // `]` keeps the class readable even though JS would accept them raw.
    // eslint-disable-next-line no-useless-escape
    .replace(/[৳$₹%()\[\]{}'"“”‘’,.;:!?/\\|_+=*&^#@~`<>-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Tokenises a normalised string so word order stops mattering. */
export function searchTokens(input: string): string[] {
  return normalizeSearchText(input).split(' ').filter(Boolean);
}

/**
 * True when every token of the query appears somewhere in the haystack.
 * Token-AND matching keeps "samsung 5g" from matching unrelated "5g" rows.
 */
export function matchesQuery(haystack: string, query: string): boolean {
  const normalizedHaystack = normalizeSearchText(haystack);
  if (!normalizedHaystack) return false;

  const tokens = searchTokens(query);
  if (tokens.length === 0) return true;

  return tokens.every((token) => normalizedHaystack.includes(token));
}

/** Convenience wrapper for matching against several fields at once. */
export function matchesAnyField(fields: Array<string | undefined | null>, query: string): boolean {
  return matchesQuery(fields.filter(Boolean).join(' '), query);
}

/** Rough relevance score for sorting search results. Higher is better. */
export function relevanceScore(haystack: string, query: string): number {
  const normalizedHaystack = normalizeSearchText(haystack);
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;

  let score = 0;
  if (normalizedHaystack === normalizedQuery) score += 100;
  if (normalizedHaystack.startsWith(normalizedQuery)) score += 40;
  if (normalizedHaystack.includes(normalizedQuery)) score += 20;

  for (const token of searchTokens(query)) {
    if (normalizedHaystack.startsWith(token)) score += 8;
    else if (normalizedHaystack.includes(token)) score += 4;
  }
  return score;
}

/** URL-safe slug. Keeps Latin characters, drops the rest, never returns empty. */
export function slugify(input: string, fallback = 'item'): string {
  const slug = input
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || `${fallback}-${Math.random().toString(36).slice(2, 7)}`;
}

export function truncate(input: string, maxLength: number, suffix = '…'): string {
  if (input.length <= maxLength) return input;
  return `${input.slice(0, Math.max(0, maxLength - suffix.length)).trimEnd()}${suffix}`;
}

/** Shortens by whole words, which reads better for Bangla product titles. */
export function truncateWords(input: string, maxLength: number, suffix = '…'): string {
  if (input.length <= maxLength) return input;
  const words = input.split(' ');
  let result = '';
  for (const word of words) {
    if ((result + ' ' + word).trim().length > maxLength - suffix.length) break;
    result = `${result} ${word}`.trim();
  }
  return `${result || input.slice(0, maxLength - suffix.length)}${suffix}`;
}

/** `in-stock` -> `In Stock` */
export function humanize(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** First letters of up to two words, for avatar fallbacks. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0] ?? '').slice(0, 2);
  return `${(parts[0] ?? '').charAt(0)}${(parts[1] ?? '').charAt(0)}`;
}

/** Trims and removes duplicate whitespace from user input. */
export function cleanInput(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}
