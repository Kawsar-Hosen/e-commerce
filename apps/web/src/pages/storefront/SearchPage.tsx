import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Clock, Search, TrendingUp, X } from 'lucide-react';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { Alert, Breadcrumbs, Chip, EmptyState, PageHeader, SearchInput, SectionHeader } from '@/components/ui';
import { ProductGrid } from '@/features/catalog/ProductCard';
import { ProductListing } from '@/features/catalog/ProductListing';
import { useProductQuery } from '@/hooks/useProductQuery';
import { useCategories, useProducts, useTopLevelCategories } from '@/hooks/useCatalog';
import { trendingProducts } from '@shobdox/shared-business-logic';
import { useDebouncedValue } from '@/hooks/useCommon';
import { useUiStore } from '@/store/ui.store';

/**
 * Search.
 *
 * The query string is the single source of truth, so a result page is
 * shareable and the Back button walks through previous searches. Clearing the
 * box shows recent searches (persisted locally) and trending products instead
 * of a blank page.
 */

export default function SearchPage() {
  const navigate = useNavigate();
  const query = useProductQuery({ pageSize: 12 });
  const products = useProducts();
  const categories = useCategories();
  const topLevel = useTopLevelCategories();
  const recentSearches = useUiStore((state) => state.recentSearches);
  const clearSearches = useUiStore((state) => state.clearSearches);
  const pushSearch = useUiStore((state) => state.pushSearch);

  const [term, setTerm] = useState(query.parsed.query);
  const debounced = useDebouncedValue(term, 350);

  // Keep the input in sync when the URL changes (Back, header search, chips).
  useEffect(() => {
    setTerm(query.parsed.query);
  }, [query.parsed.query]);

  // Debounced input drives the URL — this is what makes typing feel instant
  // without rewriting history on every keystroke. Recent searches are recorded
  // on submit only, so a single query does not fill the list with prefixes.
  useEffect(() => {
    if (debounced === query.parsed.query) return;
    query.update({ q: debounced });
    // `query.update` is stable per query-string; re-running on every render
    // would loop, so the dependency list is intentionally narrow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const trending = useMemo(() => trendingProducts(products).slice(0, 8), [products]);
  const hasQuery = query.parsed.query.trim().length > 0;

  // Popular search chips come from the catalogue's own tags, so they always
  // lead to real results instead of a hardcoded list that can go stale.
  const popularTerms = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      for (const tag of product.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [products]);

  const suggestions = useMemo(() => {
    if (!hasQuery) return [];
    const needle = query.parsed.query.trim().toLowerCase();

    const categoryHits = categories
      .filter(
        (category) =>
          category.nameBn.includes(needle) ||
          category.name.toLowerCase().includes(needle) ||
          category.slug.includes(needle),
      )
      .slice(0, 4);

    return categoryHits.map((category) => ({
      label: category.nameBn,
      href: `/category/${category.slug}`,
    }));
  }, [categories, hasQuery, query.parsed.query]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="খোঁজ করুন"
        description="পণ্যের নাম, ব্র্যান্ড বা ক্যাটাগরি দিয়ে খুঁজুন। ডেমো ডেটার ভেতরেই সব অনুসন্ধান হয় — কোনো সার্ভারে কিছু পাঠানো হয় না।"
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'হোম', href: '/' },
              { label: 'খোঁজ' },
            ]}
          />
        }
      />

      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          query.update({ q: term });
          if (term.trim().length >= 2) pushSearch(term.trim());
        }}
        className="relative"
      >
        <SearchInput
          value={term}
          onValueChange={setTerm}
          placeholder="যেমন: ব্লুটুথ হেডফোন, শাড়ি, রাইস কুকার…"
          label="পণ্য খুঁজুন"
          className="[&_input]:h-12 [&_input]:text-lg"
        />

        {term.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setTerm('');
              query.update({ q: '' });
            }}
            aria-label="খোঁজা মুছে ফেলুন"
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-text-muted hover:bg-surface-muted"
          >
            <X aria-hidden className="size-4" />
          </button>
        ) : null}
      </form>

      {suggestions.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-2">
          <li className="text-xs font-medium text-text-muted">সম্ভাব্য ক্যাটাগরি:</li>
          {suggestions.map((suggestion) => (
            <li key={suggestion.href}>
              <Link
                to={suggestion.href}
                className="inline-flex items-center gap-1 rounded-chip border border-border bg-surface px-3 py-1.5 text-sm text-text-primary hover:border-primary hover:text-primary"
              >
                <Search aria-hidden className="size-3.5" />
                {suggestion.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {!hasQuery ? (
        <div className="space-y-6">
          {popularTerms.length > 0 ? (
            <section aria-labelledby="popular-searches">
              <h2
                id="popular-searches"
                className="mb-2 flex items-center gap-2 text-lg font-bold text-text-primary"
              >
                <TrendingUp aria-hidden className="size-4 text-text-muted" />
                জনপ্রিয় খোঁজ
              </h2>
              <ul className="flex flex-wrap gap-2">
                {popularTerms.map((tag) => (
                  <li key={tag}>
                    <Chip
                      onClick={() => {
                        setTerm(tag);
                        pushSearch(tag);
                      }}
                    >
                      #{tag}
                    </Chip>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {recentSearches.length > 0 ? (            <section aria-labelledby="recent-searches">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 id="recent-searches" className="flex items-center gap-2 text-lg font-bold text-text-primary">
                  <Clock aria-hidden className="size-4 text-text-muted" />
                  সাম্প্রতিক খোঁজ
                </h2>
                <button
                  type="button"
                  onClick={clearSearches}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  সব মুছুন
                </button>
              </div>

              <ul className="flex flex-wrap gap-2">
                {recentSearches.map((entry) => (
                  <li key={entry}>
                    <Chip
                      onClick={() => {
                        setTerm(entry);
                        pushSearch(entry);
                      }}
                    >
                      {entry}
                    </Chip>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="trending-searches">
            <div id="trending-searches">
              <SectionHeader
                title="এখন জনপ্রিয়"
                subtitle="ডেমো ডেটায় সর্বাধিক দেখা পণ্যগুলো"
                href="/shop?sort=popularity"
              />
            </div>
            <ProductGrid products={trending} priorityCount={2} />
          </section>

          <section aria-labelledby="browse-categories">
            <div id="browse-categories">
              <SectionHeader title="ক্যাটাগরি ধরে দেখুন" href="/categories" />
            </div>
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {topLevel.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 hover:border-primary"
                  >
                    <span aria-hidden className="text-2xl">
                      {category.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-text-primary">
                        {category.nameBn}
                      </span>
                      <span className="font-num text-xs text-text-muted">
                        {toBanglaDigits(category.productCount)}টি পণ্য
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : query.isEmpty ? (
        <EmptyState
          icon={<Search aria-hidden className="size-6" />}
          title={`“${query.parsed.query}” এর জন্য কিছু পাওয়া যায়নি`}
          description="বানান দেখে নিন, আরও সাধারণ শব্দ ব্যবহার করুন, বা ক্যাটাগরি ধরে দেখুন।"
          action={
            <>
              <Link
                to="/categories"
                className="inline-flex h-10 items-center rounded-button bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-dark"
              >
                ক্যাটাগরি দেখুন
              </Link>
              <button
                type="button"
                onClick={() => setTerm('')}
                className="inline-flex h-10 items-center rounded-button border border-border-strong px-4 text-sm font-medium hover:border-primary"
              >
                খোঁজা মুছে ফেলুন
              </button>
            </>
          }
        />
      ) : (
        <>
          <Alert tone="info" title="ফলাফল">
            “{query.parsed.query}” — {toBanglaDigits(query.result.total)}টি পণ্য পাওয়া গেছে।
            <span className="ml-1 inline-flex items-center gap-1 text-xs">
              <TrendingUp aria-hidden className="size-3" />
              রিলেভেন্স অনুযায়ী সাজানো
            </span>
          </Alert>
          <ProductListing
            query={query}
            emptyTitle="কোনো ফলাফল নেই"
            emptyDescription="অন্য শব্দ দিয়ে খুঁজে দেখুন।"
          />
        </>
      )}

      <p className="text-xs text-text-muted">
        টিপস: দাম, রেটিং ও স্টক ফিল্টার করে ফলাফল আরও নির্দিষ্ট করতে পারেন।{' '}
        <button type="button" onClick={() => navigate('/shop')} className="text-primary hover:underline">
          সব পণ্য দেখুন
        </button>
      </p>
    </div>
  );
}
