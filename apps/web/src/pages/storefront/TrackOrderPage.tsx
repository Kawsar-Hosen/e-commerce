import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { PackageSearch, Search } from 'lucide-react';
import {
  Alert,
  Breadcrumbs,
  Button,
  ButtonLink,
  Card,
  DemoNotice,
  EmptyState,
  Input,
  KeyValue,
  PageHeader,
} from '@/components/ui';
import type { Order } from '@shobdox/shared-types';
import { useOrders } from '@/hooks/useCatalog';
import { readOrder, summarizeForConfirmation } from '@/services/order.service';
import { toast } from '@/store/ui.store';
import { formatDate, formatDateTime, maskBdPhone, normalizeBdPhone, toBanglaDigits } from '@shobdox/shared-utils';
import { OrderItemsPreview } from '@/features/checkout/OrderItemsPreview';
import { OrderStatusChip } from '@/features/orders/OrderStatusChip';
import { OrderTimeline } from '@/features/orders/OrderTimeline';

/**
 * Demo order tracking.
 *
 * There is no backend, so the search runs against the demo orders stored in
 * this browser. When a lookup fails the page lists real demo numbers to try,
 * which keeps it useful without inventing fake tracking data.
 */
export default function TrackOrderPage() {
  const orders = useOrders();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrder = searchParams.get('order') ?? '';

  const [query, setQuery] = useState(initialOrder);
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState<{ q: string; p: string } | null>(
    initialOrder ? { q: initialOrder, p: '' } : null,
  );

  const result = useMemo(() => {
    if (!submitted) return undefined;
    const direct = submitted.q ? readOrder(submitted.q) : undefined;
    const pool: Order[] = direct ? [direct] : orders;
    const normalizedPhone = submitted.p ? normalizeBdPhone(submitted.p) : '';
    return pool.find((order) => !normalizedPhone || normalizeBdPhone(order.customerPhone) === normalizedPhone);
  }, [submitted, orders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
        .slice(0, 5),
    [orders],
  );

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    const p = phone.trim();

    if (!q && !p) {
      toast({ tone: 'warning', title: 'অর্ডার নম্বর বা মোবাইল নম্বর দিন' });
      return;
    }

    setSubmitted({ q, p });
    const next = new URLSearchParams();
    if (q) next.set('order', q);
    setSearchParams(next, { replace: true });
  };

  const tryOrder = (orderNumber: string) => {
    setQuery(orderNumber);
    setPhone('');
    setSubmitted({ q: orderNumber, p: '' });
    setSearchParams({ order: orderNumber }, { replace: true });
  };

  const summary = result ? summarizeForConfirmation(result) : undefined;

  return (
    <>
      <PageHeader
        title="অর্ডার ট্র্যাক করুন"
        description="ডেমো অর্ডার নম্বর বা মোবাইল নম্বর দিয়ে অর্ডারের সর্বশেষ অবস্থা দেখুন।"
        breadcrumbs={<Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'অর্ডার ট্র্যাকিং' }]} />}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="min-w-0 space-y-4">
          <Card>
            <form onSubmit={onSearch} noValidate className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start">
              <Input
                label="অর্ডার নম্বর"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="যেমন: SDX-DEMO-001022"
                leftIcon={<PackageSearch aria-hidden className="size-4" />}
                autoComplete="off"
              />
              <Input
                label="মোবাইল নম্বর (ঐচ্ছিক)"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="017XXXXXXXX"
                autoComplete="tel"
                hint="নম্বর দিলে মিলিয়ে দেখা হবে"
              />
              <Button type="submit" leftIcon={<Search aria-hidden className="size-4" />} className="sm:mt-6">
                খুঁজুন
              </Button>
            </form>
          </Card>

          {result && summary ? (
            <Card as="section">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-text-secondary">অর্ডার নম্বর</p>
                  <p className="font-num break-words text-xl font-bold text-text-primary">{result.orderNumber}</p>
                </div>
                <OrderStatusChip status={result.status} />
              </div>

              <dl className="mt-3">
                <KeyValue label="অর্ডারের সময়">{formatDateTime(result.placedAt)}</KeyValue>
                <KeyValue label="সম্ভাব্য ডেলিভারি">{formatDate(result.estimatedDelivery)}</KeyValue>
                <KeyValue label="ডেলিভারি">{summary.deliveryWindow}</KeyValue>
                <KeyValue label="পেমেন্ট">{summary.paymentLabel}</KeyValue>
                <KeyValue label="মোবাইল">
                  <span className="font-num">{maskBdPhone(result.customerPhone)}</span>
                </KeyValue>
              </dl>

              <h2 className="mt-4 text-lg font-bold text-text-primary">অবস্থা</h2>
              <OrderTimeline order={result} className="mt-3" />

              <h2 className="mt-4 text-lg font-bold text-text-primary">পণ্য</h2>
              <OrderItemsPreview items={result.items} max={3} className="mt-2" />

              <div className="mt-4 flex flex-wrap gap-2">
                <ButtonLink to={`/account/orders/${result.id}`} variant="secondary">
                  সম্পূর্ণ অর্ডার দেখুন
                </ButtonLink>
                <ButtonLink to={`/order-confirmation/${result.id}`} variant="outline">
                  নিশ্চিতকরণ দেখুন
                </ButtonLink>
              </div>
            </Card>
          ) : null}

          {submitted && !result ? (
            <EmptyState
              title="কিছু পাওয়া যায়নি"
              description="এই নম্বর বা মোবাইল দিয়ে কোনো ডেমো অর্ডার পাওয়া যায়নি। নিচের ডেমো অর্ডার নম্বরগুলো চেষ্টা করে দেখুন।"
              icon={<PackageSearch aria-hidden className="size-6" />}
              action={
                <Button variant="outline" onClick={() => setSubmitted(null)}>
                  আবার খুঁজুন
                </Button>
              }
            />
          ) : null}

          {!submitted ? (
            <Alert tone="info" title="ডেমো ট্র্যাকিং">
              ডেমো সাইটে কোনো কুরিয়ার API নেই — সব অর্ডার এই ব্রাউজারের স্থানীয় ডেমো ডেটা থেকে খোঁজা হয়।
            </Alert>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-4">
          <Card>
            <h2 className="text-lg font-bold text-text-primary">চেষ্টা করে দেখুন</h2>
            <p className="mt-1 text-sm text-text-secondary">ডেটাসেটে থাকা সাম্প্রতিক ডেমো অর্ডারগুলো:</p>

            <ul className="mt-3 space-y-2">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => tryOrder(order.orderNumber)}
                    className="w-full rounded-card border border-border bg-surface p-3 text-left transition-colors hover:border-primary"
                  >
                    <span className="font-num block text-sm font-semibold text-text-primary">{order.orderNumber}</span>
                    <span className="mt-0.5 block text-xs text-text-secondary">
                      {order.customerName} · {formatDate(order.placedAt, { withYear: false })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {recentOrders.length === 0 ? (
              <p className="mt-2 text-sm text-text-secondary">এখনো কোনো ডেমো অর্ডার নেই।</p>
            ) : (
              <p className="mt-3 text-xs text-text-secondary">
                মোট {toBanglaDigits(orders.length)} টি ডেমো অর্ডার পাওয়া গেছে।
              </p>
            )}
          </Card>

          <DemoNotice title="ডেমো অর্ডার ট্র্যাকিং">
            এখানে কোনো কুরিয়ার বা পেমেন্ট সার্ভিসের সাথে সংযোগ হয় না। অর্ডার নম্বর ও মোবাইল নম্বর শুধু এই ব্রাউজারে
            মেলানো হয়।
          </DemoNotice>

          <ButtonLink to="/help/delivery" variant="ghost" size="sm" fullWidth>
            ডেলিভারি তথ্য পড়ুন
          </ButtonLink>
        </aside>
      </div>
    </>
  );
}
