import type {
  Banner,
  Category,
  Coupon,
  Product,
  ProductImage,
  ProductOption,
  ProductReview,
  ProductVariant,
  ProductBadge,
} from '@shobdox/shared-types';
import {
  emptyProductDraft,
  generateVariantMatrix,
  normaliseOptions,
  recalculateProduct,
} from '@shobdox/shared-business-logic';
import { slugify } from '@shobdox/shared-utils';
import type {
  BannerFormValues,
  CategoryFormValues,
  CouponFormParsed,
  CouponFormValues,
  ProductFormParsed,
  ProductFormValues,
} from '@shobdox/shared-validation';
import { useDataStore } from '@/store/data.store';

/**
 * Form <-> entity conversion for the admin and seller dashboards.
 *
 * Keeping the mapping in one place means the "add product" screen, the "edit
 * product" screen and the seller equivalents all write the same domain shape,
 * and `recalculateProduct()` is the only thing allowed to derive prices, stock
 * totals and stock status.
 */

/** Form fields store optional copy as `''` so inputs stay controlled. */
const text = (value?: string): string => value ?? '';

const DAY = 86_400_000;
const isoDateOnly = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

function uniqueSlug(base: string, taken: string[]): string {
  const slug = slugify(base) || 'product';
  if (!taken.includes(slug)) return slug;
  let index = 2;
  while (taken.includes(`${slug}-${index}`)) index += 1;
  return `${slug}-${index}`;
}

/** Regenerates the variant matrix after the option editor changes. */
export function regenerateVariants(
  options: ProductFormValues['options'],
  values: {
    id: string;
    price: number;
    compareAtPrice?: number;
    skuPrefix: string;
    previous?: ProductVariant[];
  },
): ProductVariant[] {
  const normalised = normaliseOptions(
    (options ?? []).map((option) => ({
      id: option.id,
      name: option.name,
      display: option.display,
      values: option.values.map((value) => ({
        label: value.label,
        labelBn: value.labelBn,
        hex: value.hex,
        priceDelta: value.priceDelta,
      })),
    })),
  );

  const stockByValueId: Record<string, number> = {};
  (options ?? []).forEach((option) => {
    option.values.forEach((value) => {
      const id = `${option.id}-${value.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      stockByValueId[id] = value.stock;
    });
  });

  const generated = generateVariantMatrix({
    productId: values.id,
    options: normalised,
    basePrice: values.price,
    compareAtPrice: values.compareAtPrice,
    stockByValueId,
    defaultStockPerValue: 12,
    defaultVariantStock: 24,
    skuPrefix: values.skuPrefix,
  });

  // Preserve a hand-edited SKU when the same combination still exists.
  if (!values.previous) return generated;

  return generated.map((variant) => {
    const match = values.previous?.find(
      (previous) =>
        previous.optionValues[Object.keys(variant.optionValues)[0] ?? ''] ===
          variant.optionValues[Object.keys(variant.optionValues)[0] ?? ''] &&
        previous.id === variant.id,
    );
    return match ? { ...variant, sku: match.sku, stock: match.stock } : variant;
  });
}

export function emptyProductFormValues(sellerId: string, categoryId?: string): ProductFormValues {
  const draft = emptyProductDraft({ sellerId, categoryId: categoryId ?? '' });

  return {
    title: '',
    titleBn: '',
    slug: '',
    shortDescription: '',
    description: '',
    descriptionBn: '',
    categoryId: categoryId ?? '',
    brandId: undefined,
    sellerId,
    thumbnail: '',
    gallery: [],
    price: draft.price,
    compareAtPrice: undefined,
    stock: 0,
    sku: 'SDX-NEW-001',
    warranty: '',
    returnPolicyDays: 7,
    tags: [],
    badges: [],
    status: 'draft',
    isFeatured: false,
    isTrending: false,
    isBestSeller: false,
    isNewArrival: true,
    isFlashSale: false,
    deliveryFeeInsideDhaka: 60,
    deliveryFeeOutsideDhaka: 120,
    options: [],
    variants: draft.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      optionValues: variant.optionValues,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      stock: variant.stock,
    })),
    specifications: [],
  };
}

export function productToFormValues(product: Product): ProductFormValues {
  return {
    title: product.title,
    titleBn: text(product.titleBn),
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    descriptionBn: text(product.descriptionBn),
    categoryId: product.categoryId,
    brandId: product.brandId,
    sellerId: product.sellerId,
    thumbnail: product.thumbnail,
    gallery: product.images.slice(1).map((image) => image.url),
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    sku: product.variants[0]?.sku ?? 'SDX-001',
    warranty: text(product.warranty),
    returnPolicyDays: product.returnPolicyDays,
    tags: product.tags,
    badges: product.badges,
    status: product.status,
    isFeatured: product.isFeatured,
    isTrending: product.isTrending,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    isFlashSale: product.isFlashSale,
    deliveryFeeInsideDhaka: product.delivery.deliveryFeeInsideDhaka,
    deliveryFeeOutsideDhaka: product.delivery.deliveryFeeOutsideDhaka,
    options: product.options.map((option) => ({
      id: option.id,
      name: option.name,
      display: option.display,
      values: option.values.map((value) => ({
        id: value.id,
        label: value.label,
        labelBn: text(value.labelBn),
        hex: value.hex,
        priceDelta: value.priceDelta,
        stock: product.variants.find((variant) => variant.optionValues[option.id] === value.id)?.stock ?? 0,
      })),
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      optionValues: variant.optionValues,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      stock: variant.stock,
    })),
    specifications: product.specifications.map((spec) => ({ label: spec.label, value: spec.value })),
  };
}

export interface ProductFromFormContext {
  existing?: Product;
  sellerId: string;
}

/** Builds the `Product` record that gets written into demo state. */
export function productFromFormValues(values: ProductFormParsed, context: ProductFromFormContext): Product {
  const products = useDataStore.getState().products;
  const existing = context.existing;
  const id = existing?.id ?? `p-admin-${Date.now().toString(36)}`;

  const takenSlugs = products.filter((product) => product.id !== id).map((product) => product.slug);
  const slug = uniqueSlug(values.slug || values.title, takenSlugs);

  const galleryUrls = [values.thumbnail, ...(values.gallery ?? [])].filter(Boolean);
  const images: ProductImage[] = galleryUrls.map((url, index) => ({
    id: `${id}-img-${index + 1}`,
    url,
    alt: `${values.titleBn ?? values.title} — ছবি ${index + 1}`,
  }));

  const options: ProductOption[] = normaliseOptions(
    (values.options ?? []).map((option) => ({
      id: option.id,
      name: option.name,
      display: option.display,
      values: option.values.map((value) => ({
        label: value.label,
        labelBn: value.labelBn,
        hex: value.hex,
        priceDelta: value.priceDelta,
      })),
    })),
  );

  const variants: ProductVariant[] = (values.variants ?? []).map((variant, index) => ({
    id: variant.id || `${id}-v${index + 1}`,
    sku: variant.sku,
    optionValues: variant.optionValues,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    stock: variant.stock,
    image: images[0]?.url,
  }));

  const reviews: ProductReview[] = existing?.reviews ?? [];
  const now = new Date().toISOString();

  return recalculateProduct({
    id,
    slug,
    title: values.title,
    titleBn: values.titleBn,
    shortDescription: values.shortDescription,
    description: values.description,
    descriptionBn: values.descriptionBn,
    categoryId: values.categoryId,
    brandId: values.brandId,
    sellerId: values.sellerId || context.sellerId,
    thumbnail: images[0]?.url ?? '',
    images,
    price: values.price,
    compareAtPrice: values.compareAtPrice,
    discountPercent: 0,
    rating: existing?.rating ?? 0,
    reviewCount: existing?.reviewCount ?? 0,
    reviews,
    options,
    variants: variants.length > 0 ? variants : (existing?.variants ?? []),
    specifications: values.specifications ?? [],
    tags: values.tags ?? [],
    badges: (values.badges ?? []) as ProductBadge[],
    stockStatus: 'in-stock',
    stock: 0,
    sold: existing?.sold ?? 0,
    viewCount: existing?.viewCount ?? 0,
    warranty: values.warranty,
    returnPolicyDays: values.returnPolicyDays ?? 7,
    delivery: {
      insideDhaka: existing?.delivery.insideDhaka ?? { min: 1, max: 3 },
      outsideDhaka: existing?.delivery.outsideDhaka ?? { min: 3, max: 5 },
      deliveryFeeInsideDhaka: values.deliveryFeeInsideDhaka ?? 60,
      deliveryFeeOutsideDhaka: values.deliveryFeeOutsideDhaka ?? 120,
      cashOnDeliveryAvailable: true,
    },
    isFeatured: values.isFeatured ?? false,
    isTrending: values.isTrending ?? false,
    isBestSeller: values.isBestSeller ?? false,
    isNewArrival: values.isNewArrival ?? true,
    isFlashSale: values.isFlashSale ?? false,
    flashSaleEndsAt: values.isFlashSale
      ? (existing?.flashSaleEndsAt ?? new Date(Date.now() + 24 * 3_600_000).toISOString())
      : undefined,
    recommendationScore: existing?.recommendationScore ?? Math.round((values.price ?? 0) / 500),
    status: values.status,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });
}

/* ------------------------------------------------------------------ coupons */

export function couponToFormValues(coupon: Coupon): CouponFormValues {
  return {
    code: coupon.code,
    title: coupon.title,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value,
    maxDiscount: coupon.maxDiscount,
    minOrderValue: coupon.minOrderValue,
    usageLimit: coupon.usageLimit,
    usageLimitPerCustomer: coupon.usageLimitPerCustomer,
    startsAt: coupon.startsAt.slice(0, 10),
    expiresAt: coupon.expiresAt.slice(0, 10),
    isActive: coupon.isActive,
    categoryIds: coupon.categoryIds,
  };
}

export function couponFromFormValues(values: CouponFormParsed, existing?: Coupon): Coupon {
  return {
    id: existing?.id ?? `cpn-${values.code.toLowerCase()}-${Date.now().toString(36).slice(0, 4)}`,
    code: values.code,
    title: values.title,
    titleBn: existing?.titleBn ?? values.title,
    description: values.description,
    type: values.type,
    value: values.value,
    maxDiscount: values.maxDiscount,
    minOrderValue: values.minOrderValue,
    categoryIds: values.categoryIds ?? [],
    productIds: existing?.productIds ?? [],
    usageLimit: values.usageLimit,
    usedCount: existing?.usedCount ?? 0,
    usageLimitPerCustomer: values.usageLimitPerCustomer,
    startsAt: isoDateOnly(values.startsAt),
    expiresAt: isoDateOnly(values.expiresAt),
    isActive: values.isActive ?? true,
    isDemo: true,
  };
}

/* ------------------------------------------------------------------ banners */

export function bannerToFormValues(banner: Banner): BannerFormValues {
  return {
    title: banner.title,
    subtitle: banner.subtitle,
    ctaLabel: banner.ctaLabel,
    href: banner.href,
    theme: banner.theme,
    placement: banner.placement,
    displayOrder: banner.displayOrder,
    isActive: banner.isActive,
    startsAt: banner.startsAt.slice(0, 10),
    endsAt: banner.endsAt.slice(0, 10),
  };
}

export function bannerFromFormValues(values: BannerFormValues, existing?: Banner): Banner {
  return {
    id: existing?.id ?? `bn-${Date.now().toString(36)}`,
    title: values.title,
    subtitle: values.subtitle,
    ctaLabel: values.ctaLabel,
    href: values.href,
    image: existing?.image,
    theme: values.theme,
    placement: values.placement,
    displayOrder: values.displayOrder,
    isActive: values.isActive ?? true,
    startsAt: isoDateOnly(values.startsAt),
    endsAt: isoDateOnly(values.endsAt),
  };
}

/* --------------------------------------------------------------- categories */

export function categoryToFormValues(category: Category): CategoryFormValues {
  return {
    name: category.name,
    nameBn: category.nameBn,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    accent: category.accent,
    parentId: category.parentId,
    isFeatured: category.isFeatured,
    displayOrder: category.displayOrder,
  };
}

export function categoryFromFormValues(values: CategoryFormValues, existing?: Category): Category {
  return {
    id: existing?.id ?? `cat-${values.slug}`,
    slug: values.slug,
    name: values.name,
    nameBn: values.nameBn,
    description: values.description,
    icon: values.icon,
    accent: values.accent,
    image: existing?.image,
    parentId: values.parentId || undefined,
    productCount: existing?.productCount ?? 0,
    isFeatured: values.isFeatured ?? false,
    displayOrder: values.displayOrder,
  };
}

/** Dates used by the "flash sale ends in" helper in the dashboards. */
export function flashSaleWindow(hours: number): string {
  return new Date(Date.now() + hours * 3_600_000).toISOString();
}

export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY).toISOString();
}
