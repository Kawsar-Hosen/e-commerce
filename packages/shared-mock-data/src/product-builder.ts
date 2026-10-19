import type {
  DeliveryInfo,
  Product,
  ProductBadge,
  ProductImage,
  ProductOption,
  ProductOptionValue,
  ProductReview,
  ProductSpecification,
  ProductVariant,
} from '@shobdox/shared-types';
import { generateVariantMatrix, recalculateProduct } from '@shobdox/shared-business-logic';
import { createSeededRandom } from '@shobdox/shared-utils';
import { poolPhotos, type PhotoPoolName } from './images';

/**
 * Turns the compact seed rows in `product-seeds.ts` into full `Product` records.
 *
 * Keeping one builder in the middle means every demo product automatically has
 * consistent variants, derived stock status, a gallery and reviews — and adding
 * a product later is a five-line data edit rather than a copy-paste exercise.
 */

/** Frozen "today" for the demo session so created-at dates stay believable. */
export const MOCK_NOW = new Date();

export interface OptionValueSeed {
  label: string;
  labelBn?: string;
  hex?: string;
  priceDelta?: number;
  /** Units available for any combination that includes this value. */
  stock: number;
}

export interface OptionSeed {
  id: string;
  name: string;
  nameBn?: string;
  display: 'swatch' | 'chip' | 'select';
  values: OptionValueSeed[];
}

export interface ProductSeed {
  id: string;
  slug: string;
  title: string;
  titleBn?: string;
  shortDescription: string;
  description: string;
  descriptionBn?: string;
  categoryId: string;
  brandId: string;
  sellerId: string;
  /** Which verified photo pool supplies the gallery. */
  pool: PhotoPoolName;
  /** Number of gallery images to pull from the pool. */
  gallerySize?: number;

  price: number;
  compareAtPrice?: number;

  rating: number;
  reviewCount: number;
  sold: number;
  /** Days before MOCK_NOW that the product was listed. */
  daysAgo: number;
  viewCount: number;

  options?: OptionSeed[];
  specifications: Array<[string, string]>;
  tags: string[];
  badges: ProductBadge[];

  warranty?: string;
  returnPolicyDays?: number;
  delivery?: Partial<DeliveryInfo>;
  recommendationScore?: number;

  flags?: Partial<
    Pick<
      Product,
      'isFeatured' | 'isTrending' | 'isBestSeller' | 'isNewArrival' | 'isFlashSale'
    >
  >;
  /** Hours from MOCK_NOW until the flash sale ends. */
  flashSaleHours?: number;
  /** Overrides the default SKU prefix derived from the slug. */
  skuPrefix?: string;
  /** Forces a whole product out of stock to exercise empty states. */
  outOfStock?: boolean;
}

const DEFAULT_DELIVERY: DeliveryInfo = {
  insideDhaka: { min: 1, max: 3 },
  outsideDhaka: { min: 3, max: 5 },
  deliveryFeeInsideDhaka: 60,
  deliveryFeeOutsideDhaka: 120,
  cashOnDeliveryAvailable: true,
};

/** Deterministic per-product randomness so the demo never reshuffles on reload. */
function seededRandom(key: string) {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) | 0;
  }
  return createSeededRandom(Math.abs(hash) + 7);
}

function skuFor(seed: ProductSeed, index: number): string {
  const prefix =
    seed.skuPrefix ??
    seed.slug
      .split('-')
      .slice(0, 2)
      .map((part) => part.slice(0, 3).toUpperCase())
      .join('');
  return `${prefix}-${String(index + 1).padStart(3, '0')}`;
}

function buildOptions(seed: ProductSeed): ProductOption[] {
  return (seed.options ?? []).map<ProductOption>((option) => ({
    id: option.id,
    name: option.name,
    nameBn: option.nameBn,
    display: option.display,
    values: option.values.map<ProductOptionValue>((value) => ({
      id: `${option.id}-${value.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      label: value.label,
      labelBn: value.labelBn,
      hex: value.hex,
      priceDelta: value.priceDelta,
    })),
  }));
}

/**
 * Builds the variant rows through the shared matrix generator, so the demo
 * catalogue and the admin product form can never disagree about how a set of
 * options becomes SKUs and stock.
 *
 * A product with no options still gets exactly one variant so cart and pricing
 * code never needs a special case.
 */
function buildVariants(seed: ProductSeed, options: ProductOption[], index: number): ProductVariant[] {
  const stockByValueId: Record<string, number> = {};

  for (const option of seed.options ?? []) {
    for (const value of option.values) {
      const valueId = `${option.id}-${value.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      // The scarcest selected value caps a combination, which is how real
      // inventory behaves: you cannot sell more than your smallest component.
      stockByValueId[valueId] = seed.outOfStock ? 0 : value.stock;
    }
  }

  return generateVariantMatrix({
    productId: seed.id,
    options,
    basePrice: seed.price,
    compareAtPrice: seed.compareAtPrice,
    stockByValueId,
    defaultStockPerValue: seed.outOfStock ? 0 : 20,
    defaultVariantStock: seed.outOfStock ? 0 : 24,
    skuPrefix: skuFor(seed, index),
  });
}

const REVIEW_TEMPLATES: Array<{ rating: 4 | 5 | 3; title: string; body: string }> = [
  {
    rating: 5,
    title: 'দামের তুলনায় দুর্দান্ত',
    body: 'পণ্যের মান প্রত্যাশার চেয়ে ভালো। প্যাকেজিং অনেক যত্নসহকারে করা ছিল, কোনো ক্ষতি হয়নি। ঢাকার ভেতরে একদিনেই পেয়েছি।',
  },
  {
    rating: 5,
    title: 'অরিজিনাল প্রোডাক্ট',
    body: 'ওয়ারেন্টি কার্ডসহ পেয়েছি। ব্যবহার করে দেখলাম সব ঠিকঠাক কাজ করছে। আবারও কিনব ইনশাআল্লাহ।',
  },
  {
    rating: 4,
    title: 'ভালো, তবে দাম একটু বেশি',
    body: 'কোয়ালিটি ভালো। শুধু দাম আরেকটু কম হলে আরাম লাগত। ডেলিভারি সময়মতো হয়েছে।',
  },
  {
    rating: 4,
    title: 'সন্তুষ্ট',
    body: 'ছবির সাথে মিল আছে। সাইজ ঠিকঠাক এসেছে। কাস্টমার সার্ভিসও দ্রুত রিপ্লাই দিয়েছে।',
  },
  {
    rating: 3,
    title: 'মাঝারি',
    body: 'পণ্য ঠিক আছে কিন্তু ডেলিভারি দুই দিন দেরি হয়েছে। প্যাকেজিং আরেকটু ভালো হলে ভালো হতো।',
  },
];

const REVIEWER_NAMES = [
  'রাকিব হাসান', 'সুমাইয়া আক্তার', 'ইমরান কবির', 'ফারজানা রহমান',
  'শাহীন আলম', 'মাহমুদা খাতুন', 'জুবায়ের আহমেদ', 'নাজমুল হোসেন',
];

function buildReviews(seed: ProductSeed, random: () => number): ProductReview[] {
  const count = 2 + Math.floor(random() * 2); // 2–3 written reviews
  return Array.from({ length: count }, (_, index) => {
    const template = REVIEW_TEMPLATES[Math.floor(random() * REVIEW_TEMPLATES.length)] ?? REVIEW_TEMPLATES[0]!;
    const authorName = REVIEWER_NAMES[Math.floor(random() * REVIEWER_NAMES.length)] ?? REVIEWER_NAMES[0]!;
    const daysAgo = 3 + Math.floor(random() * 120);

    return {
      id: `${seed.id}-rev-${index + 1}`,
      authorName,
      rating: template.rating,
      title: template.title,
      body: template.body,
      createdAt: new Date(MOCK_NOW.getTime() - daysAgo * 86_400_000).toISOString(),
      isVerifiedPurchase: random() > 0.25,
      helpfulCount: Math.floor(random() * 42),
      reply:
        index === 0 && seed.rating >= 4.5
          ? {
              body: 'ধন্যবাদ! আপনার মতামত আমাদের কাছে গুরুত্বপূর্ণ।',
              createdAt: new Date(MOCK_NOW.getTime() - (daysAgo - 1) * 86_400_000).toISOString(),
            }
          : undefined,
    };
  });
}

function buildImages(seed: ProductSeed): ProductImage[] {
  const size = seed.gallerySize ?? 4;
  return poolPhotos(seed.pool, size, { width: 900, height: 900 }).map((url, index) => ({
    id: `${seed.id}-img-${index + 1}`,
    url,
    alt: `${seed.titleBn ?? seed.title} — ছবি ${index + 1}`,
  }));
}

function buildSpecifications(seed: ProductSeed): ProductSpecification[] {
  return seed.specifications.map(([label, value]) => ({ label, value }));
}

/** Turns one seed row into a complete product record. */
export function buildProduct(seed: ProductSeed, index: number): Product {
  const random = seededRandom(seed.id);
  const options = buildOptions(seed);
  const variants = buildVariants(seed, options, index);
  const images = buildImages(seed);

  const createdAt = new Date(MOCK_NOW.getTime() - seed.daysAgo * 86_400_000).toISOString();

  // Price range, discount badge, total stock and stock status are all derived
  // from the variant rows by the shared rule engine — never hand-computed here.
  return recalculateProduct(
    {
    id: seed.id,
    slug: seed.slug,
    title: seed.title,
    titleBn: seed.titleBn,
    shortDescription: seed.shortDescription,
    description: seed.description,
    descriptionBn: seed.descriptionBn,
    categoryId: seed.categoryId,
    brandId: seed.brandId,
    sellerId: seed.sellerId,
    thumbnail: images[0]?.url ?? '',
    images,
    price: seed.price,
    compareAtPrice: seed.compareAtPrice,
    discountPercent: 0,
    rating: seed.rating,
    reviewCount: seed.reviewCount,
    reviews: buildReviews(seed, random),
    options,
    variants,
    specifications: buildSpecifications(seed),
    tags: seed.tags,
    badges: seed.badges,
    stockStatus: 'in-stock',
    stock: 0,
    sold: seed.sold,
    viewCount: seed.viewCount,
    warranty: seed.warranty,
    returnPolicyDays: seed.returnPolicyDays ?? 7,
    delivery: { ...DEFAULT_DELIVERY, ...seed.delivery },
    isFeatured: seed.flags?.isFeatured ?? false,
    isTrending: seed.flags?.isTrending ?? false,
    isBestSeller: seed.flags?.isBestSeller ?? false,
    isNewArrival: seed.flags?.isNewArrival ?? false,
    isFlashSale: seed.flags?.isFlashSale ?? false,
    flashSaleEndsAt: seed.flags?.isFlashSale
      ? new Date(MOCK_NOW.getTime() + (seed.flashSaleHours ?? 18) * 3_600_000).toISOString()
      : undefined,
    recommendationScore: seed.recommendationScore ?? Math.round(seed.rating * 12 + seed.sold / 250),
    status: 'active',
    createdAt,
    updatedAt: new Date(MOCK_NOW.getTime() - Math.floor(seed.daysAgo / 4) * 86_400_000).toISOString(),
    },
    MOCK_NOW,
  );
}
