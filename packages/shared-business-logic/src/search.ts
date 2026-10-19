import type {
  Brand,
  Category,
  Paginated,
  Product,
  ProductFilters,
  ProductSortKey,
  StockStatus,
} from '@shobdox/shared-types';
import { EMPTY_PRODUCT_FILTERS } from '@shobdox/shared-types';
import { matchesAnyField, percentOf, relevanceScore } from '@shobdox/shared-utils';
import { productDiscountPercent, productPriceRange } from './pricing';
import { isPurchasable } from './stock';

/**
 * Local search, filtering, sorting and pagination over the mock catalogue.
 * Both the website and the Android app call exactly these functions, so results
 * are identical on every platform.
 */

export interface ProductLookups {
  categories?: Category[];
  brands?: Brand[];
}

/** Everything a search can match against, flattened once per product. */
function searchableText(product: Product, lookups: ProductLookups): string {
  const category = lookups.categories?.find((item) => item.id === product.categoryId);
  const brand = lookups.brands?.find((item) => item.id === product.brandId);

  return [
    product.title,
    product.titleBn,
    product.shortDescription,
    product.slug,
    brand?.name,
    brand?.nameBn,
    category?.name,
    category?.nameBn,
    ...product.tags,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Free-text search with Bangla-aware token matching, ranked by relevance. */
export function searchProducts(
  products: Product[],
  query: string,
  lookups: ProductLookups = {},
): Product[] {
  const trimmed = query.trim();
  if (!trimmed) return [...products];

  return products
    .filter((product) => matchesAnyField(
      [
        product.title,
        product.titleBn,
        product.shortDescription,
        ...product.tags,
        lookups.brands?.find((brand) => brand.id === product.brandId)?.name,
        lookups.categories?.find((category) => category.id === product.categoryId)?.nameBn,
      ],
      trimmed,
    ))
    .map((product) => ({ product, score: relevanceScore(searchableText(product, lookups), trimmed) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product);
}

/** Effective price used for range filtering: the cheapest sellable variant. */
export function effectivePrice(product: Product): number {
  return productPriceRange(product).min;
}

export function filterProducts(
  products: Product[],
  filters: Partial<ProductFilters>,
): Product[] {
  const merged: ProductFilters = { ...EMPTY_PRODUCT_FILTERS, ...filters };

  return products.filter((product) => {
    if (product.status !== 'active') return false;

    if (merged.categoryIds.length > 0 && !merged.categoryIds.includes(product.categoryId)) return false;
    if (merged.brandIds.length > 0 && (!product.brandId || !merged.brandIds.includes(product.brandId))) return false;

    const price = effectivePrice(product);
    if (merged.minPrice !== undefined && price < merged.minPrice) return false;
    if (merged.maxPrice !== undefined && price > merged.maxPrice) return false;

    if (merged.minRating !== undefined && product.rating < merged.minRating) return false;
    if (merged.minDiscount !== undefined && productDiscountPercent(product) < merged.minDiscount) return false;

    if (merged.flashSaleOnly && !product.isFlashSale) return false;
    if (merged.inStockOnly && !isPurchasable(product)) return false;

    if (merged.tags.length > 0 && !merged.tags.some((tag) => product.tags.includes(tag))) return false;

    if (merged.query.trim() && matchesAnyField(
      [
        product.title,
        product.titleBn,
        product.shortDescription,
        ...product.tags,
        ...product.specifications.map((spec) => `${spec.label} ${spec.value}`),
      ],
      merged.query,
    ) === false) {
      return false;
    }

    return true;
  });
}

export function sortProducts(products: Product[], sort: ProductSortKey): Product[] {
  const byNewest = (a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  switch (sort) {
    case 'price-asc':
      return [...products].sort((a, b) => effectivePrice(a) - effectivePrice(b));
    case 'price-desc':
      return [...products].sort((a, b) => effectivePrice(b) - effectivePrice(a));
    case 'newest':
      return [...products].sort(byNewest);
    case 'popularity':
      return [...products].sort((a, b) => b.sold - a.sold || b.viewCount - a.viewCount);
    case 'rating':
      return [...products].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case 'discount':
      return [...products].sort(
        (a, b) => productDiscountPercent(b) - productDiscountPercent(a) || byNewest(a, b),
      );
    case 'relevance':
    default:
      return [...products].sort(
        (a, b) =>
          b.recommendationScore - a.recommendationScore ||
          b.sold - a.sold ||
          b.rating - a.rating,
      );
  }
}

/**
 * The full pipeline the shop and search screens use:
 * search -> filter -> sort -> paginate.
 */
export function runProductQuery(
  products: Product[],
  filters: Partial<ProductFilters>,
  lookups: ProductLookups = {},
  page = 1,
  pageSize = 12,
): Paginated<Product> {
  const merged: ProductFilters = { ...EMPTY_PRODUCT_FILTERS, ...filters };

  const searchPool = merged.query.trim() ? searchProducts(products, merged.query, lookups) : products;
  const filtered = filterProducts(searchPool, { ...merged, query: '' });
  const sorted = sortProducts(filtered, merged.sort);

  return paginate(sorted, page, pageSize);
}

export function paginate<T>(items: T[], page = 1, pageSize = 12): Paginated<T> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(items.length / safePageSize));
  const safePage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const start = (safePage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    total: items.length,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}

/** Widest price in the catalogue, used to seed the price range slider. */
export function priceBounds(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };
  const prices = products.map(effectivePrice);
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
}

export interface FacetBucket<T> {
  value: T;
  label: string;
  count: number;
  sharePercent: number;
}

export interface ProductFacets {
  categories: FacetBucket<string>[];
  brands: FacetBucket<string>[];
  ratings: FacetBucket<number>[];
  discounts: FacetBucket<number>[];
  stock: FacetBucket<StockStatus>[];
}

/**
 * Counts how many products fall into each filter bucket. Counts are computed
 * against the current query so the filter panel shows real, live numbers.
 */
export function computeFacets(
  products: Product[],
  query: string,
  lookups: ProductLookups = {},
): ProductFacets {
  const pool = query.trim() ? searchProducts(products, query, lookups) : products.filter((p) => p.status === 'active');
  const total = Math.max(1, pool.length);

  const makeBuckets = <T>(
    values: T[],
    labelOf: (value: T) => string,
    keyOf: (value: T) => string,
  ): FacetBucket<T>[] => {
    const counts = new Map<string, { value: T; count: number }>();
    for (const value of values) {
      const key = keyOf(value);
      const current = counts.get(key);
      if (current) current.count += 1;
      else counts.set(key, { value, count: 1 });
    }
    return Array.from(counts.values()).map(({ value, count }) => ({
      value,
      label: labelOf(value),
      count,
      sharePercent: percentOf(count, total),
    }));
  };

  const categoryBuckets = makeBuckets(
    pool.map((product) => product.categoryId),
    (id) => lookups.categories?.find((category) => category.id === id)?.nameBn ?? id,
    (id) => id,
  ).sort((a, b) => b.count - a.count);

  const brandBuckets = makeBuckets(
    pool.map((product) => product.brandId).filter((value): value is string => Boolean(value)),
    (id) => lookups.brands?.find((brand) => brand.id === id)?.name ?? id,
    (id) => id,
  ).sort((a, b) => b.count - a.count);

  const ratingBuckets = [4.5, 4, 3.5, 3]
    .map((threshold) => {
      const count = pool.filter((product) => product.rating >= threshold).length;
      return {
        value: threshold,
        label: `${threshold}★ ও বেশি`,
        count,
        sharePercent: percentOf(count, total),
      };
    })
    .filter((bucket) => bucket.count > 0);

  const discountBuckets = [10, 20, 30, 40]
    .map((threshold) => {
      const count = pool.filter((product) => productDiscountPercent(product) >= threshold).length;
      return {
        value: threshold,
        label: `${threshold}% বা বেশি ছাড়`,
        count,
        sharePercent: percentOf(count, total),
      };
    })
    .filter((bucket) => bucket.count > 0);

  const stockBuckets: FacetBucket<StockStatus>[] = (
    ['in-stock', 'low-stock', 'out-of-stock'] as StockStatus[]
  )
    .map((status) => {
      const count = pool.filter((product) => {
        const purchasable = isPurchasable(product);
        if (status === 'in-stock') return purchasable;
        if (status === 'out-of-stock') return !purchasable;
        return purchasable && product.variants.some((variant) => variant.stock > 0 && variant.stock <= 8);
      }).length;
      return {
        value: status,
        label: status === 'in-stock' ? 'স্টকে আছে' : status === 'low-stock' ? 'স্টক কম' : 'স্টক নেই',
        count,
        sharePercent: percentOf(count, total),
      };
    })
    .filter((bucket) => bucket.count > 0);

  return {
    categories: categoryBuckets,
    brands: brandBuckets,
    ratings: ratingBuckets,
    discounts: discountBuckets,
    stock: stockBuckets,
  };
}

/** Number of filters the shopper has actively set, for the "Filters (3)" chip. */
export function activeFilterCount(filters: Partial<ProductFilters>): number {
  const merged: ProductFilters = { ...EMPTY_PRODUCT_FILTERS, ...filters };
  let count = 0;
  if (merged.categoryIds.length > 0) count += 1;
  if (merged.brandIds.length > 0) count += 1;
  if (merged.minPrice !== undefined || merged.maxPrice !== undefined) count += 1;
  if (merged.minRating !== undefined) count += 1;
  if (merged.minDiscount !== undefined) count += 1;
  if (merged.inStockOnly) count += 1;
  if (merged.flashSaleOnly) count += 1;
  if (merged.tags.length > 0) count += 1;
  return count;
}

export function hasActiveFilters(filters: Partial<ProductFilters>): boolean {
  return activeFilterCount(filters) > 0;
}

/** Autocomplete suggestions for the header search field. */
export function suggestSearchTerms(
  products: Product[],
  query: string,
  lookups: ProductLookups = {},
  limit = 6,
): Array<{ type: 'product' | 'category' | 'brand'; label: string; href: string; image?: string }> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const suggestions: Array<{ type: 'product' | 'category' | 'brand'; label: string; href: string; image?: string }> = [];

  for (const category of lookups.categories ?? []) {
    if (matchesAnyField([category.name, category.nameBn], trimmed) && suggestions.length < limit) {
      suggestions.push({
        type: 'category',
        label: category.nameBn,
        href: `/category/${category.slug}`,
      });
    }
  }

  for (const brand of lookups.brands ?? []) {
    if (matchesAnyField([brand.name, brand.nameBn], trimmed) && suggestions.length < limit) {
      suggestions.push({ type: 'brand', label: brand.name, href: `/shop?brand=${brand.slug}` });
    }
  }

  for (const product of searchProducts(products, trimmed, lookups)) {
    if (suggestions.length >= limit) break;
    suggestions.push({
      type: 'product',
      label: product.titleBn ?? product.title,
      href: `/product/${product.slug}`,
      image: product.thumbnail,
    });
  }

  return suggestions.slice(0, limit);
}
