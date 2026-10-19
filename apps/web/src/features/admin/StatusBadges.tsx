import { Badge, type Tone } from '@/components/ui';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  PAYOUT_STATUS_LABELS,
  type CustomerRow,
  type OrderStatus,
  type OrderStatusTone,
  type PaymentStatus,
  type PayoutStatus,
  type ProductStatus,
  type SellerStatus,
} from '@shobdox/shared-types';

/**
 * Status pills shared by every admin table and drawer.
 *
 * Order labels come from `@shobdox/shared-types`; the seller/product/payment
 * label maps live here because the shared domain package deliberately keeps
 * presentation copy out of the model.
 */

const ORDER_TONE_MAP: Record<OrderStatusTone, Tone> = {
  neutral: 'neutral',
  info: 'info',
  warning: 'warning',
  success: 'success',
  error: 'danger',
};

/** Badge tone for an order status — reused by menus and timelines. */
export function orderStatusTone(status: OrderStatus): Tone {
  return ORDER_TONE_MAP[ORDER_STATUS_TONES[status]];
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge tone={orderStatusTone(status)} size="sm">
      {ORDER_STATUS_LABELS[status].bn}
    </Badge>
  );
}

const PRODUCT_STATUS_META: Record<ProductStatus, { label: string; tone: Tone }> = {
  active: { label: 'সক্রিয়', tone: 'success' },
  draft: { label: 'খসড়া', tone: 'neutral' },
  archived: { label: 'আর্কাইভড', tone: 'warning' },
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const meta = PRODUCT_STATUS_META[status];
  return (
    <Badge tone={meta.tone} size="sm">
      {meta.label}
    </Badge>
  );
}

export const SELLER_STATUS_LABELS: Record<SellerStatus, string> = {
  active: 'সক্রিয়',
  'pending-review': 'পর্যালোচনায়',
  suspended: 'স্থগিত',
};

const SELLER_STATUS_TONES: Record<SellerStatus, Tone> = {
  active: 'success',
  'pending-review': 'warning',
  suspended: 'danger',
};

export function SellerStatusBadge({ status }: { status: SellerStatus }) {
  return (
    <Badge tone={SELLER_STATUS_TONES[status]} size="sm">
      {SELLER_STATUS_LABELS[status]}
    </Badge>
  );
}

const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; tone: Tone }> = {
  unpaid: { label: 'অপরিশোধিত', tone: 'warning' },
  'cod-due': { label: 'ক্যাশ অন ডেলিভারি বাকি', tone: 'info' },
  'demo-recorded': { label: 'ডেমো-পরিশোধিত', tone: 'primary' },
  refunded: { label: 'ফেরত দেওয়া', tone: 'danger' },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const meta = PAYMENT_STATUS_META[status];
  return (
    <Badge tone={meta.tone} size="sm">
      {meta.label}
    </Badge>
  );
}

const PAYOUT_STATUS_TONES: Record<PayoutStatus, Tone> = {
  paid: 'success',
  processing: 'info',
  scheduled: 'neutral',
  'on-hold': 'warning',
};

export function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  return (
    <Badge tone={PAYOUT_STATUS_TONES[status]} size="sm">
      {PAYOUT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function CustomerStatusBadge({ status }: { status: CustomerRow['status'] }) {
  return (
    <Badge tone={status === 'active' ? 'success' : 'danger'} size="sm">
      {status === 'active' ? 'সক্রিয়' : 'ব্লকড'}
    </Badge>
  );
}

export const CUSTOMER_SEGMENT_LABELS: Record<CustomerRow['segment'], string> = {
  new: 'নতুন',
  returning: 'রিটার্নিং',
  vip: 'ভিআইপি',
  'at-risk': 'ঝুঁকিতে',
};
