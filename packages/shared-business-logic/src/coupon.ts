import type {
  AppliedCoupon,
  CartItem,
  Coupon,
  CouponRejectionReason,
  CouponValidationResult,
  Taka,
} from '@shobdox/shared-types';
import { roundTo } from '@shobdox/shared-utils';

/**
 * Coupon rules shared by the web checkout and the Android checkout.
 * A coupon is always re-validated against the live cart rather than trusted
 * from persisted state.
 */

export interface CouponContext {
  items: CartItem[];
  /** Item subtotal before any coupon discount. */
  subtotal: Taka;
  /** Injectable clock so the demo can be tested around expiry dates. */
  now?: Date;
  /** How many times this customer has already used the code. */
  customerUsageCount?: number;
  /** Product -> category lookup, needed for category-restricted coupons. */
  categoryIdByProduct?: Record<string, string>;
}

const REJECTION_COPY: Record<CouponRejectionReason, string> = {
  'not-found': 'এই কুপন কোডটি খুঁজে পাওয়া যায়নি।',
  inactive: 'এই কুপনটি এখন সক্রিয় নয়।',
  expired: 'কুপনের মেয়াদ শেষ হয়ে গেছে।',
  'not-started': 'কুপনটি এখনো চালু হয়নি।',
  'min-order-not-met': 'এই কুপন ব্যবহারের জন্য সর্বনিম্ন অর্ডার মূল্য পূরণ হয়নি।',
  'usage-limit-reached': 'কুপনটির ব্যবহারের সীমা শেষ হয়ে গেছে।',
  'category-not-eligible': 'কার্টে থাকা পণ্যগুলো এই কুপনের জন্য প্রযোজ্য নয়।',
  'already-applied': 'কুপনটি ইতিমধ্যে প্রয়োগ করা হয়েছে।',
};

/** Items the coupon is allowed to discount. */
function eligibleItems(coupon: Coupon, context: CouponContext): CartItem[] {
  if (coupon.productIds.length === 0 && coupon.categoryIds.length === 0) return context.items;

  return context.items.filter((item) => {
    if (coupon.productIds.includes(item.productId)) return true;
    const categoryId = context.categoryIdByProduct?.[item.productId];
    return Boolean(categoryId && coupon.categoryIds.includes(categoryId));
  });
}

/**
 * The Taka value a coupon removes from a cart. Category/product restrictions
 * simply reduce the eligible base; the cart is never rejected for mixing items.
 */
export function computeCouponDiscount(coupon: Coupon, context: CouponContext): Taka {
  if (coupon.type === 'free-delivery') return 0;

  const base = eligibleItems(coupon, context).reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  if (base <= 0) return 0;

  if (coupon.type === 'fixed') return roundTo(Math.min(coupon.value, base), 0);

  const raw = (base * coupon.value) / 100;
  const capped = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
  return roundTo(Math.min(capped, base), 0);
}

/**
 * Full validation returning a customer-facing Bangla message.
 * Order of checks is deliberate: existence, then lifetime, then eligibility.
 */
export function validateCoupon(coupon: Coupon | undefined, context: CouponContext): CouponValidationResult {
  if (!coupon) {
    return {
      valid: false,
      discountAmount: 0,
      reason: 'not-found',
      message: REJECTION_COPY['not-found'],
    };
  }

  const now = context.now ?? new Date();

  if (!coupon.isActive) {
    return { valid: false, coupon, discountAmount: 0, reason: 'inactive', message: REJECTION_COPY.inactive };
  }

  if (new Date(coupon.startsAt).getTime() > now.getTime()) {
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      reason: 'not-started',
      message: REJECTION_COPY['not-started'],
    };
  }

  if (new Date(coupon.expiresAt).getTime() < now.getTime()) {
    return { valid: false, coupon, discountAmount: 0, reason: 'expired', message: REJECTION_COPY.expired };
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      reason: 'usage-limit-reached',
      message: REJECTION_COPY['usage-limit-reached'],
    };
  }

  if (
    coupon.usageLimitPerCustomer > 0 &&
    (context.customerUsageCount ?? 0) >= coupon.usageLimitPerCustomer
  ) {
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      reason: 'usage-limit-reached',
      message: 'আপনি এই কুপনটি সর্বোচ্চবার ব্যবহার করেছেন।',
    };
  }

  if (context.subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      reason: 'min-order-not-met',
      message: `এই কুপন ব্যবহারের জন্য ${coupon.minOrderValue.toLocaleString('en-US')}৳ বা তার বেশি কিনতে হবে।`,
    };
  }

  const discountAmount = computeCouponDiscount(coupon, context);

  if (discountAmount <= 0 && coupon.type !== 'free-delivery') {
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      reason: 'category-not-eligible',
      message: REJECTION_COPY['category-not-eligible'],
    };
  }

  const savingCopy =
    coupon.type === 'free-delivery'
      ? 'ফ্রি ডেলিভারি প্রযোজ্য হয়েছে।'
      : `কুপন প্রয়োগ হয়েছে — সাশ্রয় ${discountAmount.toLocaleString('en-US')}৳।`;

  return { valid: true, coupon, discountAmount, message: savingCopy };
}

/** Converts a validated coupon into the snapshot stored on the cart. */
export function toAppliedCoupon(coupon: Coupon, discountAmount: Taka): AppliedCoupon {
  return {
    code: coupon.code,
    description: coupon.title,
    type: coupon.type,
    value: coupon.value,
    discountAmount,
  };
}

/** Case-insensitive lookup with forgiving whitespace. */
export function findCouponByCode(coupons: Coupon[], code: string): Coupon | undefined {
  const needle = code.trim().toUpperCase();
  return coupons.find((coupon) => coupon.code.toUpperCase() === needle);
}

/**
 * Suggests coupons a shopper could use right now, best saving first.
 * Powers the "available offers" strip in the cart and the mobile cart screen.
 */
export function suggestCoupons(coupons: Coupon[], context: CouponContext, limit = 3): CouponValidationResult[] {
  return coupons
    .map((coupon) => validateCoupon(coupon, context))
    .filter((result) => result.valid)
    .sort((a, b) => b.discountAmount - a.discountAmount)
    .slice(0, limit);
}
