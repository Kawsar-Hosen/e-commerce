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
} from '@shobdox/shared-business-logic';
import { useDataStore } from '@/store/data.store';

/**
 * Order lifecycle for the demo.
 *
 * `placeDemoOrder()` writes a real `Order` object into local state, marks it as
 * demo data and never touches a payment gateway. Status changes go through the
 * shared state machine, so an illegal jump (delivered -> placed) is refused in
 * the UI exactly as it would be on a server.
 */

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
  const store = useDataStore.getState();
  const sequence = store.consumeOrderSequence();

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

  store.addOrder(order);

  // Demo stock movement: placing an order reduces the variant stock so the
  // "low stock" and "out of stock" states can be reached without editing data.
  items.forEach((item) => {
    const product = useDataStore.getState().products.find((candidate) => candidate.id === item.productId);
    const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
    if (!product || !variant) return;
    useDataStore.getState().setProductStock(product.id, variant.id, variant.stock - item.quantity);
  });

  return order;
}

export function cancelOrder(orderId: string, actor = 'গ্রাহক'): void {
  useDataStore.getState().setOrderStatus(orderId, 'cancelled', undefined, actor);
}

export function updateOrderStatus(orderId: string, status: OrderStatus, note?: string, actor?: string): void {
  useDataStore.getState().setOrderStatus(orderId, status, note, actor);
}

export function readOrders(): Order[] {
  return useDataStore.getState().orders;
}

export function readOrder(idOrNumber: string): Order | undefined {
  return readOrders().find((order) => order.id === idOrNumber || order.orderNumber === idOrNumber);
}

export function readOrdersForCustomer(customerId: string): Order[] {
  return readOrders()
    .filter((order) => order.customerId === customerId)
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
}

export function readOrdersForSeller(sellerId: string): Order[] {
  return readOrders()
    .filter((order) => order.items.some((item) => item.sellerId === sellerId))
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
}

/** Latest order for the demo customer; used by the tracking screen's default view. */
export function readLatestOrder(): Order | undefined {
  return [...readOrders()].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())[0];
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
        ? 'ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে পরিশোধ)'
        : `${order.paymentMethod.toUpperCase()} — ডেমো নির্বাচন, কোনো পেমেন্ট হয়নি`,
  };
}

export { canCustomerCancel };
