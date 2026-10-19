/**
 * Formatting helpers re-exported for the web app.
 *
 * The implementations live in `@shobdox/shared-utils` so the Expo app renders
 * prices, dates and counts identically. This module only adds the React-facing
 * conveniences (`useTaka`-style call sites can import a single module).
 */
export {
  formatTaka,
  formatTakaCompact,
  formatNumber,
  formatPercent,
  formatDelta,
  formatDiscountPercent,
  discountPercentOf,
  parseTakaInput,
  toBanglaDigits,
  fromBanglaDigits,
  formatBanglaCount,
  formatCompactCount,
  formatDate,
  formatWeekday,
  formatDateTime,
  formatChartDate,
  formatRelativeTime,
  formatDayRange,
  getCountdownParts,
  formatCountdown,
  toDayKey,
  eachDay,
  formatBdPhone,
  toInternationalBdPhone,
  normalizeBdPhone,
  isValidBdPhone,
  bdCarrierOf,
} from '@shobdox/shared-utils';

export type { FormatTakaOptions } from '@shobdox/shared-utils';
