import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ArrowUpDown, Funnel, Search } from 'lucide-react-native';
import type { ProductFilters, ProductSortKey } from '@shobdox/shared-types';
import { EMPTY_PRODUCT_FILTERS, PRODUCT_SORT_LABELS } from '@shobdox/shared-types';
import { activeFilterCount, computeFacets, priceBounds, runProductQuery } from '@shobdox/shared-business-logic';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { DEFAULT_PAGE_SIZE } from '../src/lib/constants';
import { useDebouncedValue } from '../src/hooks/useDebouncedValue';
import { useTheme } from '../src/hooks/useTheme';
import { useBrands, useCategories, useProducts } from '../src/hooks/useProducts';
import { useUiStore } from '../src/store/ui.store';
import { track } from '../src/services/analytics.service';
import { FilterSheet } from '../src/components/catalog/FilterSheet';
import { SearchBar } from '../src/components/catalog/SearchBar';
import { SortSheet } from '../src/components/catalog/SortSheet';
import {
  Button,
  Chip,
  EmptyState,
  ProductGrid,
  Screen,
  Text,
} from '../src/components/ui';

/**
 * Search and listing.
 *
 * The screen is a thin shell around `runProductQuery()`: typing is debounced,
 * filters and sort come from the shared pipeline, and facets are counted against
 * the current query so the filter sheet shows live numbers.
 *
 * Query params (used by deep links and the home rails): `q`, `brand`,
 * `category`, `sort`, `flashSale`.
 */

export default function SearchScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{
    q?: string;
    brand?: string;
    category?: string;
    sort?: string;
    flashSale?: string;
  }>();

  const products = useProducts();
  const categories = useCategories();
  const brands = useBrands();

  const recentSearches = useUiStore((state) => state.recentSearches);
  const rememberSearch = useUiStore((state) => state.rememberSearch);
  const forgetSearch = useUiStore((state) => state.forgetSearch);
  const clearRecentSearches = useUiStore((state) => state.clearRecentSearches);

  const [term, setTerm] = useState(params.q ?? '');
  const [sort, setSort] = useState<ProductSortKey>((params.sort as ProductSortKey) ?? 'relevance');
  const [filters, setFilters] = useState<ProductFilters>(() => ({
    ...EMPTY_PRODUCT_FILTERS,
    flashSaleOnly: params.flashSale === 'true',
    brandIds: brands.filter((brand) => brand.slug === params.brand).map((brand) => brand.id),
    categoryIds: [],
  }));
  const [visible, setVisible] = useState(DEFAULT_PAGE_SIZE);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const debouncedTerm = useDebouncedValue(term, 300);

  // A category deep link is resolved against the live category list.
  useEffect(() => {
    if (!params.category) return;
    const match = categories.find((category) => category.slug === params.category);
    if (!match) return;
    setFilters((current) => ({ ...current, categoryIds: [match.id] }));
  }, [categories, params.category]);

  const query: ProductFilters = useMemo(
    () => ({ ...filters, query: debouncedTerm, sort }),
    [debouncedTerm, filters, sort],
  );

  const lookups = useMemo(() => ({ categories, brands }), [brands, categories]);

  const result = useMemo(
    () => runProductQuery(products, query, lookups, 1, Math.max(products.length, DEFAULT_PAGE_SIZE)),
    [lookups, products, query],
  );

  const facets = useMemo(() => computeFacets(products, debouncedTerm, lookups), [debouncedTerm, lookups, products]);
  const bounds = useMemo(() => priceBounds(products), [products]);

  const shown = useMemo(() => result.items.slice(0, visible), [result.items, visible]);

  // A new query always starts from the first page.
  useEffect(() => setVisible(DEFAULT_PAGE_SIZE), [query]);

  const submitTerm = useCallback(() => {
    const cleaned = term.trim();
    if (cleaned.length === 0) return;
    rememberSearch(cleaned);
    track('search', { term: cleaned });
  }, [rememberSearch, term]);

  const filterCount = activeFilterCount(filters);
  const hasMore = shown.length < result.items.length;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: theme.space[4], gap: theme.space[4], paddingBottom: theme.space[8] }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBar
          value={term}
          onChangeText={setTerm}
          onSubmit={submitTerm}
          recentSearches={recentSearches}
          onPickRecent={(value) => {
            setTerm(value);
            rememberSearch(value);
          }}
          onForgetRecent={forgetSearch}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
          <View style={{ flex: 1, flexDirection: 'row', gap: theme.space[2], flexWrap: 'wrap' }}>
            <Chip
              icon={<Funnel size={14} color={theme.colors.primary} />}
              label={filterCount > 0 ? `ফিল্টার (${toBanglaDigits(filterCount)})` : 'ফিল্টার'}
              selected={filterCount > 0}
              onPress={() => setFilterOpen(true)}
              accessibilityLabel="ফিল্টার খুলুন"
            />
            <Chip
              icon={<ArrowUpDown size={14} color={theme.colors.primary} />}
              label={PRODUCT_SORT_LABELS[sort]}
              onPress={() => setSortOpen(true)}
              accessibilityLabel="সাজানোর ধরন বদলান"
            />
          </View>
        </View>

        <Text variant="caption" tone="secondary" accessibilityLiveRegion="polite">
          {`${toBanglaDigits(result.total)}টি পণ্য পাওয়া গেছে`}
          {debouncedTerm ? ` — "${debouncedTerm}"` : ''}
        </Text>

        {recentSearches.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            label="সাম্প্রতিক খোঁজ মুছুন"
            accessibilityLabel="সাম্প্রতিক খোঁজের তালিকা মুছুন"
            onPress={clearRecentSearches}
          />
        ) : null}

        <ProductGrid
          products={shown}
          onEndReached={() => (hasMore ? setVisible((current) => current + DEFAULT_PAGE_SIZE) : undefined)}
          ListEmptyComponent={
            <EmptyState
              icon={<Search size={28} color={theme.colors.primary} />}
              title="কিছু পাওয়া যায়নি"
              description="শব্দ বা ফিল্টার বদলে আবার চেষ্টা করুন — অথবা সব পণ্য দেখুন।"
              actionLabel="ফিল্টার রিসেট করুন"
              onAction={() => {
                setFilters({ ...EMPTY_PRODUCT_FILTERS });
                setTerm('');
              }}
            />
          }
          ListFooterComponent={
            hasMore ? (
              <View style={{ padding: theme.space[4] }}>
                <Button
                  fullWidth
                  variant="outline"
                  label={`আরও ${toBanglaDigits(DEFAULT_PAGE_SIZE)}টি পণ্য`}
                  accessibilityLabel="আরও পণ্য লোড করুন"
                  onPress={() => setVisible((current) => current + DEFAULT_PAGE_SIZE)}
                />
              </View>
            ) : undefined
          }
        />
      </ScrollView>

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        facets={facets}
        bounds={bounds}
        onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
        onReset={() => setFilters({ ...EMPTY_PRODUCT_FILTERS, query: filters.query, sort: filters.sort })}
      />

      <SortSheet visible={sortOpen} onClose={() => setSortOpen(false)} value={sort} onChange={setSort} />
    </Screen>
  );
}
