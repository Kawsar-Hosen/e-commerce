import type { Brand, Category, ProductFilters, ProductSortKey } from '@shobdox/shared-types';
import { EMPTY_PRODUCT_FILTERS } from '@shobdox/shared-types';
import { activeFilterCount } from '@shobdox/shared-business-logic';

/**
 * URL <-> filter-state conversion.
 *
 * Filters live in the query string so a filtered shop page can be shared,
 * bookmarked and restored by Back — and so the same parser serves the shop, the
 * category page, the search page and the admin product table.
 */

export interface ParsedShopParams {
  query: string;
  categorySlugs: string[];
  brandSlugs: string[];
  tags: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minDiscount?: number;
  inStockOnly: boolean;
  flashSaleOnly: boolean;
  sort: ProductSortKey;
  page: number;
  /** Page size override used by the admin table. */
  pageSize?: number;
}

const SORT_KEYS: ProductSortKey[] = [
  'relevance',
  'price-asc',
  'price-desc',
  'newest',
  'popularity',
  'rating',
  'discount',
];

function numberParam(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function listParam(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseShopParams(params: URLSearchParams): ParsedShopParams {
  const sortParam = params.get('sort') as ProductSortKey | null;

  return {
    query: params.get('q')?.trim() ?? '',
    categorySlugs: listParam(params.get('cat')),
    brandSlugs: listParam(params.get('brand')),
    tags: listParam(params.get('tag')),
    minPrice: numberParam(params.get('min')),
    maxPrice: numberParam(params.get('max')),
    minRating: numberParam(params.get('rating')),
    minDiscount: numberParam(params.get('discount')),
    inStockOnly: params.get('stock') === '1',
    flashSaleOnly: params.get('flash') === '1',
    sort: sortParam && SORT_KEYS.includes(sortParam) ? sortParam : 'relevance',
    page: Math.max(1, numberParam(params.get('page')) ?? 1),
    pageSize: numberParam(params.get('pageSize')),
  };
}

/** Maps the URL state onto the shared filter object the query pipeline expects. */
export function toProductFilters(
  parsed: ParsedShopParams,
  lookups: { categories?: Category[]; brands?: Brand[] } = {},
): Partial<ProductFilters> {
  const categoryIds = parsed.categorySlugs.flatMap((slug) => {
    const category = lookups.categories?.find((candidate) => candidate.slug === slug);
    if (!category) return [];
    // A parent category includes its children so "Fashion" lists everything.
    const children = lookups.categories?.filter((candidate) => candidate.parentId === category.id) ?? [];
    return [category.id, ...children.map((child) => child.id)];
  });

  const brandIds = parsed.brandSlugs.flatMap((slug) => {
    const brand = lookups.brands?.find((candidate) => candidate.slug === slug);
    return brand ? [brand.id] : [];
  });

  return {
    query: parsed.query,
    categoryIds,
    brandIds,
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    minRating: parsed.minRating,
    minDiscount: parsed.minDiscount,
    inStockOnly: parsed.inStockOnly,
    flashSaleOnly: parsed.flashSaleOnly,
    tags: parsed.tags,
    sort: parsed.sort,
  };
}

/** Applies a patch to the current query string, dropping empty values. */
export function applyShopParams(
  current: URLSearchParams,
  patch: Partial<{
    q: string;
    cat: string[];
    brand: string[];
    tag: string[];
    min: number | undefined;
    max: number | undefined;
    rating: number | undefined;
    discount: number | undefined;
    stock: boolean;
    flash: boolean;
    sort: ProductSortKey;
    page: number;
  }>,
): URLSearchParams {
  const next = new URLSearchParams(current);

  const setOrDelete = (key: string, value: string | undefined) => {
    if (!value) next.delete(key);
    else next.set(key, value);
  };

  if (patch.q !== undefined) setOrDelete('q', patch.q.trim() || undefined);
  if (patch.cat !== undefined) setOrDelete('cat', patch.cat.join(',') || undefined);
  if (patch.brand !== undefined) setOrDelete('brand', patch.brand.join(',') || undefined);
  if (patch.tag !== undefined) setOrDelete('tag', patch.tag.join(',') || undefined);
  if (patch.min !== undefined) setOrDelete('min', patch.min ? String(patch.min) : undefined);
  if (patch.max !== undefined) setOrDelete('max', patch.max ? String(patch.max) : undefined);
  if (patch.rating !== undefined) setOrDelete('rating', patch.rating ? String(patch.rating) : undefined);
  if (patch.discount !== undefined) setOrDelete('discount', patch.discount ? String(patch.discount) : undefined);
  if (patch.stock !== undefined) setOrDelete('stock', patch.stock ? '1' : undefined);
  if (patch.flash !== undefined) setOrDelete('flash', patch.flash ? '1' : undefined);
  if (patch.sort !== undefined) setOrDelete('sort', patch.sort === 'relevance' ? undefined : patch.sort);

  // Any filter change resets pagination unless the caller is paging.
  if (patch.page !== undefined) setOrDelete('page', patch.page > 1 ? String(patch.page) : undefined);
  else if (Object.keys(patch).length > 0) next.delete('page');

  return next;
}

export interface FilterChip {
  id: string;
  label: string;
  remove: () => Partial<{ q: string; cat: string[]; brand: string[]; tag: string[]; min: number; max: number; rating: number; discount: number; stock: boolean; flash: boolean }>;
}

/** Human-readable chips for the active filter row. */
export function buildFilterChips(
  parsed: ParsedShopParams,
  lookups: { categories?: Category[]; brands?: Brand[] } = {},
): FilterChip[] {
  const chips: FilterChip[] = [];

  if (parsed.query) {
    chips.push({ id: 'q', label: `“${parsed.query}”`, remove: () => ({ q: '' }) });
  }

  for (const slug of parsed.categorySlugs) {
    const category = lookups.categories?.find((candidate) => candidate.slug === slug);
    chips.push({
      id: `cat-${slug}`,
      label: category?.nameBn ?? slug,
      remove: () => ({ cat: parsed.categorySlugs.filter((value) => value !== slug) }),
    });
  }

  for (const slug of parsed.brandSlugs) {
    const brand = lookups.brands?.find((candidate) => candidate.slug === slug);
    chips.push({
      id: `brand-${slug}`,
      label: brand?.name ?? slug,
      remove: () => ({ brand: parsed.brandSlugs.filter((value) => value !== slug) }),
    });
  }

  if (parsed.minPrice !== undefined || parsed.maxPrice !== undefined) {
    chips.push({
      id: 'price',
      label: `৳ ${parsed.minPrice ?? 0} – ${parsed.maxPrice ?? '∞'}`,
      remove: () => ({ min: 0, max: 0 }),
    });
  }

  if (parsed.minRating !== undefined) {
    chips.push({ id: 'rating', label: `${parsed.minRating}★ ও বেশি`, remove: () => ({ rating: 0 }) });
  }

  if (parsed.minDiscount !== undefined) {
    chips.push({ id: 'discount', label: `${parsed.minDiscount}%+ ছাড়`, remove: () => ({ discount: 0 }) });
  }

  if (parsed.inStockOnly) {
    chips.push({ id: 'stock', label: 'স্টকে আছে', remove: () => ({ stock: false }) });
  }

  if (parsed.flashSaleOnly) {
    chips.push({ id: 'flash', label: 'ফ্ল্যাশ সেল', remove: () => ({ flash: false }) });
  }

  for (const tag of parsed.tags) {
    chips.push({
      id: `tag-${tag}`,
      label: `#${tag}`,
      remove: () => ({ tag: parsed.tags.filter((value) => value !== tag) }),
    });
  }

  return chips;
}

/** Number of active filters, for the "ফিল্টার (৩)" button label. */
export function countActiveFilters(parsed: ParsedShopParams): number {
  const filters: Partial<ProductFilters> = {
    ...EMPTY_PRODUCT_FILTERS,
    categoryIds: parsed.categorySlugs,
    brandIds: parsed.brandSlugs,
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    minRating: parsed.minRating,
    minDiscount: parsed.minDiscount,
    inStockOnly: parsed.inStockOnly,
    flashSaleOnly: parsed.flashSaleOnly,
    tags: parsed.tags,
  };
  return activeFilterCount(filters);
}
