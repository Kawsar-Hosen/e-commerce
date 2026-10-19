import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { CheckCircle2, Copy, Printer } from 'lucide-react';
import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  ButtonLink,
  Card,
  DemoNotice,
  EmptyState,
  KeyValue,
  PageHeader,
} from '@/components/ui';
import { useOrder, useProducts } from '@/hooks/useCatalog';
import { useCopyToClipboard } from '@/hooks/useCommon';
import { summarizeForConfirmation } from '@/services/order.service';
import { recommendedProducts } from '@shobdox/shared-business-logic';
import { formatBdPhone, formatDate, formatDateTime, toBanglaDigits } from '@shobdox/shared-utils';
import { OrderItemsPreview } from '@/features/checkout/OrderItemsPreview';
import { OrderSummary } from '@/features/checkout/OrderSummary';
import { ProductRail } from '@/features/checkout/ProductRail';
import { OrderStatusChip } from '@/features/orders/OrderStatusChip';
import { OrderTimeline } from '@/features/orders/OrderTimeline';

/** Confirmation for a locally recorded demo order. Nothing was charged. */
export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const order = useOrder(orderId);
  const products = useProducts();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { copied, copy } = useCopyToClipboard();
  // Watch the id, not the object, so the focus move does not re-fire when
  // unrelated store updates rebuild the order record.
  const placedOrderId = order?.id;

  // Move focus to the result so screen-reader users are not left at the top.
  useEffect(() => {
    if (placedOrderId) headingRef.current?.focus();
  }, [placedOrderId]);

  if (!order) {
    return (
      <>
        <PageHeader
          title="অর্ডার নিশ্চিতকরণ"
          breadcrumbs={<Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'অর্ডার নিশ্চিতকরণ' }]} />}
        />
        <EmptyState
          title="অর্ডারটি খুঁজে পাওয়া যায়নি"
          description="লিংকটি ভুল হতে পারে, অথবা রিসেটের কারণে ডেমো অর্ডারটি মুছে গেছে। নম্বর দিয়ে ট্র্যাক করে দেখুন।"
          action={
            <>
              <ButtonLink to="/track">অর্ডার ট্র্যাক করুন</ButtonLink>
              <ButtonLink to="/shop" variant="outline">
                কেনাকাটা চালিয়ে যান
              </ButtonLink>
            </>
          }
        />
      </>
    );
  }

  const summary = summarizeForConfirmation(order);
  const recommendations = recommendedProducts({
    products,
    cartProductIds: order.items.map((item) => item.productId),
    limit: 4,
  });

  return (
    <>
      <PageHeader
        title="অর্ডার নিশ্চিতকরণ"
        breadcrumbs={<Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'অর্ডার নিশ্চিতকরণ' }]} />}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="min-w-0 space-y-4">
          <Card>
            <div className="flex flex-wrap items-start gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                <CheckCircle2 aria-hidden className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="break-words text-2xl font-bold text-text-primary focus:outline-none"
                >
                  ধন্যবাদ! ডেমো অর্ডারটি রেকর্ড করা হয়েছে
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  কোনো প্রকৃত পেমেন্ট হয়নি — অর্ডারটি শুধু এই ব্রাউজারে সংরক্ষিত হয়েছে।
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="font-num rounded-chip bg-surface-muted px-3 py-1.5 text-base font-bold text-text-primary">
                    {order.orderNumber}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Copy aria-hidden className="size-4" />}
                    onClick={() => copy(order.orderNumber)}
                  >
                    {copied ? 'কপি হয়েছে' : 'নম্বর কপি করুন'}
                  </Button>
                  <OrderStatusChip status={order.status} />
                </div>
              </div>
            </div>

            <DemoNotice title="এটি একটি ডেমো অর্ডার — কোনো প্রকৃত পেমেন্ট বা ডেলিভারি হবে না" className="mt-4">
              <p>
                {order.orderNumber} নম্বরটি ডেমো সিস্টেমের তৈরি। কোনো গেটওয়েতে টাকা যায়নি, কোনো কার্ড/ওয়ালেট তথ্য
                নেওয়া হয়নি এবং কোনো কুরিয়ার ডেলিভারি হবে না।
              </p>
              <p className="mt-1">অর্ডারটি শুধু এই ব্রাউজারে স্থানীয়ভাবে রেকর্ড করা হয়েছে।</p>
            </DemoNotice>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-text-primary">অর্ডারের অবস্থা</h2>
            <OrderTimeline order={order} className="mt-3" />
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-text-primary">পণ্যসমূহ</h2>
            <OrderItemsPreview items={order.items} max={20} className="mt-2" />
          </Card>
        </div>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-20">
          <OrderSummary totals={order.totals} couponCode={order.couponCode}>
            <Button
              variant="outline"
              fullWidth
              leftIcon={<Printer aria-hidden className="size-4" />}
              onClick={() => window.print()}
            >
              প্রিন্ট করুন
            </Button>
            <ButtonLink to={`/track?order=${encodeURIComponent(order.orderNumber)}`} variant="secondary" fullWidth>
              অর্ডার ট্র্যাক করুন
            </ButtonLink>
            <ButtonLink to="/account/orders" variant="ghost" fullWidth>
              আমার অর্ডারসমূহ
            </ButtonLink>
            <ButtonLink to="/shop" variant="ghost" fullWidth>
              আরও কেনাকাটা করুন
            </ButtonLink>
          </OrderSummary>

          <Card>
            <h2 className="text-lg font-bold text-text-primary">ডেলিভারি ও পেমেন্ট</h2>
            <dl className="mt-2">
              <KeyValue label="ডেলিভারি পদ্ধতি">{summary.deliveryWindow}</KeyValue>
              <KeyValue label="পেমেন্ট">{summary.paymentLabel}</KeyValue>
              <KeyValue label="অর্ডারের সময়">{formatDateTime(order.placedAt)}</KeyValue>
              <KeyValue label="সম্ভাব্য ডেলিভারি">{formatDate(order.estimatedDelivery)}</KeyValue>
            </dl>

            <div className="mt-3 rounded-card bg-surface-muted p-3 text-sm">
              <p className="font-semibold text-text-primary">ডেলিভারি ঠিকানা</p>
              <p className="mt-1 break-words text-text-secondary">
                {order.shippingAddress.fullName} · <span className="font-num">{formatBdPhone(order.shippingAddress.phone)}</span>
              </p>
              <p className="break-words text-text-secondary">
                {order.shippingAddress.addressLine}, {order.shippingAddress.area}, {order.shippingAddress.district},{' '}
                {order.shippingAddress.division}
              </p>
              {order.shippingAddress.postcode ? (
                <p className="font-num text-text-secondary">পোস্ট কোড: {toBanglaDigits(order.shippingAddress.postcode)}</p>
              ) : null}
            </div>

            {order.note ? (
              <Alert tone="info" className="mt-3" title="আপনার নোট">
                <span className="break-words">{order.note}</span>
              </Alert>
            ) : null}
          </Card>

          <Badge tone="neutral" className="whitespace-normal">
            অর্ডার আইডি: <span className="font-num">{order.id}</span>
          </Badge>
        </aside>
      </div>

      <ProductRail title="আপনার জন্য আরও প্রস্তাব" products={recommendations} href="/shop" className="no-print" />
    </>
  );
}
