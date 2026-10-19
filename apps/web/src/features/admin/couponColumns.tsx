import { Copy, Pencil, Power, Trash2 } from 'lucide-react';
import type { Coupon } from '@shobdox/shared-types';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { Badge, IconButton, Progress, type Tone } from '@/components/ui';
import type { AdminColumn } from './ResponsiveTable';

/**
 * Column definition and state helpers for the admin coupon table.
 *
 * The page keeps search/filter/pagination state; this module only answers
 * "what state is this coupon in" and "how does a row look", so the desktop
 * table and the mobile card share the same labels.
 */

export type CouponState = 'active' | 'upcoming' | 'expired' | 'inactive';

export const COUPON_STATE_META: Record<CouponState, { label: string; tone: Tone }> = {
  active: { label: 'কার্যকর', tone: 'success' },
  upcoming: { label: 'শীঘ্রই শুরু', tone: 'info' },
  expired: { label: 'মেয়াদ শেষ', tone: 'warning' },
  inactive: { label: 'নিষ্ক্রিয়', tone: 'neutral' },
};

export function couponState(coupon: Coupon): CouponState {
  if (!coupon.isActive) return 'inactive';
  const now = Date.now();
  if (new Date(coupon.startsAt).getTime() > now) return 'upcoming';
  if (new Date(coupon.expiresAt).getTime() < now) return 'expired';
  return 'active';
}

export function discountLabel(coupon: Coupon): string {
  if (coupon.type === 'percentage') return `${toBanglaDigits(coupon.value)}%`;
  if (coupon.type === 'fixed') return formatTaka(coupon.value);
  return 'ফ্রি ডেলিভারি';
}

export interface CouponColumnHandlers {
  onCopy: (coupon: Coupon) => void;
  onEdit: (coupon: Coupon) => void;
  onToggleActive: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
}

export function buildCouponColumns(handlers: CouponColumnHandlers): AdminColumn<Coupon>[] {
  return [
    {
      id: 'code',
      header: 'কোড',
      render: (coupon) => (
        <span className="flex items-center gap-1">
          <span className="font-num font-semibold text-text-primary">{coupon.code}</span>
          <IconButton label={`${coupon.code} কপি করুন`} variant="ghost" size="sm" onClick={() => handlers.onCopy(coupon)}>
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
        const meta = COUPON_STATE_META[couponState(coupon)];
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
          <IconButton label="কুপন সম্পাদনা" variant="ghost" size="sm" onClick={() => handlers.onEdit(coupon)}>
            <Pencil aria-hidden className="size-4" />
          </IconButton>
          <IconButton
            label={coupon.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
            variant="ghost"
            size="sm"
            onClick={() => handlers.onToggleActive(coupon)}
          >
            <Power aria-hidden className={coupon.isActive ? 'size-4 text-success' : 'size-4'} />
          </IconButton>
          <IconButton label="কুপন মুছুন" variant="ghost" size="sm" onClick={() => handlers.onDelete(coupon)}>
            <Trash2 aria-hidden className="size-4 text-error" />
          </IconButton>
        </div>
      ),
    },
  ];
}
