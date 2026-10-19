import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Ban, CalendarDays, MapPin, Truck } from 'lucide-react';
import type { Seller } from '@shobdox/shared-types';
import {
  Badge,
  Button,
  ConfirmDialog,
  Drawer,
  EmptyState,
  KeyValue,
  Progress,
  Thumb,
} from '@/components/ui';
import {
  COMMISSION_RATES,
  PAYOUT_METHOD_LABELS,
  TIER_LABELS,
  TIER_THRESHOLDS,
} from '@shobdox/shared-business-logic';
import { useSellerProducts } from '@/hooks/useCatalog';
import { readPayouts } from '@/services/analytics.service';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { formatDate, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { PayoutStatusBadge, SELLER_STATUS_LABELS, SellerStatusBadge } from './StatusBadges';

/**
 * Seller admin drawer.
 *
 * Everything the marketplace team needs before approving or suspending a store:
 * commission tier explainer (rates and thresholds come from the shared
 * commission module), top products, and the generated payout history.
 */

export function SellerDetailDrawer({ seller, onClose }: { seller?: Seller; onClose: () => void }) {
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  useEffect(() => setConfirmSuspend(false), [seller?.id]);

  return (
    <Drawer open={Boolean(seller)} onClose={onClose} title="সেলার প্রোফাইল" widthClassName="sm:max-w-xl">
      {seller ? <SellerBody seller={seller} onClose={onClose} onSuspend={() => setConfirmSuspend(true)} /> : null}

      <ConfirmDialog
        open={confirmSuspend}
        title="সেলার স্থগিত করবেন?"
        message={`${seller?.profile.storeNameBn ?? seller?.profile.storeName ?? ''} স্থগিত হলে স্টোরফ্রন্টে তাদের পণ্য লুকিয়ে যাবে। পরবর্তীতে আবার সক্রিয় করা যাবে।`}
        confirmLabel="হ্যাঁ, স্থগিত করুন"
        onConfirm={() => {
          if (!seller) return;
          useDataStore.getState().setSellerStatus(seller.id, 'suspended');
          toast({ tone: 'warning', title: 'সেলার স্থগিত করা হয়েছে', description: seller.profile.storeNameBn });
          setConfirmSuspend(false);
        }}
        onClose={() => setConfirmSuspend(false)}
      />
    </Drawer>
  );
}

function SellerBody({ seller, onClose, onSuspend }: { seller: Seller; onClose: () => void; onSuspend: () => void }) {
  const products = useSellerProducts(seller.id);
  const payouts = useMemo(() => readPayouts(seller.id), [seller.id]);
  const topProducts = useMemo(
    () => [...products].sort((a, b) => b.sold - a.sold).slice(0, 5),
    [products],
  );

  const tiers = (Object.keys(TIER_THRESHOLDS) as Array<keyof typeof TIER_THRESHOLDS>).map((tier) => ({
    tier,
    threshold: TIER_THRESHOLDS[tier],
    rate: COMMISSION_RATES[tier],
  }));
  const nextTier = tiers.find((entry) => entry.threshold > seller.totalSales);

  const setStatus = (status: Seller['status']) => {
    useDataStore.getState().setSellerStatus(seller.id, status);
    toast({
      tone: 'success',
      title: `স্ট্যাটাস: ${SELLER_STATUS_LABELS[status]}`,
      description: seller.profile.storeNameBn ?? seller.profile.storeName,
    });
  };

  return (
    <div className="space-y-5">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-bold text-text-primary">
            {seller.profile.storeNameBn ?? seller.profile.storeName}
          </h3>
          <SellerStatusBadge status={seller.status} />
        </div>
        <p className="mt-0.5 text-sm text-text-secondary">{seller.profile.tagline}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          <span>মালিক: {seller.ownerName}</span>
          <span aria-hidden>·</span>
          <span className="font-num">{seller.profile.supportPhone}</span>
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1">
            <CalendarDays aria-hidden className="size-3.5" />
            যোগদান {formatDate(seller.joinedAt)}
          </span>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {seller.status !== 'active' ? (
          <Button
            variant="success"
            leftIcon={<BadgeCheck aria-hidden className="size-4" />}
            onClick={() => setStatus('active')}
          >
            {seller.status === 'pending-review' ? 'অনুমোদন করুন' : 'স্থগিতাদেশ প্রত্যাহার করুন'}
          </Button>
        ) : null}
        {seller.status !== 'suspended' ? (
          <Button variant="outline" leftIcon={<Ban aria-hidden className="size-4" />} onClick={onSuspend}>
            স্থগিত করুন
          </Button>
        ) : null}
      </div>

      <dl className="rounded-card border border-border px-3">
        <KeyValue label="পণ্য">{toBanglaDigits(seller.productCount)}</KeyValue>
        <KeyValue label="মোট বিক্রয়">{formatTaka(seller.totalSales)}</KeyValue>
        <KeyValue label="রেটিং">
          {toBanglaDigits(seller.rating)} ({toBanglaDigits(seller.reviewCount)} রিভিউ)
        </KeyValue>
        <KeyValue label="সময়মতো ডেলিভারি">
          <span className="flex items-center gap-1">
            <Truck aria-hidden className="size-3.5" />
            {toBanglaDigits(Math.round(seller.onTimeDeliveryRate))}%
          </span>
        </KeyValue>
      </dl>

      <section aria-label="কমিশন টিয়ার" className="rounded-card border border-border p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-text-primary">কমিশন টিয়ার</h3>
          <Badge tone="primary" size="sm">
            {TIER_LABELS[seller.tier]} · {toBanglaDigits(seller.commissionRate)}%
          </Badge>
        </div>

        {nextTier ? (
          <div className="mt-3">
            <Progress
              value={Math.min(seller.totalSales, nextTier.threshold)}
              max={nextTier.threshold}
              tone="accent"
              size="sm"
              label={`${TIER_LABELS[nextTier.tier]} টিয়ারে যেতে ${formatTaka(nextTier.threshold - seller.totalSales)} বাকি`}
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-text-secondary">সর্বোচ্চ টিয়ারে আছেন — কমিশন সর্বনিম্ন হারে।</p>
        )}

        <table className="mt-3 w-full border-collapse text-left text-sm">
          <caption className="sr-only">টিয়ার অনুযায়ী মাসিক বিক্রয় সীমা ও কমিশন হার</caption>
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-text-secondary">
              <th scope="col" className="py-1.5">
                টিয়ার
              </th>
              <th scope="col" className="py-1.5 text-right">
                মাসিক বিক্রয় (সর্বনিম্ন)
              </th>
              <th scope="col" className="py-1.5 text-right">
                কমিশন
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {tiers.map((entry) => (
              <tr key={entry.tier} className={entry.tier === seller.tier ? 'font-semibold text-primary-dark' : ''}>
                <td className="py-1.5">{TIER_LABELS[entry.tier]}</td>
                <td className="py-1.5 text-right font-num">{formatTaka(entry.threshold)}</td>
                <td className="py-1.5 text-right font-num">{toBanglaDigits(entry.rate)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-xs text-text-muted">
          টিয়ার নির্ধারণে ডেমো হিসেবে আজীবন বিক্রয় ব্যবহার করা হয়েছে (রিয়েলে মাসিক হিসাব)।
        </p>
      </section>

      <section aria-label="শীর্ষ পণ্য">
        <h3 className="text-base font-semibold text-text-primary">শীর্ষ পণ্য</h3>
        {topProducts.length === 0 ? (
          <EmptyState className="mt-2" title="এই সেলারের কোনো পণ্য নেই" />
        ) : (
          <ul className="mt-2 space-y-2">
            {topProducts.map((product) => (
              <li key={product.id} className="flex items-center gap-3">
                <Thumb src={product.thumbnail} alt={product.titleBn ?? product.title} className="size-10" />
                <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                  {product.titleBn ?? product.title}
                </span>
                <span className="shrink-0 text-xs text-text-secondary">
                  বিক্রয় {toBanglaDigits(product.sold)} · {formatTaka(product.price)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="পেআউট ইতিহাস" className="rounded-card border border-border p-3">
        <h3 className="text-base font-semibold text-text-primary">পেআউট ইতিহাস (ডেমো)</h3>
        <p className="mt-0.5 text-xs text-text-secondary">
          ডেমো সেটেলমেন্ট সপ্তাহভিত্তিক তৈরি হয় — প্রথম দুটি সারি এখনো সেটেলমেন্ট উইন্ডোতে।
        </p>

        <ul className="mt-2 divide-y divide-divider">
          {payouts.map((payout) => (
            <li key={payout.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="text-sm text-text-secondary">
                {formatDate(payout.periodStart)} – {formatDate(payout.periodEnd)}
                <span className="ml-2 text-xs text-text-muted">{PAYOUT_METHOD_LABELS[payout.method]}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="font-num text-sm font-semibold text-text-primary">{formatTaka(payout.amount)}</span>
                <PayoutStatusBadge status={payout.status} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <address className="flex items-start gap-2 text-sm not-italic text-text-secondary">
        <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>{seller.profile.pickupAddress}</span>
      </address>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          বন্ধ করুন
        </Button>
      </div>
    </div>
  );
}
