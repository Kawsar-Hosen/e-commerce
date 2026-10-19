import { Link } from 'react-router';
import { Archive, Copy, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import type { Product } from '@shobdox/shared-types';
import { Badge, ButtonLink, IconButton, Price, StockBadge, Thumb } from '@/components/ui';
import { cn } from '@/lib/cn';
import { toBanglaDigits } from '@/lib/format';
import { PRODUCT_STATUS_LABELS, variantLabel } from './utils';

/**
 * Product rows for the seller catalogue.
 *
 * The same handlers drive the desktop table and the phone card list, so the two
 * layouts can never diverge in behaviour.
 */

export interface ProductRowHandlers {
  onToggleStatus: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductStatusBadge({ status }: { status: Product['status'] }) {
  const tone = status === 'active' ? 'success' : status === 'draft' ? 'neutral' : 'warning';
  return (
    <Badge tone={tone} size="sm">
      {PRODUCT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function ProductRowActions({ product, onToggleStatus, onDuplicate, onDelete, className }: ProductRowHandlers & { product: Product; className?: string }) {
  const archive = product.status === 'active';
  return (
    <div className={cn('flex items-center justify-end gap-0.5', className)}>
      <ButtonLink
        to={`/seller/products/${product.id}/edit`}
        variant="ghost"
        size="icon"
        aria-label="সম্পাদনা করুন"
        title="সম্পাদনা করুন"
      >
        <Pencil aria-hidden className="size-4" />
      </ButtonLink>
      <IconButton
        label="কপি করুন"
        variant="ghost"
        onClick={() => onDuplicate(product)}
      >
        <Copy aria-hidden className="size-4" />
      </IconButton>
      <IconButton
        label={archive ? 'আর্কাইভ করুন' : 'সক্রিয় করুন'}
        variant="ghost"
        onClick={() => onToggleStatus(product)}
      >
        {archive ? <Archive aria-hidden className="size-4" /> : <RotateCcw aria-hidden className="size-4" />}
      </IconButton>
      <IconButton label="মুছে ফেলুন" variant="ghost" className="text-error" onClick={() => onDelete(product)}>
        <Trash2 aria-hidden className="size-4" />
      </IconButton>
    </div>
  );
}

/** Desktop table row (rendered only at `lg` and up). */
export function ProductTableRow({ product, ...handlers }: { product: Product } & ProductRowHandlers) {
  const sku = product.variants[0]?.sku ?? '—';

  return (
    <tr className="border-b border-divider last:border-0 hover:bg-surface-muted/60">
      <th scope="row" className="px-3 py-3 text-left font-normal">
        <div className="flex items-center gap-3">
          <Thumb src={product.thumbnail} alt={product.titleBn ?? product.title} label={product.title} />
          <div className="min-w-0">
            <Link
              to={`/seller/products/${product.id}/edit`}
              className="line-clamp-2 text-sm font-semibold text-text-primary hover:text-primary"
            >
              {product.titleBn ?? product.title}
            </Link>
            <p className="mt-0.5 font-num text-xs text-text-secondary">{sku}</p>
          </div>
        </div>
      </th>
      <td className="px-3 py-3 text-right">
        <Price value={product.price} size="sm" inline />
      </td>
      <td className="px-3 py-3 text-right">
        <span className="font-num text-sm text-text-primary">{toBanglaDigits(product.stock)}</span>
        <div className="mt-0.5">
          <StockBadge status={product.stockStatus} stock={product.stock} />
        </div>
      </td>
      <td className="px-3 py-3 text-right font-num text-sm text-text-primary">{toBanglaDigits(product.sold)}</td>
      <td className="px-3 py-3">
        <ProductStatusBadge status={product.status} />
      </td>
      <td className="px-3 py-3">
        <ProductRowActions product={product} {...handlers} />
      </td>
    </tr>
  );
}

/** Phone card (rendered below `lg`). */
export function ProductCardItem({ product, ...handlers }: { product: Product } & ProductRowHandlers) {
  const sku = product.variants[0]?.sku ?? '—';

  return (
    <li className="rounded-card border border-border bg-surface p-3 shadow-xs">
      <div className="flex gap-3">
        <Thumb src={product.thumbnail} alt={product.titleBn ?? product.title} label={product.title} className="size-16" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/seller/products/${product.id}/edit`}
              className="line-clamp-2 text-sm font-semibold text-text-primary hover:text-primary"
            >
              {product.titleBn ?? product.title}
            </Link>
            <ProductStatusBadge status={product.status} />
          </div>
          <p className="mt-0.5 font-num text-xs text-text-secondary">{sku}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Price value={product.price} size="sm" inline />
            <span className="text-xs text-text-secondary">
              স্টক: <span className="font-num text-text-primary">{toBanglaDigits(product.stock)}</span>
            </span>
            <span className="text-xs text-text-secondary">
              বিক্রি: <span className="font-num text-text-primary">{toBanglaDigits(product.sold)}</span>
            </span>
          </div>
          <p className="mt-1 text-xs">
            <StockBadge status={product.stockStatus} stock={product.stock} />
          </p>
        </div>
      </div>

      <div className="mt-2 border-t border-divider pt-2">
        <ProductRowActions product={product} {...handlers} />
      </div>
    </li>
  );
}

/** "প্রথম ভ্যারিয়েন্ট · ২টি ভ্যারিয়েন্ট" summary used inside the bulk modal. */
export function VariantSummary({ product }: { product: Product }) {
  const first = product.variants[0];
  return (
    <span className="text-xs text-text-secondary">
      {first ? variantLabel(product, first) : '—'} · {toBanglaDigits(product.variants.length)}টি ভ্যারিয়েন্ট
    </span>
  );
}
