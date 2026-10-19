import type { IsoDateString } from '@shobdox/shared-types';
import { toBanglaDigits } from './currency';

const EN_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const BN_MONTHS = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে',
];

const BN_WEEKDAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];
const EN_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MS_PER_DAY = 86_400_000;

export function parseDate(value: IsoDateString | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export function toIso(date: Date): IsoDateString {
  return date.toISOString();
}

export function addDays(value: IsoDateString | Date, days: number): Date {
  const date = parseDate(value);
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function daysBetween(from: IsoDateString | Date, to: IsoDateString | Date): number {
  const a = parseDate(from).getTime();
  const b = parseDate(to).getTime();
  return Math.round((b - a) / MS_PER_DAY);
}

/** `12 Jan 2026` / `১২ জানু ২০২৬` */
export function formatDate(value: IsoDateString | Date, options: { bangla?: boolean; withYear?: boolean } = {}): string {
  const { bangla = true, withYear = true } = options;
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return '';

  const day = date.getDate();
  const month = bangla ? BN_MONTHS[date.getMonth()] : EN_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  const dayText = bangla ? toBanglaDigits(day) : String(day);
  const yearText = bangla ? toBanglaDigits(year) : String(year);

  return withYear ? `${dayText} ${month} ${yearText}` : `${dayText} ${month}`;
}

/** `শুক্রবার` style weekday label. */
export function formatWeekday(value: IsoDateString | Date, bangla = true): string {
  const date = parseDate(value);
  const index = date.getDay();
  return `${bangla ? BN_WEEKDAYS[index] : EN_WEEKDAYS[index]}বার`;
}

/** `12 জানু, ১০:৩০` — used in order timelines and chat-like feeds. */
export function formatDateTime(value: IsoDateString | Date, bangla = true): string {
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return '';
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const clock = `${hours % 12 === 0 ? 12 : hours % 12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
  return `${formatDate(date, { bangla, withYear: false })}, ${bangla ? toBanglaDigits(clock) : clock}`;
}

/** Short axis labels for charts: `12 Jan`. */
export function formatChartDate(value: IsoDateString | Date, bangla = false): string {
  return formatDate(value, { bangla, withYear: false });
}

/**
 * Relative time in Bangla, e.g. `৩ ঘণ্টা আগে`. Deliberately simple so it works
 * identically on web and native without a date library.
 */
export function formatRelativeTime(value: IsoDateString | Date, now: Date = new Date(), bangla = true): string {
  const then = parseDate(value).getTime();
  if (Number.isNaN(then)) return '';

  const diffMs = now.getTime() - then;
  const future = diffMs < 0;
  const abs = Math.abs(diffMs);

  const minutes = Math.floor(abs / 60_000);
  const hours = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / MS_PER_DAY);

  const wrap = (text: string) => {
    const localized = bangla ? text : text;
    return future && bangla ? `${localized} পরে` : `${localized}${bangla ? ' আগে' : ' ago'}`;
  };
  const num = (n: number) => (bangla ? toBanglaDigits(n) : String(n));

  if (minutes < 1) return bangla ? 'এইমাত্র' : 'just now';
  if (minutes < 60) return wrap(bangla ? `${num(minutes)} মিনিট` : `${minutes} min`);
  if (hours < 24) return wrap(bangla ? `${num(hours)} ঘণ্টা` : `${hours} hr`);
  if (days < 30) return wrap(bangla ? `${num(days)} দিন` : `${days} d`);
  return formatDate(value, { bangla });
}

/** `২ দিন` / `3 days` — used for delivery estimates. */
export function formatDayRange(min: number, max: number, bangla = true): string {
  const label = (n: number) => (bangla ? toBanglaDigits(n) : String(n));
  if (min === max) return `${label(min)} ${bangla ? 'দিন' : 'day'}`;
  return `${label(min)}–${label(max)} ${bangla ? 'দিন' : 'days'}`;
}

/** Countdown parts for the flash-sale timer. */
export function getCountdownParts(target: IsoDateString | Date, now: Date = new Date()) {
  const diff = Math.max(0, parseDate(target).getTime() - now.getTime());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    totalSeconds,
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    isComplete: diff <= 0,
  };
}

/** `01:23:45` with optional Bengali numerals, for the flash-sale clock. */
export function formatCountdown(target: IsoDateString | Date, now: Date = new Date(), bangla = false): string {
  const { days, hours, minutes, seconds } = getCountdownParts(target, now);
  const pad = (n: number) => String(n).padStart(2, '0');
  const core = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  const withDays = days > 0 ? `${pad(days)}d ${core}` : core;
  return bangla ? toBanglaDigits(withDays) : withDays;
}

/** Group key for daily analytics rollups. */
export function toDayKey(value: IsoDateString | Date): string {
  return parseDate(value).toISOString().slice(0, 10);
}

/** Inclusive list of day keys between two dates — used to build chart series. */
export function eachDay(from: IsoDateString | Date, to: IsoDateString | Date): IsoDateString[] {
  const days: IsoDateString[] = [];
  const start = parseDate(from);
  const end = parseDate(to);
  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
    days.push(toDayKey(cursor));
  }
  return days;
}
