/**
 * Turns validated checkout values into a locally recorded demo order.
 *
 * Kept out of the screen so the page only owns rendering and form state: the
 * order itself is always built by the order service, never by hand.
 */

import type {
  CartItem,
  Coupon,
  Order,
  ShippingAddress,
} from '@shobdox/shared-types';
import type { CheckoutParsed } from '@shobdox/shared-validation';
import { computeCartTotals } from '@shobdox/shared-business-logic';
import { simulateLatency } from '@shobdox/shared-utils';
import { placeDemoOrder } from './order.service';

export interface SubmitDemoCheckoutInput {
  values: CheckoutParsed;
  /** Owning demo account id; contact name/phone come from the form. */
  customerId: string;
  /** Reuses the picked saved-address id so order history can link back. */
  addressId?: string;
  items: CartItem[];
  coupon?: Coupon;
}

export interface DemoCheckoutResult {
  order: Order;
  /** The address as the shopper typed it, ready for the address book. */
  address: ShippingAddress;
}

export async function submitDemoCheckout({
  values,
  customerId,
  addressId,
  items,
  coupon,
}: SubmitDemoCheckoutInput): Promise<DemoCheckoutResult> {
  // Small delay so the submit button's loading state is visible in the demo.
  await simulateLatency(400, 800);

  const address: ShippingAddress = {
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
    address,
    deliveryMethodId: values.deliveryMethod,
  });

  const order = placeDemoOrder({
    customer: { id: customerId, name: values.fullName, phone: values.phone },
    items,
    address,
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
    couponCode: coupon?.code,
    note: values.note,
  });

  return { order, address };
}
