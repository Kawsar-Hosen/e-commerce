import { useMemo } from 'react';
import type { CartTotals, Coupon, CouponValidationResult, ShippingAddress } from '@shobdox/shared-types';
import {
  auditCartLines,
  computeCartTotals,
  findCouponByCode,
  freeDeliveryProgress,
  repriceCartItems,
  toAppliedCoupon,
  validateCoupon,
} from '@shobdox/shared-business-logic';
import { formatTaka } from '@shobdox/shared-utils';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '../store/auth.store';
import { useCoupons, useProducts } from './useProducts';

/**
 * The cart as the UI sees it.
 *
 * Totals are recomputed from the live catalogue on every read; the persisted
 * cart only remembers *what the shopper picked*. That is why a price change, a
 * stock-out or an expired coupon shows up immediately instead of hiding behind a
 * stale cached number.
 */

export function defaultShippingAddress(user?: {
  addresses: ShippingAddress[];
}): ShippingAddress | undefined {
  if (!user) return undefined;
  return user.addresses.find((address) => address.isDefault) ?? user.addresses[0];
}

/** A neutral address so guests can still see delivery maths before checkout. */
export const GUEST_ADDRESS: ShippingAddress = {
  id: 'addr-guest',
  fullName: 'অতিথি গ্রাহক',
  phone: '01700000000',
  division: 'Dhaka',
  district: 'Dhaka',
  area: 'ধানমন্ডি',
  addressLine: 'ঠিকানা চেকআউটে দেওয়া হবে',
  isDefault: true,
};

export interface UseCartResult {
  items: ReturnType<typeof useCartStore.getState>['items'];
  totals: CartTotals;
  coupon?: Coupon;
  couponResult?: CouponValidationResult;
  appliedCoupon?: ReturnType<typeof toAppliedCoupon>;
  deliveryMethodId: ReturnType<typeof useCartStore.getState>['deliveryMethod'];
  paymentMethodId: ReturnType<typeof useCartStore.getState>['paymentMethod'];
  note?: string;
  /** Address used for delivery-fee maths (signed-in default, else guest). */
  address: ShippingAddress;
  /** Lines whose catalogue price/stock no longer matches what is stored. */
  issues: ReturnType<typeof auditCartLines>;
  reprice: ReturnType<typeof repriceCartItems>;
  hasStalePrices: boolean;
  freeDeliveryPercent: number;
  freeDeliveryMessage: string;
  isFreeDelivery: boolean;
  savingsLabel: string;
  isEmpty: boolean;
}

export function useCart(): UseCartResult {
  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);
  const deliveryMethodId = useCartStore((state) => state.deliveryMethod);
  const paymentMethodId = useCartStore((state) => state.paymentMethod);
  const note = useCartStore((state) => state.note);

  const products = useProducts();
  const coupons = useCoupons();
  const user = useAuthStore((state) => state.session?.user);
  const address = defaultShippingAddress(user) ?? GUEST_ADDRESS;

  const coupon = useMemo(
    () => (couponCode ? findCouponByCode(coupons, couponCode) : undefined),
    [coupons, couponCode],
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [items],
  );

  const categoryIdByProduct = useMemo(() => {
    const map: Record<string, string> = {};
    for (const product of products) map[product.id] = product.categoryId;
    return map;
  }, [products]);

  const couponResult = useMemo(
    () => (coupon ? validateCoupon(coupon, { items, subtotal, categoryIdByProduct }) : undefined),
    [coupon, items, subtotal, categoryIdByProduct],
  );

  const appliedCoupon = useMemo(
    () =>
      coupon && couponResult?.valid
        ? toAppliedCoupon(coupon, couponResult.discountAmount)
        : undefined,
    [coupon, couponResult],
  );

  const totals = useMemo(
    () => computeCartTotals({ items, appliedCoupon, address, deliveryMethodId }),
    [items, appliedCoupon, address, deliveryMethodId],
  );

  const issues = useMemo(() => auditCartLines(items, products), [items, products]);
  const reprice = useMemo(() => repriceCartItems(items, products), [items, products]);

  const hasStalePrices = useMemo(
    () =>
      reprice.some((line, index) => {
        const original = items[index];
        return original ? original.unitPrice !== line.unitPrice : true;
      }),
    [reprice, items],
  );

  const freeDeliveryPercent = freeDeliveryProgress(totals);
  const isFreeDelivery = totals.amountUntilFreeDelivery === 0;

  return {
    items,
    totals,
    coupon,
    couponResult,
    appliedCoupon,
    deliveryMethodId,
    paymentMethodId,
    note,
    address,
    issues,
    reprice,
    hasStalePrices,
    freeDeliveryPercent,
    freeDeliveryMessage: isFreeDelivery
      ? 'আপনি ফ্রি ডেলিভারি পাচ্ছেন'
      : `আর ${formatTaka(totals.amountUntilFreeDelivery)} যোগ করলে ডেলিভারি ফ্রি`,
    isFreeDelivery,
    savingsLabel: totals.savings > 0 ? `আপনি সাশ্রয় করছেন ${formatTaka(totals.savings)}` : '',
    isEmpty: items.length === 0,
  };
}

/** Just the badge number for the tab bar / header cart button. */
export function useCartCount(): number {
  return useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
}
