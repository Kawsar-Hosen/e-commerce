import type { Seller, SellerTier } from '@shobdox/shared-types';
import {
  COMMISSION_RATES,
  TIER_LABELS,
  TIER_THRESHOLDS,
  commissionRateForTier,
  tierForSales,
} from '@shobdox/shared-business-logic';
import { Badge, Card, Progress, SectionHeader } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatTaka, toBanglaDigits } from '@/lib/format';

const TIER_ORDER: SellerTier[] = ['bronze', 'silver', 'gold', 'platinum'];

/**
 * Current-tier card with a progress bar towards the next commission tier.
 *
 * Rates and thresholds come from the shared commission module, so the ladder
 * here can never disagree with `seller.commissionRate`.
 */
export function CommissionTierCard({ seller }: { seller: Seller }) {
  const tier = tierForSales(seller.totalSales);
  const rate = commissionRateForTier(tier);
  const index = TIER_ORDER.indexOf(tier);
  const nextTier = TIER_ORDER[index + 1];
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : undefined;
  const previousThreshold = TIER_THRESHOLDS[tier];
  const progress = nextThreshold
    ? Math.min(100, Math.round(((seller.totalSales - previousThreshold) / (nextThreshold - previousThreshold)) * 100))
    : 100;

  return (
    <Card>
      <SectionHeader
        title="কমিশন রেট"
        subtitle="মাসিক বিক্রয় অনুযায়ী টিয়ার ও রেট নির্ধারিত হয়।"
        trailing={<Badge tone="accent">{TIER_LABELS[tier]} সেলার</Badge>}
      />

      <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
        <div>
          <p className="text-sm text-text-secondary">বর্তমান কমিশন</p>
          <p className="font-num text-4xl font-extrabold text-text-primary">{toBanglaDigits(rate)}%</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-secondary">
            মোট বিক্রয় <span className="font-num text-text-primary">{formatTaka(seller.totalSales)}</span>
          </p>
          {nextTier && nextThreshold ? (
            <p className="mt-0.5 text-xs text-text-secondary">
              {TIER_LABELS[nextTier]} টিয়ারে যেতে আরও {formatTaka(Math.max(0, nextThreshold - seller.totalSales))} দরকার
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-text-secondary">সর্বোচ্চ টিয়ার — সবচেয়ে কম কমিশন রেট।</p>
          )}
        </div>
      </div>

      <Progress
        value={progress}
        tone={nextTier ? 'primary' : 'success'}
        label={nextTier ? `${TIER_LABELS[nextTier]} টিয়ারে অগ্রগতি ${progress}%` : 'সর্বোচ্চ টিয়ার'}
        className="mt-3"
      />
      {nextTier && nextThreshold ? (
        <p className="mt-1 text-xs text-text-secondary">
          {formatTaka(seller.totalSales)} / {formatTaka(nextThreshold)} · {toBanglaDigits(progress)}%
        </p>
      ) : null}

      <ul className="mt-4 divide-y divide-divider rounded-card border border-border">
        {TIER_ORDER.map((candidate) => {
          const current = candidate === tier;
          return (
            <li
              key={candidate}
              className={cn(
                'flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm',
                current && 'bg-primary-soft/60',
              )}
            >
              <span className={cn('font-medium', current ? 'text-primary-dark' : 'text-text-primary')}>
                {TIER_LABELS[candidate]} {current ? '· এখন' : ''}
              </span>
              <span className="flex items-center gap-3 text-xs text-text-secondary">
                <span>
                  কমিশন <span className="font-num text-text-primary">{toBanglaDigits(COMMISSION_RATES[candidate])}%</span>
                </span>
                <span>
                  বিক্রয় ≥ <span className="font-num text-text-primary">{formatTaka(TIER_THRESHOLDS[candidate])}</span>
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
