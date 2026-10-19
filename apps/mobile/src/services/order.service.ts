/**
 * Order lifecycle for the demo.
 *
 * `placeDemoOrder()` writes a real `Order` object into local state, marks it as
 * demo data and never touches a payment gateway. Status changes go through the
 * shared state machine, so an illegal jump (delivered → placed) is refused by
 * the same rule a server would enforce.
 */

import type {
  CartItem,
  DeliveryMethodId,
  Order,
  OrderStatus,
  PaymentMethodId,
  ShippingAddress,
  User,
} from '@shobdox/shared-types';
import {
  canCustomerCancel,
  createDemoOrder,
  estimateDeliveryDate,
  findDeliveryMethod,
  nextStatuses,
  isTerminalStatus,
} from '@shobdox/shared-business-logic';
import { useDataStore } from '../store/data.store';

export interface PlaceDemoOrderInput {
  customer: Pick<User, 'id' | 'name' | 'phone'>;
  items: CartItem[];
  address: ShippingAddress;
  deliveryMethod: DeliveryMethodId;
  paymentMethod: PaymentMethodId;
  totals: Order['totals'];
  couponCode?: string;
  note?: string;
}

export function placeDemoOrder({
  customer,
  items,
  address,
  deliveryMethod,
  paymentMethod,
  totals,
  couponCode,
  note,
}: PlaceDemoOrderInput): Order {
  const sequence = useDataStore.getState().consumeOrderSequence();

  const order = createDemoOrder({
    sequence,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    items,
    shippingAddress: address,
    deliveryMethod,
    paymentMethod,
    totals,
    couponCode,
    note,
  });

  useDataStore.getState().addOrder(order);

  // Demo stock movement: placing an order reduces variant stock so the
  // "স্টক কম" and "স্টক নেই" states can be reached without editing data.
  for (const item of items) {
    const product = useDataStore.getState().products.find((candidate) => candidate.id === item.productId);
    const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
    if (!product || !variant) continue;
    useDataStore.getState().setProductStock(product.id, variant.id, variant.stock - item.quantity);
  }

  return order;
}

export function cancelOrder(orderId: string, actor = 'গ্রাহক (ডেমো)'): void {
  useDataStore.getState().setOrderStatus(orderId, 'cancelled', 'গ্রাহকের অনুরোধে ডেমো অর্ডার বাতিল।', actor);
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
  actor?: string,
): void {
  useDataStore.getState().setOrderStatus(orderId, status, note, actor);
}

/** Moves a demo order one step along the shared state machine. */
export function advanceOrder(orderId: string, actor = 'SHOBDOX ডেমো অপারেশন টিম'): OrderStatus | undefined {
  const order = readOrder(orderId);
  if (!order || isTerminalStatus(order.status)) return undefined;

  const forward = nextStatuses(order.status).find((status) => status !== 'cancelled');
  if (!forward) return undefined;

  updateOrderStatus(orderId, forward, undefined, actor);
  return forward;
}

export function readOrders(): Order[] {
  return useDataStore.getState().orders;
}

export function readOrder(idOrNumber: string): Order | undefined {
  return readOrders().find(
    (order) => order.id === idOrNumber || order.orderNumber === idOrNumber,
  );
}

export function readOrdersForCustomer(customerId: string): Order[] {
  return readOrders()
    .filter((order) => order.customerId === customerId)
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
}

/** Newest order on the device — the tracking screen's default view. */
export function readLatestOrder(): Order | undefined {
  return [...readOrders()].sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
  )[0];
}

export interface OrderConfirmationSummary {
  order: Order;
  deliveryWindow: string;
  paymentLabel: string;
}

export function summarizeForConfirmation(order: Order): OrderConfirmationSummary {
  const method = findDeliveryMethod(order.deliveryMethod);
  const eta = estimateDeliveryDate(order.deliveryMethod, order.shippingAddress, new Date(order.placedAt));

  return {
    order,
    deliveryWindow: `${method.nameBn} · ${eta.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' })} নাগাদ`,
    paymentLabel:
      order.paymentMethod === 'cod'
        ? 'ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে পরিশোধ (ডেমো, লেনদেন হয় না)'
        : `${order.paymentMethod.toUpperCase()} — ডেমো নির্বাচন, কোনো পেমেন্ট হয়নি`,
  };
}

export { canCustomerCancel };
