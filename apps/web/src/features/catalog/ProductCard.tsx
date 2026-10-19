import { memo } from 'react';
import { Link } from 'react-router';
import { Heart, MapPin, ShoppingCart, Zap } from 'lucide-react';
import type { Product } from '@shobdox/shared-types';
import { PRODUCT_BADGE_LABELS } from '@shobdox/shared-types';
import { cn } from '@/lib/cn';
import { SmartImage } from '@/components/ui';
import { Price, Rating, StockBadge } from '@/components/ui/Display';
import { useCartStore } from '@/store/cart.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { productPriceRange } from '@shobdox/shared-business-logic';
import { toBanglaDigits } from '@shobdox/shared-utils';

/**
 * Product card.
 *
 * Writes straight to the cart/wishlist stores (rather than taking callbacks) so
 * a card behaves identically on the homepage rail, the shop grid, the search
 * results and the wishlist page.
 */

export interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list' | 'rail';
  className?: string;
  /** Admin/seller previews pass `false` to hide shopper actions. */
  interactive?: boolean;
  priority?: boolean;
}

function ProductCardBase({
  product,
  layout = 'grid',
  className,
  interactive = true,
  priority = false,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const wishlisted = useWishlistStore((state) => state.productIds.includes(product.id));

  const range = productPriceRange(product);
  const firstPurchasable = product.variants.find((variant) => variant.stock > 0);
  const isOutOfStock = product.stockStatus === 'out-of-stock';
  const badge = product.badges[0];

  const onAdd = () => {
    const variant = firstPurchasable;
    if (!variant) return;
    addItem(product, variant, 1);
  };

  const media = (
    <div
      className={cn(
        'relative overflow-hidden rounded-image bg-surface-muted',
        layout === 'list' ? 'size-28 shrink-0 sm:size-32' : 'aspect-square w-full',
      )}
    >
      <Link to={`/product/${product.slug}`} className="block size-full" tabIndex={-1} aria-hidden={false}>
        <SmartImage
          src={product.thumbnail}
          alt={product.titleBn ?? product.title}
          fallbackLabel={product.titleBn ?? product.title}
          priority={priority}
          withSkeleton
          className={cn(
            'size-full transition-transform duration-300',
            !isOutOfStock && 'hover:scale-[1.04]',
            isOutOfStock && 'opacity-60 grayscale',
          )}
        />
      </Link>

      <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
        {product.discountPercent > 0 ? (
          <span className="rounded-chip bg-error px-1.5 py-0.5 font-num text-xs font-bold text-white shadow-sm">
            -{toBanglaDigits(product.discountPercent)}%
          </span>
        ) : null}
        {badge ? (
          <span className="rounded-chip bg-surface-inverse/90 px-1.5 py-0.5 text-xs font-semibold text-text-inverse">
            {PRODUCT_BADGE_LABELS[badge]}
          </span>
        ) : null}
        {product.isFlashSale ? (
          <span className="flex items-center gap-0.5 rounded-chip bg-accent px-1.5 py-0.5 text-xs font-semibold text-on-accent">
            <Zap aria-hidden className="size-3" />
            ফ্ল্যাশ
          </span>
        ) : null}
      </div>

      {interactive ? (
        <button
          type="button"
          onClick={() => toggleWishlist(product.id, product.titleBn ?? product.title)}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? 'উইশলিস্ট থেকে সরান' : 'উইশলিস্টে যোগ করুন'}
          className={cn(
            'absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border shadow-xs transition-colors',
            wishlisted
              ? 'border-error/30 bg-error-soft text-error'
              : 'border-border bg-surface/95 text-text-secondary hover:text-error',
          )}
        >
          <Heart aria-hidden className={cn('size-4', wishlisted && 'fill-error')} />
        </button>
      ) : null}

      {isOutOfStock ? (
        <span className="absolute inset-x-2 bottom-2 rounded-chip bg-surface-inverse/90 px-2 py-1 text-center text-xs font-semibold text-text-inverse">
          স্টক শেষ
        </span>
      ) : null}
    </div>
  );

  const details = (
    <div className={cn('min-w-0', layout === 'list' ? 'flex flex-1 flex-col' : 'mt-2 space-y-1')}>
      <Link
        to={`/product/${product.slug}`}
        className="line-clamp-2 text-base font-medium text-text-primary hover:text-primary"
      >
        {product.titleBn ?? product.title}
      </Link>

      <Rating value={product.rating} count={product.reviewCount} size="sm" className="mt-0.5" />

      <div className={cn(layout === 'list' ? 'mt-auto pt-2' : 'pt-1')}>
        <Price
          value={range.min}
          compareAt={product.compareAtPrice}
          discountPercent={product.discountPercent}
          size={layout === 'rail' ? 'md' : 'md'}
          fromLabel={range.min !== range.max}
        />
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <StockBadge status={product.stockStatus} stock={product.stock} />

        {product.delivery.deliveryFeeInsideDhaka === 0 ? (
          <span className="flex items-center gap-0.5 text-xs text-text-secondary">
            <MapPin aria-hidden className="size-3" />
            ফ্রি ডেলিভারি
          </span>
        ) : null}
      </div>

      {interactive ? (
        <button
          type="button"
          onClick={onAdd}
          disabled={isOutOfStock}
          className={cn(
            'mt-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-button px-3 text-sm font-medium transition-colors',
            isOutOfStock
              ? 'cursor-not-allowed bg-surface-muted text-text-muted'
              : 'bg-primary text-on-primary hover:bg-primary-dark',
          )}
        >
          <ShoppingCart aria-hidden className="size-4" />
          {isOutOfStock ? 'স্টক নেই' : 'কার্টে যোগ'}
        </button>
      ) : null}
    </div>
  );

  if (layout === 'list') {
    return (
      <article
        className={cn(
          'flex gap-3 rounded-card border border-border bg-surface p-3 transition-shadow hover:shadow-md',
          className,
        )}
      >
        {media}
        {details}
      </article>
    );
  }

  return (
    <article
      className={cn(
        'flex flex-col rounded-card border border-border bg-surface p-2 transition-shadow hover:shadow-md sm:p-3',
        layout === 'rail' && 'w-[168px] shrink-0 sm:w-[196px]',
        className,
      )}
    >
      {media}
      {details}
    </article>
  );
}

/** Cards re-render only when their product object changes. */
export const ProductCard = memo(ProductCardBase);

export function ProductGrid({
  products,
  className,
  columns = 'responsive',
  priorityCount = 0,
}: {
  products: Product[];
  className?: string;
  columns?: 'responsive' | 'two' | 'three';
  priorityCount?: number;
}) {
  return (
    <div
      className={cn(
        'grid gap-3',
        columns === 'two'
          ? 'grid-cols-2'
          : columns === 'three'
            ? 'grid-cols-2 md:grid-cols-3'
            : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  );
}

export function ProductListItem({ product, className }: { product: Product; className?: string }) {
  return <ProductCard product={product} layout="list" className={className} />;
}
