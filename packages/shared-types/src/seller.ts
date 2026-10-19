import type { EntityId, IsoDateString, Taka } from './common';
import type { OrderStatus } from './order';

export type SellerStatus = 'active' | 'pending-review' | 'suspended';
export type SellerTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface SellerStoreProfile {
  storeName: string;
  storeNameBn?: string;
  tagline: string;
  description: string;
  logo?: string;
  banner?: string;
  /** Bangladeshi business identifiers held as demo strings only. */
  tradeLicense?: string;
  tin?: string;
  pickupAddress: string;
  supportPhone: string;
  supportEmail?: string;
  returnPolicyDays: number;
  shipsWithinDays: number;
}

export interface Seller {
  id: EntityId;
  slug: string;
  ownerUserId: EntityId;
  ownerName: string;
  status: SellerStatus;
  tier: SellerTier;
  /** Commission charged by the marketplace, as a percentage of gross sales. */
  commissionRate: number;
  profile: SellerStoreProfile;
  joinedAt: IsoDateString;
  rating: number;
  reviewCount: number;
  productCount: number;
  totalSales: Taka;
  /** Share of orders shipped on time, 0–100. */
  onTimeDeliveryRate: number;
}

export type PayoutStatus = 'paid' | 'processing' | 'scheduled' | 'on-hold';

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  paid: 'পরিশোধিত',
  processing: 'প্রক্রিয়াধীন',
  scheduled: 'নির্ধারিত',
  'on-hold': 'স্থগিত',
};

export interface Payout {
  id: EntityId;
  sellerId: EntityId;
  amount: Taka;
  commissionDeducted: Taka;
  status: PayoutStatus;
  /** Settlement window the payout covers. */
  periodStart: IsoDateString;
  periodEnd: IsoDateString;
  requestedAt: IsoDateString;
  paidAt?: IsoDateString;
  method: 'bank-transfer' | 'bkash' | 'nagad';
  reference?: string;
}

export interface CommissionSummary {
  sellerId: EntityId;
  rate: number;
  grossSales: Taka;
  commissionEarned: Taka;
  netEarnings: Taka;
  pendingPayout: Taka;
  lastPayoutAt?: IsoDateString;
}

/** Row shape used by the seller order tables. */
export interface SellerOrderRow {
  id: EntityId;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  itemCount: number;
  grossAmount: Taka;
  commission: Taka;
  netPayable: Taka;
  placedAt: IsoDateString;
  district: string;
}
