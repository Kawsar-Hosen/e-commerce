import { Link, useParams } from 'react-router';
import { PackageSearch } from 'lucide-react';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { Breadcrumbs, ButtonLink, EmptyState } from '@/components/ui';
import { ProductListing } from '@/features/catalog/ProductListing';
import { useCategories } from '@/hooks/useCatalog';
import { useProductQuery } from '@/hooks/useProductQuery';

/**
 * A single category (or sub-category) listing.
 *
 * The category is *locked* into the query through `lockedCategorySlugs`, so the
 * ledger of filters on this page can never accidentally drop the category the
 * shopper is browsing.
 */

export default function CategoryPage() {
  const { slug = '' } = useParams();
  const categories = useCategories();
  const category = categories.find((candidate) => candidate.slug === slug);
  const parent = category?.parentId
    ? categories.find((candidate) => candidate.id === category.parentId)
    : undefined;
  const children = category
    ? categories.filter((candidate) => candidate.parentId === category.id)
    : [];

  const query = useProductQuery({ pageSize: 12, lockedCategorySlugs: slug ? [slug] : undefined });

  if (!category) {
    return (
      <EmptyState
        icon={<PackageSearch aria-hidden className="size-6" />}
        title="এই ক্যাটাগরিটি পাওয়া যায়নি"
        description="লিংকটি হয়তো পুরোনো। ক্যাটাগরি তালিকা থেকে আবার বেছে নিন।"
        action={<ButtonLink to="/categories">সব ক্যাটাগরি</ButtonLink>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'হোম', href: '/' },
          { label: 'ক্যাটাগরি', href: '/categories' },
          ...(parent ? [{ label: parent.nameBn, href: `/category/${parent.slug}` }] : []),
          { label: category.nameBn },
        ]}
        className="mb-2"
      />

      <header className="rounded-panel border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-4">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-card bg-primary-soft text-3xl text-primary-dark"
          >
            {category.icon}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-text-primary">{category.nameBn}</h1>
            <p className="text-sm text-text-secondary">{category.name}</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
              {category.description}
            </p>
            <p className="mt-2 font-num text-sm text-text-muted">
              এই ক্যাটাগরিতে {toBanglaDigits(category.productCount)}টি পণ্য
            </p>
          </div>
        </div>

        {children.length > 0 ? (
          <nav aria-label="উপ-ক্যাটাগরি" className="mt-4 border-t border-divider pt-3">
            <ul className="flex flex-wrap gap-2">
              {children.map((child) => (
                <li key={child.id}>
                  <Link
                    to={`/category/${child.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-chip border border-border bg-surface-muted px-3 py-1.5 text-sm font-medium text-text-primary hover:border-primary hover:text-primary"
                  >
                    {child.nameBn}
                    <span className="font-num text-xs text-text-muted">
                      {toBanglaDigits(child.productCount)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <ProductListing
        query={query}
        emptyTitle="এই ক্যাটাগরিতে কোনো পণ্য মেলেনি"
        emptyDescription="ফিল্টার শিথিল করে দেখুন, অথবা অন্য ক্যাটাগরিতে যান।"
      />
    </div>
  );
}
