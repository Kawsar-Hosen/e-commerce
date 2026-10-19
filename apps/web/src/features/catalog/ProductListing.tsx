import { useState } from 'react';
import { PackageSearch, SlidersHorizontal } from 'lucide-react';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { Button, Chip, Drawer, EmptyState, Pagination } from '@/components/ui';
import { ProductGrid } from './ProductCard';
import { FilterPanel, SortSelect } from './FilterPanel';
import type { ProductQueryState } from '@/hooks/useProductQuery';

/**
 * The shared product-listing surface: filter sidebar (desktop), filter sheet
 * (mobile), sort control, active-filter chips, grid, pagination and empty state.
 *
 * /shop, /search and /category/:slug all render this, so a filter behaves the
 * same everywhere and there is exactly one empty state to keep honest.
 */

export function ProductListing({
  query,
  emptyTitle = 'কোনো পণ্য পাওয়া যায়নি',
  emptyDescription = 'ফিল্টার বা খোঁজা শব্দ বদলে আবার চেষ্টা করুন।',
  priorityCount = 4,
}: {
  query: ProductQueryState;
  emptyTitle?: string;
  emptyDescription?: string;
  priorityCount?: number;
}) {
  const { parsed, result, chips, activeCount, setSort, setPage, reset, update, isEmpty } = query;
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-6">
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-card border border-border bg-surface p-4">
          <FilterPanel query={query} />
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-button border border-border-strong bg-surface px-3 text-sm font-medium text-text-primary hover:border-primary lg:hidden"
            aria-label={activeCount > 0 ? `ফিল্টার, ${activeCount}টি চালু` : 'ফিল্টার'}
          >
            <SlidersHorizontal aria-hidden className="size-4" />
            ফিল্টার
            {activeCount > 0 ? (
              <span className="rounded-full bg-primary px-1.5 font-num text-xs text-on-primary">
                {toBanglaDigits(activeCount)}
              </span>
            ) : null}
          </button>

          <p className="text-sm text-text-secondary lg:py-2">
            <span className="font-num font-semibold text-text-primary">
              {toBanglaDigits(result.total)}
            </span>{' '}
            টি পণ্য
            {parsed.query ? (
              <>
                {' '}
                — “<span className="font-medium text-text-primary">{parsed.query}</span>” এর জন্য
              </>
            ) : null}
          </p>

          <div className="ml-auto w-full sm:w-64">
            <SortSelect value={parsed.sort} onChange={setSort} />
          </div>
        </div>

        {chips.length > 0 ? (
          <ul className="mb-3 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <li key={chip.id}>
                <Chip selected onRemove={() => update(chip.remove())}>
                  {chip.label}
                </Chip>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={reset}
                className="text-xs font-medium text-primary hover:underline"
              >
                সব মুছুন
              </button>
            </li>
          </ul>
        ) : null}

        {isEmpty ? (
          <EmptyState
            icon={<PackageSearch aria-hidden className="size-6" />}
            title={emptyTitle}
            description={emptyDescription}
            action={
              <>
                <Button variant="outline" onClick={reset}>
                  ফিল্টার মুছে ফেলুন
                </Button>
                <Button onClick={() => setFiltersOpen(true)} className="lg:hidden">
                  ফিল্টার বদলান
                </Button>
              </>
            }
          />
        ) : (
          <ProductGrid products={result.items} priorityCount={priorityCount} />
        )}

        <Pagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} className="mt-6" />
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="ফিল্টার"
        side="bottom"
        footer={
          <Button fullWidth onClick={() => setFiltersOpen(false)}>
            {isEmpty ? 'ফিল্টার দেখুন' : `${toBanglaDigits(result.total)}টি ফলাফল দেখুন`}
          </Button>
        }
      >
        <FilterPanel query={query} />
      </Drawer>
    </div>
  );
}
