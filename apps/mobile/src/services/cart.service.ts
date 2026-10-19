/**
 * Cart actions that are more than a single store call.
 *
 * The store keeps `addItem` for one product at a time (it toasts per add). Bulk
 * flows — "add everything from my wishlist" — build the lines first and commit
 * them in one update so the shopper gets a single, honest summary instead of a
 * burst of identical toasts.
 */

import type { CartItem, Product } from '@shobdox/shared-types';
import {
  addLineToCart,
  createCartLine,
  defaultOptionSelection,
  findVariantByOptions,
} from '@shobdox/shared-business-logic';
import { useCartStore } from '../store/cart.store';

export interface BulkAddResult {
  added: number;
  /** Products that need the detail screen first (options, or no stock). */
  skipped: number;
  addedTitles: string[];
}

/**
 * Adds every product that can be added without a choice — one variant, in
 * stock. Products with options are skipped on purpose: the shopper must pick a
 * real variant on the detail screen instead of the app guessing one.
 */
export function addProductsToCart(products: Product[]): BulkAddResult {
  const result: BulkAddResult = { added: 0, skipped: 0, addedTitles: [] };

  const lines: CartItem[] = [];
  for (const product of products) {
    const variant = findVariantByOptions(product, defaultOptionSelection(product));

    const canAddDirectly = product.options.length === 0 && variant && variant.stock > 0;
    if (!canAddDirectly || !variant) {
      result.skipped += 1;
      continue;
    }

    lines.push(createCartLine(product, variant, 1));
    result.added += 1;
    result.addedTitles.push(product.titleBn ?? product.title);
  }

  if (lines.length === 0) return result;

  useCartStore.setState((state) => ({
    items: lines.reduce((items, line) => addLineToCart(items, line), state.items),
    lastAddedLineId: lines[0]?.id,
  }));

  return result;
}

/** Empty the cart without a toast — the caller decides what to say. */
export function clearCart(): void {
  useCartStore.getState().clear();
}
