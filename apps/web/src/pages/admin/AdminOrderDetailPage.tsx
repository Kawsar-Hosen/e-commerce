import { Link, useParams } from 'react-router';
import { Copy, Printer } from 'lucide-react';
import { Card, ErrorState, Button, ButtonLink, KeyValue, PageHeader, SectionHeader } from '@/components/ui';
import { findDeliveryMethod, findPaymentMethod } from '@shobdox/shared-business-logic';
import { formatDate, formatDateTime, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { useOrder } from '@/hooks/useCatalog';
import { useCopyToClipboard } from '@/hooks/useCommon';
import { OrderItemsTable, OrderTotalsList } from '@/features/admin/OrderItemsTable';
import { OrderReceipt } from '@/features/admin/OrderReceipt';
import { OrderStatusForm } from '@/features/admin/OrderStatusForm';
import { OrderStatusBadge, PaymentStatusBadge } from '@/features/admin/StatusBadges';
import { OrderTimeline } from '@/features/admin/OrderTimeline';

/**
 * Admin order detail.
 *
 * On-screen dashboard plus a `hidden print:block` receipt: `window.print()`
 * prints only `OrderReceipt` because everything else sits inside a
 * `print:hidden` wrapper (the layout marks its own chrome `no-print` too).
 */
export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const order = useOrder(orderId);
  const { copied, copy } = useCopyToClipboard();

  if (!order) {
    return (
      <>
        <PageHeader title="অর্ডার বিস্তারিত" description="অনুরোধ করা অর্ডারটি ডেমো স্টেটে নেই।" />
        <ErrorState title="অর্ডারটি খুঁজে পাওয়া যায়নি" description="সম্ভবত লিংকটি পুরনো বা অর্ডারটি ডেমো রিসেটে মুছে গেছে।">
          <ButtonLink to="/admin/orders">অর্ডার তালিকায় ফিরুন</ButtonLink>
        </ErrorState>
      </>
    );
  }

  const delivery = findDeliveryMethod(order.deliveryMethod);
  const payment = findPaymentMethod(order.paymentMethod);

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          breadcrumbs={
            <nav aria-label="ব্রেডক্রাম্ব" className="mb-2 text-xs text-text-secondary">
              <Link to="/admin/orders" className="hover:text-primary hover:underline">
                অর্ডার
              </Link>{' '}
              / <span className="font-num font-medium text-text-primary">{order.orderNumber}</span>
            </nav>
          }
          title={order.orderNumber}
          description={`${order.customerName} · ${formatDateTime(order.placedAt)} · সম্ভাব্য ডেলিভারি ${formatDate(order.estimatedDelivery)}`}
          actions={
            <>
              <Button
                variant="outline"
                leftIcon={<Copy aria-hidden className="size-4" />}
                onClick={() => copy(order.orderNumber)}
              >
                {copied ? 'কপি হয়েছে' : 'নম্বর কপি'}
              </Button>
              <Button leftIcon={<Printer aria-hidden className="size-4" />} onClick={() => window.print()}>
                রিসিট প্রিন্ট
              </Button>
            </>
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
          <span className="text-sm text-text-secondary">
            পেমেন্ট: {payment.nameBn} · ডেলিভারি: {delivery.nameBn}
          </span>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <Card>
              <SectionHeader
                title="পণ্য"
                subtitle={`মোট ${toBanglaDigits(order.items.reduce((sum, item) => sum + item.quantity, 0))} ইউনিট`}
              />
              <OrderItemsTable items={order.items} />
              <OrderTotalsList order={order} className="mt-4 border-t border-border pt-2" />
            </Card>

            <Card>
              <SectionHeader title="অর্ডার টাইমলাইন" subtitle="স্ট্যাটাস পরিবর্তনের পূর্ণ ইতিহাস" />
              <OrderTimeline events={order.timeline} />
            </Card>

            {order.note ? (
              <Card>
                <SectionHeader title="গ্রাহকের নোট" />
                <p className="rounded-card bg-surface-muted px-3 py-2 text-sm text-text-secondary">{order.note}</p>
              </Card>
            ) : null}
          </div>

          <div className="min-w-0 space-y-5">
            <OrderStatusForm order={order} />

            <Card>
              <SectionHeader title="গ্রাহক ও ঠিকানা" />
              <p className="text-sm font-medium text-text-primary">{order.customerName}</p>
              <p className="font-num text-sm text-text-secondary">{order.customerPhone}</p>
              <address className="mt-2 text-sm not-italic text-text-secondary">
                {order.shippingAddress.addressLine}, {order.shippingAddress.area}, {order.shippingAddress.district},{' '}
                {order.shippingAddress.division}
              </address>
            </Card>

            <Card>
              <SectionHeader title="শিপিং ও পেমেন্ট" />
              <dl className="divide-y divide-divider">
                <KeyValue label="ডেলিভারি পদ্ধতি">
                  {delivery.nameBn} · {delivery.estimatedDays}
                </KeyValue>
                <KeyValue label="ডেলিভারি ফি">{formatTaka(order.totals.deliveryFee)}</KeyValue>
                <KeyValue label="পেমেন্ট পদ্ধতি">{payment.nameBn}</KeyValue>
                <KeyValue label="কুপন">{order.couponCode ?? 'প্রযোজ্য নয়'}</KeyValue>
                <KeyValue label="সর্বমোট">{formatTaka(order.totals.total)}</KeyValue>
              </dl>
              <p className="mt-2 text-xs text-text-muted">{payment.demoNotice}</p>
            </Card>
          </div>
        </div>
      </div>

      <div className="hidden print:block">
        <OrderReceipt order={order} />
      </div>
    </>
  );
}
