import { Link } from 'react-router';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { Breadcrumbs, PageHeader } from '@/components/ui';
import { useCategories, useProducts, useTopLevelCategories } from '@/hooks/useCatalog';

/**
 * Category index.
 *
 * Parent rows show every child with its own live count, which is what makes
 * this page usable as the primary way to browse the demo catalogue.
 */

export default function CategoriesPage() {
  const categories = useCategories();
  const topLevel = useTopLevelCategories();
  const products = useProducts();

  const totalProducts = products.length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="ক্যাটাগরি"
        description={`${toBanglaDigits(topLevel.length)}টি প্রধান ক্যাটাগরি ও ${toBanglaDigits(totalProducts)}টি ডেমো পণ্য। যা খুঁজছেন সেটি বেছে নিন।`}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'হোম', href: '/' },
              { label: 'ক্যাটাগরি' },
            ]}
          />
        }
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {topLevel.map((category) => {
          const children = categories.filter((candidate) => candidate.parentId === category.id);

          return (
            <li key={category.id}>
              <article className="flex h-full flex-col rounded-card border border-border bg-surface p-4">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="flex size-12 shrink-0 items-center justify-center rounded-card bg-primary-soft text-2xl text-primary-dark"
                  >
                    {category.icon}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-text-primary">
                      <Link to={`/category/${category.slug}`} className="hover:text-primary">
                        {category.nameBn}
                      </Link>
                    </h2>
                    <p className="font-num text-xs text-text-muted">
                      {toBanglaDigits(category.productCount)}টি পণ্য
                    </p>
                  </div>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{category.description}</p>

                {children.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {children.map((child) => (
                      <li key={child.id}>
                        <Link
                          to={`/category/${child.slug}`}
                          className="inline-flex items-center gap-1 rounded-chip bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-primary-soft hover:text-primary-dark"
                        >
                          {child.nameBn}
                          <span className="font-num text-[0.6875rem] text-text-muted">
                            {toBanglaDigits(child.productCount)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <Link
                  to={`/category/${category.slug}`}
                  className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  {category.nameBn} দেখুন →
                </Link>
              </article>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-text-muted">
        সব ক্যাটাগরি ও পণ্য নমুনা ডেটা — কোনো প্রকৃত দোকান নেই।{' '}
        <Link to="/help/about" className="text-primary hover:underline">
          ডেমো সম্পর্কে জানুন
        </Link>
        ।
      </p>
    </div>
  );
}
