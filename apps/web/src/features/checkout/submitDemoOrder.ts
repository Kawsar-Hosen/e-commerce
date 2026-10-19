import type { AppliedCoupon, CartItem, Coupon, Order, ShippingAddress } from '@shobdox/shared-types';
import type { CheckoutParsed } from '@shobdox/shared-validation';
import { computeCartTotals } from '@shobdox/shared-business-logic';
import { simulateLatency } from '@shobdox/shared-utils';
import { placeDemoOrder } from '@/services/order.service';

/**
 * Turns validated checkout values into a locally recorded demo order.
 *
 * Kept out of the page so the screen only owns rendering and form state; the
 * order itself is always built by the order service, never by hand.
 */
export interface SubmitDemoOrderInput {
  values: CheckoutParsed;
  /** Owning demo account id; the contact name/phone come from the form. */
  customerId: string;
  /** Reuses the picked saved-address id so order history can link back. */
  addressId?: string;
  items: CartItem[];
  coupon?: Coupon;
  appliedCoupon?: AppliedCoupon;
}

export async function submitDemoOrder({
  values,
  customerId,
  addressId,
  items,
  coupon,
  appliedCoupon,
}: SubmitDemoOrderInput): Promise<Order> {
  // Small delay so the submit button's loading state is visible in the demo.
  await simulateLatency(400, 800);

  const shippingAddress: ShippingAddress = {
    id: addressId ?? `addr-demo-${Date.now().toString(36)}`,
    fullName: values.fullName,
    phone: values.phone,
    email: values.email,
    division: values.division,
    district: values.district,
    area: values.area,
    addressLine: values.addressLine,
    landmark: values.landmark,
    postcode: values.postcode ? values.postcode : undefined,
    isDefault: values.saveAddress,
  };

  const totals = computeCartTotals({
    items,
    coupon,
    address: shippingAddress,
    deliveryMethodId: values.deliveryMethod,
  });

  return placeDemoOrder({
    customer: { id: customerId, name: values.fullName, phone: values.phone },
    items,
    address: shippingAddress,
    deliveryMethod: values.deliveryMethod,
    paymentMethod: values.paymentMethod,
    totals: {
      subtotal: totals.subtotal,
      productDiscount: totals.productDiscount,
      couponDiscount: totals.couponDiscount,
      deliveryFee: totals.deliveryFee,
      vat: totals.vat,
      total: totals.total,
      savings: totals.savings,
    },
    couponCode: appliedCoupon?.code,
    note: values.note,
  });
}
