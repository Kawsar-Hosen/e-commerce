import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { Clock, Flame, Search, TrendingUp } from 'lucide-react';
import { runProductQuery } from '@shobdox/shared-business-logic';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { useBrands, useCategories, useProducts } from '@/hooks/useCatalog';
import { useDebouncedValue } from '@/hooks/useCommon';
import { useUiStore } from '@/store/ui.store';
import { Thumb } from '@/components/ui';
import { Price } from '@/components/ui/Display';
import { Chip } from '@/components/ui/Nav';

/**
 * Live search suggestions.
 *
 * Renders inside the header overlay on mobile and under the search box on
 * desktop. Matching uses the same `runProductQuery()` the results page uses, so
 * a suggestion is never something the shop page would fail to find.
 */

const POPULAR_SEARCHES = [
  'স্মার্টফোন',
  'শাড়ি',
  'হেডফোন',
  'রাইস কুকার',
  'স্নিকার',
  'ফ্রিজ',
  'বই',
];

export function SearchPanel({ query, onNavigate }: { query: string; onNavigate?: () => void }) {
  const navigate = useNavigate();
  const products = useProducts();
  const categories = useCategories();
  const brands = useBrands();
  const recentSearches = useUiStore((state) => state.recentSearches);
  const pushSearch = useUiStore((state) => state.pushSearch);
  const clearSearches = useUiStore((state) => state.clearSearches);
  const markViewed = useUiStore((state) => state.markViewed);

  const debounced = useDebouncedValue(query, 180);
  const trimmed = debounced.trim();

  const lookups = useMemo(() => ({ categories, brands }), [categories, brands]);

  const matches = useMemo(() => {
    if (trimmed.length < 2) return [];
    return runProductQuery(products, { query: trimmed }, lookups, 1, 6).items;
  }, [products, trimmed, lookups]);

  const matchedCategories = useMemo(() => {
    if (trimmed.length < 2) return [];
    const needle = trimmed.toLowerCase();
    return categories
      .filter((category) => category.nameBn.includes(trimmed) || category.name.toLowerCase().includes(needle))
      .slice(0, 4);
  }, [categories, trimmed]);

  const goToResults = () => {
    const term = trimmed;
    if (term.length > 0) pushSearch(term);
    onNavigate?.();
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
  };

  return (
    <div className="space-y-4">
      {trimmed.length < 2 ? (
        <>
          {recentSearches.length > 0 ? (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                  <Clock aria-hidden className="size-3.5" /> সাম্প্রতিক খোঁজ
                </h3>
                <button type="button" onClick={clearSearches} className="text-xs text-text-secondary hover:text-error">
                  মুছে ফেলুন
                </button>
              </div>

              <ul className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <li key={term}>
                    <Chip
                      onClick={() => {
                        pushSearch(term);
                        onNavigate?.();
                        navigate(`/shop?q=${encodeURIComponent(term)}`);
                      }}
                    >
                      {term}
                    </Chip>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
              <TrendingUp aria-hidden className="size-3.5" /> জনপ্রিয় খোঁজ
            </h3>
            <ul className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <li key={term}>
                  <Chip
                    onClick={() => {
                      pushSearch(term);
                      onNavigate?.();
                      navigate(`/shop?q=${encodeURIComponent(term)}`);
                    }}
                  >
                    {term}
                  </Chip>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
              <Flame aria-hidden className="size-3.5" /> ক্যাটাগরি
            </h3>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories
                .filter((category) => !category.parentId)
                .slice(0, 6)
                .map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/category/${category.slug}`}
                      onClick={onNavigate}
                      className="flex items-center justify-between rounded-input border border-border px-3 py-2 text-sm hover:border-primary"
                    >
                      <span className="truncate">{category.nameBn}</span>
                      <span className="font-num text-xs text-text-secondary">
                        {toBanglaDigits(category.productCount)}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        </>
      ) : (
        <>
          {matchedCategories.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {matchedCategories.map((category) => (
                <li key={category.id}>
                  <Chip
                    onClick={() => {
                      onNavigate?.();
                      navigate(`/category/${category.slug}`);
                    }}
                  >
                    {category.nameBn}
                  </Chip>
                </li>
              ))}
            </ul>
          ) : null}

          {matches.length > 0 ? (
            <ul className="divide-y divide-divider overflow-hidden rounded-card border border-border">
              {matches.map((product) => (
                <li key={product.id}>
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={() => {
                      pushSearch(trimmed);
                      markViewed(product.id);
                      onNavigate?.();
                    }}
                    className="flex items-center gap-3 p-2.5 hover:bg-surface-muted"
                  >
                    <Thumb src={product.thumbnail} alt={product.titleBn ?? product.title} label={product.title} className="size-11" />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm font-medium text-text-primary">
                        {product.titleBn ?? product.title}
                      </span>
                      <Price value={product.price} size="sm" className="mt-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-card border border-dashed border-border-strong px-4 py-6 text-center text-sm text-text-secondary">
              “{trimmed}” এর জন্য কিছু পাওয়া যায়নি। অন্যভাবে খুঁজে দেখুন।
            </p>
          )}

          <button
            type="button"
            onClick={goToResults}
            className="flex w-full items-center justify-center gap-2 rounded-button bg-primary-soft px-4 py-2.5 text-sm font-semibold text-primary-dark hover:bg-green-100"
          >
            <Search aria-hidden className="size-4" />
            “{trimmed}” এর সব ফলাফল দেখুন
          </button>
        </>
      )}
    </div>
  );
}
