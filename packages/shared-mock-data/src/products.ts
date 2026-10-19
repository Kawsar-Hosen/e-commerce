import type { Product } from '@shobdox/shared-types';
import { buildProduct, MOCK_NOW } from './product-builder';
import { PRODUCT_SEEDS } from './product-seeds';

/**
 * The built demo catalogue.
 *
 * Seeds are expanded once at module load; every price, variant, stock status and
 * gallery is derived through shared business logic, so the data cannot
 * contradict itself and adding a product is a data-only edit.
 */
export const MOCK_PRODUCTS: Product[] = PRODUCT_SEEDS.map((seed, index) => buildProduct(seed, index));

export function findProductByIdOrSlug(idOrSlug: string): Product | undefined {
  return MOCK_PRODUCTS.find((product) => product.id === idOrSlug || product.slug === idOrSlug);
}

export function productsByCategory(categoryId: string): Product[] {
  return MOCK_PRODUCTS.filter((product) => product.categoryId === categoryId);
}

export function productsBySeller(sellerId: string): Product[] {
  return MOCK_PRODUCTS.filter((product) => product.sellerId === sellerId);
}

export { MOCK_NOW };
export type { ProductSeed, OptionSeed, OptionValueSeed } from './product-builder';
