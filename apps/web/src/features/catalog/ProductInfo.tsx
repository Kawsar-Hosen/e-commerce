import { Link } from 'react-router';
import { BadgeCheck, PackageCheck, Store } from 'lucide-react';
import type { Brand, Category, Product, Seller } from '@shobdox/shared-types';
import { PRODUCT_BADGE_LABELS } from '@shobdox/shared-types';
import { formatRelativeTime, toBanglaDigits } from '@shobdox/shared-utils';
import { Avatar, Badge, Card, Rating } from '@/components/ui';
import { SELLER_TIER_LABELS } from '@/services/catalog.service';

/**
 * Long-form product information: description, specifications, tags and the
 * seller card. Kept out of the page component so the product route stays
 * focused on layout.
 */

export function ProductDescription({ product }: { product: Product }) {
  const paragraphs = (product.descriptionBn ?? product.description)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <Card className="space-y-3">
      <h2 className="text-2xl font-bold text-text-primary">পণ্যের বিবরণ</h2>
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-text-secondary">
          {paragraph}
        </p>
      ))}

      {product.badges.length > 0 ? (
        <ul className="flex flex-wrap gap-2 pt-1">
          {product.badges.map((badge) => (
            <li key={badge}>
              <Badge tone={badge === 'flash-sale' ? 'accent' : 'primary'}>
                {PRODUCT_BADGE_LABELS[badge]}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {product.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2 border-t border-divider pt-3">
          {product.tags.map((tag) => (
            <li key={tag}>
              <Link
                to={`/shop?tag=${encodeURIComponent(tag)}`}
                className="inline-flex rounded-chip bg-surface-muted px-3 py-1 text-xs font-medium text-text-secondary hover:bg-primary-soft hover:text-primary-dark"
              >
                #{tag}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}

export function ProductSpecifications({ product }: { product: Product }) {
  if (product.specifications.length === 0) return null;

  return (
    <Card className="space-y-3">
      <h2 className="text-2xl font-bold text-text-primary">স্পেসিফিকেশন</h2>

      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{product.titleBn ?? product.title} — স্পেসিফিকেশন</caption>
          <tbody>
            {product.specifications.map((specification, index) => (
              <tr
                key={specification.label}
                className={index % 2 === 1 ? 'bg-surface-muted/60' : undefined}
              >
                <th
                  scope="row"
                  className="w-2/5 border-b border-divider px-3 py-2.5 text-left align-top font-medium text-text-secondary"
                >
                  {specification.label}
                </th>
                <td className="border-b border-divider px-3 py-2.5 align-top text-text-primary">
                  {specification.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function SellerCard({ seller, category }: { seller: Seller; category?: Category }) {
  const storeName = seller.profile.storeNameBn ?? seller.profile.storeName;
  const active = seller.status === 'active';

  return (
    <Card className="space-y-3">
      <h2 className="text-lg font-bold text-text-primary">বিক্রেতা</h2>

      <div className="flex items-start gap-3">
        <Avatar name={storeName} size="md" />

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-base font-semibold text-text-primary">
            {storeName}
            {active ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
                <BadgeCheck aria-hidden className="size-3.5" />
                যাচাইকৃত
              </span>
            ) : (
              <Badge tone="warning">পর্যালোচনাধীন</Badge>
            )}
          </p>

          <p className="text-xs text-text-muted">
            {seller.ownerName} · {SELLER_TIER_LABELS[seller.tier]} বিক্রেতা
          </p>
          <p className="mt-0.5 text-sm text-text-secondary">{seller.profile.tagline}</p>

          <Rating value={seller.rating} count={seller.reviewCount} size="sm" className="mt-1" />

          <ul className="mt-2 grid gap-1.5 text-xs text-text-secondary sm:grid-cols-2">
            <li className="flex items-center gap-1.5">
              <Store aria-hidden className="size-3.5 text-text-muted" />
              {toBanglaDigits(seller.productCount)}টি পণ্য
            </li>
            <li className="flex items-center gap-1.5">
              <PackageCheck aria-hidden className="size-3.5 text-text-muted" />
              সময়মতো ডেলিভারি {toBanglaDigits(Math.round(seller.onTimeDeliveryRate))}%
            </li>
          </ul>

          <p className="mt-2 text-xs text-text-muted">
            যোগ দিয়েছেন {formatRelativeTime(seller.joinedAt)} · পিকআপ: {seller.profile.pickupAddress}
          </p>
        </div>
      </div>

      <p className="rounded-card bg-surface-muted px-3 py-2 text-xs leading-relaxed text-text-secondary">
        {seller.profile.description}
      </p>

      {category ? (
        <Link
          to={`/category/${category.slug}`}
          className="inline-flex text-sm font-semibold text-primary hover:underline"
        >
          {category.nameBn} ক্যাটাগরির সব পণ্য দেখুন →
        </Link>
      ) : null}

      <p className="text-xs text-text-muted">
        বিক্রেতার তথ্য ডেমো — কোনো প্রকৃত দোকান, লাইসেন্স বা পেআউট নেই।
      </p>
    </Card>
  );
}

export function ProductQuickFacts({ product, brand }: { product: Product; brand?: Brand }) {
  return (
    <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
      <div className="rounded-card border border-border bg-surface p-2.5">
        <dt className="text-text-muted">ব্র্যান্ড</dt>
        <dd className="mt-0.5 font-medium text-text-primary">{brand?.name ?? 'নেই'}</dd>
      </div>
      <div className="rounded-card border border-border bg-surface p-2.5">
        <dt className="text-text-muted">রেটিং</dt>
        <dd className="mt-0.5 font-num font-medium text-text-primary">
          {toBanglaDigits(product.rating.toFixed(1))} / {toBanglaDigits(5)}
        </dd>
      </div>
      <div className="rounded-card border border-border bg-surface p-2.5">
        <dt className="text-text-muted">বিক্রি</dt>
        <dd className="mt-0.5 font-num font-medium text-text-primary">
          {toBanglaDigits(product.sold)}টি
        </dd>
      </div>
      <div className="rounded-card border border-border bg-surface p-2.5">
        <dt className="text-text-muted">ভ্যারিয়েন্ট</dt>
        <dd className="mt-0.5 font-num font-medium text-text-primary">
          {toBanglaDigits(product.variants.length)}টি
        </dd>
      </div>
    </dl>
  );
}
