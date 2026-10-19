import { Link, useParams } from 'react-router';
import { Printer } from 'lucide-react';
import { computeCommission, computeNetPayable } from '@shobdox/shared-business-logic';
import { useCurrentSeller } from '@/components/layout/SellerLayout';
import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  KeyValue,
  PageHeader,
  SectionHeader,
  Thumb,
} from '@/components/ui';
import { OrderStatusBadge } from '@/features/seller/OrderStatusBadge';
import { OrderTimeline, PackingSlip, StatusUpdateCard } from '@/features/seller/OrderDetailParts';
import { useOrder } from '@/hooks/useCatalog';
import { formatDate, formatDateTime, formatTaka, toBanglaDigits } from '@/lib/format';

/**
 * A single order, filtered down to this seller's own line items.
 *
 * The status form and the timeline live in `OrderDetailParts`; everything on
 * this page is read-only except the "প্যাকিং স্লিপ প্রিন্ট" action.
 */

export default function SellerOrderDetailPage() {
  const { orderId } = useParams();
  const seller = useCurrentSeller();
  const order = useOrder(orderId);

  if (!order) {
    return (
      <div className="space-y-5">
        <PageHeader title="অর্ডার বিস্তারিত" />
        <EmptyState
          title="অর্ডারটি পাওয়া যায়নি"
          description="লিংকটি পুরনো হলে অর্ডার তালিকা থেকে আবার খুলুন।"
          action={<ButtonLink to="/seller/orders" variant="outline">অর্ডার তালিকায় ফিরুন</ButtonLink>}
        />
      </div>
    );
  }

  const items = order.items.filter((item) => item.sellerId === seller.id);
  if (items.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader title="অর্ডার বিস্তারিত" description={order.orderNumber} />
        <Alert tone="warning" title="এই অর্ডারে আপনার কোনো পণ্য নেই">
          অর্ডারটি অন্য সেলারের পণ্য নিয়ে তৈরি।{' '}
          <Link to="/seller/orders" className="font-medium underline">
            আমার অর্ডারে ফিরে যান
          </Link>
          ।
        </Alert>
      </div>
    );
  }

  const gross = items.reduce((total, item) => total + item.lineTotal, 0);
  const commission = computeCommission(gross, seller.commissionRate);
  const net = computeNetPayable(gross, seller.commissionRate);
  const address = order.shippingAddress;

  return (
    <div className="space-y-5">
      <PageHeader
        title={`অর্ডার ${order.orderNumber}`}
        description={`${order.customerName} · ${formatDate(order.placedAt)} · ${toBanglaDigits(items.length)}টি পণ্য`}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'সেলার', href: '/seller' },
              { label: 'অর্ডার', href: '/seller/orders' },
              { label: order.orderNumber },
            ]}
          />
        }
        actions={
          <>
            <Button variant="outline" leftIcon={<Printer aria-hidden className="size-4" />} onClick={() => window.print()}>
              প্যাকিং স্লিপ প্রিন্ট
            </Button>
            <ButtonLink to="/seller/orders" variant="ghost">
              সব অর্ডার
            </ButtonLink>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <OrderStatusBadge status={order.status} size="md" />
        <Badge tone={order.paymentMethod === 'cod' ? 'warning' : 'info'}>
          {order.paymentMethod === 'cod'
            ? 'ক্যাশ অন ডেলিভারি (ডেমো)'
            : `${order.paymentMethod.toUpperCase()} — ডেমো`}
        </Badge>
        <span className="text-xs text-text-secondary">সর্বশেষ আপডেট: {formatDateTime(order.updatedAt)}</span>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <Card>
            <SectionHeader title="আপনার পণ্য" subtitle="শুধু আপনার স্টোরের লাইন আইটেম দেখানো হয়েছে।" />
            <ul className="divide-y divide-divider">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-3 py-3">
                  <Thumb src={item.image} alt={item.title} label={item.title} />
                  <div className="min-w-0 flex-1">
                    <Link to={`/product/${item.slug}`} className="text-sm font-semibold text-text-primary hover:text-primary">
                      {item.titleBn ?? item.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {Object.values(item.selectedOptions).join(' / ') || 'ডিফল্ট'}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {formatTaka(item.unitPrice)} × {toBanglaDigits(item.quantity)}
                    </p>
                  </div>
                  <p className="font-num text-sm font-semibold text-text-primary">{formatTaka(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
          </Card>

          <StatusUpdateCard order={order} seller={seller} />
          <OrderTimeline events={order.timeline} />
        </div>

        <div className="space-y-5">
          <Card>
            <SectionHeader title="আয়ের হিসাব" subtitle="ডেমো কমিশন হিসাব" />
            <dl className="divide-y divide-divider">
              <KeyValue label="গ্রস (আপনার অংশ)">{formatTaka(gross)}</KeyValue>
              <KeyValue label={`প্ল্যাটফর্ম কমিশন (${toBanglaDigits(seller.commissionRate)}%)`}>
                −{formatTaka(commission)}
              </KeyValue>
              <KeyValue label="নিট পাওনা">
                <span className="font-semibold text-success">{formatTaka(net)}</span>
              </KeyValue>
            </dl>
            <p className="mt-3 text-xs text-text-secondary">
              কমিশন অর্ডার সম্পন্ন হওয়ার সময় হিসাব হয় (ডেমো)। প্রকৃত কোনো পেআউট হয় না।
            </p>
          </Card>

          <Card>
            <SectionHeader title="শিপিং ঠিকানা" subtitle={`${address.district}, ${address.division}`} />
            <address className="space-y-1 text-sm not-italic text-text-primary">
              <p className="font-semibold">{address.fullName}</p>
              <p className="font-num text-sm text-text-secondary">{address.phone}</p>
              <p>{address.addressLine}</p>
              <p>
                {address.area}
                {address.postcode ? `, ${address.postcode}` : ''}
              </p>
              <p>
                {address.district}, {address.division}
              </p>
              {address.landmark ? <p className="text-xs text-text-secondary">ল্যান্ডমার্ক: {address.landmark}</p> : null}
            </address>

            {order.note ? (
              <p className="mt-3 rounded-card bg-surface-muted px-3 py-2 text-sm text-text-secondary">
                গ্রাহকের নোট: {order.note}
              </p>
            ) : null}

            <p className="mt-3 rounded-card bg-warning-soft px-3 py-2 text-xs text-amber-900">
              এই ঠিকানা ডেমো ডেটাসেটের — প্রকৃত কোনো গ্রাহকের তথ্য নয়। ডেলিভারি সম্পন্ন করতে প্যাকিং স্লিপে ব্যবহার করুন।
            </p>
          </Card>

          <PackingSlip order={order} seller={seller} items={items} />
        </div>
      </div>
    </div>
  );
}
