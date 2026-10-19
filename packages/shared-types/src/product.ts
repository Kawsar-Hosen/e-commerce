import type { EntityId, IsoDateString, ProductSortKey, Taka } from './common';

/**
 * Stock is always derived from the variant rows so the product card, the
 * product page and the dashboards can never disagree about availability.
 */
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'pre-order';

export type ProductBadge =
  | 'flash-sale'
  | 'new'
  | 'best-seller'
  | 'featured'
  | 'trending'
  | 'limited-stock'
  | 'free-delivery'
  | 'official-warranty';

export const PRODUCT_BADGE_LABELS: Record<ProductBadge, string> = {
  'flash-sale': 'ফ্ল্যাশ সেল',
  new: 'নতুন',
  'best-seller': 'বেস্ট সেলার',
  featured: 'ফিচার্ড',
  trending: 'ট্রেন্ডিং',
  'limited-stock': 'সীমিত স্টক',
  'free-delivery': 'ফ্রি ডেলিভারি',
  'official-warranty': 'অফিসিয়াল ওয়ারেন্টি',
};

export type ProductStatus = 'active' | 'draft' | 'archived';

/**
 * A single selectable value of an option, e.g. option "Colour" value "Midnight".
 * `hex` is only present for colour swatches.
 */
export interface ProductOptionValue {
  id: EntityId;
  label: string;
  labelBn?: string;
  hex?: string;
  /** Applied on top of the product's base price when this value is selected. */
  priceDelta?: Taka;
  /** Optional dedicated image, used by the product gallery. */
  image?: string;
}

/** A purchasable choice group, e.g. "Storage" or "Size". */
export interface ProductOption {
  id: EntityId;
  name: string;
  /** Displayed to the customer; falls back to `name` when absent. */
  nameBn?: string;
  /** `swatch` renders colour chips, `chip` renders size pills, `select` a dropdown. */
  display: 'swatch' | 'chip' | 'select';
  values: ProductOptionValue[];
}

/**
 * A concrete SKU. Every product has at least one variant, even when it has no
 * options, so cart and pricing logic never needs a special case.
 */
export interface ProductVariant {
  id: EntityId;
  sku: string;
  /** Maps `ProductOption.id` -> `ProductOptionValue.id`. */
  optionValues: Record<EntityId, EntityId>;
  /** Selling price in Taka for this variant. */
  price: Taka;
  /** Previous price, present only while the variant is discounted. */
  compareAtPrice?: Taka;
  stock: number;
  image?: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductReview {
  id: EntityId;
  authorName: string;
  authorAvatar?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  body: string;
  createdAt: IsoDateString;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  /** Optional seller/admin reply rendered under the review. */
  reply?: { body: string; createdAt: IsoDateString };
}

export interface ProductImage {
  id: EntityId;
  url: string;
  alt: string;
}

export interface DeliveryInfo {
  /** Typical delivery window in days, e.g. `{ min: 1, max: 3 }`. */
  insideDhaka: { min: number; max: number };
  outsideDhaka: { min: number; max: number };
  /** Flat or calculated fee hints used by the cart breakdown. */
  deliveryFeeInsideDhaka: Taka;
  deliveryFeeOutsideDhaka: Taka;
  cashOnDeliveryAvailable: boolean;
}

export interface Product {
  id: EntityId;
  slug: string;
  /** Brand name kept first in listings; usually Latin script. */
  title: string;
  /** Bangla title, used as the primary heading in Bangla-first surfaces. */
  titleBn?: string;
  shortDescription: string;
  description: string;
  descriptionBn?: string;

  categoryId: EntityId;
  brandId?: EntityId;
  sellerId: EntityId;

  thumbnail: string;
  images: ProductImage[];

  /** Display price = lowest active variant price. Kept on the row for listings. */
  price: Taka;
  compareAtPrice?: Taka;
  /** `0` when the product is not discounted. Derived by shared business logic. */
  discountPercent: number;

  rating: number;
  reviewCount: number;
  reviews: ProductReview[];

  options: ProductOption[];
  variants: ProductVariant[];

  specifications: ProductSpecification[];
  tags: string[];

  badges: ProductBadge[];
  stockStatus: StockStatus;

  /** Total units across all variants. */
  stock: number;
  sold: number;
  viewCount: number;

  warranty?: string;
  returnPolicyDays: number;
  delivery: DeliveryInfo;

  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isFlashSale: boolean;
  /** Only set when `isFlashSale` is true. */
  flashSaleEndsAt?: IsoDateString;
  /** 0–100 merchandising score used to order the "Recommended" rail. */
  recommendationScore: number;

  status: ProductStatus;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

/** Filter state shared by the shop page, the mobile search screen and the admin tables. */
export interface ProductFilters {
  query: string;
  categoryIds: EntityId[];
  brandIds: EntityId[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  /** Minimum discount percentage, e.g. `20` for "20% off or more". */
  minDiscount?: number;
  inStockOnly: boolean;
  flashSaleOnly: boolean;
  tags: string[];
  sort: ProductSortKey;
}

export const EMPTY_PRODUCT_FILTERS: ProductFilters = {
  query: '',
  categoryIds: [],
  brandIds: [],
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
  minDiscount: undefined,
  inStockOnly: false,
  flashSaleOnly: false,
  tags: [],
  sort: 'relevance',
};
