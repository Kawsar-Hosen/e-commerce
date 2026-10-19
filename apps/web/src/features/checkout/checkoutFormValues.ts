import type { DefaultValues, UseFormReturn } from 'react-hook-form';
import type { ShippingAddress } from '@shobdox/shared-types';
import type { CheckoutFormValues, CheckoutParsed } from '@shobdox/shared-validation';

/**
 * Value helpers for the checkout form.
 *
 * Plain functions in a `.ts` module (no JSX) keep the page's `useForm` setup
 * small and let the "account vs. saved address vs. guest" precedence live in
 * one place.
 */

type CheckoutForm = UseFormReturn<CheckoutFormValues, unknown, CheckoutParsed>;

/** Seeds the checkout form with account, address and cart selections. */
export function buildCheckoutDefaults(input: {
  /** Signed-in demo account (or the primary mock customer for guests). */
  account: { name: string; phone: string; email?: string | null };
  /** Default saved address, or GUEST_ADDRESS — supplies most field values. */
  address: ShippingAddress;
  deliveryMethodId: CheckoutFormValues['deliveryMethod'];
  paymentMethodId: CheckoutFormValues['paymentMethod'];
  note?: string;
}): DefaultValues<CheckoutFormValues> {
  const { account, address, deliveryMethodId, paymentMethodId, note } = input;

  return {
    fullName: address.fullName || account.name,
    phone: address.phone || account.phone,
    altPhone: '',
    email: account.email ?? address.email ?? '',
    division: address.division,
    district: address.district,
    area: address.area,
    addressLine: address.addressLine,
    landmark: address.landmark ?? '',
    postcode: address.postcode ?? '',
    deliveryMethod: deliveryMethodId,
    paymentMethod: paymentMethodId,
    saveAddress: true,
    note: note ?? '',
  };
}

/** Copies a picked saved address into the checkout form fields. */
export function applyAddressToForm(form: CheckoutForm, address: ShippingAddress) {
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
