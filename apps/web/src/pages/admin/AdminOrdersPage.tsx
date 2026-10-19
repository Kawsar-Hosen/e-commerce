import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Download } from 'lucide-react';
import { ORDER_STATUS_LABELS, type Order, type OrderStatus, type PaymentStatus } from '@shobdox/shared-types';
import { formatRelativeTime, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import {
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  PageHeader,
  Pagination,
  SearchInput,
  SegmentedControl,
  Select,
  Tabs,
} from '@/components/ui';
import { useOrders } from '@/hooks/useCatalog';
import { useDebouncedValue } from '@/hooks/useCommon';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { ResponsiveTable, type AdminColumn } from '@/features/admin/ResponsiveTable';
import { OrderStatusMenu } from '@/features/admin/OrderStatusMenu';
import { OrderStatusBadge, PaymentStatusBadge } from '@/features/admin/StatusBadges';
import { exportCsv } from '@/features/admin/csv';
import { usePagination } from '@/features/admin/usePagination';

type StatusTab = 'all' | 'active' | 'shipped' | 'completed' | 'cancelled';
type DateRange = 'all' | '7' | '30';

const STATUS_TABS: Record<Exclude<StatusTab, 'all'>, OrderStatus[]> = {
  active: ['placed', 'confirmed', 'processing'],
  shipped: ['shipped', 'out-for-delivery'],
  completed: ['delivered'],
  cancelled: ['cancelled', 'returned'],
};

const PAYMENT_OPTIONS: Array<{ value: PaymentStatus; label: string }> = [
  { value: 'unpaid', label: 'অপরিশোধিত' },
  { value: 'cod-due', label: 'ক্যাশ অন ডেলিভারি বাকি' },
  { value: 'demo-recorded', label: 'ডেমো-পরিশোধিত' },
  { value: 'refunded', label: 'ফেরত দেওয়া' },
];

/** Order list: status tabs, date/payment filters, quick status advance, CSV. */
export default function AdminOrdersPage() {
  const orders = useOrders();
  const [tab, setTab] = useState<StatusTab>('all');
  const [range, setRange] = useState<DateRange>('all');
  const [payment, setPayment] = useState<'all' | PaymentStatus>('all');
  const [search, setSearch] = useState('');
  const searchTerm = useDebouncedValue(search);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const cutoff = range === 'all' ? 0 : Date.now() - Number(range) * 86_400_000;

    return orders
      .filter((order) => {
        if (tab !== 'all' && !STATUS_TABS[tab].includes(order.status)) return false;
        if (payment !== 'all' && order.paymentStatus !== payment) return false;
        if (cutoff && new Date(order.placedAt).getTime() < cutoff) return false;
        if (term) {
          const haystack = `${order.orderNumber} ${order.customerName} ${order.customerPhone}`.toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  }, [orders, tab, range, payment, searchTerm]);

  const { page, totalPages, pageRows, totalRows, setPage, resetPage } = usePagination(filtered);
  useEffect(() => resetPage(), [tab, range, payment, searchTerm, resetPage]);

  const tabCount = (candidate: StatusTab) =>
    candidate === 'all' ? orders.length : orders.filter((order) => STATUS_TABS[candidate].includes(order.status)).length;

  const quickAdvance = (order: Order, next: OrderStatus) => {
    if (next === 'cancelled') {
      setCancelTarget(order);
      return;
    }
    useDataStore.getState().setOrderStatus(order.id, next);
    toast({
      tone: 'success',
      title: 'স্ট্যাটাস আপডেট হয়েছে',
      description: `${order.orderNumber} → ${ORDER_STATUS_LABELS[next].bn}`,
    });
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    useDataStore.getState().setOrderStatus(cancelTarget.id, 'cancelled');
    toast({ tone: 'warning', title: 'অর্ডার বাতিল হয়েছে', description: cancelTarget.orderNumber });
    setCancelTarget(null);
  };

  const columns: AdminColumn<Order>[] = [
    {
      id: 'order',
      header: 'অর্ডার',
      render: (order) => (
        <div>
          <Link to={`/admin/orders/${order.id}`} className="font-num font-medium text-text-primary hover:text-primary">
            {order.orderNumber}
          </Link>
          <p className="text-xs text-text-secondary">
            {formatRelativeTime(order.placedAt)} · {toBanglaDigits(order.items.length)} আইটেম
          </p>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'গ্রাহক',
      mobileLabel: 'গ্রাহক',
      render: (order) => (
        <div>
          <p className="text-sm text-text-primary">{order.customerName}</p>
          <p className="font-num text-xs text-text-secondary">{order.customerPhone}</p>
        </div>
      ),
    },
    {
      id: 'total',
      header: 'মোট',
      mobileLabel: 'মোট',
      align: 'right',
      render: (order) => <span className="font-num font-semibold">{formatTaka(order.totals.total)}</span>,
    },
    {
      id: 'payment',
      header: 'পেমেন্ট',
      mobileLabel: 'পেমেন্ট',
      render: (order) => <PaymentStatusBadge status={order.paymentStatus} />,
    },
    {
      id: 'status',
      header: 'স্ট্যাটাস',
      mobileLabel: 'স্ট্যাটাস',
      render: (order) => <OrderStatusBadge status={order.status} />,
    },
    {
      id: 'actions',
      header: 'পরবর্তী ধাপ',
      align: 'right',
      render: (order) => <OrderStatusMenu status={order.status} onSelect={(next) => quickAdvance(order, next)} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="অর্ডার"
        description="অর্ডার খুঁজুন, স্ট্যাটাস এগিয়ে নিন এবং রিসিট প্রিন্ট করুন।"
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<Download aria-hidden className="size-4" />}
              onClick={() =>
                exportCsv(
                  'shobdox-orders.csv',
                  [
                    { header: 'অর্ডার নম্বর', value: (order) => order.orderNumber },
                    { header: 'গ্রাহক', value: (order) => order.customerName },
                    { header: 'মোবাইল', value: (order) => order.customerPhone },
                    { header: 'স্ট্যাটাস', value: (order) => order.status },
                    { header: 'পেমেন্ট', value: (order) => order.paymentStatus },
                    { header: 'মোট (৳)', value: (order) => order.totals.total },
                    { header: 'তারিখ', value: (order) => order.placedAt.slice(0, 10) },
                  ],
                  filtered,
                )
              }
            >
              CSV এক্সপোর্ট
            </Button>
            <ButtonLink to="/admin/reports" variant="outline">
              রিপোর্ট
            </ButtonLink>
          </>
        }
      />

      <Card className="mb-4 space-y-3">
        <Tabs
          aria-label="স্ট্যাটাস অনুযায়ী অর্ডার"
          activeId={tab}
          onChange={(id) => setTab(id as StatusTab)}
          items={[
            { id: 'all', label: 'সব', count: tabCount('all') },
            { id: 'active', label: 'চলমান', count: tabCount('active') },
            { id: 'shipped', label: 'পাঠানো', count: tabCount('shipped') },
            { id: 'completed', label: 'সম্পন্ন', count: tabCount('completed') },
            { id: 'cancelled', label: 'বাতিল/ফেরত', count: tabCount('cancelled') },
          ]}
        />

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="অর্ডার নম্বর, নাম বা মোবাইল দিয়ে খুঁজুন…"
            label="অর্ডার খুঁজুন"
          />
          <SegmentedControl
            label="তারিখের পরিসর"
            value={range}
            onChange={setRange}
            options={[
              { value: 'all', label: 'সব সময়' },
              { value: '7', label: '৭ দিন' },
              { value: '30', label: '৩০ দিন' },
            ]}
          />
          <Select
            aria-label="পেমেন্ট ফিল্টার"
            value={payment}
            onChange={(event) => setPayment(event.target.value as 'all' | PaymentStatus)}
            options={[{ value: 'all', label: 'সব পেমেন্ট' }, ...PAYMENT_OPTIONS]}
          />
        </div>
      </Card>

      <ResponsiveTable
        rows={pageRows}
        columns={columns}
        rowKey={(order) => order.id}
        caption={`অর্ডারের তালিকা — মোট ${toBanglaDigits(totalRows)}টি`}
        mobileTitle={(order) => (
          <div className="min-w-0">
            <Link to={`/admin/orders/${order.id}`} className="font-num text-sm font-semibold text-text-primary">
              {order.orderNumber}
            </Link>
            <p className="text-xs text-text-secondary">
              {order.customerName} · {formatRelativeTime(order.placedAt)}
            </p>
          </div>
        )}
        mobileTrailing={(order) => <OrderStatusBadge status={order.status} />}
        mobileActions={(order) => (
          <>
            <ButtonLink to={`/admin/orders/${order.id}`} variant="outline" size="sm">
              বিস্তারিত
            </ButtonLink>
            <OrderStatusMenu status={order.status} onSelect={(next) => quickAdvance(order, next)} />
          </>
        )}
        empty={{ title: 'কোনো অর্ডার মেলেনি', description: 'ফিল্টার বা তারিখের পরিসর বদলে দেখুন।' }}
      />

      <Pagination className="mt-4" page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="অর্ডার বাতিল করবেন?"
        message={`${cancelTarget?.orderNumber ?? ''} বাতিল হলে গ্রাহক ট্র্যাকিংয়ে বাতিল অবস্থা দেখবেন।`}
        confirmLabel="হ্যাঁ, বাতিল করুন"
        onConfirm={confirmCancel}
        onClose={() => setCancelTarget(null)}
      />
    </>
  );
}
