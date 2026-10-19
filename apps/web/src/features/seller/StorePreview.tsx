import type { Seller } from '@shobdox/shared-types';
import { Badge, Card, Rating, SectionHeader } from '@/components/ui';
import { formatDate, toBanglaDigits } from '@/lib/format';
import { TIER_LABELS } from '@shobdox/shared-business-logic';
import type { SellerStoreProfileValues } from '@shobdox/shared-validation';

/**
 * Live store-header preview for the "স্টোর প্রোফাইল" form.
 *
 * It renders the same fields the shopper sees on the storefront, straight from
 * the form's current values (before saving).
 */

export function StorePreview({
  values,
  seller,
}: {
  values: Partial<SellerStoreProfileValues>;
  seller: Seller;
}) {
  const storeName = values.storeNameBn?.trim() || values.storeName?.trim() || seller.profile.storeName;
  const tagline = values.tagline?.trim() || seller.profile.tagline;

  return (
    <Card>
      <SectionHeader title="লাইভ প্রিভিউ" subtitle="স্টোরফ্রন্টে আপনার স্টোর হেডার এমন দেখাবে।" />

      <div className="overflow-hidden rounded-card border border-border">
        <div className="bg-primary px-4 py-5 text-on-primary">
          <p className="text-2xl font-bold">{storeName}</p>
          <p className="mt-0.5 text-sm opacity-90">{tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-chip bg-on-primary/15 px-2 py-1 text-xs font-medium">
              {TIER_LABELS[seller.tier]} সেলার
            </span>
            <span className="rounded-chip bg-on-primary/15 px-2 py-1 text-xs font-medium">
              যোগ দিয়েছেন {formatDate(seller.joinedAt, { withYear: true })}
            </span>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Rating value={seller.rating} count={seller.reviewCount} />
            <span className="text-xs text-text-secondary">
              সময়মতো ডেলিভারি: <span className="font-num text-text-primary">{toBanglaDigits(seller.onTimeDeliveryRate)}%</span>
            </span>
          </div>

          {values.description?.trim() ? (
            <p className="text-sm leading-relaxed text-text-secondary">{values.description}</p>
          ) : (
            <p className="text-sm text-text-muted">স্টোরের বিবরণ এখানে দেখা যাবে।</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge tone="primary" size="sm">
              রিটার্ন: {toBanglaDigits(values.returnPolicyDays ?? seller.profile.returnPolicyDays)} দিনের মধ্যে
            </Badge>
            <Badge tone="info" size="sm">
              শিপিং: {toBanglaDigits(values.shipsWithinDays ?? seller.profile.shipsWithinDays)} দিনের মধ্যে
            </Badge>
            <Badge tone="neutral" size="sm">
              সাপোর্ট: <span className="font-num">{values.supportPhone?.trim() || seller.profile.supportPhone}</span>
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
