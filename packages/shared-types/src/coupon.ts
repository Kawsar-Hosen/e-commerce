import type { EntityId, IsoDateString, Taka } from './common';

export type CouponType = 'percentage' | 'fixed' | 'free-delivery';

export interface Coupon {
  id: EntityId;
  code: string;
  title: string;
  titleBn?: string;
  description: string;
  type: CouponType;
  /** Percentage points for `percentage`, Taka for `fixed`, ignored for `free-delivery`. */
  value: Taka;
  /** Maximum Taka discount for percentage coupons. */
  maxDiscount?: Taka;
  minOrderValue: Taka;
  /** Restricts the coupon to specific categories; empty means "all". */
  categoryIds: EntityId[];
  /** Restricts the coupon to specific products; empty means "all". */
  productIds: EntityId[];
  usageLimit: number;
  usedCount: number;
  usageLimitPerCustomer: number;
  startsAt: IsoDateString;
  expiresAt: IsoDateString;
  isActive: boolean;
  /** Demo coupons are pre-seeded so the checkout never needs a backend. */
  isDemo: boolean;
}

export type CouponRejectionReason =
  | 'not-found'
  | 'inactive'
  | 'expired'
  | 'not-started'
  | 'min-order-not-met'
  | 'usage-limit-reached'
  | 'category-not-eligible'
  | 'already-applied';

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  /** Taka value the coupon would remove from this cart. */
  discountAmount: Taka;
  reason?: CouponRejectionReason;
  message: string;
}

export interface Banner {
  id: EntityId;
  title: string;
  subtitle: string;
  /** Bangla call-to-action label. */
  ctaLabel: string;
  href: string;
  image?: string;
  /** Token-driven background used when no artwork is available. */
  theme: 'primary' | 'accent' | 'dark' | 'soft';
  placement: 'hero' | 'strip' | 'category' | 'footer';
  displayOrder: number;
  isActive: boolean;
  startsAt: IsoDateString;
  endsAt: IsoDateString;
}

export interface Announcement {
  id: EntityId;
  message: string;
  messageBn?: string;
  href?: string;
  tone: 'primary' | 'accent' | 'dark';
  isActive: boolean;
}
