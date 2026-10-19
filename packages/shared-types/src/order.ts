import type { EntityId, IsoDateString, Taka } from './common';

/**
 * Order lifecycle. The first six values are the timeline shown to the customer
 * in the demo order-tracking screen; `cancelled` and `returned` are terminal
 * branches.
 */
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'placed',
  'confirmed',
  'processing',
  'shipped',
  'out-for-delivery',
  'delivered',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, { en: string; bn: string }> = {
  placed: { en: 'Order Placed', bn: 'অর্ডার করা হয়েছে' },
  confirmed: { en: 'Confirmed', bn: 'নিশ্চিত করা হয়েছে' },
  processing: { en: 'Processing', bn: 'প্রস্তুত হচ্ছে' },
  shipped: { en: 'Shipped', bn: 'পাঠানো হয়েছে' },
  'out-for-delivery': { en: 'Out for Delivery', bn: 'ডেলিভারির পথে' },
  delivered: { en: 'Delivered', bn: 'ডেলিভার হয়েছে' },
  cancelled: { en: 'Cancelled', bn: 'বাতিল' },
  returned: { en: 'Returned', bn: 'ফেরত' },
};

export type OrderStatusTone = 'neutral' | 'info' | 'warning' | 'success' | 'error';

export const ORDER_STATUS_TONES: Record<OrderStatus, OrderStatusTone> = {
  placed: 'info',
  confirmed: 'info',
  processing: 'warning',
  shipped: 'warning',
  'out-for-delivery': 'info',
  delivered: 'success',
  cancelled: 'error',
  returned: 'error',
};

export interface OrderStatusEvent {
  id: EntityId;
  status: OrderStatus;
  /** Short customer-facing note, usually in Bangla. */
  note: string;
  at: IsoDateString;
  location?: string;
  /** Set when the event was created by an admin/seller in the demo dashboards. */
  actor?: string;
}

/**
 * PAYMENT IS SIMULATED ONLY.
 * `demo-recorded` exists purely so the demo dashboard can render a "paid-looking"
 * row. No gateway is contacted and no money moves in this phase.
 */
export type PaymentStatus = 'unpaid' | 'cod-due' | 'demo-recorded' | 'refunded';

export type PaymentMethodId = 'cod' | 'bkash' | 'nagad' | 'rocket';

export interface PaymentMethodOption {
  id: PaymentMethodId;
  name: string;
  nameBn: string;
  description: string;
  /** Design-token colour used for the demo chip. */
  brandColor: string;
  /** Shown in a prominent notice so nobody mistakes the demo for a real gateway. */
  demoNotice: string;
  available: boolean;
  fee: Taka;
}

export type DeliveryMethodId = 'standard' | 'express' | 'same-day' | 'pickup';

export interface DeliveryMethodOption {
  id: DeliveryMethodId;
  name: string;
  nameBn: string;
  description: string;
  estimatedDays: string;
  fee: Taka;
  available: boolean;
}

export interface OrderLineItem {
  id: string;
  productId: EntityId;
  variantId: EntityId;
  slug: string;
  title: string;
  titleBn?: string;
  image: string;
  selectedOptions: Record<string, string>;
  unitPrice: Taka;
  quantity: number;
  lineTotal: Taka;
  sellerId: EntityId;
  fulfilledBy: 'shobdox' | 'seller';
}

export interface ShippingAddress {
  id: EntityId;
  label?: string;
  fullName: string;
  phone: string;
  /** Optional in the demo: many BD shoppers use email only for receipts. */
  email?: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  landmark?: string;
  postcode?: string;
  isDefault: boolean;
}

export interface OrderTotals {
  subtotal: Taka;
  productDiscount: Taka;
  couponDiscount: Taka;
  deliveryFee: Taka;
  vat: Taka;
  total: Taka;
  savings: Taka;
}

export interface Order {
  id: EntityId;
  /** Customer-facing demo number, e.g. `SDX-DEMO-000123`. */
  orderNumber: string;
  customerId: EntityId;
  customerName: string;
  customerPhone: string;
  items: OrderLineItem[];
  shippingAddress: ShippingAddress;
  deliveryMethod: DeliveryMethodId;
  paymentMethod: PaymentMethodId;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  timeline: OrderStatusEvent[];
  totals: OrderTotals;
  couponCode?: string;
  /** Free-text note the customer can leave in the demo checkout. */
  note?: string;
  placedAt: IsoDateString;
  updatedAt: IsoDateString;
  estimatedDelivery: IsoDateString;
  /** Marks orders created by the interactive demo so they can be reset. */
  isDemo?: boolean;
}

/** Aggregated per-seller slice of an order, used by the seller dashboard. */
export interface SellerOrderSummary {
  orderId: EntityId;
  orderNumber: string;
  status: OrderStatus;
  itemCount: number;
  grossAmount: Taka;
  commission: Taka;
  netPayable: Taka;
  placedAt: IsoDateString;
}
