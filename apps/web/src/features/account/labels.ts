import type { OrderStatus, PaymentStatus, UserRole } from '@shobdox/shared-types';
import { ORDER_STATUS_LABELS } from '@shobdox/shared-types';
import type { Tone } from '@/components/ui';

/**
 * Bangla labels and badge tones shared by every account surface.
 *
 * The domain's status tone union uses `error`; the UI badge uses `danger`, so
 * the mapping lives here once instead of in each screen.
 */

const STATUS_TONES: Record<OrderStatus, Tone> = {
  placed: 'info',
  confirmed: 'info',
  processing: 'warning',
  shipped: 'warning',
  'out-for-delivery': 'info',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'danger',
};

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status].bn;
}

export function orderStatusTone(status: OrderStatus): Tone {
  return STATUS_TONES[status];
}

/** Payment is simulated only — the labels say so wherever they are rendered. */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'পরিশোধ হয়নি (ডেমো)',
  'cod-due': 'ক্যাশ অন ডেলিভারিতে পরিশোধযোগ্য',
  'demo-recorded': 'ডেমো রেকর্ড — প্রকৃত পেমেন্ট নয়',
  refunded: 'ডেমো রিফান্ড রেকর্ড',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'গ্রাহক',
  admin: 'অ্যাডমিন',
  seller: 'সেলার',
};
