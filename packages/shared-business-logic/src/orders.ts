import type {
  CartItem,
  DeliveryMethodId,
  Order,
  OrderLineItem,
  OrderStatus,
  OrderStatusEvent,
  OrderTotals,
  PaymentMethodId,
  ShippingAddress,
} from '@shobdox/shared-types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from '@shobdox/shared-types';
import { addDays, createOrderNumber, isInsideDhakaCity } from '@shobdox/shared-utils';
import { findDeliveryMethod } from './cart';

/**
 * Order lifecycle rules. The customer tracking screen, the admin order table and
 * the seller order table all read the state machine from here.
 */

/** Allowed forward moves. Nothing may skip a step or move backwards. */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['out-for-delivery', 'returned'],
  'out-for-delivery': ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

export function nextStatuses(current: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[current] ?? [];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return nextStatuses(from).includes(to);
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return nextStatuses(status).length === 0;
}

export function isCancellable(status: OrderStatus): boolean {
  return nextStatuses(status).includes('cancelled');
}

/** Position of a status inside the customer-facing six-step timeline. */
export function statusStepIndex(status: OrderStatus): number {
  const index = ORDER_STATUS_SEQUENCE.indexOf(status);
  if (index >= 0) return index;
  // Cancelled/returned are shown as a branch on top of the timeline.
  return status === 'cancelled' ? 0 : ORDER_STATUS_SEQUENCE.length - 1;
}

export function orderProgressPercent(status: OrderStatus): number {
  if (status === 'delivered') return 100;
  const index = statusStepIndex(status);
  return Math.round((index / (ORDER_STATUS_SEQUENCE.length - 1)) * 100);
}

export function orderStatusLabel(status: OrderStatus, language: 'bn' | 'en' = 'bn'): string {
  const labels = ORDER_STATUS_LABELS[status];
  return language === 'bn' ? labels.bn : labels.en;
}

/** Customer-facing note attached to an automatically generated timeline event. */
const STATUS_NOTES: Record<OrderStatus, string> = {
  placed: 'আপনার অর্ডারটি গ্রহণ করা হয়েছে।',
  confirmed: 'অর্ডার নিশ্চিত করা হয়েছে, শীঘ্রই প্রস্তুত করা হবে।',
  processing: 'পণ্য প্যাকিং করা হচ্ছে।',
  shipped: 'কুরিয়ারে হস্তান্তর করা হয়েছে।',
  'out-for-delivery': 'ডেলিভারি ম্যান পণ্যটি নিয়ে বেরিয়েছে।',
  delivered: 'পণ্যটি সফলভাবে ডেলিভারি দেওয়া হয়েছে।',
  cancelled: 'অর্ডারটি বাতিল করা হয়েছে।',
  returned: 'পণ্যটি ফেরত নেওয়া হয়েছে।',
};

export function statusNote(status: OrderStatus): string {
  return STATUS_NOTES[status];
}

/**
 * Reconstructs the timeline for an order that is already part-way through its
 * life. Day offsets are deterministic so the demo history looks sensible.
 */
export function buildTimeline(
  status: OrderStatus,
  placedAt: string,
  options: { actor?: string; location?: string } = {},
): OrderStatusEvent[] {
  const reached = status === 'cancelled' || status === 'returned'
    ? ORDER_STATUS_SEQUENCE.slice(0, status === 'cancelled' ? 1 : 4)
    : ORDER_STATUS_SEQUENCE.slice(0, statusStepIndex(status) + 1);

  const offsets: Record<string, number> = {
    placed: 0,
    confirmed: 0.05,
    processing: 0.35,
    shipped: 1,
    'out-for-delivery': 2,
    delivered: 2.4,
  };

  const events = reached.map<OrderStatusEvent>((step, index) => {
    const hours = (offsets[step] ?? index) * 24;
    return {
      id: `evt-${step}-${index}`,
      status: step,
      note: STATUS_NOTES[step],
      at: new Date(new Date(placedAt).getTime() + hours * 3_600_000).toISOString(),
      location: options.location,
      actor: options.actor,
    };
  });

  if (status === 'cancelled' || status === 'returned') {
    events.push({
      id: `evt-${status}`,
      status,
      note: STATUS_NOTES[status],
      at: new Date(new Date(placedAt).getTime() + 26 * 3_600_000).toISOString(),
      actor: options.actor,
    });
  }

  return events;
}

/** Appends a status change, refusing illegal jumps. Returns the same order when nothing changes. */
export function applyStatusChange(
  order: Order,
  status: OrderStatus,
  options: { note?: string; actor?: string; location?: string } = {},
): Order {
  if (order.status === status) return order;
  if (!canTransition(order.status, status)) return order;

  const at = new Date().toISOString();
  const event: OrderStatusEvent = {
    id: `evt-${status}-${Date.now().toString(36)}`,
    status,
    note: options.note ?? STATUS_NOTES[status],
    at,
    actor: options.actor,
    location: options.location,
  };

  return {
    ...order,
    status,
    updatedAt: at,
    paymentStatus: status === 'delivered' && order.paymentStatus === 'cod-due' ? 'cod-due' : order.paymentStatus,
    timeline: [...order.timeline, event],
  };
}

export function latestEvent(order: Order): OrderStatusEvent | undefined {
  return order.timeline[order.timeline.length - 1];
}

/* --------------------------------------------------------- order creation */

export interface CreateDemoOrderInput {
  sequence: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  deliveryMethod: DeliveryMethodId;
  paymentMethod: PaymentMethodId;
  totals: OrderTotals;
  couponCode?: string;
  note?: string;
  /** Injectable clock keeps tests and snapshots stable. */
  now?: Date;
}

/** Delivery window promised at checkout. Mirrors the copy on the delivery cards. */
export function estimateDeliveryDate(
  methodId: DeliveryMethodId,
  address: Pick<ShippingAddress, 'division' | 'district'>,
  placedAt: Date,
  daysMin = 0,
  daysMax = 0,
): Date {
  const insideDhaka = isInsideDhakaCity(address.division, address.district);

  const windows: Record<DeliveryMethodId, [number, number]> = {
    standard: insideDhaka ? [1, 3] : [3, 5],
    express: insideDhaka ? [1, 2] : [2, 3],
    'same-day': [0, 1],
    pickup: [2, 4],
  };

  const fallback = windows[methodId] ?? [daysMin || 2, daysMax || 5];
  return addDays(placedAt, fallback[1]);
}

/**
 * Builds the demo order produced by the interactive checkout.
 *
 * The order is a local object only: no request leaves the browser, the payment
 * status never becomes "paid" and the id is clearly marked as a demo record.
 */
export function createDemoOrder({
  sequence,
  customerId,
  customerName,
  customerPhone,
  items,
  shippingAddress,
  deliveryMethod,
  paymentMethod,
  totals,
  couponCode,
  note,
  now = new Date(),
}: CreateDemoOrderInput): Order {
  const placedAt = now.toISOString();

  const lineItems: OrderLineItem[] = items.map((item) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    slug: item.slug,
    title: item.title,
    titleBn: item.titleBn,
    image: item.image,
    selectedOptions: item.selectedOptions,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.unitPrice * item.quantity,
    sellerId: item.sellerId,
    fulfilledBy: item.fulfilledBy,
  }));

  const order: Order = {
    id: `ord-demo-${sequence}`,
    orderNumber: createOrderNumber(sequence),
    customerId,
    customerName,
    customerPhone,
    items: lineItems,
    shippingAddress,
    deliveryMethod,
    paymentMethod,
    // Cash on delivery is never "paid" in advance; wallet selections stay
    // `unpaid` because no gateway is contacted in this phase.
    paymentStatus: paymentMethod === 'cod' ? 'cod-due' : 'unpaid',
    status: 'placed',
    timeline: [],
    totals,
    couponCode,
    note,
    placedAt,
    updatedAt: placedAt,
    estimatedDelivery: estimateDeliveryDate(deliveryMethod, shippingAddress, now).toISOString(),
    isDemo: true,
  };

  return {
    ...order,
    timeline: buildTimeline('placed', placedAt, {
      actor: 'SHOBDOX ডেমো সিস্টেম',
      location: `${shippingAddress.district}, ${shippingAddress.division}`,
    }),
  };
}

/** Human summary used in the confirmation screen and the admin detail drawer. */
export function summarizeOrder(order: Order): string {
  const units = order.items.reduce((total, item) => total + item.quantity, 0);
  const method = findDeliveryMethod(order.deliveryMethod);
  return `${units} টি পণ্য · ${method.nameBn} · ${order.items.length} টি ভিন্ন পণ্য`;
}

/**
 * Refunds/cancellations only make sense before dispatch; the tracking screen
 * uses this to decide whether to offer the "cancel demo order" action.
 */
export function canCustomerCancel(order: Order): boolean {
  return !['shipped', 'out-for-delivery', 'delivered', 'cancelled', 'returned'].includes(order.status);
}
