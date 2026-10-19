import type { CommissionSummary, Payout, PayoutStatus, SellerOrderRow, SellerTier, Taka } from '@shobdox/shared-types';
import { createSeededRandom, roundTo } from '@shobdox/shared-utils';

/**
 * Marketplace commission and payout maths for the seller dashboard.
 * Nothing settles for real — payouts are generated rows in demo state.
 */

/** Commission the marketplace keeps, by seller tier. */
export const COMMISSION_RATES: Record<SellerTier, number> = {
  bronze: 12,
  silver: 10,
  gold: 8,
  platinum: 6,
};

export const TIER_LABELS: Record<SellerTier, string> = {
  bronze: 'ব্রোঞ্জ',
  silver: 'সিলভার',
  gold: 'গোল্ড',
  platinum: 'প্লাটিনাম',
};

/** Minimum monthly sales required for each tier — shown on the seller profile. */
export const TIER_THRESHOLDS: Record<SellerTier, Taka> = {
  bronze: 0,
  silver: 150_000,
  gold: 600_000,
  platinum: 2_000_000,
};

export function tierForSales(totalSales: Taka): SellerTier {
  if (totalSales >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (totalSales >= TIER_THRESHOLDS.gold) return 'gold';
  if (totalSales >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

export function commissionRateForTier(tier: SellerTier): number {
  return COMMISSION_RATES[tier] ?? COMMISSION_RATES.bronze;
}

export function computeCommission(grossAmount: Taka, rate: number): Taka {
  return roundTo((grossAmount * rate) / 100, 0);
}

export function computeNetPayable(grossAmount: Taka, rate: number): Taka {
  return roundTo(grossAmount - computeCommission(grossAmount, rate), 0);
}

/** Rolls seller order rows into the commission card on the seller overview. */
export function summarizeCommission(
  sellerId: string,
  rows: SellerOrderRow[],
  rate: number,
  lastPayoutAt?: string,
): CommissionSummary {
  const grossSales = rows.reduce((total, row) => total + row.grossAmount, 0);
  const commissionEarned = rows.reduce((total, row) => total + row.commission, 0);
  const netEarnings = grossSales - commissionEarned;

  // Demo rule: 28% of net earnings is still inside the settlement window.
  const pendingPayout = roundTo(netEarnings * 0.28, 0);

  return {
    sellerId,
    rate,
    grossSales,
    commissionEarned,
    netEarnings,
    pendingPayout,
    lastPayoutAt,
  };
}

const PAYOUT_METHODS: Payout['method'][] = ['bank-transfer', 'bkash', 'nagad'];
const PAYOUT_STATUSES: PayoutStatus[] = ['paid', 'processing', 'scheduled', 'on-hold'];

export interface BuildPayoutsInput {
  sellerId: string;
  /** Average weekly settlement amount, derived from real seller sales. */
  weeklyNetEarnings: Taka;
  count?: number;
  seed?: number;
  endDate?: Date;
}

/**
 * Generates a deterministic payout history. Paid rows are the oldest, and the
 * most recent row is still inside its settlement window — which is exactly the
 * state a real seller dashboard shows on the 1st of the month.
 */
export function buildPayoutHistory({
  sellerId,
  weeklyNetEarnings,
  count = 8,
  seed = 4242,
  endDate = new Date(),
}: BuildPayoutsInput): Payout[] {
  const random = createSeededRandom(seed);
  const payouts: Payout[] = [];

  for (let index = 0; index < count; index += 1) {
    const weeksAgo = index + 1;
    const periodEnd = new Date(endDate.getTime() - weeksAgo * 7 * 86_400_000);
    const periodStart = new Date(periodEnd.getTime() - 6 * 86_400_000);

    const amount = Math.round(weeklyNetEarnings * (0.78 + random() * 0.44));
    const status: PayoutStatus =
      index === 0 ? 'processing' : index === 1 ? 'scheduled' : index === count - 1 && random() > 0.7 ? 'on-hold' : 'paid';

    payouts.push({
      id: `pay-${sellerId}-${String(index + 1).padStart(3, '0')}`,
      sellerId,
      amount,
      commissionDeducted: roundTo(amount * 0.11, 0),
      status: PAYOUT_STATUSES.includes(status) ? status : 'paid',
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      requestedAt: new Date(periodEnd.getTime() + 86_400_000).toISOString(),
      paidAt: status === 'paid' ? new Date(periodEnd.getTime() + 3 * 86_400_000).toISOString() : undefined,
      method: PAYOUT_METHODS[index % PAYOUT_METHODS.length] ?? 'bank-transfer',
      reference:
        status === 'paid' ? `SDX${periodEnd.getFullYear()}${String(periodEnd.getMonth() + 1).padStart(2, '0')}${String(random() * 9999).slice(0, 4)}` : undefined,
    });
  }

  return payouts;
}

export const PAYOUT_METHOD_LABELS: Record<Payout['method'], string> = {
  'bank-transfer': 'ব্যাংক ট্রান্সফার',
  bkash: 'বিকাশ',
  nagad: 'নগদ',
};
