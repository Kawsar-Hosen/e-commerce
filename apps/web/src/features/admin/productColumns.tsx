import type { ReactNode } from 'react';
import { Copy, PackagePlus, Pencil, Trash2 } from 'lucide-react';
import type { Product } from '@shobdox/shared-types';
import { formatRelativeTime, toBanglaDigits } from '@shobdox/shared-utils';
import { Button, ButtonLink, IconButton, Price, StockBadge, Thumb } from '@/components/ui';
import { exportCsv, type CsvColumn } from './csv';
import type { AdminColumn } from './ResponsiveTable';
import { ProductStatusBadge } from './StatusBadges';

/**
 * Column definitions, CSV export and mobile actions for the admin product table.
 *
 * The page owns state and handlers; this module only decides how a product row
 * is drawn, so the screen file stays about filtering and pagination.
 */

export interface ProductColumnHandlers {
  onDuplicate: (product: Product) => void;
  onToggleArchive: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function buildProductColumns(handlers: ProductColumnHandlers): AdminColumn<Product>[] {
  return [
    {
      id: 'product',
      header: 'পণ্য',
      render: (product) => (
        <div className="flex items-center gap-2">
          <Thumb src={product.thumbnail} alt={product.titleBn ?? product.title} className="size-10" />
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">{product.titleBn ?? product.title}</p>
            <p className="font-num text-xs text-text-secondary">{product.variants[0]?.sku ?? product.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'price',
      header: 'দাম',
      mobileLabel: 'দাম',
      align: 'right',
      render: (product) => <Price value={product.price} compareAt={product.compareAtPrice} size="sm" />,
    },
    {
      id: 'stock',
      header: 'স্টক',
      mobileLabel: 'স্টক',
      render: (product) => (
        <span className="flex items-center justify-end gap-2">
          <StockBadge status={product.stockStatus} stock={product.stock} />
        </span>
      ),
    },
    {
      id: 'sold',
      header: 'বিক্রয়',
      mobileLabel: 'বিক্রয়',
      align: 'right',
      render: (product) => <span className="font-num">{toBanglaDigits(product.sold)}</span>,
    },
    {
      id: 'status',
      header: 'স্ট্যাটাস',
      mobileLabel: 'স্ট্যাটাস',
      render: (product) => <ProductStatusBadge status={product.status} />,
    },
    {
      id: 'updated',
      header: 'আপডেট',
      render: (product) => <span className="text-xs text-text-secondary">{formatRelativeTime(product.updatedAt)}</span>,
    },
    {
      id: 'actions',
      header: 'অ্যাকশন',
      align: 'right',
      render: (product) => (
        <div className="flex items-center justify-end gap-1">
          <ButtonLink to={`/admin/products/${product.id}/edit`} variant="ghost" size="icon" aria-label="পণ্য সম্পাদনা">
            <Pencil aria-hidden className="size-4" />
          </ButtonLink>
          <IconButton label="পণ্যের কপি" variant="ghost" size="sm" onClick={() => handlers.onDuplicate(product)}>
            <Copy aria-hidden className="size-4" />
          </IconButton>
          <IconButton
            label={product.status === 'archived' ? 'সক্রিয় করুন' : 'আর্কাইভ করুন'}
            variant="ghost"
            size="sm"
            onClick={() => handlers.onToggleArchive(product)}
          >
            <PackagePlus aria-hidden className="size-4" />
          </IconButton>
          <IconButton label="পণ্য মুছুন" variant="ghost" size="sm" onClick={() => handlers.onDelete(product)}>
            <Trash2 aria-hidden className="size-4 text-error" />
          </IconButton>
        </div>
      ),
    },
  ];
}

/** Rows currently on screen are exported as-is; nothing leaves the browser. */
export function exportProductsCsv(rows: Product[]): void {
  const columns: Array<CsvColumn<Product>> = [
    { header: 'নাম', value: (product) => product.titleBn ?? product.title },
    { header: 'SKU', value: (product) => product.variants[0]?.sku ?? '' },
    { header: 'দাম', value: (product) => product.price },
    { header: 'স্টক', value: (product) => product.stock },
    { header: 'স্ট্যাটাস', value: (product) => product.status },
    { header: 'বিক্রয়', value: (product) => product.sold },
  ];
  exportCsv('shobdox-products.csv', columns, rows);
}

/** Buttons under a product card on phones — same actions as the table row. */
export function buildProductMobileActions(handlers: ProductColumnHandlers): (product: Product) => ReactNode {
  return (product) => (
    <>
      <ButtonLink to={`/admin/products/${product.id}/edit`} variant="outline" size="sm">
        সম্পাদনা
      </ButtonLink>
      <Button variant="ghost" size="sm" onClick={() => handlers.onDuplicate(product)}>
        কপি
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handlers.onToggleArchive(product)}>
        {product.status === 'archived' ? 'সক্রিয় করুন' : 'আর্কাইভ'}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handlers.onDelete(product)}>
        মুছুন
      </Button>
    </>
  );
}
