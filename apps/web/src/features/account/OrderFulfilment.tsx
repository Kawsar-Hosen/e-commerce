import type { Order } from '@shobdox/shared-types';
import { findDeliveryMethod, findPaymentMethod } from '@shobdox/shared-business-logic';
import { formatBdPhone, formatDate } from '@shobdox/shared-utils';
import { Alert, Card, KeyValue } from '@/components/ui';
import { DEMO_PAYMENT_NOTICE } from '@/lib/constants';
import { PAYMENT_STATUS_LABELS } from './labels';

/** Delivery and payment summaries for the customer order detail page. */

export function OrderDeliveryCard({ order }: { order: Order }) {
  const method = findDeliveryMethod(order.deliveryMethod);
  const address = order.shippingAddress;

  return (
    <Card as="section">
      <h2 className="text-xl font-bold text-text-primary">ডেলিভারি</h2>

      <div className="mt-3 text-sm text-text-secondary">
        <p className="font-medium text-text-primary">{address.fullName}</p>
        <p className="font-num">{formatBdPhone(address.phone)}</p>
        <p className="mt-1 leading-relaxed text-text-primary">{address.addressLine}</p>
        <p>
          {address.area}, {address.district}, {address.division}
          {address.postcode ? ` — ${address.postcode}` : ''}
        </p>
        {address.landmark ? <p>নিকটবর্তী চিহ্ন: {address.landmark}</p> : null}
      </div>

      <dl className="mt-3 border-t border-divider pt-2">
        <KeyValue label="ডেলিভারি পদ্ধতি">{method.nameBn}</KeyValue>
        <KeyValue label="আনুমানিক ডেলিভারি">{formatDate(order.estimatedDelivery)}</KeyValue>
      </dl>

      <p className="mt-1 text-xs leading-relaxed text-text-muted">
        {method.description} · {method.estimatedDays} (ডেমো অনুমান, প্রকৃত কুরিয়ার নেই)
      </p>
    </Card>
  );
}

export function OrderPaymentCard({ order }: { order: Order }) {
  const method = findPaymentMethod(order.paymentMethod);

  return (
    <Card as="section">
      <h2 className="text-xl font-bold text-text-primary">পেমেন্ট</h2>

      <dl className="mt-3">
        <KeyValue label="মাধ্যম">{method.nameBn}</KeyValue>
        <KeyValue label="স্ট্যাটাস">{PAYMENT_STATUS_LABELS[order.paymentStatus]}</KeyValue>
      </dl>

      <Alert tone="warning" className="mt-3" title="ডেমো পেমেন্ট — কোনো টাকা লেনদেন হয়নি">
        {method.demoNotice}। {DEMO_PAYMENT_NOTICE}
      </Alert>
    </Card>
  );
}
