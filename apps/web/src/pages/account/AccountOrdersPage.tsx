import { useEffect, useMemo, useState } from 'react';
import { PackageSearch } from 'lucide-react';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_SEQUENCE,
  type Order,
  type OrderStatus,
} from '@shobdox/shared-types';
import { matchesAnyField, toBanglaDigits } from '@shobdox/shared-utils';
import {
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  Tabs,
} from '@/components/ui';
import { OrderHistoryList } from '@/features/account/OrderHistoryList';
import { useCustomerOrders } from '@/hooks/useCatalog';
import { useDebouncedValue } from '@/hooks/useCommon';
import { cancelOrder } from '@/services/order.service';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/ui.store';

/** Customer order history: status tabs, search, sort and pagination. */

const PAGE_SIZE = 5;

type SortKey = 'newest' | 'oldest' | 'total-desc' | 'total-asc';

const SORT_OPTIONS = [
  { value: 'newest', label: 'নতুন আগে' },
  { value: 'oldest', label: 'পুরনো আগে' },
  { value: 'total-desc', label: 'বেশি দাম আগে' },
  { value: 'total-asc', label: 'কম দাম আগে' },
];

const TAB_STATUSES: OrderStatus[] = [...ORDER_STATUS_SEQUENCE, 'cancelled', 'returned'];

export default function AccountOrdersPage() {
  const user = useAuthStore((state) => state.session?.user);
  const orders = useCustomerOrders(user?.id);

  const [tab, setTab] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const debouncedQuery = useDebouncedValue(query, 250);

  const counts = useMemo(() => {
    const map: Partial<Record<OrderStatus, number>> = {};
    for (const order of orders) map[order.status] = (map[order.status] ?? 0) + 1;
    return map;
  }, [orders]);

  const tabs = useMemo(() => {
    const items = [{ id: 'all', label: 'সব', count: orders.length }];
    for (const status of TAB_STATUSES) {
      const count = counts[status] ?? 0;
      if (count > 0) items.push({ id: status, label: ORDER_STATUS_LABELS[status].bn, count });
    }
    return items;
  }, [counts, orders.length]);

  // Any change to the filters must return the shopper to the first page.
  useEffect(() => {
    setPage(1);
  }, [tab, debouncedQuery, sort]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim();
    const rows = orders
      .filter((order) => (tab === 'all' ? true : order.status === tab))
      .filter(
        (order) =>
          q.length === 0 ||
          matchesAnyField(
            [order.orderNumber, ...order.items.flatMap((item) => [item.title, item.titleBn])],
            q,
          ),
      );

    switch (sort) {
      case 'oldest':
        rows.sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime());
        break;
      case 'total-desc':
        rows.sort((a, b) => b.totals.total - a.totals.total);
        break;
      case 'total-asc':
        rows.sort((a, b) => a.totals.total - b.totals.total);
        break;
      default:
        rows.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
    }

    return rows;
  }, [orders, tab, debouncedQuery, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const clearFilters = () => {
    setTab('all');
    setQuery('');
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    cancelOrder(cancelTarget.id, 'গ্রাহক (ডেমো)');
    toast({
      tone: 'success',
      title: 'অর্ডার বাতিল হয়েছে',
      description: `${cancelTarget.orderNumber} বাতিল করা হয়েছে (ডেমো স্ট্যাটাস পরিবর্তন)।`,
    });
    setCancelTarget(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="আমার অর্ডার"
        description="ডেমো অর্ডারগুলোর অবস্থা, ট্র্যাকিং ও বাতিলের সব অপশন এখানে।"
        actions={
          <ButtonLink to="/track" variant="outline" size="sm">
            অর্ডার ট্র্যাক করুন
          </ButtonLink>
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={<PackageSearch aria-hidden className="size-6" />}
          title="এখনো কোনো অর্ডার নেই"
          description="ডেমো স্টোর থেকে পছন্দের পণ্য বেছে নিয়ে প্রথম অর্ডারটি করুন।"
          action={<ButtonLink to="/shop">শপে যান</ButtonLink>}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <Tabs items={tabs} activeId={tab} onChange={setTab} aria-label="অর্ডারের অবস্থা" />
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchInput
                value={query}
                onValueChange={setQuery}
                placeholder="অর্ডার নম্বর বা পণ্য…"
                label="অর্ডার খুঁজুন"
                className="sm:w-64"
              />
              <Select
                aria-label="অর্ডার সাজান"
                options={SORT_OPTIONS}
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="sm:w-44"
              />
            </div>
          </div>

          {pageItems.length === 0 ? (
            <EmptyState
              title="এই ফিল্টারে কোনো অর্ডার নেই"
              description="অন্য অবস্থা বেছে নিন বা সার্চ শব্দটি মুছে দিন।"
              action={
                <Button variant="outline" onClick={clearFilters}>
                  ফিল্টার মুছুন
                </Button>
              }
            />
          ) : (
            <Card padded={false} className="overflow-hidden">
              <div className="p-3 lg:p-4">
                <OrderHistoryList orders={pageItems} onCancel={setCancelTarget} />
              </div>
            </Card>
          )}

          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

          <p className="text-xs text-text-muted">
            মোট {toBanglaDigits(filtered.length)}টি অর্ডার দেখানো হচ্ছে। সবই ডেমো রেকর্ড — কোনো প্রকৃত কেনাকাটা বা
            পেমেন্ট ঘটেনি।
          </p>
        </>
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        title="অর্ডার বাতিল করবেন?"
        message={
          cancelTarget
            ? `${cancelTarget.orderNumber} বাতিল হলে অর্ডারটি ডেমো ডেটাসেটে ‘বাতিল’ অবস্থায় যাবে।`
            : ''
        }
        confirmLabel="হ্যাঁ, বাতিল করুন"
        onConfirm={confirmCancel}
        onClose={() => setCancelTarget(null)}
      >
        <p className="mt-2 text-xs text-text-secondary">
          ডেমো নিয়ম অনুযায়ী শুধু পাঠানোর আগের অর্ডার গ্রাহক নিজে বাতিল করতে পারেন — কোনো টাকা ফেরতের ঘটনা এখানে
          ঘটে না।
        </p>
      </ConfirmDialog>
    </div>
  );
}
