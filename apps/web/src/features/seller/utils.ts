import type { Category, Product, ProductStatus, ProductVariant, SellerStatus } from '@shobdox/shared-types';
import { formatDate, toBanglaDigits } from '@shobdox/shared-utils';

/**
 * Small helpers shared by the seller dashboard screens.
 *
 * Labels live here because `@shobdox/shared-types` only ships the order, badge,
 * payout and tier label maps — product/seller statuses need a Bangla label too.
 */

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'সক্রিয়',
  draft: 'খসড়া',
  archived: 'আর্কাইভ',
};

export const SELLER_STATUS_LABELS: Record<SellerStatus, string> = {
  active: 'সক্রিয়',
  'pending-review': 'পর্যালোচনাধীন',
  suspended: 'স্থগিত',
};

/** "লাল / XL" — human label for a variant's option combination. */
export function variantLabel(product: Product, variant: ProductVariant): string {
  const parts = Object.entries(variant.optionValues).map(([optionId, valueId]) => {
    const option = product.options.find((candidate) => candidate.id === optionId);
    const value = option?.values.find((candidate) => candidate.id === valueId);
    return value?.labelBn ?? value?.label ?? valueId;
  });
  return parts.filter(Boolean).join(' / ') || 'ডিফল্ট';
}

/** `১২ জানু – ১৮ জানু ২০২৬`, used by payouts and settlement windows. */
export function periodLabel(start: string, end: string): string {
  return `${formatDate(start, { withYear: false })} – ${formatDate(end)}`;
}

export function categoryLabel(categories: Category[], categoryId: string): string {
  const category = categories.find((candidate) => candidate.id === categoryId);
  return category?.nameBn ?? category?.name ?? 'অন্যান্য';
}

export function monthKeyOf(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

const MONTH_NAMES_BN = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export function monthLabelOf(key: string): string {
  const [year = '', month = '1'] = key.split('-');
  const name = MONTH_NAMES_BN[Number(month) - 1] ?? month;
  return `${name} ${toBanglaDigits(year)}`;
}

/** Client-side CSV download with a UTF-8 BOM so Bangla text opens in Excel. */
export function downloadCsv(
  filename: string,
  header: string[],
  rows: Array<Array<string | number>>,
): void {
  const escapeCell = (value: string | number): string => {
    const text = String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const csv = [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
