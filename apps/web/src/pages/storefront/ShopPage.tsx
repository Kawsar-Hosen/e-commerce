import { Link } from 'react-router';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { Breadcrumbs, PageHeader } from '@/components/ui';
import { ProductListing } from '@/features/catalog/ProductListing';
import { useProductQuery } from '@/hooks/useProductQuery';
import { useTopLevelCategories } from '@/hooks/useCatalog';

/**
 * The catalogue.
 *
 * All filter state lives in the URL through `useProductQuery()`, so this page
 * has no filtering logic of its own — it only frames the shared listing.
 */

export default function ShopPage() {
  const query = useProductQuery({ pageSize: 12 });
  const categories = useTopLevelCategories();

  return (
    <div className="space-y-4">
      <PageHeader
        title="সব পণ্য"
        description="ফিল্টার করে, সাজিয়ে, নিজের পছন্দের পণ্য খুঁজে নিন। প্রতিটি দাম ও স্টক ডেমো ডেটা থেকে আসছে।"
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'হোম', href: '/' },
              { label: 'শপ' },
            ]}
          />
        }
      />

      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {categories.map((category) => (
          <li key={category.id} className="shrink-0">
            <Link
              to={`/category/${category.slug}`}
              className="inline-flex items-center gap-1.5 rounded-chip border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:border-primary hover:text-primary"
            >
              <span aria-hidden>{category.icon}</span>
              {category.nameBn}
              <span className="font-num text-xs text-text-muted">
                {toBanglaDigits(category.productCount)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <ProductListing query={query} />
    </div>
  );
}
