import { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SectionHeader, ScrollRail } from '@/components/ui';
import { Countdown } from '@/components/ui';
import { ProductCard } from './ProductCard';
import type { ProductRail as ProductRailData } from '@/services/catalog.service';

/**
 * A horizontal product rail with the shared section header.
 *
 * Flash-sale rails carry a live countdown taken from the earliest
 * `flashSaleEndsAt` in the rail, which is the same value the shop page filters
 * on — so the timer and the filter can never disagree.
 */

export function ProductRail({
  rail,
  priorityCount = 0,
  className,
}: {
  rail: ProductRailData;
  priorityCount?: number;
  className?: string;
}) {
  const endsAt = useMemo(() => {
    if (rail.variant !== 'flash') return undefined;

    const ends = rail.products
      .map((product) => product.flashSaleEndsAt)
      .filter((value): value is string => Boolean(value))
      .sort();

    return ends[0];
  }, [rail.products, rail.variant]);

  if (rail.products.length === 0) return null;

  return (
    <section className={cn('space-y-3', className)} aria-labelledby={`rail-${rail.id}`}>
      <div id={`rail-${rail.id}`}>
        <SectionHeader
          title={rail.title}
          subtitle={rail.subtitle}
          href={rail.href}
          trailing={
            rail.variant === 'flash' ? (
              <span className="hidden items-center gap-2 sm:flex">
                <Flame aria-hidden className="size-4 text-accent" />
                <Countdown endsAt={endsAt} tone="accent" size="sm" prefix="শেষ হবে" />
              </span>
            ) : undefined
          }
        />
      </div>

      <ScrollRail label={`${rail.title} পণ্য`}>
        {rail.products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            layout="rail"
            priority={index < priorityCount}
          />
        ))}
      </ScrollRail>
    </section>
  );
}

export function ProductRailSkeleton({ title }: { title?: string }) {
  return (
    <section className="space-y-3">
      <SectionHeader title={title ?? 'লোড হচ্ছে…'} />
      <div className="rail no-scrollbar pb-1">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="w-[168px] shrink-0 space-y-2 rounded-card border border-border bg-surface p-3 sm:w-[196px]"
          >
            <span className="skeleton block aspect-square w-full rounded-image" />
            <span className="skeleton block h-3 w-2/3 rounded-full" />
            <span className="skeleton block h-3 w-1/2 rounded-full" />
            <span className="skeleton block h-5 w-1/3 rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
