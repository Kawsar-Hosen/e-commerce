import { useEffect, useMemo, useState } from 'react';
import { Copy, Download, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import type { Coupon } from '@shobdox/shared-types';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  IconButton,
  PageHeader,
  Pagination,
  Progress,
  SearchInput,
  SegmentedControl,
  type Tone,
} from '@/components/ui';
import { useCategories, useCoupons } from '@/hooks/useCatalog';
import { useCopyToClipboard, useDebouncedValue } from '@/hooks/useCommon';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { ResponsiveTable, type AdminColumn } from '@/features/admin/ResponsiveTable';
import { CouponFormModal } from '@/features/admin/CouponFormModal';
import { CouponTesterCard } from '@/features/admin/CouponTesterCard';
import { exportCsv } from '@/features/admin/csv';
import { usePagination } from '@/features/admin/usePagination';

type StateFilter = 'all' | 'active' | 'upcoming' | 'expired' | 'inactive';
type CouponState = Exclude<StateFilter, 'all'>;

const STATE_META: Record<CouponState, { label: string; tone: Tone }> = {
  active: { label: 'কার্যকর', tone: 'success' },
  upcoming: { label: 'শীঘ্রই শুরু', tone: 'info' },
  expired: { label: 'মেয়াদ শেষ', tone: 'warning' },
  inactive: { label: 'নিষ্ক্রিয়', tone: 'neutral' },
};

function couponState(coupon: Coupon): CouponState {
  if (!coupon.isActive) return 'inactive';
  const now = Date.now();
  if (new Date(coupon.startsAt).getTime() > now) return 'upcoming';
  if (new Date(coupon.expiresAt).getTime() < now) return 'expired';
  return 'active';
}

function discountLabel(coupon: Coupon): string {
  if (coupon.type === 'percentage') return `${toBanglaDigits(coupon.value)}%`;
  if (coupon.type === 'fixed') return formatTaka(coupon.value);
  return 'ফ্রি ডেলিভারি';
}

/** Coupon list: state filters, live tester, editor modal, activate/delete. */
export default function AdminCouponsPage() {
  const coupons = useCoupons();
  const categories = useCategories();

  const [search, setSearch] = useState('');
  const searchTerm = useDebouncedValue(search);
  const [state, setState] = useState<StateFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const { copy } = useCopyToClipboard();

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return coupons
      .filter((coupon) => {
        if (state !== 'all' && couponState(coupon) !== state) return false;
        if (term && !`${coupon.code} ${coupon.title} ${coupon.description}`.toLowerCase().includes(term)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime());
  }, [coupons, searchTerm, state]);

  const { page, totalPages, pageRows, totalRows, setPage, resetPage } = usePagination(filtered);
  useEffect(() => resetPage(), [state, searchTerm, resetPage]);

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setModalOpen(true);
  };

  const toggleActive = (coupon: Coupon) => {
    useDataStore.getState().upsertCoupon({ ...coupon, isActive: !coupon.isActive });
    toast({
      tone: 'success',
      title: coupon.isActive ? 'কুপন নিষ্ক্রিয় করা হয়েছে' : 'কুপন সক্রিয় করা হয়েছে',
      description: coupon.code,
    });
  };

  const copyCode = (coupon: Coupon) => {
    copy(coupon.code);
    toast({ tone: 'info', title: 'কোড কপি হয়েছে', description: coupon.code });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    useDataStore.getState().deleteCoupon(deleteTarget.id);
    toast({ tone: 'success', title: 'কুপন মুছে ফেলা হয়েছে', description: deleteTarget.code });
    setDeleteTarget(null);
  };

  const columns: AdminColumn<Coupon>[] = [
    {
      id: 'code',
      header: 'কোড',
      render: (coupon) => (
        <span className="flex items-center gap-1">
          <span className="font-num font-semibold text-text-primary">{coupon.code}</span>
          <IconButton label={`${coupon.code} কপি করুন`} variant="ghost" size="sm" onClick={() => copyCode(coupon)}>
            <Copy aria-hidden className="size-3.5" />
          </IconButton>
        </span>
      ),
    },
    {
      id: 'title',
      header: 'শিরোনাম',
      mobileLabel: 'শিরোনাম',
      render: (coupon) => <span className="text-sm text-text-primary">{coupon.title}</span>,
    },
    {
      id: 'discount',
      header: 'ছাড়',
      mobileLabel: 'ছাড়',
      align: 'right',
      render: (coupon) => <span className="font-num font-semibold">{discountLabel(coupon)}</span>,
    },
    {
      id: 'min-order',
      header: 'সর্বনিম্ন অর্ডার',
      mobileLabel: 'সর্বনিম্ন অর্ডার',
      align: 'right',
      render: (coupon) => <span className="font-num text-text-secondary">{formatTaka(coupon.minOrderValue)}</span>,
    },
    {
      id: 'usage',
      header: 'ব্যবহার',
      mobileLabel: 'ব্যবহার',
      render: (coupon) => (
        <div className="min-w-32">
          <p className="font-num text-xs text-text-secondary">
            {toBanglaDigits(coupon.usedCount)} / {toBanglaDigits(coupon.usageLimit)}
          </p>
          <Progress className="mt-1" size="sm" value={coupon.usedCount} max={coupon.usageLimit} label="ব্যবহারের হার" />
        </div>
      ),
    },
    {
      id: 'validity',
      header: 'মেয়াদ',
      render: (coupon) => (
        <span className="text-xs text-text-secondary">
          {coupon.startsAt.slice(0, 10)} → {coupon.expiresAt.slice(0, 10)}
        </span>
      ),
    },
    {
      id: 'state',
      header: 'স্ট্যাটাস',
      mobileLabel: 'স্ট্যাটাস',
      render: (coupon) => {
        const meta = STATE_META[couponState(coupon)];
        return (
          <Badge tone={meta.tone} size="sm">
            {meta.label}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'অ্যাকশন',
      align: 'right',
      render: (coupon) => (
        <div className="flex items-center justify-end gap-0.5">
          <IconButton label="কুপন সম্পাদনা" variant="ghost" size="sm" onClick={() => openEdit(coupon)}>
            <Pencil aria-hidden className="size-4" />
          </IconButton>
          <IconButton
            label={coupon.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
            variant="ghost"
            size="sm"
            onClick={() => toggleActive(coupon)}
          >
            <Power aria-hidden className={coupon.isActive ? 'size-4 text-success' : 'size-4'} />
          </IconButton>
          <IconButton label="কুপন মুছুন" variant="ghost" size="sm" onClick={() => setDeleteTarget(coupon)}>
            <Trash2 aria-hidden className="size-4 text-error" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="কুপন"
        description="ছাড়ের কোড তৈরি করুন, সীমা ঠিক করুন এবং চেকআউটের নিয়মে টেস্ট করুন।"
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<Download aria-hidden className="size-4" />}
              onClick={() =>
                exportCsv(
                  'shobdox-coupons.csv',
                  [
                    { header: 'কোড', value: (coupon) => coupon.code },
                    { header: 'ধরন', value: (coupon) => coupon.type },
                    { header: 'মান', value: (coupon) => coupon.value },
                    { header: 'ব্যবহৃত', value: (coupon) => coupon.usedCount },
                    { header: 'সীমা', value: (coupon) => coupon.usageLimit },
                    { header: 'মেয়াদ শেষ', value: (coupon) => coupon.expiresAt.slice(0, 10) },
                  ],
                  filtered,
                )
              }
            >
              CSV এক্সপোর্ট
            </Button>
            <Button onClick={openCreate} leftIcon={<Plus aria-hidden className="size-4" />}>
              নতুন কুপন
            </Button>
          </>
        }
      />

      <div className="mb-4">
        <CouponTesterCard coupons={coupons} />
      </div>

      <Card className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="কোড বা শিরোনাম দিয়ে খুঁজুন…"
          label="কুপন খুঁজুন"
        />
        <SegmentedControl
          label="স্ট্যাটাস ফিল্টার"
          value={state}
          onChange={setState}
          options={[
            { value: 'all', label: 'সব' },
            { value: 'active', label: 'কার্যকর' },
            { value: 'upcoming', label: 'শীঘ্রই' },
            { value: 'expired', label: 'মেয়াদ শেষ' },
            { value: 'inactive', label: 'নিষ্ক্রিয়' },
          ]}
        />
      </Card>

      <ResponsiveTable
        rows={pageRows}
        columns={columns}
        rowKey={(coupon) => coupon.id}
        caption={`কুপন তালিকা — মোট ${toBanglaDigits(totalRows)}টি`}
        mobileTitle={(coupon) => (
          <div className="min-w-0">
            <p className="font-num text-sm font-semibold text-text-primary">{coupon.code}</p>
            <p className="truncate text-xs text-text-secondary">{coupon.title}</p>
          </div>
        )}
        mobileTrailing={(coupon) => (
          <Badge tone={STATE_META[couponState(coupon)].tone} size="sm">
            {STATE_META[couponState(coupon)].label}
          </Badge>
        )}
        mobileActions={(coupon) => (
          <>
            <Button variant="outline" size="sm" onClick={() => openEdit(coupon)}>
              সম্পাদনা
            </Button>
            <Button variant="ghost" size="sm" onClick={() => copyCode(coupon)}>
              কপি
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toggleActive(coupon)}>
              {coupon.isActive ? 'নিষ্ক্রিয়' : 'সক্রিয়'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(coupon)}>
              মুছুন
            </Button>
          </>
        )}
        empty={{ title: 'কোনো কুপন মেলেনি', description: 'ফিল্টার বদলান বা নতুন কুপন তৈরি করুন।' }}
      />

      <Pagination className="mt-4" page={page} totalPages={totalPages} onPageChange={setPage} />

      <CouponFormModal open={modalOpen} onClose={() => setModalOpen(false)} existing={editing} categories={categories} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="কুপন মুছে ফেলবেন?"
        message={`${deleteTarget?.code ?? ''} মুছে ফেললে চেকআউটে আর কাজ করবে না।`}
        confirmLabel="হ্যাঁ, মুছে ফেলুন"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
