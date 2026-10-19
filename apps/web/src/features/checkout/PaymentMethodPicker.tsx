import { Alert, RadioGroup } from '@/components/ui';
import type { PaymentMethodId } from '@shobdox/shared-types';
import { PAYMENT_METHODS } from '@shobdox/shared-business-logic';
import { formatTaka } from '@shobdox/shared-utils';
import { DEMO_PAYMENT_NOTICE } from '@/lib/constants';

/**
 * Payment choice — DEMO INTERFACE ONLY.
 *
 * Deliberately renders no wallet number, PIN or OTP input: there is no gateway
 * behind this screen and no payment data should ever be typed in.
 */
export function PaymentMethodPicker({
  value,
  onChange,
}: {
  value: PaymentMethodId;
  onChange: (method: PaymentMethodId) => void;
}) {
  const options = PAYMENT_METHODS.map((method) => ({
    value: method.id,
    label: `${method.nameBn} — ${method.name}`,
    description: method.demoNotice,
    disabled: !method.available,
    trailing: method.fee > 0 ? formatTaka(method.fee) : undefined,
  }));

  const selected = PAYMENT_METHODS.find((method) => method.id === value);

  return (
    <div className="space-y-3">
      <RadioGroup
        name="paymentMethod"
        label="পেমেন্ট পদ্ধতি"
        value={value}
        onChange={(next) => onChange(next as PaymentMethodId)}
        options={options}
      />

      <Alert tone="warning" title="পেমেন্ট শুধু ডেমো ইন্টারফেস">
        <p>{DEMO_PAYMENT_NOTICE}</p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
          <li>কোনো বিকাশ/নগদ/রকেট নম্বর, পিন বা OTP এখানে চাওয়া হয় না — চাইলে দেবেন না।</li>
          <li>কোনো টাকা কাটা হবে না এবং পেমেন্ট “সম্পন্ন” হিসেবে দাবি করা হবে না।</li>
          <li>অর্ডারটি শুধু এই ব্রাউজারে ডেমো রেকর্ড হিসেবে সংরক্ষিত হয়।</li>
        </ul>
        {selected ? (
          <p className="mt-1.5 font-medium">
            {selected.nameBn}: {selected.demoNotice}
          </p>
        ) : null}
      </Alert>
    </div>
  );
}
