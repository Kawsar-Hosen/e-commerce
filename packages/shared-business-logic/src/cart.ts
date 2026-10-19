import type {
  AppliedCoupon,
  Cart,
  CartItem,
  CartTotals,
  Coupon,
  DeliveryMethodId,
  DeliveryMethodOption,
  PaymentMethodId,
  PaymentMethodOption,
  Product,
  ProductVariant,
  ShippingAddress,
  Taka,
} from '@shobdox/shared-types';
import { isInsideDhakaCity, roundTo } from '@shobdox/shared-utils';
import { extractIncludedVat, variantCompareAtPrice, variantUnitPrice } from './pricing';
import { validateCoupon } from './coupon';

/* --------------------------------------------------------------- constants */

/** Orders at or above this value ship free, before any delivery upgrade. */
export const FREE_DELIVERY_THRESHOLD = 5_000;

/** Maximum units of a single variant that one demo order may contain. */
export const MAX_QUANTITY_PER_LINE = 10;

export const DELIVERY_METHODS: DeliveryMethodOption[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    nameBn: 'স্ট্যান্ডার্ড ডেলিভারি',
    description: 'সারা দেশে কুরিয়ার/হোম ডেলিভারি',
    estimatedDays: '২–৫ দিন',
    fee: 60,
    available: true,
  },
  {
    id: 'express',
    name: 'Express Delivery',
    nameBn: 'এক্সপ্রেস ডেলিভারি',
    description: 'দ্রুত ডেলিভারি, অতিরিক্ত চার্জ প্রযোজ্য',
    estimatedDays: '১–২ দিন',
    fee: 120,
    available: true,
  },
  {
    id: 'same-day',
    name: 'Same Day (inside Dhaka)',
    nameBn: 'একই দিনে (ঢাকার ভেতরে)',
    description: 'শুধুমাত্র ঢাকা সিটির ভেতরে প্রযোজ্য',
    estimatedDays: 'আজকের মধ্যে',
    fee: 200,
    available: true,
  },
  {
    id: 'pickup',
    name: 'Pickup Point',
    nameBn: 'পিকআপ পয়েন্ট',
    description: 'নিকটস্থ পিকআপ পয়েন্ট থেকে সংগ্রহ করুন',
    estimatedDays: '২–৪ দিন',
    fee: 0,
    available: true,
  },
];

/**
 * Payment options are INTERFACE ONLY. No gateway is contacted, no credentials
 * are collected and no transaction can occur in this phase.
 */
export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    nameBn: 'ক্যাশ অন ডেলিভারি',
    description: 'পণ্য হাতে পেয়ে টাকা পরিশোধ করুন',
    brandColor: '#475569',
    demoNotice: 'ডেমো: কোনো নগদ লেনদেন হবে না',
    available: true,
    fee: 0,
  },
  {
    id: 'bkash',
    name: 'bKash',
    nameBn: 'বিকাশ',
    description: 'মোবাইল ওয়ালেট (ডেমো ইন্টারফেস)',
    brandColor: '#E2136E',
    demoNotice: 'ডেমো: বিকাশে কোনো পেমেন্ট পাঠানো হবে না',
    available: true,
    fee: 0,
  },
  {
    id: 'nagad',
    name: 'Nagad',
    nameBn: 'নগদ',
    description: 'মোবাইল ওয়ালেট (ডেমো ইন্টারফেস)',
    brandColor: '#F6821F',
    demoNotice: 'ডেমো: নগদে কোনো পেমেন্ট পাঠানো হবে না',
    available: true,
    fee: 0,
  },
  {
    id: 'rocket',
    name: 'Rocket',
    nameBn: 'রকেট',
    description: 'মোবাইল ওয়ালেট (ডেমো ইন্টারফেস)',
    brandColor: '#8C3494',
    demoNotice: 'ডেমো: রকেটে কোনো পেমেন্ট পাঠানো হবে না',
    available: true,
    fee: 0,
  },
];

export function findDeliveryMethod(id: DeliveryMethodId): DeliveryMethodOption {
  return DELIVERY_METHODS.find((method) => method.id === id) ?? DELIVERY_METHODS[0]!;
}

export function findPaymentMethod(id: PaymentMethodId): PaymentMethodOption {
  return PAYMENT_METHODS.find((method) => method.id === id) ?? PAYMENT_METHODS[0]!;
}

/* ------------------------------------------------------------- cart lines */

export function cartLineId(productId: string, variantId: string): string {
  return `${productId}:${variantId}`;
}

/** Builds a cart line from a product + variant. Assumes the variant is in stock. */
export function createCartLine(
  product: Product,
  variant: ProductVariant,
  quantity = 1,
  selectedOptions: Record<string, string> = {},
): CartItem {
  const optionLabels = product.options.reduce<Record<string, string>>((labels, option) => {
    const valueId = selectedOptions[option.id] ?? variant.optionValues[option.id];
    const value = option.values.find((candidate) => candidate.id === valueId);
    if (value) labels[option.nameBn ?? option.name] = value.labelBn ?? value.label;
    return labels;
  }, {});

  return {
    id: cartLineId(product.id, variant.id),
    productId: product.id,
    variantId: variant.id,
    slug: product.slug,
    title: product.title,
    titleBn: product.titleBn,
    image: variant.image ?? product.thumbnail,
    selectedOptions: optionLabels,
    unitPrice: variantUnitPrice(product, variant),
    compareAtPrice: variantCompareAtPrice(product, variant),
    quantity: Math.min(Math.max(1, quantity), MAX_QUANTITY_PER_LINE),
    availableStock: variant.stock,
    sellerId: product.sellerId,
    // A demo flag: SHOBDOX-owned stock ships itself, everything else is seller-fulfilled.
    fulfilledBy: product.sellerId === 'seller-shobdox' ? 'shobdox' : 'seller',
  };
}

/** Adds a line, merging with an existing line for the same variant. */
export function addLineToCart(items: CartItem[], line: CartItem): CartItem[] {
  const existing = items.find((item) => item.id === line.id);
  if (!existing) return [...items, line];

  return items.map((item) =>
    item.id === line.id
      ? {
          ...item,
          quantity: Math.min(item.quantity + line.quantity, Math.min(item.availableStock, MAX_QUANTITY_PER_LINE)),
        }
      : item,
  );
}

export function updateLineQuantity(items: CartItem[], lineId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter((item) => item.id !== lineId);

  return items.map((item) => {
    if (item.id !== lineId) return item;
    const ceiling = Math.min(item.availableStock > 0 ? item.availableStock : MAX_QUANTITY_PER_LINE, MAX_QUANTITY_PER_LINE);
    return { ...item, quantity: Math.min(Math.max(1, quantity), Math.max(1, ceiling)) };
  });
}

export function removeLineFromCart(items: CartItem[], lineId: string): CartItem[] {
  return items.filter((item) => item.id !== lineId);
}

/** Units of a given product already in the cart — drives the "in cart" badge. */
export function quantityInCart(items: CartItem[], productId: string): number {
  return items
    .filter((item) => item.productId === productId)
    .reduce((total, item) => total + item.quantity, 0);
}

/* ------------------------------------------------------------ delivery fee */

export interface DeliveryFeeInput {
  methodId: DeliveryMethodId;
  address?: Pick<ShippingAddress, 'division' | 'district'>;
  /** Item subtotal after product discounts, before coupon. */
  subtotal: Taka;
  /** A coupon of type `free-delivery` waives the courier charge. */
  hasFreeDeliveryCoupon?: boolean;
}

/**
 * Computes the courier charge. Rules:
 *  - Pickup is always free.
 *  - Orders at or above FREE_DELIVERY_THRESHOLD get free standard delivery.
 *  - Same-day is only offered inside Dhaka city; outside it falls back to express.
 *  - Fees are higher outside Dhaka.
 */
export function computeDeliveryFee({ methodId, address, subtotal, hasFreeDeliveryCoupon }: DeliveryFeeInput): Taka {
  if (methodId === 'pickup') return 0;
  if (hasFreeDeliveryCoupon && methodId === 'standard') return 0;

  const insideDhaka = address ? isInsideDhakaCity(address.division, address.district) : true;

  const surcharge = insideDhaka ? 0 : methodId === 'same-day' ? 140 : 60;
  const effectiveMethodId = methodId === 'same-day' && !insideDhaka ? 'express' : methodId;
  const base = findDeliveryMethod(effectiveMethodId).fee;

  const fee = base + surcharge;

  if (subtotal >= FREE_DELIVERY_THRESHOLD && effectiveMethodId === 'standard') return 0;
  return fee;
}

/** Same-day delivery is advertised inside Dhaka only. */
export function isDeliveryMethodAvailable(methodId: DeliveryMethodId, address?: Pick<ShippingAddress, 'division' | 'district'>): boolean {
  if (methodId !== 'same-day') return true;
  if (!address) return true;
  return isInsideDhakaCity(address.division, address.district);
}

/* ---------------------------------------------------------------- totals */

export interface ComputeCartTotalsInput {
  items: CartItem[];
  coupon?: Coupon | null;
  appliedCoupon?: AppliedCoupon | null;
  address?: Pick<ShippingAddress, 'division' | 'district'>;
  deliveryMethodId?: DeliveryMethodId;
  /** Counts towards the free-delivery threshold by default. */
  includeDeliveryInThreshold?: boolean;
}

/**
 * The single source of truth for order maths used by the cart page, the checkout
 * summary and the mobile app.
 *
 * `total = subtotal - couponDiscount + deliveryFee`
 * VAT is extracted from the taxable amount and shown for transparency only —
 * it is never added on top.
 */
export function computeCartTotals({
  items,
  coupon,
  appliedCoupon,
  address,
  deliveryMethodId = 'standard',
}: ComputeCartTotalsInput): CartTotals {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const subtotal = roundTo(
    items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    0,
  );

  const productDiscount = roundTo(
    items.reduce((total, item) => {
      const reference = item.compareAtPrice ?? item.unitPrice;
      return total + Math.max(0, reference - item.unitPrice) * item.quantity;
    }, 0),
    0,
  );

  let couponDiscount = appliedCoupon?.discountAmount ?? 0;

  // Re-validate on every render: the cart may have changed since the coupon was applied.
  if (coupon) {
    const validation = validateCoupon(coupon, { items, subtotal });
    couponDiscount = validation.valid ? validation.discountAmount : 0;
  }

  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);

  const hasFreeDeliveryCoupon =
    coupon?.type === 'free-delivery' || appliedCoupon?.type === 'free-delivery';

  const deliveryFee = computeDeliveryFee({
    methodId: deliveryMethodId,
    address,
    subtotal: discountedSubtotal,
    hasFreeDeliveryCoupon,
  });

  const vat = extractIncludedVat(Math.max(0, discountedSubtotal - deliveryFee));

  const total = roundTo(discountedSubtotal + deliveryFee, 0);

  return {
    itemCount,
    lineCount: items.length,
    subtotal,
    productDiscount,
    couponDiscount,
    deliveryFee,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    amountUntilFreeDelivery: Math.max(0, FREE_DELIVERY_THRESHOLD - discountedSubtotal),
    vat,
    total,
    savings: roundTo(productDiscount + couponDiscount, 0),
  };
}

/** Percentage of the free-delivery threshold the cart has reached, 0–100. */
export function freeDeliveryProgress(totals: CartTotals): number {
  if (totals.subtotal >= totals.freeDeliveryThreshold) return 100;
  return Math.round((totals.subtotal / totals.freeDeliveryThreshold) * 100);
}

/* ------------------------------------------------------------- cart health */

export interface CartLineIssue {
  lineId: string;
  message: string;
  severity: 'warning' | 'error';
}

/**
 * Cross-checks the persisted cart against current stock. Demo carts survive a
 * refresh, so prices and availability can legitimately have moved on.
 */
export function auditCartLines(items: CartItem[], products: Product[]): CartLineIssue[] {
  const issues: CartLineIssue[] = [];

  for (const item of items) {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) {
      issues.push({
        lineId: item.id,
        message: 'পণ্যটি এখন আর পাওয়া যাচ্ছে না — কার্ট থেকে সরিয়ে দিন।',
        severity: 'error',
      });
      continue;
    }

    const variant = product.variants.find((candidate) => candidate.id === item.variantId);
    if (!variant || variant.stock <= 0) {
      issues.push({
        lineId: item.id,
        message: 'নির্বাচিত ভ্যারিয়েন্টটি স্টকে নেই।',
        severity: 'error',
      });
      continue;
    }

    if (item.quantity > variant.stock) {
      issues.push({
        lineId: item.id,
        message: `স্টকে মাত্র ${variant.stock} টি আছে।`,
        severity: 'warning',
      });
    }

    const currentPrice = variantUnitPrice(product, variant);
    if (currentPrice !== item.unitPrice) {
      issues.push({
        lineId: item.id,
        message:
          currentPrice < item.unitPrice
            ? 'দাম কমেছে — নতুন দাম কার্টে যোগ করা হয়েছে।'
            : 'দাম বেড়েছে — নতুন দাম কার্টে যোগ করা হয়েছে।',
        severity: 'warning',
      });
    }
  }

  return issues;
}

/** Re-prices persisted lines against the current catalogue. */
export function repriceCartItems(items: CartItem[], products: Product[]): CartItem[] {
  return items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) return [];
    const variant = product.variants.find((candidate) => candidate.id === item.variantId);
    if (!variant || variant.stock <= 0) return [];

    return [
      {
        ...item,
        slug: product.slug,
        title: product.title,
        titleBn: product.titleBn,
        image: variant.image ?? product.thumbnail,
        unitPrice: variantUnitPrice(product, variant),
        compareAtPrice: variantCompareAtPrice(product, variant),
        availableStock: variant.stock,
        quantity: Math.min(item.quantity, variant.stock),
      },
    ];
  });
}

export function createEmptyCart(): Cart {
  return { items: [], coupon: null, updatedAt: new Date().toISOString() };
}
