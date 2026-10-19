import { useEffect, useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';
import type { Payout, PayoutStatus } from '@shobdox/shared-types';
import { PAYOUT_STATUS_LABELS } from '@shobdox/shared-types';
import { PAYOUT_METHOD_LABELS } from '@shobdox/shared-business-logic';
import { useCurrentSeller } from '@/components/layout/SellerLayout';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DemoNotice,
  PageHeader,
  Pagination,
  SectionHeader,
  StatTile,
  Tabs,
} from '@/components/ui';
import { periodLabel } from '@/features/seller/utils';
import { readPayouts } from '@/services/analytics.service';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { formatDate, formatTaka, toBanglaDigits } from '@/lib/format';

/**
 * Payout history for one seller.
 *
 * Rows come from `buildPayoutHistory()` through the analytics service — a
 * deterministic demo ledger. Requesting a payout is deliberately disabled: the
 * dialog says so, and the toast reports that nothing was sent anywhere.
 */

const PAGE_SIZE = 6;

const STATUS_ORDER: PayoutStatus[] = ['paid', 'processing', 'scheduled', 'on-hold'];

const STATUS_TONES: Record<PayoutStatus, 'success' | 'info' | 'primary' | 'warning'> = {
  paid: 'success',
  processing: 'info',
  scheduled: 'primary',
  'on-hold': 'warning',
};

export default function SellerPayoutsPage() {
  const seller = useCurrentSeller();
  const products = useDataStore((state) => state.products);
  const orders = useDataStore((state) => state.orders);
  const [statusTab, setStatusTab] = useState<'all' | PayoutStatus>('all');
  const [page, setPage] = useState(1);
  const [requestOpen, setRequestOpen] = useState(false);

// Dataset slices are dependencies on purpose: a local edit (stock, status) must recompute this.
// eslint-disable-next-line react-hooks/exhaustive-deps
  const payouts = useMemo(() => readPayouts(seller.id), [seller.id, products, orders]);

  useEffect(() => {
    setPage(1);
  }, [statusTab]);

  const summary = useMemo(() => {
    const byStatus = new Map<PayoutStatus, { total: number; count: number }>();
    payouts.forEach((payout) => {
      const current = byStatus.get(payout.status) ?? { total: 0, count: 0 };
      byStatus.set(payout.status, { total: current.total + payout.amount, count: current.count + 1 });
    });
    return {
      byStatus,
      paidTotal: byStatus.get('paid')?.total ?? 0,
      grandTotal: payouts.reduce((total, payout) => total + payout.amount, 0),
    };
  }, [payouts]);

  const filtered = useMemo(
    () => (statusTab === 'all' ? payouts : payouts.filter((payout) => payout.status === statusTab)),
    [payouts, statusTab],
  );

  const tabs = useMemo(() => {
    const items: Array<{ id: 'all' | PayoutStatus; label: string; count: number }> = [
      { id: 'all', label: 'সব', count: payouts.length },
    ];
    STATUS_ORDER.forEach((status) => {
      const count = payouts.filter((payout) => payout.status === status).length;
      if (count > 0) items.push({ id: status, label: PAYOUT_STATUS_LABELS[status], count });
    });
    return items;
  }, [payouts]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const confirmRequest = () => {
    setRequestOpen(false);
    toast({
      tone: 'info',
      title: 'ডেমো বিল্ডে পেআউট অনুরোধ নিষ্ক্রিয়',
      description: 'অনুরোধ কোথাও পাঠানো হয়নি এবং কোনো টাকা স্থানান্তরিত হয়নি।',
    });
  };

  const methodOf = (payout: Payout) => PAYOUT_METHOD_LABELS[payout.method];

  return (
    <div className="space-y-5">
      <PageHeader
        title="পেআউট"
        description="আপনার নিট আয়ের সাপ্তাহিক সেটেলমেন্ট — কোনটি পরিশোধিত, কোনটি অপেক্ষমাণ।"
        actions={
          <Button leftIcon={<Wallet aria-hidden className="size-4" />} onClick={() => setRequestOpen(true)}>
            পেআউট রিকোয়েস্ট
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="পরিশোধিত"
          value={formatTaka(summary.paidTotal)}
          hint={`${toBanglaDigits(summary.byStatus.get('paid')?.count ?? 0)}টি সেটেলমেন্ট`}
          tone="success"
        />
        <StatTile
          label="প্রক্রিয়াধীন"
          value={formatTaka(summary.byStatus.get('processing')?.total ?? 0)}
          hint={`${toBanglaDigits(summary.byStatus.get('processing')?.count ?? 0)}টি সেটেলমেন্ট`}
          tone="info"
        />
        <StatTile
          label="নির্ধারিত"
          value={formatTaka(summary.byStatus.get('scheduled')?.total ?? 0)}
          hint={`${toBanglaDigits(summary.byStatus.get('scheduled')?.count ?? 0)}টি সেটেলমেন্ট`}
          tone="primary"
        />
        <StatTile
          label="স্থগিত"
          value={formatTaka(summary.byStatus.get('on-hold')?.total ?? 0)}
          hint={`${toBanglaDigits(summary.byStatus.get('on-hold')?.count ?? 0)}টি সেটেলমেন্ট`}
          tone="accent"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="space-y-3 p-4 pb-0">
          <SectionHeader
            title="সেটেলমেন্ট হিস্ট্রি"
            subtitle={`সর্বমোট ${formatTaka(summary.grandTotal)} — ${toBanglaDigits(payouts.length)}টি সাপ্তাহিক উইন্ডো।`}
            className="mb-0"
          />
          <Tabs
            items={tabs.map((tab) => ({ id: tab.id, label: tab.label, count: tab.count }))}
            activeId={statusTab}
            onChange={(id) => setStatusTab(id as 'all' | PayoutStatus)}
            aria-label="পেআউট অবস্থা"
          />
        </div>

        {paged.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-text-secondary">
            এই অবস্থায় কোনো সেটেলমেন্ট নেই — অন্য ফিল্টার দেখুন।
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto p-4 lg:block">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">পেআউটের তালিকা</caption>
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-secondary">
                    <th scope="col" className="px-2 py-2 font-medium">সময়কাল</th>
                    <th scope="col" className="px-2 py-2 text-right font-medium">পরিমাণ</th>
                    <th scope="col" className="px-2 py-2 font-medium">পদ্ধতি</th>
                    <th scope="col" className="px-2 py-2 font-medium">স্ট্যাটাস</th>
                    <th scope="col" className="px-2 py-2 font-medium">তারিখ ও রেফারেন্স</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((payout) => (
                    <tr key={payout.id} className="border-b border-divider last:border-0 hover:bg-surface-muted/60">
                      <th scope="row" className="px-2 py-3 text-left font-normal">
                        <p className="text-sm font-medium text-text-primary">
                          {periodLabel(payout.periodStart, payout.periodEnd)}
                        </p>
                        <p className="mt-0.5 text-xs text-text-muted">
                          কমিশন কাটা: <span className="font-num">{formatTaka(payout.commissionDeducted)}</span>
                        </p>
                      </th>
                      <td className="px-2 py-3 text-right font-num text-sm font-semibold text-text-primary">
                        {formatTaka(payout.amount)}
                      </td>
                      <td className="px-2 py-3 text-sm text-text-secondary">{methodOf(payout)}</td>
                      <td className="px-2 py-3">
                        <Badge tone={STATUS_TONES[payout.status]} size="sm">
                          {PAYOUT_STATUS_LABELS[payout.status]}
                        </Badge>
                      </td>
                      <td className="px-2 py-3 text-xs text-text-secondary">
                        {payout.paidAt ? (
                          <p>পরিশোধ: {formatDate(payout.paidAt)}</p>
                        ) : (
                          <p>অনুরোধ: {formatDate(payout.requestedAt)}</p>
                        )}
                        {payout.reference ? <p className="mt-0.5 font-num text-text-muted">{payout.reference}</p> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-2 p-4 lg:hidden">
              {paged.map((payout) => (
                <li key={payout.id} className="rounded-card border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary">
                        {periodLabel(payout.periodStart, payout.periodEnd)}
                      </p>
                      <p className="mt-0.5 font-num text-lg font-bold text-text-primary">{formatTaka(payout.amount)}</p>
                    </div>
                    <Badge tone={STATUS_TONES[payout.status]} size="sm">
                      {PAYOUT_STATUS_LABELS[payout.status]}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-text-secondary">
                    {methodOf(payout)} · কমিশন কাটা{' '}
                    <span className="font-num">{formatTaka(payout.commissionDeducted)}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {payout.paidAt
                      ? `পরিশোধ ${formatDate(payout.paidAt)}`
                      : `অনুরোধ ${formatDate(payout.requestedAt)}`}
                    {payout.reference ? ` · ${payout.reference}` : ''}
                  </p>
                </li>
              ))}
            </ul>

            <div className="px-4 pb-4">
              <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>

      <DemoNotice title="ডেমো পেআউট">
        সেটেলমেন্ট সারিগুলো ডেমো নিয়মে তৈরি — কোনো ব্যাংক, বিকাশ বা নগদ লেনদেন হয় না। "পেআউট রিকোয়েস্ট" চাপলেও
        অনুরোধ কোথাও পাঠানো হয় না।
      </DemoNotice>

      <ConfirmDialog
        open={requestOpen}
        title="পেআউট রিকোয়েস্ট করবেন?"
        message="এই ডেমো বিল্ডে পেআউট অনুরোধ নিষ্ক্রিয়। চালিয়ে গেলে কোনো টাকা স্থানান্তরিত হবে না এবং অনুরোধ কোথাও পাঠানো হবে না।"
        confirmLabel="তবুও চালিয়ে যান"
        tone="primary"
        onConfirm={confirmRequest}
        onClose={() => setRequestOpen(false)}
      />
    </div>
  );
}
