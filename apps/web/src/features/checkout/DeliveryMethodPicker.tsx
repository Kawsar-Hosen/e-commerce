import { Alert, RadioGroup } from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import type { DeliveryMethodId, ShippingAddress } from '@shobdox/shared-types';
import {
  DELIVERY_METHODS,
  computeDeliveryFee,
  estimateDeliveryDate,
  isDeliveryMethodAvailable,
} from '@shobdox/shared-business-logic';
import { formatDate, formatTaka, isInsideDhakaCity } from '@shobdox/shared-utils';

/**
 * Delivery choice with live fees and estimated dates.
 *
 * `address` is passed in (rather than read from the session) so the checkout
 * previews fees for the address the shopper has just typed, not the saved one.
 */
export function DeliveryMethodPicker({
  value,
  onChange,
  address,
}: {
  value: DeliveryMethodId;
  onChange: (method: DeliveryMethodId) => void;
  address: Pick<ShippingAddress, 'division' | 'district'>;
}) {
  const { coupon, totals } = useCart();

  const insideDhaka = isInsideDhakaCity(address.division, address.district);
  const discountedSubtotal = Math.max(0, totals.subtotal - totals.couponDiscount);
  const hasFreeDeliveryCoupon = coupon?.type === 'free-delivery';

  const options = DELIVERY_METHODS.map((method) => {
    const available = isDeliveryMethodAvailable(method.id, address);
    const fee = available
      ? computeDeliveryFee({
          methodId: method.id,
          address,
          subtotal: discountedSubtotal,
          hasFreeDeliveryCoupon,
        })
      : undefined;
    const eta = estimateDeliveryDate(method.id, address, new Date());

    return {
      value: method.id,
      label: method.nameBn,
      description: available
        ? `${method.description} · ${formatDate(eta)} নাগাদ`
        : 'ঢাকার বাইরে প্রযোজ্য নয় — এক্সপ্রেস ডেলিভারি হবে',
      disabled: !available,
      trailing: fee === undefined ? '—' : fee === 0 ? <span className="font-medium text-success">ফ্রি</span> : formatTaka(fee),
    };
  });

  return (
    <div className="space-y-3">
      <RadioGroup
        name="deliveryMethod"
        label="ডেলিভারি পদ্ধতি"
        value={value}
        onChange={(next) => onChange(next as DeliveryMethodId)}
        options={options}
      />

      {!insideDhaka ? (
        <Alert tone="info" title="ঢাকার বাইরে ডেলিভারি">
          ঢাকার বাইরে স্ট্যান্ডার্ড ও এক্সপ্রেস ডেলিভারিতে অতিরিক্ত ৬০৳ সারচার্জ যোগ হয়, আর একই দিনে ডেলিভারি
          শুধু ঢাকা সিটির ভেতরে পাওয়া যায়। উপরের ফি-তে সারচার্জ হিসাব করা হয়েছে।
        </Alert>
      ) : null}

      {hasFreeDeliveryCoupon ? (
        <Alert tone="success">ফ্রি ডেলিভারি কুপন প্রয়োগ করা আছে — স্ট্যান্ডার্ড ডেলিভারির চার্জ ০৳।</Alert>
      ) : null}
    </div>
  );
}
