import { BadgeCheck, Ban, Eye } from 'lucide-react';
import type { Seller } from '@shobdox/shared-types';
import { TIER_LABELS } from '@shobdox/shared-business-logic';
import { formatRelativeTime, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { Badge, IconButton, type Tone } from '@/components/ui';
import type { AdminColumn } from './ResponsiveTable';
import { SellerStatusBadge } from './StatusBadges';

/**
 * Column definition for the admin seller table.
 *
 * The page owns search, tabs and drawer state; this module only decides how a
 * seller row is drawn, so approve/suspend stay one callback away.
 */

export const SELLER_TIER_TONES: Record<Seller['tier'], Tone> = {
  bronze: 'warning',
  silver: 'neutral',
  gold: 'accent',
  platinum: 'primary',
};

export interface SellerColumnHandlers {
  onView: (seller: Seller) => void;
  onApprove: (seller: Seller) => void;
  onSuspend: (seller: Seller) => void;
}

export function buildSellerColumns(handlers: SellerColumnHandlers): AdminColumn<Seller>[] {
  return [
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
          <Badge tone={SELLER_TIER_TONES[seller.tier]} size="sm">
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
          <IconButton
            label={`${seller.profile.storeName} প্রোফাইল`}
            variant="ghost"
            size="sm"
            onClick={() => handlers.onView(seller)}
          >
            <Eye aria-hidden className="size-4" />
          </IconButton>
          {seller.status !== 'active' ? (
            <IconButton label="অনুমোদন করুন" variant="ghost" size="sm" onClick={() => handlers.onApprove(seller)}>
              <BadgeCheck aria-hidden className="size-4 text-success" />
            </IconButton>
          ) : null}
          {seller.status !== 'suspended' ? (
            <IconButton label="স্থগিত করুন" variant="ghost" size="sm" onClick={() => handlers.onSuspend(seller)}>
              <Ban aria-hidden className="size-4 text-error" />
            </IconButton>
          ) : null}
        </div>
      ),
    },
  ];
}
