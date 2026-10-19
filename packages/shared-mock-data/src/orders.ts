import type {
  DeliveryMethodId,
  Order,
  OrderStatus,
  PaymentMethodId,
  PaymentStatus,
  ShippingAddress,
} from '@shobdox/shared-types';
import { buildTimeline, computeCartTotals, createCartLine } from '@shobdox/shared-business-logic';
import { MOCK_COUPONS } from './coupons';
import { MOCK_CUSTOMERS } from './people';
import { MOCK_PRODUCTS } from './products';

/**
 * Demo order history.
 *
 * Every order is assembled through the same cart maths the checkout uses, so the
 * totals shown to the customer, in the admin table and in the seller dashboard
 * always reconcile.
 */

interface OrderItemSeed {
  slug: string;
  /** Index into the product's variant list. Defaults to the first variant. */
  variant?: number;
  quantity: number;
}

interface OrderSeed {
  id: string;
  customerId: string;
  status: OrderStatus;
  daysAgo: number;
  items: OrderItemSeed[];
  deliveryMethod: DeliveryMethodId;
  paymentMethod: PaymentMethodId;
  couponCode?: string;
  note?: string;
}

const ORDER_SEEDS: OrderSeed[] = [
  {
    id: 'ord-1001',
    customerId: 'user-customer-1',
    status: 'delivered',
    daysAgo: 42,
    items: [
      { slug: 'samsung-galaxy-a55-5g-8-256gb', variant: 4, quantity: 1 },
      { slug: 'boat-rockerz-450-bluetooth-headphone', variant: 0, quantity: 2 },
    ],
    deliveryMethod: 'standard',
    paymentMethod: 'bkash',
  },
  {
    id: 'ord-1002',
    customerId: 'user-customer-4',
    status: 'delivered',
    daysAgo: 38,
    items: [{ slug: 'tangail-handloom-jamdani-saree', quantity: 1 }],
    deliveryMethod: 'express',
    paymentMethod: 'cod',
  },
  {
    id: 'ord-1003',
    customerId: 'user-customer-2',
    status: 'delivered',
    daysAgo: 31,
    items: [
      { slug: 'aci-pure-miniket-rice', variant: 1, quantity: 1 },
      { slug: 'fresh-mustard-oil-5-litre', variant: 1, quantity: 2 },
      { slug: 'ispahani-mirzapore-tea-400g', quantity: 3 },
    ],
    deliveryMethod: 'standard',
    paymentMethod: 'nagad',
    couponCode: 'FREESHIP',
    note: 'কুরিয়ার অফিসে রেখে যাবেন না, সরাসরি বাসায় দিন।',
  },
  {
    id: 'ord-1004',
    customerId: 'user-customer-1',
    status: 'delivered',
    daysAgo: 24,
    items: [
      { slug: 'maybelline-fit-me-matte-poreless-foundation', variant: 1, quantity: 1 },
      { slug: 'nivea-soft-moisturising-cream', variant: 1, quantity: 1 },
    ],
    deliveryMethod: 'standard',
    paymentMethod: 'cod',
  },
  {
    id: 'ord-1005',
    customerId: 'user-customer-3',
    status: 'delivered',
    daysAgo: 21,
    items: [{ slug: 'cotton-king-size-bed-sheet-set', variant: 0, quantity: 1 }],
    deliveryMethod: 'standard',
    paymentMethod: 'rocket',
  },
  {
    id: 'ord-1006',
    customerId: 'user-customer-5',
    status: 'out-for-delivery',
    daysAgo: 3,
    items: [
      { slug: 'realme-c75-8-128gb', variant: 0, quantity: 1 },
      { slug: 'water-resistant-laptop-backpack', variant: 1, quantity: 1 },
    ],
    deliveryMethod: 'express',
    paymentMethod: 'bkash',
  },
  {
    id: 'ord-1007',
    customerId: 'user-customer-2',
    status: 'shipped',
    daysAgo: 4,
    items: [
      { slug: 'unstitched-cotton-three-piece-set', variant: 0, quantity: 2 },
      { slug: 'printed-cotton-dupatta', variant: 1, quantity: 1 },
    ],
    deliveryMethod: 'standard',
    paymentMethod: 'cod',
  },
  {
    id: 'ord-1008',
    customerId: 'user-customer-1',
    status: 'processing',
    daysAgo: 2,
    items: [
      { slug: 'xiaomi-redmi-buds-5-wireless-earbuds', variant: 0, quantity: 1 },
      { slug: 'anker-powercore-20000mah-powerbank', quantity: 1 },
    ],
    deliveryMethod: 'same-day',
    paymentMethod: 'nagad',
    couponCode: 'SHOBDOX10',
  },
  {
    id: 'ord-1009',
    customerId: 'user-customer-4',
    status: 'confirmed',
    daysAgo: 1,
    items: [
      { slug: 'humayun-ahmed-himu-samagra', quantity: 1 },
      { slug: 'arif-azad-paradoxical-sajid', quantity: 2 },
    ],
    deliveryMethod: 'standard',
    paymentMethod: 'cod',
  },
  {
    id: 'ord-1010',
    customerId: 'user-customer-2',
    status: 'placed',
    daysAgo: 0,
    items: [
      { slug: 'humayun-ahmed-misir-ali-samagra', quantity: 1 },
      { slug: 'how-to-win-friends-bangla-translation', quantity: 1 },
    ],
    deliveryMethod: 'standard',
    paymentMethod: 'cod',
  },
  {
    id: 'ord-1011',
    customerId: 'user-customer-3',
    status: 'cancelled',
    daysAgo: 12,
    items: [{ slug: 'lotto-casual-running-sneaker', variant: 3, quantity: 1 }],
    deliveryMethod: 'standard',
    paymentMethod: 'bkash',
    note: 'সাইজ ভুল ছিল, বাতিল করতে চাই।',
  },
  {
    id: 'ord-1012',
    customerId: 'user-customer-5',
    status: 'delivered',
    daysAgo: 9,
    items: [
      { slug: 'anti-slip-yoga-mat-6mm', variant: 0, quantity: 1 },
      { slug: 'speed-skipping-rope', quantity: 1 },
    ],
    deliveryMethod: 'pickup',
    paymentMethod: 'cod',
  },
  {
    id: 'ord-1013',
    customerId: 'user-customer-1',
    status: 'returned',
    daysAgo: 17,
    items: [{ slug: 'walton-wd43urv-43-4k-smart-tv', quantity: 1 }],
    deliveryMethod: 'standard',
    paymentMethod: 'nagad',
    note: 'স্ক্রিনে সমস্যা ছিল, ফেরত দেওয়া হয়েছে।',
  },
  {
    id: 'ord-1014',
    customerId: 'user-customer-4',
    status: 'delivered',
    daysAgo: 55,
    items: [
      { slug: 'casio-analog-couple-watch', variant: 0, quantity: 1 },
      { slug: 'genuine-leather-wallet', variant: 1, quantity: 2 },
    ],
    deliveryMethod: 'express',
    paymentMethod: 'bkash',
    couponCode: 'WELCOME200',
  },
  {
    id: 'ord-1015',
    customerId: 'user-customer-2',
    status: 'delivered',
    daysAgo: 6,
    items: [{ slug: 'xiaomi-redmi-note-14-pro-8-256gb', variant: 3, quantity: 1 }],
    deliveryMethod: 'express',
    paymentMethod: 'bkash',
  },
  {
    id: 'ord-1016',
    customerId: 'user-customer-3',
    status: 'processing',
    daysAgo: 1,
    items: [
      { slug: 'prestige-nonstick-cookware-set-5-piece', quantity: 1 },
      { slug: 'non-stick-fry-pan-28cm', quantity: 2 },
    ],
    deliveryMethod: 'standard',
    paymentMethod: 'cod',
    couponCode: 'HOME300',
  },
  {
    id: 'ord-1017',
    customerId: 'user-customer-5',
    status: 'delivered',
    daysAgo: 47,
    items: [
      { slug: 'rfl-plastic-storage-box-set', variant: 0, quantity: 2 },
      { slug: 'printed-cotton-dupatta', variant: 0, quantity: 3 },
    ],
    deliveryMethod: 'standard',
    paymentMethod: 'rocket',
  },
  {
    id: 'ord-1018',
    customerId: 'user-customer-1',
    status: 'shipped',
    daysAgo: 3,
    items: [
      { slug: 'bata-men-formal-leather-shoes', variant: 2, quantity: 1 },
      { slug: 'easy-slim-fit-stretch-denim-pant', variant: 4, quantity: 1 },
    ],
    deliveryMethod: 'standard',
    paymentMethod: 'cod',
  },
  {
    id: 'ord-1019',
    customerId: 'user-customer-4',
    status: 'confirmed',
    daysAgo: 2,
    items: [
      { slug: 'womens-georgette-embroidered-kurti', variant: 5, quantity: 2 },
      { slug: 'handwoven-silk-dupatta', variant: 0, quantity: 1 },
    ],
    deliveryMethod: 'express',
    paymentMethod: 'nagad',
  },
  {
    id: 'ord-1020',
    customerId: 'user-customer-2',
    status: 'out-for-delivery',
    daysAgo: 2,
    items: [
      { slug: 'polarized-uv400-sunglasses', variant: 0, quantity: 1 },
      { slug: 'adjustable-dumbbell-set-20kg', quantity: 1 },
    ],
    deliveryMethod: 'standard',
    paymentMethod: 'cod',
    couponCode: 'FREESHIP',
  },
];

function addressFor(customerId: string): ShippingAddress {
  const customer = MOCK_CUSTOMERS.find((candidate) => candidate.id === customerId);
  const address = customer?.addresses[0];

  if (!address) {
    return {
      id: 'addr-fallback',
      fullName: customer?.name ?? 'ডেমো গ্রাহক',
      phone: customer?.phone ?? '01700000000',
      division: 'Dhaka',
      district: 'Dhaka',
      area: 'Mirpur',
      addressLine: 'ডেমো ঠিকানা, ঢাকা',
      isDefault: true,
    };
  }

  return {
    id: address.id,
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    email: customer?.email,
    division: address.division,
    district: address.district,
    area: address.area,
    addressLine: address.addressLine,
    landmark: address.landmark,
    postcode: address.postcode,
    isDefault: address.isDefault,
  };
}

/**
 * Demo payment status. Nothing is ever charged in this phase:
 *  - cash on delivery stays `cod-due` forever
 *  - wallet orders are only `demo-recorded` once delivered, purely so the
 *    dashboards have a realistic-looking mix of rows
 */
function paymentStatusFor(status: OrderStatus, method: PaymentMethodId): PaymentStatus {
  if (method === 'cod') return 'cod-due';
  if (status === 'delivered') return 'demo-recorded';
  if (status === 'cancelled' || status === 'returned') return 'refunded';
  return 'unpaid';
}

function buildOrder(seed: OrderSeed, index: number): Order | undefined {
  const customer = MOCK_CUSTOMERS.find((candidate) => candidate.id === seed.customerId);
  if (!customer) return undefined;

  const items = seed.items
    .map((item) => {
      const product = MOCK_PRODUCTS.find((candidate) => candidate.slug === item.slug);
      if (!product) return undefined;
      const variant = product.variants[item.variant ?? 0] ?? product.variants[0];
      if (!variant) return undefined;
      return createCartLine(product, variant, Math.max(1, item.quantity));
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));

  if (items.length === 0) return undefined;

  const shippingAddress = addressFor(seed.customerId);
  const coupon = seed.couponCode
    ? MOCK_COUPONS.find((candidate) => candidate.code === seed.couponCode)
    : undefined;

  const totals = computeCartTotals({
    items,
    coupon,
    address: shippingAddress,
    deliveryMethodId: seed.deliveryMethod,
  });

  // Spread orders across plausible shopping hours instead of stacking them all
  // at the same instant.
  const placedAt = new Date(
    Date.now() - seed.daysAgo * 86_400_000 - ((index % 9) + 9) * 3_600_000,
  ).toISOString();

  const fulfilmentDays = seed.deliveryMethod === 'express' ? 2 : seed.deliveryMethod === 'pickup' ? 4 : 4;

  return {
    id: seed.id,
    orderNumber: `SDX-2026-${String(1000 + index).padStart(6, '0')}`,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    items: items.map((item) => ({
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
    })),
    shippingAddress,
    deliveryMethod: seed.deliveryMethod,
    paymentMethod: seed.paymentMethod,
    paymentStatus: paymentStatusFor(seed.status, seed.paymentMethod),
    status: seed.status,
    timeline: buildTimeline(seed.status, placedAt, {
      actor: 'SHOBDOX অপারেশন টিম',
      location: `${shippingAddress.district}, ${shippingAddress.division}`,
    }),
    totals: {
      subtotal: totals.subtotal,
      productDiscount: totals.productDiscount,
      couponDiscount: totals.couponDiscount,
      deliveryFee: totals.deliveryFee,
      vat: totals.vat,
      total: totals.total,
      savings: totals.savings,
    },
    couponCode: seed.couponCode,
    note: seed.note,
    placedAt,
    updatedAt: placedAt,
    estimatedDelivery: new Date(new Date(placedAt).getTime() + fulfilmentDays * 86_400_000).toISOString(),
    isDemo: false,
  };
}

export const MOCK_ORDERS: Order[] = ORDER_SEEDS.map(buildOrder).filter(
  (order): order is Order => Boolean(order),
);

export function ordersForCustomer(customerId: string): Order[] {
  return MOCK_ORDERS.filter((order) => order.customerId === customerId).sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
  );
}

export function ordersForSeller(sellerId: string): Order[] {
  return MOCK_ORDERS.filter((order) => order.items.some((item) => item.sellerId === sellerId)).sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
  );
}

export function findOrderByIdOrNumber(idOrNumber: string): Order | undefined {
  return MOCK_ORDERS.find((order) => order.id === idOrNumber || order.orderNumber === idOrNumber);
}

/** Most recent order for the default demo customer; used by tracking screens. */
export const MOCK_FEATURED_ORDER: Order | undefined =
  ordersForCustomer('user-customer-1')[0] ?? MOCK_ORDERS[0];
