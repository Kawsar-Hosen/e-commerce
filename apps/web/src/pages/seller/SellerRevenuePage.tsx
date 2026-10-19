import { useMemo } from 'react';
import type { PayoutStatus } from '@shobdox/shared-types';
import { PAYOUT_STATUS_LABELS } from '@shobdox/shared-types';
import { PAYOUT_METHOD_LABELS, computeCommission } from '@shobdox/shared-business-logic';
import { useCurrentSeller } from '@/components/layout/SellerLayout';
import { Badge, ButtonLink, Card, DemoNotice, PageHeader, SectionHeader, StatTile } from '@/components/ui';
import { MonthlyRevenueChart, type RevenueMonthPoint } from '@/features/seller/MonthlyRevenueChart';
import { monthKeyOf, monthLabelOf, periodLabel } from '@/features/seller/utils';
import { readCommissionSummary, readPayouts, readSellerOverview } from '@/services/analytics.service';
import { useDataStore } from '@/store/data.store';
import { formatDate, formatTaka, toBanglaDigits } from '@/lib/format';

/**
 * Revenue breakdown for one seller.
 *
 * The stacked bars and the month table bucket the same 90-day demo series by
 * calendar month, so the chart, the table and the totals can never disagree.
 * Settlement rows come from `readPayouts()`, the same source the payout screen
 * uses.
 */

const PAYOUT_TONES: Record<PayoutStatus, 'success' | 'info' | 'primary' | 'warning'> = {
  paid: 'success',
  processing: 'info',
  scheduled: 'primary',
  'on-hold': 'warning',
};

const PAYOUT_DOTS: Record<PayoutStatus, string> = {
  paid: 'bg-success',
  processing: 'bg-info',
  scheduled: 'bg-primary',
  'on-hold': 'bg-warning',
};

export default function SellerRevenuePage() {
  const seller = useCurrentSeller();
  const products = useDataStore((state) => state.products);
  const orders = useDataStore((state) => state.orders);

// Dataset slices are dependencies on purpose: a local edit (stock, status) must recompute this.
// eslint-disable-next-line react-hooks/exhaustive-deps
  const overview = useMemo(() => readSellerOverview(seller, 90), [seller, products, orders]);
// Dataset slices are dependencies on purpose: a local edit (stock, status) must recompute this.
// eslint-disable-next-line react-hooks/exhaustive-deps
  const commission = useMemo(() => readCommissionSummary(seller), [seller, products, orders]);
// Dataset slices are dependencies on purpose: a local edit (stock, status) must recompute this.
// eslint-disable-next-line react-hooks/exhaustive-deps
  const payouts = useMemo(() => readPayouts(seller.id), [seller.id, products, orders]);

  const months = useMemo(() => {
    const buckets = new Map<string, { gross: number; orders: number }>();
    overview.revenueSeries.forEach((point) => {
      const key = monthKeyOf(point.date);
      const current = buckets.get(key) ?? { gross: 0, orders: 0 };
      buckets.set(key, { gross: current.gross + point.revenue, orders: current.orders + point.orders });
    });

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, bucket]) => {
        const fee = computeCommission(bucket.gross, seller.commissionRate);
        return {
          key,
          label: monthLabelOf(key),
          gross: bucket.gross,
          commission: fee,
          net: bucket.gross - fee,
          orders: bucket.orders,
        };
      });
  }, [overview.revenueSeries, seller.commissionRate]);

  const chartData = useMemo<RevenueMonthPoint[]>(
    () => months.map((month) => ({ label: month.label, commission: month.commission, net: month.net })),
    [months],
  );

  const totals = useMemo(
    () =>
      months.reduce(
        (sum, month) => ({
          gross: sum.gross + month.gross,
          commission: sum.commission + month.commission,
          net: sum.net + month.net,
          orders: sum.orders + month.orders,
        }),
        { gross: 0, commission: 0, net: 0, orders: 0 },
      ),
    [months],
  );

  const settlementRows = payouts.slice(0, 4);
  const upcoming = payouts.find((payout) => payout.status === 'processing' || payout.status === 'scheduled');

  return (
    <div className="space-y-5">
      <PageHeader
        title="আয় ও খরচ"
        description="৯০ দিনের ডেমো হিস্ট্রি থেকে মাসভিত্তিক গ্রস, কমিশন ও নিট আয়ের হিসাব।"
        actions={
          <ButtonLink to="/seller/payouts" variant="outline">
            পেআউট দেখুন
          </ButtonLink>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="৯০ দিনের গ্রস আয়"
          value={formatTaka(totals.gross)}
          hint={`${toBanglaDigits(totals.orders)}টি অর্ডার`}
        />
        <StatTile
          label="প্ল্যাটফর্ম কমিশন"
          value={formatTaka(totals.commission)}
          hint={`${toBanglaDigits(seller.commissionRate)}% হারে কাটা`}
          tone="accent"
        />
        <StatTile label="নিট আয়" value={formatTaka(totals.net)} hint="কমিশন বাদে" tone="success" />
        <StatTile
          label="সেটেলমেন্টের অপেক্ষায়"
          value={formatTaka(commission.pendingPayout)}
          hint="ডেমো নিয়ম: নিট আয়ের ২৮%"
          tone="info"
        />
      </div>

      <Card>
        <SectionHeader
          title="মাসভিত্তিক আয়"
          subtitle="নিট + কমিশন মিলে প্রতিটি বারের উচ্চতা গ্রস আয় (চলতি মাস আংশিক)।"
        />
        <MonthlyRevenueChart data={chartData} label="মাস অনুযায়ী নিট আয় ও কমিশন" />
        <ul className="mt-2 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-full bg-primary" /> নিট আয় (আপনার অংশ)
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-full bg-accent" /> প্ল্যাটফর্ম কমিশন
          </li>
        </ul>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <SectionHeader
            title="সেটেলমেন্ট সময়রেখা"
            subtitle="ডেলিভারির পর নিট আয় সপ্তাহিক সেটেলমেন্ট উইন্ডোতে যোগ হয়।"
            href="/seller/payouts"
            linkLabel="সব পেআউট"
          />
          {settlementRows.length === 0 ? (
            <p className="text-sm text-text-secondary">এখনো কোনো সেটেলমেন্ট হিস্ট্রি নেই।</p>
          ) : (
            <ol className="space-y-3">
              {settlementRows.map((payout) => (
                <li key={payout.id} className="flex items-start gap-3">
                  <span aria-hidden className={`mt-1.5 size-2.5 shrink-0 rounded-full ${PAYOUT_DOTS[payout.status]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-text-primary">
                        {periodLabel(payout.periodStart, payout.periodEnd)}
                      </p>
                      <Badge tone={PAYOUT_TONES[payout.status]} size="sm">
                        {PAYOUT_STATUS_LABELS[payout.status]}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      <span className="font-num">{formatTaka(payout.amount)}</span> · {PAYOUT_METHOD_LABELS[payout.method]}
                      {payout.paidAt
                        ? ` · পরিশোধ ${formatDate(payout.paidAt)}`
                        : ` · অনুরোধ ${formatDate(payout.requestedAt)}`}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {upcoming ? (
            <p className="mt-4 rounded-card bg-info-soft/60 px-3 py-2 text-xs text-sky-900">
              পরবর্তী সেটেলমেন্ট:{' '}
              <span className="font-num font-semibold">{formatTaka(upcoming.amount)}</span> (
              {periodLabel(upcoming.periodStart, upcoming.periodEnd)})
            </p>
          ) : null}
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="p-4 pb-0">
            <SectionHeader title="মাসভিত্তিক বিবরণ" subtitle="প্রতিটি মাসের গ্রস, কমিশন ও নিট আয়।" />
          </div>

          <div className="hidden overflow-x-auto px-4 pb-4 lg:block">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">মাস অনুযায়ী আয়ের তালিকা</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-secondary">
                  <th scope="col" className="px-2 py-2 font-medium">মাস</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">অর্ডার</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">গ্রস</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">কমিশন</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">নিট</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month) => (
                  <tr key={month.key} className="border-b border-divider last:border-0">
                    <th scope="row" className="px-2 py-2.5 text-left font-medium text-text-primary">
                      {month.label}
                    </th>
                    <td className="px-2 py-2.5 text-right font-num text-text-secondary">
                      {toBanglaDigits(month.orders)}
                    </td>
                    <td className="px-2 py-2.5 text-right font-num">{formatTaka(month.gross)}</td>
                    <td className="px-2 py-2.5 text-right font-num text-text-secondary">
                      −{formatTaka(month.commission)}
                    </td>
                    <td className="px-2 py-2.5 text-right font-num font-semibold text-success">
                      {formatTaka(month.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border-strong text-sm font-semibold">
                  <th scope="row" className="px-2 py-2.5 text-left">মোট</th>
                  <td className="px-2 py-2.5 text-right font-num">{toBanglaDigits(totals.orders)}</td>
                  <td className="px-2 py-2.5 text-right font-num">{formatTaka(totals.gross)}</td>
                  <td className="px-2 py-2.5 text-right font-num text-text-secondary">
                    −{formatTaka(totals.commission)}
                  </td>
                  <td className="px-2 py-2.5 text-right font-num text-success">{formatTaka(totals.net)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <ul className="space-y-2 p-4 pt-0 lg:hidden">
            {months.map((month) => (
              <li key={month.key} className="rounded-card border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-text-primary">{month.label}</p>
                  <span className="text-xs text-text-secondary">{toBanglaDigits(month.orders)}টি অর্ডার</span>
                </div>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-text-secondary">গ্রস</dt>
                    <dd className="font-num font-semibold text-text-primary">{formatTaka(month.gross)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">কমিশন</dt>
                    <dd className="font-num font-semibold text-text-primary">−{formatTaka(month.commission)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">নিট</dt>
                    <dd className="font-num font-semibold text-success">{formatTaka(month.net)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <DemoNotice title="ডেমো আয়ের হিসাব">
        গ্রাফ ও টেবিল ৯০ দিনের ডেমো হিস্ট্রি সিরিজ থেকে তৈরি; কমিশন আপনার বর্তমান টিয়ার হারে কাটা হিসেবে দেখানো।
        সেটেলমেন্ট সারিগুলো বাস্তব পেআউট নয় — কোনো টাকা স্থানান্তরিত হয় না।
      </DemoNotice>
    </div>
  );
}
