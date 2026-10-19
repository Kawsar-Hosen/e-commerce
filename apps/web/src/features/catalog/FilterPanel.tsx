import { useEffect, useId, useState } from 'react';
import { RotateCcw, Star } from 'lucide-react';
import type { ProductSortKey } from '@shobdox/shared-types';
import { PRODUCT_SORT_LABELS } from '@shobdox/shared-types';
import { toBanglaDigits, formatTaka } from '@shobdox/shared-utils';
import { cn } from '@/lib/cn';
import { Button, Checkbox, Chip, Select } from '@/components/ui';
import type { ProductQueryState } from '@/hooks/useProductQuery';
import { useBrands, useCategories } from '@/hooks/useCatalog';

/**
 * The filter panel used by /shop, /category/:slug and /search.
 *
 * It reads and writes the URL through `useProductQuery()`, so the desktop
 * sidebar and the mobile sheet are the same component — closing the sheet
 * cannot lose filter state, and the browser's Back button undoes a filter.
 */

export function FilterPanel({ query, className }: { query: ProductQueryState; className?: string }) {
  const { parsed, facets, bounds, update, toggleCategory, toggleBrand, reset, activeCount } = query;
  const categories = useCategories();
  const brands = useBrands();
  const priceId = useId();

  // Price inputs are local until applied: typing "1" of "1500" should not
  // rewrite the URL and re-run the query on every keystroke.
  const [minPrice, setMinPrice] = useState(parsed.minPrice !== undefined ? String(parsed.minPrice) : '');
  const [maxPrice, setMaxPrice] = useState(parsed.maxPrice !== undefined ? String(parsed.maxPrice) : '');

  useEffect(() => {
    setMinPrice(parsed.minPrice !== undefined ? String(parsed.minPrice) : '');
    setMaxPrice(parsed.maxPrice !== undefined ? String(parsed.maxPrice) : '');
  }, [parsed.minPrice, parsed.maxPrice]);

  const applyPrice = () => {
    const min = minPrice.trim() === '' ? undefined : Math.max(0, Number(minPrice));
    const max = maxPrice.trim() === '' ? undefined : Math.max(0, Number(maxPrice));
    update({
      min: min !== undefined && Number.isFinite(min) ? min : undefined,
      max: max !== undefined && Number.isFinite(max) ? max : undefined,
    });
  };

  // Facets carry category ids; the panel shows only buckets that still have
  // matches, which is what makes narrowing down feel predictable.
  const visibleCategories = facets.categories
    .map((bucket) => {
      const category = categories.find((candidate) => candidate.id === bucket.value);
      return category && bucket.count > 0 ? { category, count: bucket.count } : undefined;
    })
    .filter((entry): entry is { category: (typeof categories)[number]; count: number } => Boolean(entry))
    .sort((a, b) => {
      const parentA = a.category.parentId ?? a.category.id;
      const parentB = b.category.parentId ?? b.category.id;
      if (parentA !== parentB) return parentA.localeCompare(parentB);
      return a.category.displayOrder - b.category.displayOrder;
    });

  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-text-primary">ফিল্টার</h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <RotateCcw aria-hidden className="size-3" />
            সব মুছুন ({toBanglaDigits(activeCount)})
          </button>
        ) : null}
      </div>

      <section aria-labelledby="filter-category">
        <h3 id="filter-category" className="mb-2 text-sm font-semibold text-text-primary">
          ক্যাটাগরি
        </h3>
        <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {visibleCategories.map(({ category, count }) => (
            <li key={category.id}>
              <Checkbox
                checked={parsed.categorySlugs.includes(category.slug)}
                onChange={() => toggleCategory(category.slug)}
                label={
                  <span className="flex items-center justify-between gap-2">
                    <span className={cn(category.parentId && 'pl-3 text-sm text-text-secondary')}>
                      {category.nameBn}
                    </span>
                    <span className="font-num text-xs text-text-muted">{toBanglaDigits(count)}</span>
                  </span>
                }
              />
            </li>
          ))}

          {visibleCategories.length === 0 ? (
            <li className="text-xs text-text-muted">এই মুহূর্তে কোনো ক্যাটাগরি পাওয়া যায়নি।</li>
          ) : null}
        </ul>
      </section>

      <section aria-labelledby="filter-price" className="border-t border-divider pt-4">
        <h3 id="filter-price" className="mb-2 text-sm font-semibold text-text-primary">
          দাম
        </h3>
        <p className="mb-2 text-xs text-text-secondary">
          পুরো ক্যাটালগে {formatTaka(bounds.min)} – {formatTaka(bounds.max)}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor={`${priceId}-min`} className="sr-only">
            সর্বনিম্ন দাম
          </label>
          <input
            id={`${priceId}-min`}
            type="number"
            inputMode="numeric"
            min={0}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') applyPrice();
            }}
            placeholder="সর্বনিম্ন"
            className="h-9 w-full min-w-0 rounded-input border border-border-strong px-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-text-muted">–</span>
          <label htmlFor={`${priceId}-max`} className="sr-only">
            সর্বোচ্চ দাম
          </label>
          <input
            id={`${priceId}-max`}
            type="number"
            inputMode="numeric"
            min={0}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') applyPrice();
            }}
            placeholder="সর্বোচ্চ"
            className="h-9 w-full min-w-0 rounded-input border border-border-strong px-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button variant="outline" size="sm" fullWidth className="mt-2" onClick={applyPrice}>
          দাম প্রয়োগ করুন
        </Button>
      </section>

      <section aria-labelledby="filter-rating" className="border-t border-divider pt-4">
        <h3 id="filter-rating" className="mb-2 text-sm font-semibold text-text-primary">
          রেটিং
        </h3>
        <div className="flex flex-wrap gap-2">
          {[4, 3].map((rating) => {
            const bucket = facets.ratings.find((item) => item.value === rating);
            return (
              <Chip
                key={rating}
                selected={parsed.minRating === rating}
                onClick={() => update({ rating: parsed.minRating === rating ? 0 : rating })}
              >
                <Star aria-hidden className="size-3 fill-accent text-accent" />
                {toBanglaDigits(rating)}★ ও বেশি
                {bucket ? (
                  <span className="font-num text-xs text-text-muted">({toBanglaDigits(bucket.count)})</span>
                ) : null}
              </Chip>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="filter-discount" className="border-t border-divider pt-4">
        <h3 id="filter-discount" className="mb-2 text-sm font-semibold text-text-primary">
          ছাড়
        </h3>
        <div className="flex flex-wrap gap-2">
          {[10, 20, 30].map((discount) => (
            <Chip
              key={discount}
              selected={parsed.minDiscount === discount}
              onClick={() => update({ discount: parsed.minDiscount === discount ? 0 : discount })}
            >
              {toBanglaDigits(discount)}%+
            </Chip>
          ))}
        </div>
      </section>

      <section aria-labelledby="filter-stock" className="space-y-2.5 border-t border-divider pt-4">
        <h3 id="filter-stock" className="text-sm font-semibold text-text-primary">
          উপলব্ধতা
        </h3>
        <Checkbox
          checked={parsed.inStockOnly}
          onChange={(checked) => update({ stock: checked })}
          label="শুধু স্টকে থাকা পণ্য"
        />
        <Checkbox
          checked={parsed.flashSaleOnly}
          onChange={(checked) => update({ flash: checked })}
          label="শুধু ফ্ল্যাশ সেল"
        />
      </section>

      <section aria-labelledby="filter-brand" className="border-t border-divider pt-4">
        <h3 id="filter-brand" className="mb-2 text-sm font-semibold text-text-primary">
          ব্র্যান্ড
        </h3>
        <ul className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {facets.brands
            .filter((bucket) => bucket.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 14)
            .map((bucket) => {
              const brand = brands.find((candidate) => candidate.id === bucket.value);
              if (!brand) return null;

              return (
                <li key={brand.id}>
                  <Checkbox
                    checked={parsed.brandSlugs.includes(brand.slug)}
                    onChange={() => toggleBrand(brand.slug)}
                    label={
                      <span className="flex items-center justify-between gap-2">
                        <span>{bucket.label}</span>
                        <span className="font-num text-xs text-text-muted">{toBanglaDigits(bucket.count)}</span>
                      </span>
                    }
                  />
                </li>
              );
            })}
        </ul>
      </section>
    </div>
  );
}

export function SortSelect({
  value,
  onChange,
  className,
}: {
  value: ProductSortKey;
  onChange: (sort: ProductSortKey) => void;
  className?: string;
}) {
  return (
    <Select
      label="সাজান"
      wrapperClassName={className}
      value={value}
      onChange={(event) => onChange(event.target.value as ProductSortKey)}
      options={Object.entries(PRODUCT_SORT_LABELS).map(([key, label]) => ({ value: key, label }))}
    />
  );
}
