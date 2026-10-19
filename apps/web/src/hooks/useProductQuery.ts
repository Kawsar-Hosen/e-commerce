import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { Paginated, Product, ProductSortKey } from '@shobdox/shared-types';
import { computeFacets, priceBounds, runProductQuery } from '@shobdox/shared-business-logic';
import { useBrands, useCategories, useProducts } from './useCatalog';
import {
  applyShopParams,
  buildFilterChips,
  countActiveFilters,
  parseShopParams,
  toProductFilters,
  type ParsedShopParams,
} from '@/lib/filter-params';

/**
 * The shop / category / search query, kept in the URL.
 *
 * One hook powers every product listing surface so filtering behaves identically
 * on `/shop`, `/category/:slug`, `/search` and the admin catalogue table.
 */

export interface UseProductQueryOptions {
  pageSize?: number;
  /** Extra filter the page forces, e.g. a category page locking its own id. */
  lockedCategorySlugs?: string[];
}

export function useProductQuery({ pageSize = 12, lockedCategorySlugs }: UseProductQueryOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useProducts();
  const categories = useCategories();
  const brands = useBrands();

  const parsed: ParsedShopParams = useMemo(() => {
    const base = parseShopParams(searchParams);
    return lockedCategorySlugs && lockedCategorySlugs.length > 0
      ? { ...base, categorySlugs: [...new Set([...lockedCategorySlugs, ...base.categorySlugs])] }
      : base;
  }, [searchParams, lockedCategorySlugs]);

  const lookups = useMemo(() => ({ categories, brands }), [categories, brands]);
  const filters = useMemo(() => toProductFilters(parsed, lookups), [parsed, lookups]);

  const result: Paginated<Product> = useMemo(
    () => runProductQuery(products, filters, lookups, parsed.page, parsed.pageSize ?? pageSize),
    [products, filters, lookups, parsed.page, parsed.pageSize, pageSize],
  );

  const facets = useMemo(
    () => computeFacets(products, parsed.query, lookups),
    [products, parsed.query, lookups],
  );

  const bounds = useMemo(() => priceBounds(products), [products]);

  const update = useCallback(
    (patch: Parameters<typeof applyShopParams>[1]) => {
      setSearchParams(applyShopParams(searchParams, patch), { replace: false });
    },
    [searchParams, setSearchParams],
  );

  const toggleCategory = useCallback(
    (slug: string) => {
      const next = parsed.categorySlugs.includes(slug)
        ? parsed.categorySlugs.filter((value) => value !== slug)
        : [...parsed.categorySlugs, slug];
      update({ cat: next });
    },
    [parsed.categorySlugs, update],
  );

  const toggleBrand = useCallback(
    (slug: string) => {
      const next = parsed.brandSlugs.includes(slug)
        ? parsed.brandSlugs.filter((value) => value !== slug)
        : [...parsed.brandSlugs, slug];
      update({ brand: next });
    },
    [parsed.brandSlugs, update],
  );

  const setSort = useCallback((sort: ProductSortKey) => update({ sort }), [update]);

  const setPage = useCallback((page: number) => update({ page }), [update]);

  const reset = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: false });
  }, [setSearchParams]);

  const chips = useMemo(() => buildFilterChips(parsed, lookups), [parsed, lookups]);
  const activeCount = useMemo(() => countActiveFilters(parsed), [parsed]);

  return {
    parsed,
    filters,
    result,
    facets,
    bounds,
    chips,
    activeCount,
    page: result.page,
    totalPages: result.totalPages,
    update,
    toggleCategory,
    toggleBrand,
    setSort,
    setPage,
    reset,
    isEmpty: result.total === 0,
  };
}

export type ProductQueryState = ReturnType<typeof useProductQuery>;
