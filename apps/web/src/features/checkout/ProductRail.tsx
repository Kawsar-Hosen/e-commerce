import type { Product } from '@shobdox/shared-types';
import { ScrollRail, SectionHeader } from '@/components/ui';
import { ProductCard } from '@/features/catalog/ProductCard';
import { cn } from '@/lib/cn';

/**
 * Horizontal merchandising rail. Behaviour (add-to-cart, wishlist) comes from
 * `ProductCard`, so a rail product behaves exactly like one in the shop grid.
 */
export function ProductRail({
  title,
  products,
  subtitle,
  href,
  linkLabel,
  className,
}: {
  title: string;
  products: Product[];
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className={cn('mt-6', className)} aria-label={title}>
      <SectionHeader title={title} subtitle={subtitle} href={href} linkLabel={linkLabel} />
      <ScrollRail label={title}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} layout="rail" />
        ))}
      </ScrollRail>
    </section>
  );
}
