import type { Taka } from '@shobdox/shared-types';

/**
 * Currency helpers. Bangladeshi Taka uses the `৳` glyph, the Indian-style
 * lakh/crore digit grouping (1,00,000 not 100,000) and the Bengali numbering
 * system is available where a Bangla-first surface benefits from it.
 */

const TAKA_GLYPH = '৳';
const NBSP = '\u00A0';

/** Group digits the way South Asia does: last three, then pairs. */
export function groupSouthAsianDigits(value: string): string {
  const [whole = '', fraction] = value.split('.');
  const negative = whole.startsWith('-');
  const digits = negative ? whole.slice(1) : whole;

  if (digits.length <= 3) {
    return `${negative ? '-' : ''}${digits}${fraction ? `.${fraction}` : ''}`;
  }

  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}${grouped},${lastThree}${fraction ? `.${fraction}` : ''}`;
}

export interface FormatTakaOptions {
  /** Render the `৳` glyph. Defaults to `true`. */
  withSymbol?: boolean;
  /** Force decimals. Defaults to `false` (whole Taka render without `.00`). */
  decimals?: boolean;
  /** Use the non-breaking space between glyph and amount. Defaults to `true`. */
  useNbsp?: boolean;
  /** Convert digits to Bengali numerals. Defaults to `false`. */
  banglaNumerals?: boolean;
}

/**
 * `formatTaka(1499)` -> `৳ 1,499`
 * `formatTaka(1499.5, { decimals: true })` -> `৳ 1,499.50`
 */
export function formatTaka(amount: Taka, options: FormatTakaOptions = {}): string {
  const {
    withSymbol = true,
    decimals = false,
    useNbsp = true,
    banglaNumerals = false,
  } = options;

  const safe = Number.isFinite(amount) ? amount : 0;
  const hasFraction = Math.abs(safe % 1) > 0.001;
  const showDecimals = decimals || hasFraction;
  const fixed = safe.toFixed(showDecimals ? 2 : 0);

  // `toFixed` renders "-0" for tiny negative values; normalise it.
  const normalized = fixed === '-0' ? '0' : fixed;
  let grouped = groupSouthAsianDigits(normalized);

  if (banglaNumerals) grouped = toBanglaDigits(grouped);

  const separator = useNbsp ? NBSP : ' ';
  return withSymbol ? `${TAKA_GLYPH}${separator}${grouped}` : grouped;
}

/**
 * Short form for dense dashboards and chips: `৳ 1.5L`, `৳ 2.4Cr`, `৳ 12.5K`.
 * Uses the Bangladeshi conventions (K = thousand, L = lakh, Cr = crore).
 */
export function formatTakaCompact(amount: Taka, banglaNumerals = false): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const abs = Math.abs(safe);
  const sign = safe < 0 ? '-' : '';

  const render = (value: number, unit: string): string => {
    const rounded = value >= 100 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, '');
    const digits = banglaNumerals ? toBanglaDigits(rounded) : rounded;
    return `${sign}${TAKA_GLYPH}${NBSP}${digits}${unit}`;
  };

  if (abs >= 1_00_00_000) return render(abs / 1_00_00_000, 'Cr');
  if (abs >= 1_00_000) return render(abs / 1_00_000, 'L');
  if (abs >= 1_000) return render(abs / 1_000, 'K');
  return formatTaka(safe, { banglaNumerals });
}

/** `1499` -> `1,499` with no currency glyph. */
export function formatNumber(value: number, banglaNumerals = false): string {
  const grouped = groupSouthAsianDigits(
    Number.isFinite(value) ? String(Math.round(value * 100) / 100) : '0',
  );
  return banglaNumerals ? toBanglaDigits(grouped) : grouped;
}

export function formatPercent(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/** Signed percentage for KPI deltas: `+12.4%`, `-3.1%`, `0%`. */
export function formatDelta(value: number): string {
  if (!Number.isFinite(value) || Math.abs(value) < 0.05) return '0%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/** Discount badge text. Returns `null` when there is no real saving. */
export function formatDiscountPercent(price: Taka, compareAtPrice?: Taka): string | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  const percent = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  return percent > 0 ? `-${percent}%` : null;
}

export function discountPercentOf(price: Taka, compareAtPrice?: Taka): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/** Parses `"1,499"`, `"৳1499"`, `"১৪৯৯"` into a number. Returns `NaN` when unusable. */
export function parseTakaInput(raw: string): number {
  if (typeof raw !== 'string') return Number.NaN;
  const cleaned = fromBanglaDigits(raw)
    .replace(/[৳,\s\u00A0]/g, '')
    .replace(/[^\d.-]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return Number.NaN;
  return Number(cleaned);
}

/** Converts Western digits to Bengali numerals. Non-digits pass through. */
export function toBanglaDigits(input: string | number): string {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(input).replace(/\d/g, (digit) => map[Number(digit)] ?? digit);
}

/** Converts Bengali numerals to Western digits. */
export function fromBanglaDigits(input: string): string {
  const map: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return input.replace(/[০-৯]/g, (digit) => map[digit] ?? digit);
}

/** `1234` -> `1,234 টি` — used for counts inside Bangla sentences. */
export function formatBanglaCount(value: number): string {
  return `${formatNumber(value, true)} টি`;
}

/**
 * Compacts large counts for badges and rails: 1200 -> `1.2K`.
 * Bengali-numeral friendly.
 */
export function formatCompactCount(value: number, banglaNumerals = false): string {
  const abs = Math.abs(value);
  const format = (n: number, suffix: string) => {
    const rounded = n >= 100 ? Math.round(n).toString() : n.toFixed(1).replace(/\.0$/, '');
    return `${banglaNumerals ? toBanglaDigits(rounded) : rounded}${suffix}`;
  };
  if (abs >= 1_00_00_000) return format(value / 1_00_00_000, 'Cr');
  if (abs >= 1_00_000) return format(value / 1_00_000, 'L');
  if (abs >= 1_000) return format(value / 1_000, 'K');
  return banglaNumerals ? toBanglaDigits(String(Math.round(value))) : String(Math.round(value));
}
