import type { EntityId, Taka } from './common';

export interface CartItem {
  /** Stable line id: `${productId}:${variantId}`. */
  id: string;
  productId: EntityId;
  variantId: EntityId;
  slug: string;
  title: string;
  titleBn?: string;
  image: string;
  /** Human-readable selected options, e.g. `{ Size: 'M', Colour: 'Black' }`. */
  selectedOptions: Record<string, string>;
  unitPrice: Taka;
  compareAtPrice?: Taka;
  quantity: number;
  /** Snapshot of variant availability at the time the line was added. */
  availableStock: number;
  sellerId: EntityId;
  /**
   * Products sold by a third-party seller are marked so delivery/commission
   * logic and the seller dashboard can tell them apart from SHOBDOX-owned stock.
   */
  fulfilledBy: 'shobdox' | 'seller';
}

/** A discount produced by applying a coupon. */
export interface AppliedCoupon {
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free-delivery';
  value: number;
  /** Amount actually deducted from this cart. */
  discountAmount: Taka;
}

export interface CartTotals {
  itemCount: number;
  lineCount: number;
  subtotal: Taka;
  /** Sum of `compareAtPrice - unitPrice` across lines. */
  productDiscount: Taka;
  couponDiscount: Taka;
  deliveryFee: Taka;
  /** Delivery is free above this threshold, configured in shared business logic. */
  freeDeliveryThreshold: Taka;
  /** How much more the customer must spend to unlock free delivery. */
  amountUntilFreeDelivery: Taka;
  /** VAT shown for transparency; included in `total`, never added twice. */
  vat: Taka;
  total: Taka;
  savings: Taka;
}

export interface Cart {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  updatedAt: string;
}
