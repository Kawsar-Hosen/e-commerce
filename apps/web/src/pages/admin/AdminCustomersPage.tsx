import { useEffect, useMemo, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import type { CustomerRow } from '@shobdox/shared-types';
import { formatRelativeTime, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  IconButton,
  PageHeader,
  Pagination,
  SearchInput,
  SegmentedControl,
  Tabs,
} from '@/components/ui';
import { useDebouncedValue } from '@/hooks/useCommon';
import { useDataStore } from '@/store/data.store';
import { customerRowsWithExtras } from '@/services/analytics.service';
import { ResponsiveTable, type AdminColumn } from '@/features/admin/ResponsiveTable';
import { CUSTOMER_SEGMENT_LABELS, CustomerStatusBadge } from '@/features/admin/StatusBadges';
import { CustomerDrawer } from '@/features/admin/CustomerDrawer';
import { exportCsv } from '@/features/admin/csv';
import { usePagination } from '@/features/admin/usePagination';

type SegmentTab = 'all' | CustomerRow['segment'];
type StatusFilter = 'all' | CustomerRow['status'];

const SEGMENT_TONES: Record<CustomerRow['segment'], 'info' | 'accent' | 'success' | 'warning'> = {
  new: 'info',
  returning: 'success',
  vip: 'accent',
  'at-risk': 'warning',
};

/** Customer list with segment tabs, a profile drawer and CSV export. */
export default function AdminCustomersPage() {
  const customers = useDataStore((state) => state.customers);
  const orders = useDataStore((state) => state.orders);
  const [segment, setSegment] = useState<SegmentTab>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const searchTerm = useDebouncedValue(search);
  const [openRow, setOpenRow] = useState<CustomerRow | undefined>();

  const rows = useMemo(() => customerRowsWithExtras(customers, orders), [customers, orders]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return rows
      .filter((row) => {
        if (segment !== 'all' && row.segment !== segment) return false;
        if (status !== 'all' && row.status !== status) return false;
        if (term) {
          const haystack = `${row.name} ${row.phone} ${row.email ?? ''} ${row.district}`.toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        return true;
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [rows, segment, status, searchTerm]);

  const { page, totalPages, pageRows, totalRows, setPage, resetPage } = usePagination(filtered);
  useEffect(() => resetPage(), [segment, status, searchTerm, resetPage]);

  const segmentCount = (candidate: SegmentTab) =>
    candidate === 'all' ? rows.length : rows.filter((row) => row.segment === candidate).length;

  const columns: AdminColumn<CustomerRow>[] = [
    {
      id: 'customer',
      header: 'গ্রাহক',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">{row.name}</p>
            <p className="font-num text-xs text-text-secondary">{row.phone}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'district',
      header: 'জেলা',
      mobileLabel: 'জেলা',
      render: (row) => <span className="text-sm text-text-secondary">{row.district}</span>,
    },
    {
      id: 'orders',
      header: 'অর্ডার',
      mobileLabel: 'অর্ডার',
      align: 'right',
      render: (row) => <span className="font-num">{toBanglaDigits(row.orders)}</span>,
    },
    {
      id: 'spent',
      header: 'মোট খরচ',
      mobileLabel: 'মোট খরচ',
      align: 'right',
      render: (row) => <span className="font-num font-semibold">{formatTaka(row.totalSpent)}</span>,
    },
    {
      id: 'aov',
      header: 'গড় অর্ডার',
      mobileLabel: 'গড় অর্ডার',
      align: 'right',
      render: (row) => <span className="font-num text-text-secondary">{formatTaka(row.averageOrderValue)}</span>,
    },
    {
      id: 'segment',
      header: 'সেগমেন্ট',
      mobileLabel: 'সেগমেন্ট',
      render: (row) => (
        <Badge tone={SEGMENT_TONES[row.segment]} size="sm">
          {CUSTOMER_SEGMENT_LABELS[row.segment]}
        </Badge>
      ),
    },
    {
      id: 'last-order',
      header: 'শেষ অর্ডার',
      render: (row) => (
        <span className="text-xs text-text-secondary">
          {row.lastOrderAt ? formatRelativeTime(row.lastOrderAt) : 'এখনো নেই'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'অ্যাকশন',
      align: 'right',
      render: (row) => (
        <IconButton label={`${row.name} এর প্রোফাইল`} variant="ghost" size="sm" onClick={() => setOpenRow(row)}>
          <Eye aria-hidden className="size-4" />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="গ্রাহক"
        description="গ্রাহকের খরচ, সেগমেন্ট ও অর্ডার ইতিহাস এক নজরে।"
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<Download aria-hidden className="size-4" />}
              onClick={() =>
                exportCsv(
                  'shobdox-customers.csv',
                  [
                    { header: 'নাম', value: (row) => row.name },
                    { header: 'মোবাইল', value: (row) => row.phone },
                    { header: 'জেলা', value: (row) => row.district },
                    { header: 'অর্ডার', value: (row) => row.orders },
                    { header: 'মোট খরচ (৳)', value: (row) => row.totalSpent },
                    { header: 'সেগমেন্ট', value: (row) => row.segment },
                  ],
                  filtered,
                )
              }
            >
              CSV এক্সপোর্ট
            </Button>
            <ButtonLink to="/admin/orders" variant="outline">
              অর্ডার দেখুন
            </ButtonLink>
          </>
        }
      />

      <Card className="mb-4 space-y-3">
        <Tabs
          aria-label="সেগমেন্ট অনুযায়ী গ্রাহক"
          activeId={segment}
          onChange={(id) => setSegment(id as SegmentTab)}
          items={[
            { id: 'all', label: 'সব', count: segmentCount('all') },
            { id: 'new', label: 'নতুন', count: segmentCount('new') },
            { id: 'returning', label: 'রিটার্নিং', count: segmentCount('returning') },
            { id: 'vip', label: 'ভিআইপি', count: segmentCount('vip') },
            { id: 'at-risk', label: 'ঝুঁকিতে', count: segmentCount('at-risk') },
          ]}
        />

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="নাম, মোবাইল, ইমেইল বা জেলা দিয়ে খুঁজুন…"
            label="গ্রাহক খুঁজুন"
          />
          <SegmentedControl
            label="স্ট্যাটাস ফিল্টার"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'সব স্ট্যাটাস' },
              { value: 'active', label: 'সক্রিয়' },
              { value: 'blocked', label: 'ব্লকড' },
            ]}
          />
        </div>
      </Card>

      <ResponsiveTable
        rows={pageRows}
        columns={columns}
        rowKey={(row) => row.id}
        caption={`গ্রাহকের তালিকা — মোট ${toBanglaDigits(totalRows)}জন`}
        mobileTitle={(row) => (
          <div className="flex items-center gap-2">
            <Avatar name={row.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{row.name}</p>
              <p className="font-num text-xs text-text-secondary">{row.phone}</p>
            </div>
          </div>
        )}
        mobileTrailing={(row) => <CustomerStatusBadge status={row.status} />}
        mobileActions={(row) => (
          <Button variant="outline" size="sm" onClick={() => setOpenRow(row)}>
            প্রোফাইল দেখুন
          </Button>
        )}
        empty={{ title: 'কোনো গ্রাহক মেলেনি', description: 'সেগমেন্ট বা সার্চ বদলে দেখুন।' }}
      />

      <Pagination className="mt-4" page={page} totalPages={totalPages} onPageChange={setPage} />

      <CustomerDrawer row={openRow} onClose={() => setOpenRow(undefined)} />
    </>
  );
}
