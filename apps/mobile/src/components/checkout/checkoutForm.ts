import type { DefaultValues, UseFormReturn } from 'react-hook-form';
import type { DeliveryMethodId, PaymentMethodId, ShippingAddress } from '@shobdox/shared-types';
import type { CheckoutFormValues, CheckoutParsed } from '@shobdox/shared-validation';
import { GUEST_ADDRESS } from '../../hooks/useCart';

/**
 * Value helpers for the checkout form.
 *
 * Plain functions in a `.ts` module (no JSX) keep the screen's `useForm` setup
 * small and give the "account vs. saved address vs. guest" precedence one home.
 * Field names and rules come from the shared `checkoutSchema`.
 */

export type CheckoutForm = UseFormReturn<CheckoutFormValues, unknown, CheckoutParsed>;

export interface CheckoutDefaultsInput {
  /** Signed-in demo account, or the primary mock customer for guests. */
  account: { name: string; phone: string; email?: string | null };
  /** Default saved address, or `GUEST_ADDRESS` when the shopper has none. */
  address: ShippingAddress;
  deliveryMethodId: DeliveryMethodId;
  paymentMethodId: PaymentMethodId;
  note?: string;
}

/** Seeds the form with account, address and cart selections. */
export function buildCheckoutDefaults({
  account,
  address,
  deliveryMethodId,
  paymentMethodId,
  note,
}: CheckoutDefaultsInput): DefaultValues<CheckoutFormValues> {
  return {
    fullName: address.fullName || account.name,
    phone: address.phone || account.phone,
    altPhone: '',
    email: account.email ?? address.email ?? '',
    division: address.division,
    district: address.district,
    area: address.area,
    // The guest placeholder line must not pass validation as a real address.
    addressLine: address.id === GUEST_ADDRESS.id ? '' : address.addressLine,
    landmark: address.landmark ?? '',
    postcode: address.postcode ?? '',
    deliveryMethod: deliveryMethodId,
    paymentMethod: paymentMethodId,
    saveAddress: true,
    note: note ?? '',
  };
}

/** Copies a picked saved address into the form fields. */
export function applyAddressToForm(form: CheckoutForm, address: ShippingAddress): void {
  form.setValue('fullName', address.fullName);
  form.setValue('phone', address.phone);
  form.setValue('email', address.email ?? '');
  form.setValue('division', address.division);
  form.setValue('district', address.district);
  form.setValue('area', address.area);
  form.setValue('addressLine', address.addressLine);
  form.setValue('landmark', address.landmark ?? '');
  form.setValue('postcode', address.postcode ?? '');
}
