/**
 * Formatting helpers.
 *
 * Every money and digit rule lives in `@shobdox/shared-utils`; this module only
 * re-exports them and adds the two Bangla convenience wrappers the UI repeats
 * often. Nothing here does its own arithmetic.
 */

import { toBanglaDigits, formatNumber } from '@shobdox/shared-utils';

export {
  formatTaka,
  formatTakaCompact,
  formatNumber,
  formatPercent,
  formatDiscountPercent,
  discountPercentOf,
  toBanglaDigits,
  fromBanglaDigits,
  formatBanglaCount,
  formatCompactCount,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatWeekday,
  formatDayRange,
  formatCountdown,
  getCountdownParts,
  parseTakaInput,
  formatBdPhone,
  maskBdPhone,
  truncateWords,
  initialsOf,
  cleanInput,
} from '@shobdox/shared-utils';

/** `২৪টি` — Bangla numerals plus the Bangla counter suffix. */
export function banglaCount(value: number): string {
  return `${toBanglaDigits(Math.max(0, Math.round(value)))}টি`;
}

/** `২৪টি পণ্য` — the phrasing used by listing headers. */
export function banglaProductCount(value: number): string {
  return `${banglaCount(value)} পণ্য`;
}

/** `১,৪৯৯ টাকা` without the currency glyph, for prose. */
export function takaWords(value: number, banglaNumerals = true): string {
  return `${formatNumber(value, banglaNumerals)} টাকা`;
}

/** Percentage with Bangla numerals, e.g. `৪৫%`. */
export function banglaPercent(value: number): string {
  return `${toBanglaDigits(Math.round(value))}%`;
}
