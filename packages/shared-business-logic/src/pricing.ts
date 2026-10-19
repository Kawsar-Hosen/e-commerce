import type { Product, ProductOption, ProductVariant, Taka } from '@shobdox/shared-types';
import { discountPercentOf, roundTo } from '@shobdox/shared-utils';

/**
 * Pricing rules shared by the website and the Android app.
 * Every price the customer sees is derived here — no component does its own
 * arithmetic, so the cart, the admin table and the mobile app can never disagree.
 */

/** Consumer VAT rate in Bangladesh for this demo. Prices are VAT-inclusive. */
export const VAT_RATE = 0.05;

/**
 * Resolves the variant a shopper is currently looking at from a selection of
 * option values. Returns `undefined` when the combination is not sold.
 */
export function findVariantByOptions(
  product: Product,
  selection: Record<string, string>,
): ProductVariant | undefined {
  const entries = Object.entries(selection).filter(([, value]) => Boolean(value));
  if (entries.length === 0) return product.variants[0];

  return product.variants.find((variant) =>
    entries.every(([optionId, valueId]) => variant.optionValues[optionId] === valueId),
  );
}

/** Default selection for a product page: the first in-stock variant, else the first. */
export function defaultOptionSelection(product: Product): Record<string, string> {
  const preferred = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
  return preferred ? { ...preferred.optionValues } : {};
}

/**
 * The price a variant sells for. When a variant has no explicit price the
 * product-level price is used (variant-level overrides are optional).
 */
export function variantUnitPrice(product: Product, variant: ProductVariant): Taka {
  return variant.price > 0 ? variant.price : product.price;
}

export function variantCompareAtPrice(product: Product, variant: ProductVariant): Taka | undefined {
  return variant.compareAtPrice ?? product.compareAtPrice;
}

/** Savings on a single unit. Never negative. */
export function variantSaving(product: Product, variant: ProductVariant): Taka {
  const compareAt = variantCompareAtPrice(product, variant);
  if (!compareAt) return 0;
  return Math.max(0, compareAt - variantUnitPrice(product, variant));
}

export function variantDiscountPercent(product: Product, variant: ProductVariant): number {
  return discountPercentOf(variantUnitPrice(product, variant), variantCompareAtPrice(product, variant));
}

/** Cheapest purchasable variant, used for "from ৳x" labels and for sorting. */
export function cheapestVariant(product: Product): ProductVariant | undefined {
  const inStock = product.variants.filter((variant) => variant.stock > 0);
  const pool = inStock.length > 0 ? inStock : product.variants;
  return pool.reduce<ProductVariant | undefined>(
    (best, variant) => (best === undefined || variantUnitPrice(product, variant) < variantUnitPrice(product, best) ? variant : best),
    undefined,
  );
}

export interface PriceRange {
  min: Taka;
  max: Taka;
  /** True when two variants sell at different prices. */
  isRange: boolean;
}

/**
 * The price band shown on a listing card. Falls back to the product's own
 * `price` row when a product somehow has no variants.
 */
export function productPriceRange(product: Product): PriceRange {
  if (product.variants.length === 0) {
    return { min: product.price, max: product.price, isRange: false };
  }

  const prices = product.variants.map((variant) => variantUnitPrice(product, variant));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max, isRange: min !== max };
}

/** `৳ 1,299` or `৳ 1,299 – ৳ 1,599`. */
export function formatPriceRange(range: PriceRange, formatter: (value: Taka) => string): string {
  return range.isRange ? `${formatter(range.min)} – ${formatter(range.max)}` : formatter(range.min);
}

/** Highest compare-at price across variants — the "previous price" on a card. */
export function productCompareAtPrice(product: Product): Taka | undefined {
  const candidates = product.variants
    .map((variant) => variantCompareAtPrice(product, variant))
    .filter((value): value is Taka => typeof value === 'number' && value > 0);
  if (candidates.length === 0) return undefined;
  return Math.max(...candidates);
}

/** The deepest discount available anywhere on the product. */
export function productDiscountPercent(product: Product): number {
  if (product.variants.length === 0) return discountPercentOf(product.price, product.compareAtPrice);
  return product.variants.reduce(
    (best, variant) => Math.max(best, variantDiscountPercent(product, variant)),
    0,
  );
}

/**
 * Applies option-level surcharges (e.g. 256GB costs ৳3,000 more) on top of the
 * resolved variant price. Values without a `priceDelta` are ignored.
 */
export function priceWithOptionDeltas(
  product: Product,
  variant: ProductVariant,
  selection: Record<string, string>,
): Taka {
  let total = variantUnitPrice(product, variant);

  for (const option of product.options) {
    const valueId = selection[option.id];
    if (!valueId) continue;
    const value = option.values.find((candidate) => candidate.id === valueId);
    if (value?.priceDelta) total += value.priceDelta;
  }

  return roundTo(total, 0);
}

/**
 * Extracts the VAT portion of a VAT-inclusive price so the cart can show it
 * without adding it a second time.
 */
export function extractIncludedVat(inclusiveAmount: Taka, rate = VAT_RATE): Taka {
  if (inclusiveAmount <= 0) return 0;
  return roundTo((inclusiveAmount * rate) / (1 + rate), 0);
}

/** Options that have at least one value still in stock for a given selection. */
export function availableValuesFor(
  product: Product,
  option: ProductOption,
  selection: Record<string, string>,
): Set<string> {
  const otherSelections = Object.entries(selection).filter(([optionId]) => optionId !== option.id);

  const available = new Set<string>();
  for (const variant of product.variants) {
    if (variant.stock <= 0) continue;
    const matchesOthers = otherSelections.every(
      ([optionId, valueId]) => !valueId || variant.optionValues[optionId] === valueId,
    );
    if (!matchesOthers) continue;

    const valueId = variant.optionValues[option.id];
    if (valueId) available.add(valueId);
  }
  return available;
}
