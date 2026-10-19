import { Link } from 'react-router';
import type { Category } from '@shobdox/shared-types';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { cn } from '@/lib/cn';
import { SmartImage } from '@/components/ui';
import { SectionHeader } from '@/components/ui';

/** Category cards. Images are optional; the accent tint carries the card alone. */

const ACCENTS: Record<Category['accent'], string> = {
  green: 'bg-primary-soft text-primary-dark',
  amber: 'bg-accent-soft text-amber-800',
  blue: 'bg-info-soft text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  slate: 'bg-surface-muted text-text-secondary',
};

export function CategoryTiles({
  categories,
  title = 'ক্যাটাগরি',
  subtitle = 'যা খুঁজছেন সেটি বেছে নিন',
  href = '/categories',
  className,
}: {
  categories: Category[];
  title?: string;
  subtitle?: string;
  href?: string;
  className?: string;
}) {
  if (categories.length === 0) return null;

  return (
    <section className={className} aria-labelledby="home-categories">
      <div id="home-categories">
        <SectionHeader title={title} subtitle={subtitle} href={href} linkLabel="সব ক্যাটাগরি" />
      </div>

      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6 xl:gap-3">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              to={`/category/${category.slug}`}
              className="flex h-full flex-col items-center gap-2 rounded-card border border-border bg-surface p-3 text-center transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            >
              <span
                className={cn(
                  'flex size-14 items-center justify-center overflow-hidden rounded-card text-2xl',
                  ACCENTS[category.accent],
                )}
              >
                {category.image ? (
                  <SmartImage
                    src={category.image}
                    alt=""
                    fallbackLabel={category.nameBn}
                    className="size-full"
                  />
                ) : (
                  <span aria-hidden>{category.icon}</span>
                )}
              </span>

              <span className="line-clamp-2 text-sm font-medium text-text-primary">{category.nameBn}</span>
              <span className="font-num text-xs text-text-muted">
                {toBanglaDigits(category.productCount)}টি পণ্য
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
