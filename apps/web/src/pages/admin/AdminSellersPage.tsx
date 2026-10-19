import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Ban, Download, Eye } from 'lucide-react';
import type { Seller, SellerStatus } from '@shobdox/shared-types';
import { TIER_LABELS } from '@shobdox/shared-business-logic';
import { formatRelativeTime, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  IconButton,
  PageHeader,
  Pagination,
  SearchInput,
  Tabs,
} from '@/components/ui';
import { useSellers } from '@/hooks/useCatalog';
import { useDebouncedValue } from '@/hooks/useCommon';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { ResponsiveTable, type AdminColumn } from '@/features/admin/ResponsiveTable';
import { SellerStatusBadge } from '@/features/admin/StatusBadges';
import { SellerDetailDrawer } from '@/features/admin/SellerDetailDrawer';
import { exportCsv } from '@/features/admin/csv';
import { usePagination } from '@/features/admin/usePagination';

type StatusTab = 'all' | SellerStatus;

const TIER_TONES: Record<Seller['tier'], 'warning' | 'neutral' | 'accent' | 'primary'> = {
  bronze: 'warning',
  silver: 'neutral',
  gold: 'accent',
  platinum: 'primary',
};

/** Seller list: search, status tabs, approve/suspend and a detail drawer. */
export default function AdminSellersPage() {
  const sellers = useSellers();
  const [tab, setTab] = useState<StatusTab>('all');
  const [search, setSearch] = useState('');
  const searchTerm = useDebouncedValue(search);
  const [openSeller, setOpenSeller] = useState<Seller | undefined>();
  const [suspendTarget, setSuspendTarget] = useState<Seller | null>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return sellers
      .filter((seller) => {
        if (tab !== 'all' && seller.status !== tab) return false;
        if (term) {
          const haystack = `${seller.profile.storeName} ${seller.profile.storeNameBn ?? ''} ${seller.ownerName} ${
            seller.profile.supportPhone
          } ${seller.slug}`.toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        return true;
      })
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [sellers, tab, searchTerm]);

  const { page, totalPages, pageRows, totalRows, setPage, resetPage } = usePagination(filtered);
  useEffect(() => resetPage(), [tab, searchTerm, resetPage]);

  const tabCount = (candidate: StatusTab) =>
    candidate === 'all' ? sellers.length : sellers.filter((seller) => seller.status === candidate).length;

  const approve = (seller: Seller) => {
    useDataStore.getState().setSellerStatus(seller.id, 'active');
    toast({
      tone: 'success',
      title: 'সেলার অনুমোদিত হয়েছে',
      description: seller.profile.storeNameBn ?? seller.profile.storeName,
    });
  };

  const confirmSuspend = () => {
    if (!suspendTarget) return;
    useDataStore.getState().setSellerStatus(suspendTarget.id, 'suspended');
    toast({
      tone: 'warning',
      title: 'সেলার স্থগিত করা হয়েছে',
      description: suspendTarget.profile.storeNameBn ?? suspendTarget.profile.storeName,
    });
    setSuspendTarget(null);
  };

  const columns: AdminColumn<Seller>[] = [
    {
      id: 'seller',
      header: 'সেলার',
      render: (seller) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-text-primary">
            {seller.profile.storeNameBn ?? seller.profile.storeName}
          </p>
          <p className="truncate text-xs text-text-secondary">
            {seller.ownerName} · <span className="font-num">{seller.profile.supportPhone}</span>
          </p>
        </div>
      ),
    },
    {
      id: 'tier',
      header: 'টিয়ার',
      mobileLabel: 'টিয়ার',
      render: (seller) => (
        <span className="flex items-center gap-1.5">
          <Badge tone={TIER_TONES[seller.tier]} size="sm">
            {TIER_LABELS[seller.tier]}
          </Badge>
          <span className="font-num text-xs text-text-secondary">{toBanglaDigits(seller.commissionRate)}%</span>
        </span>
      ),
    },
    {
      id: 'products',
      header: 'পণ্য',
      mobileLabel: 'পণ্য',
      align: 'right',
      render: (seller) => <span className="font-num">{toBanglaDigits(seller.productCount)}</span>,
    },
    {
      id: 'sales',
      header: 'মোট বিক্রয়',
      mobileLabel: 'মোট বিক্রয়',
      align: 'right',
      render: (seller) => <span className="font-num font-semibold">{formatTaka(seller.totalSales)}</span>,
    },
    {
      id: 'rating',
      header: 'রেটিং',
      mobileLabel: 'রেটিং',
      align: 'right',
      render: (seller) => (
        <span className="font-num text-text-secondary">
          {toBanglaDigits(seller.rating)} ({toBanglaDigits(seller.reviewCount)})
        </span>
      ),
    },
    {
      id: 'joined',
      header: 'যোগদান',
      render: (seller) => (
        <span className="text-xs text-text-secondary">{formatRelativeTime(seller.joinedAt)}</span>
      ),
    },
    {
      id: 'status',
      header: 'স্ট্যাটাস',
      mobileLabel: 'স্ট্যাটাস',
      render: (seller) => <SellerStatusBadge status={seller.status} />,
    },
    {
      id: 'actions',
      header: 'অ্যাকশন',
      align: 'right',
      render: (seller) => (
        <div className="flex items-center justify-end gap-0.5">
          <IconButton label={`${seller.profile.storeName} প্রোফাইল`} variant="ghost" size="sm" onClick={() => setOpenSeller(seller)}>
            <Eye aria-hidden className="size-4" />
          </IconButton>
          {seller.status !== 'active' ? (
            <IconButton label="অনুমোদন করুন" variant="ghost" size="sm" onClick={() => approve(seller)}>
              <BadgeCheck aria-hidden className="size-4 text-success" />
            </IconButton>
          ) : null}
          {seller.status !== 'suspended' ? (
            <IconButton label="স্থগিত করুন" variant="ghost" size="sm" onClick={() => setSuspendTarget(seller)}>
              <Ban aria-hidden className="size-4 text-error" />
            </IconButton>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="সেলার"
        description="সেলার অনুমোদন, টিয়ার-ভিত্তিক কমিশন ও স্টোরের স্বাস্থ্য দেখুন।"
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<Download aria-hidden className="size-4" />}
              onClick={() =>
                exportCsv(
                  'shobdox-sellers.csv',
                  [
                    { header: 'স্টোর', value: (seller) => seller.profile.storeName },
                    { header: 'বাংলা নাম', value: (seller) => seller.profile.storeNameBn ?? '' },
                    { header: 'মালিক', value: (seller) => seller.ownerName },
                    { header: 'টিয়ার', value: (seller) => seller.tier },
                    { header: 'কমিশন %', value: (seller) => seller.commissionRate },
                    { header: 'মোট বিক্রয় (৳)', value: (seller) => seller.totalSales },
                    { header: 'স্ট্যাটাস', value: (seller) => seller.status },
                  ],
                  filtered,
                )
              }
            >
              CSV এক্সপোর্ট
            </Button>
            <ButtonLink to="/admin/products" variant="outline">
              পণ্য দেখুন
            </ButtonLink>
          </>
        }
      />

      <Card className="mb-4 space-y-3">
        <Tabs
          aria-label="স্ট্যাটাস অনুযায়ী সেলার"
          activeId={tab}
          onChange={(id) => setTab(id as StatusTab)}
          items={[
            { id: 'all', label: 'সব', count: tabCount('all') },
            { id: 'pending-review', label: 'পর্যালোচনায়', count: tabCount('pending-review') },
            { id: 'active', label: 'সক্রিয়', count: tabCount('active') },
            { id: 'suspended', label: 'স্থগিত', count: tabCount('suspended') },
          ]}
        />

        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="স্টোর, মালিক বা মোবাইল দিয়ে খুঁজুন…"
          label="সেলার খুঁজুন"
        />
      </Card>

      <ResponsiveTable
        rows={pageRows}
        columns={columns}
        rowKey={(seller) => seller.id}
        caption={`সেলার তালিকা — মোট ${toBanglaDigits(totalRows)}জন`}
        mobileTitle={(seller) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">
              {seller.profile.storeNameBn ?? seller.profile.storeName}
            </p>
            <p className="truncate text-xs text-text-secondary">
              {seller.ownerName} · {formatTaka(seller.totalSales)}
            </p>
          </div>
        )}
        mobileTrailing={(seller) => <SellerStatusBadge status={seller.status} />}
        mobileActions={(seller) => (
          <>
            <Button variant="outline" size="sm" onClick={() => setOpenSeller(seller)}>
              বিস্তারিত
            </Button>
            {seller.status !== 'active' ? (
              <Button variant="ghost" size="sm" onClick={() => approve(seller)}>
                অনুমোদন
              </Button>
            ) : null}
            {seller.status !== 'suspended' ? (
              <Button variant="ghost" size="sm" onClick={() => setSuspendTarget(seller)}>
                স্থগিত
              </Button>
            ) : null}
          </>
        )}
        empty={{ title: 'কোনো সেলার মেলেনি', description: 'ট্যাব বা সার্চ বদলে দেখুন।' }}
      />

      <Pagination className="mt-4" page={page} totalPages={totalPages} onPageChange={setPage} />

      <SellerDetailDrawer seller={openSeller} onClose={() => setOpenSeller(undefined)} />

      <ConfirmDialog
        open={Boolean(suspendTarget)}
        title="সেলার স্থগিত করবেন?"
        message={`${suspendTarget?.profile.storeNameBn ?? suspendTarget?.profile.storeName ?? ''} স্থগিত হলে স্টোরফ্রন্টে তাদের পণ্য লুকাবে।`}
        confirmLabel="হ্যাঁ, স্থগিত করুন"
        onConfirm={confirmSuspend}
        onClose={() => setSuspendTarget(null)}
      />
    </>
  );
}
