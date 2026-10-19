import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { Breadcrumbs, Chip, EmptyState, PageHeader, SearchInput } from '@/components/ui';
import { useBrands } from '@/hooks/useCatalog';

/**
 * Brand index.
 *
 * Brands are a filter on the shop page, so every card links to `/shop?brand=…`
 * rather than maintaining a separate brand-listing route.
 */

export default function BrandsPage() {
  const brands = useBrands();
  const [term, setTerm] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();

    return brands
      .filter((brand) => (featuredOnly ? brand.isFeatured : true))
      .filter((brand) =>
        needle.length === 0
          ? true
          : brand.name.toLowerCase().includes(needle) ||
            (brand.nameBn ?? '').includes(needle) ||
            brand.wordmark.toLowerCase().includes(needle),
      )
      .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));
  }, [brands, featuredOnly, term]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="ব্র্যান্ড"
        description="দেশি ও আন্তর্জাতিক ব্র্যান্ড — প্রতিটি কার্ড থেকে শুধু সেই ব্র্যান্ডের পণ্য দেখুন।"
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'হোম', href: '/' },
              { label: 'ব্র্যান্ড' },
            ]}
          />
        }
      />

      <div className="flex flex-wrap items-end gap-2">
        <SearchInput
          value={term}
          onValueChange={setTerm}
          placeholder="ব্র্যান্ড খুঁজুন…"
          label="ব্র্যান্ড খুঁজুন"
          className="w-full sm:max-w-xs"
        />
        <Chip selected={featuredOnly} onClick={() => setFeaturedOnly((value) => !value)}>
          শুধু ফিচার্ড ব্র্যান্ড
        </Chip>
        <p className="ml-auto font-num text-sm text-text-secondary">
          {toBanglaDigits(filtered.length)}টি ব্র্যান্ড
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search aria-hidden className="size-6" />}
          title="কোনো ব্র্যান্ড মেলেনি"
          description="অন্য নাম দিয়ে খুঁজুন বা ফিচার্ড ফিল্টারটি বন্ধ করুন।"
          action={
            <button
              type="button"
              onClick={() => {
                setTerm('');
                setFeaturedOnly(false);
              }}
              className="inline-flex h-10 items-center rounded-button bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-dark"
            >
              ফিল্টার মুছুন
            </button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((brand) => (
            <li key={brand.id}>
              <Link
                to={`/shop?brand=${brand.slug}`}
                className="flex h-full flex-col rounded-card border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-num text-2xl font-bold text-text-primary">{brand.wordmark}</span>
                  <span className="rounded-chip bg-surface-muted px-2 py-0.5 font-num text-xs text-text-muted">
                    {toBanglaDigits(brand.productCount)}
                  </span>
                </div>

                <p className="mt-1 text-sm font-medium text-text-secondary">
                  {brand.nameBn ?? brand.name}
                </p>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-muted">
                  {brand.description}
                </p>

                <p className="mt-auto pt-3 text-xs text-text-muted">
                  উৎস: {brand.origin}
                  {brand.isFeatured ? ' · ফিচার্ড' : ''}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-text-muted">
        ব্র্যান্ডের নাম ও বর্ণনা ডেমো ডেটা।{' '}
        <Link to="/shop" className="text-primary hover:underline">
          ব্র্যান্ড ফিল্টার দিয়ে সব পণ্য দেখুন
        </Link>
        ।
      </p>
    </div>
  );
}
