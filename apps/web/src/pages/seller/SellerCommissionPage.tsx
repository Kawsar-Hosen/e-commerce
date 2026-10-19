import { useMemo } from 'react';
import { Info } from 'lucide-react';
import type { SellerTier } from '@shobdox/shared-types';
import {
  COMMISSION_RATES,
  TIER_LABELS,
  TIER_THRESHOLDS,
  tierForSales,
} from '@shobdox/shared-business-logic';
import { useCurrentSeller } from '@/components/layout/SellerLayout';
import {
  Alert,
  ButtonLink,
  Card,
  DemoNotice,
  KeyValue,
  PageHeader,
  Progress,
  SectionHeader,
  StatTile,
} from '@/components/ui';
import { CommissionTierCard } from '@/features/seller/CommissionTierCard';
import { CommissionOrderTable } from '@/features/seller/CommissionOrderTable';
import { readCommissionSummary, readSellerRows } from '@/services/analytics.service';
import { useDataStore } from '@/store/data.store';
import { formatDate, formatTaka, toBanglaDigits } from '@/lib/format';

/**
 * Commission screen.
 *
 * The tier card, the per-order table and the paid-vs-pending split all read the
 * shared commission module through the analytics service, so the rate on screen
 * is the rate actually used in the arithmetic.
 */

const TIER_ORDER: SellerTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export default function SellerCommissionPage() {
  const seller = useCurrentSeller();
  const products = useDataStore((state) => state.products);
  const orders = useDataStore((state) => state.orders);

// Dataset slices are dependencies on purpose: a local edit (stock, status) must recompute this.
// eslint-disable-next-line react-hooks/exhaustive-deps
  const rows = useMemo(() => readSellerRows(seller.id), [seller.id, orders]);
// Dataset slices are dependencies on purpose: a local edit (stock, status) must recompute this.
// eslint-disable-next-line react-hooks/exhaustive-deps
  const commission = useMemo(() => readCommissionSummary(seller), [seller, products, orders]);

  const settledTotal = commission.paid + commission.pendingPayout;
  const paidPercent = settledTotal > 0 ? Math.round((commission.paid / settledTotal) * 100) : 0;
  const currentTier = tierForSales(seller.totalSales);

  return (
    <div className="space-y-5">
      <PageHeader
        title="কমিশন"
        description="প্রতিটি অর্ডার থেকে কাটা প্ল্যাটফর্ম কমিশন, আপনার টিয়ার ও সেটেলমেন্টের হিসাব।"
        actions={
          <ButtonLink to="/seller/payouts" variant="outline">
            পেআউট দেখুন
          </ButtonLink>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="মোট গ্রস বিক্রয়"
          value={formatTaka(commission.grossSales)}
          hint={`${toBanglaDigits(commission.orderCount)}টি অর্ডার`}
        />
        <StatTile
          label="প্ল্যাটফর্ম কমিশন"
          value={formatTaka(commission.commissionEarned)}
          hint={`${toBanglaDigits(commission.rate)}% হারে`}
          tone="accent"
        />
        <StatTile
          label="নিট আয়"
          value={formatTaka(commission.netEarnings)}
          hint="কমিশন বাদ দেওয়ার পর"
          tone="success"
        />
        <StatTile
          label="সেটেলমেন্টের অপেক্ষায়"
          value={formatTaka(commission.pendingPayout)}
          hint={`পরিশোধিত আজ পর্যন্ত: ${formatTaka(commission.paid)}`}
          tone="info"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <CommissionTierCard seller={seller} />

        <Card>
          <SectionHeader
            title="পরিশোধিত বনাম অপেক্ষমাণ"
            subtitle="আপনার নিট আয়ের কতটা হাতে এসেছে, কতটা সেটেলমেন্টে আছে।"
          />
          <Progress
            value={commission.paid}
            max={Math.max(1, settledTotal)}
            tone="success"
            label={`পরিশোধিত ${toBanglaDigits(paidPercent)}%`}
          />
          <p className="mt-1 text-xs text-text-secondary">
            পরিশোধিত <span className="font-num text-text-primary">{toBanglaDigits(paidPercent)}%</span> · বাকি{' '}
            <span className="font-num text-text-primary">{formatTaka(Math.max(0, commission.pendingPayout))}</span>
          </p>

          <dl className="mt-4 divide-y divide-divider">
            <KeyValue label="মোট কমিশন কাটা">{formatTaka(commission.commissionEarned)}</KeyValue>
            <KeyValue label="পরিশোধিত পেআউট">{formatTaka(commission.paid)}</KeyValue>
            <KeyValue label="সেটেলমেন্টের অপেক্ষায়">{formatTaka(commission.pendingPayout)}</KeyValue>
            <KeyValue label="সর্বশেষ পেআউট">
              {commission.lastPayoutAt ? formatDate(commission.lastPayoutAt) : 'এখনো হয়নি'}
            </KeyValue>
          </dl>

          <Alert tone="info" className="mt-4" icon={<Info aria-hidden className="size-4" />}>
            সেটেলমেন্টের হিসাব ডেমো নিয়ম অনুযায়ী — নিট আয়ের একটি অংশ সবসময় সাপ্তাহিক উইন্ডোতে থাকে।
          </Alert>
        </Card>
      </div>

      <Card>
        <SectionHeader
          title="কমিশন কীভাবে হিসাব হয়"
          subtitle="মাসিক বিক্রয় বাড়লে টিয়ার উন্নীত হয় এবং কমিশনের হার কমে।"
        />
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {TIER_ORDER.map((tier, index) => {
            const current = tier === currentTier;
            return (
              <div
                key={tier}
                className={
                  current
                    ? 'rounded-card border border-primary bg-primary-soft/60 p-3'
                    : 'rounded-card border border-border p-3'
                }
              >
                <p className="text-sm font-semibold text-text-primary">
                  {toBanglaDigits(index + 1)}. {TIER_LABELS[tier]} {current ? '· আপনার টিয়ার' : ''}
                </p>
                <p className="mt-1 font-num text-2xl font-bold text-text-primary">
                  {toBanglaDigits(COMMISSION_RATES[tier])}%
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  মাসিক বিক্রয় {tier === 'bronze' ? 'যেকোনো' : `≥ ${formatTaka(TIER_THRESHOLDS[tier])}`} হলে
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-text-secondary">
          উদাহরণ: <span className="font-num">৳১,০০০</span> বিক্রয়ে গোল্ড সেলারের কমিশন{' '}
          <span className="font-num">৳{toBanglaDigits(COMMISSION_RATES.gold * 10)}</span> এবং নিট{' '}
          <span className="font-num">৳{toBanglaDigits(1000 - COMMISSION_RATES.gold * 10)}</span>।
        </p>
      </Card>

      <CommissionOrderTable rows={rows} rate={commission.rate} />

      <DemoNotice title="ডেমো কমিশন">
        সব কমিশন কেবল এই ব্রাউজারের অর্ডার ডেটা থেকে হিসাব করা — কোনো প্রকৃত চার্জ, সেটেলমেন্ট বা পেআউট হয় না।
      </DemoNotice>
    </div>
  );
}
