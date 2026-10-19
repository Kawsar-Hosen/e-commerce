/** Bangladeshi mobile number helpers. Demo data only — nothing is dialled or sent. */

const BD_LOCAL_PATTERN = /^01[3-9]\d{8}$/;
const BD_INTL_PATTERN = /^\+?8801[3-9]\d{8}$/;

/**
 * Normalises user input to the local `01XXXXXXXXX` form.
 * Bangla numerals and separators are accepted.
 * Returns an empty string when the number cannot be understood.
 */
export function normalizeBdPhone(input: string): string {
  if (!input) return '';

  const map: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };

  let digits = input
    .replace(/[\s\u00A0()\-.]/g, '')
    .replace(/[০-৯]/g, (d) => map[d] ?? d)
    .replace(/[^\d+]/g, '');

  if (digits.startsWith('+880')) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith('880')) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith('1') && digits.length === 10) digits = `0${digits}`;

  return digits;
}

export function isValidBdPhone(input: string): boolean {
  const normalized = normalizeBdPhone(input);
  return BD_LOCAL_PATTERN.test(normalized);
}

/** `+8801XXXXXXXXX` — the form carriers and SMS gateways expect. */
export function toInternationalBdPhone(input: string): string {
  const normalized = normalizeBdPhone(input);
  if (!BD_LOCAL_PATTERN.test(normalized)) return '';
  return `+880${normalized.slice(1)}`;
}

/** Groups the number for display: `01712-345678`. */
export function formatBdPhone(input: string): string {
  const normalized = normalizeBdPhone(input);
  if (normalized.length !== 11) return input.trim();
  return `${normalized.slice(0, 5)}-${normalized.slice(5)}`;
}

/** `01712-345678` -> `01712-***678`. Used on public order-tracking screens. */
export function maskBdPhone(input: string): string {
  const normalized = normalizeBdPhone(input);
  if (normalized.length !== 11) return '—';
  return `${normalized.slice(0, 5)}-***${normalized.slice(-3)}`;
}

/** Which carrier a prefix belongs to — a nice touch for the demo checkout. */
export function bdCarrierOf(input: string): 'Grameenphone' | 'Robi' | 'Banglalink' | 'Airtel' | 'Teletalk' | null {
  const normalized = normalizeBdPhone(input);
  if (!BD_LOCAL_PATTERN.test(normalized)) return null;

  const prefix = normalized.slice(0, 3);
  if (['013', '017'].includes(prefix)) return 'Grameenphone';
  if (['018'].includes(prefix)) return 'Robi';
  if (['019', '014'].includes(prefix)) return 'Banglalink';
  if (['016'].includes(prefix)) return 'Airtel';
  if (['015'].includes(prefix)) return 'Teletalk';
  return null;
}

export { BD_LOCAL_PATTERN, BD_INTL_PATTERN };
