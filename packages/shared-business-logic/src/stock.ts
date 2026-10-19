import type { Product, ProductVariant, StockStatus } from '@shobdox/shared-types';

/** Stock rules shared by listings, product pages and both dashboards. */

/** At or below this many units a variant is flagged as low stock. */
export const LOW_STOCK_THRESHOLD = 8;

/** Order is only accepted when at least this many units are free for sale. */
export const MIN_PURCHASABLE_STOCK = 1;

export function variantStockStatus(variant: ProductVariant): StockStatus {
  if (variant.stock <= 0) return 'out-of-stock';
  if (variant.stock <= LOW_STOCK_THRESHOLD) return 'low-stock';
  return 'in-stock';
}

/** Total units across every variant. */
export function totalStock(product: Product): number {
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
}

/**
 * Product-level status. A product is only "in stock" when at least one variant
 * can actually be bought.
 */
export function productStockStatus(product: Product): StockStatus {
  const statuses = product.variants.map(variantStockStatus);
  if (statuses.every((status) => status === 'out-of-stock')) return 'out-of-stock';
  if (statuses.includes('low-stock')) return 'low-stock';
  return 'in-stock';
}

export function isPurchasable(product: Product): boolean {
  return product.status === 'active' && product.variants.some((variant) => variant.stock >= MIN_PURCHASABLE_STOCK);
}

export function isVariantPurchasable(variant: ProductVariant, quantity = 1): boolean {
  return variant.stock >= quantity;
}

/** Variants at or below the low-stock threshold, worst first. */
export function lowStockVariants(product: Product, threshold = LOW_STOCK_THRESHOLD): ProductVariant[] {
  return product.variants
    .filter((variant) => variant.stock <= threshold)
    .sort((a, b) => a.stock - b.stock);
}

export const STOCK_STATUS_LABELS: Record<StockStatus, { en: string; bn: string }> = {
  'in-stock': { en: 'In Stock', bn: 'স্টকে আছে' },
  'low-stock': { en: 'Low Stock', bn: 'স্টক কম' },
  'out-of-stock': { en: 'Out of Stock', bn: 'স্টক নেই' },
  'pre-order': { en: 'Pre-order', bn: 'প্রি-অর্ডার' },
};

/** "মাত্র ৩ টি বাকি" — urgency copy for the product page. */
export function stockUrgencyCopy(product: Product, threshold = LOW_STOCK_THRESHOLD): string | null {
  const stock = totalStock(product);
  if (stock <= 0) return 'স্টক শেষ';
  if (stock <= threshold) return `মাত্র ${stock} টি বাকি`;
  return null;
}

/** Units sold relative to stock, 0–100. Drives the "almost gone" progress bar. */
export function stockPressure(product: Product): number {
  const stock = totalStock(product);
  const starting = stock + product.sold;
  if (starting <= 0) return 0;
  return Math.round((product.sold / starting) * 100);
}

/** Clamps a requested quantity to what is available and allowed. */
export function clampQuantity(quantity: number, available: number, maxPerLine = 10): number {
  const ceiling = Math.max(1, Math.min(available > 0 ? available : maxPerLine, maxPerLine));
  return Math.min(Math.max(1, Math.floor(quantity) || 1), ceiling);
}
