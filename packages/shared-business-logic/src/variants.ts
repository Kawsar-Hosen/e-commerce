import type {
  EntityId,
  Product,
  ProductOption,
  ProductOptionValue,
  ProductVariant,
  Taka,
} from '@shobdox/shared-types';
import { LOW_STOCK_THRESHOLD, totalStock, productStockStatus } from './stock';
import { productDiscountPercent } from './pricing';

/**
 * Variant and option helpers.
 *
 * Three screens need to turn a set of shopper-facing choices into concrete SKUs:
 * the demo catalogue builder, the admin product form and the seller product
 * form. They all call `generateVariantMatrix()` so the same combination always
 * produces the same rows, the same SKUs and the same stock maths.
 */

/** Stable, URL-safe id for an option value, e.g. `color-midnight-black`. */
export function optionValueId(optionId: string, label: string): EntityId {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${optionId}-${slug || 'value'}`;
}

export interface OptionInput {
  id?: string;
  name: string;
  nameBn?: string;
  display: ProductOption['display'];
  values: Array<{
    label: string;
    labelBn?: string;
    hex?: string;
    priceDelta?: Taka;
    image?: string;
  }>;
}

/** Normalises friendly form rows into the domain `ProductOption` shape. */
export function normaliseOptions(input: OptionInput[]): ProductOption[] {
  return input
    .filter((option) => option.name.trim() && option.values.length > 0)
    .map((option, index) => {
      const id = (option.id?.trim() || option.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || `option-${index + 1}`);
      return {
        id,
        name: option.name.trim(),
        nameBn: option.nameBn?.trim() || undefined,
        display: option.display,
        values: option.values
          .filter((value) => value.label.trim())
          .map<ProductOptionValue>((value) => ({
            id: optionValueId(id, value.label),
            label: value.label.trim(),
            labelBn: value.labelBn?.trim() || undefined,
            hex: value.hex,
            priceDelta: value.priceDelta,
            image: value.image,
          })),
      };
    });
}

/** Every combination of the supplied options, in a stable order. */
export function optionCombinations(options: ProductOption[]): Array<Record<EntityId, EntityId>> {
  if (options.length === 0) return [{}];

  return options.reduce<Array<Record<EntityId, EntityId>>>(
    (combinations, option) =>
      combinations.flatMap((combination) =>
        option.values.map((value) => ({ ...combination, [option.id]: value.id })),
      ),
    [{}],
  );
}

export interface GenerateVariantMatrixInput {
  productId: EntityId;
  options: ProductOption[];
  basePrice: Taka;
  compareAtPrice?: Taka;
  /**
   * Units available per option-value id. A combination can never have more stock
   * than its scarcest selected value — the same rule a warehouse follows.
   */
  stockByValueId?: Record<EntityId, number>;
  /** Used for value ids missing from `stockByValueId`. */
  defaultStockPerValue?: number;
  /** Upper bound applied when a combination has no option-value stock hint. */
  defaultVariantStock?: number;
  skuPrefix: string;
}

/** Small deterministic SKU suffix, e.g. `BLK-256` from the selected values. */
function skuSuffix(optionValues: Record<EntityId, EntityId>, options: ProductOption[]): string {
  return options
    .map((option) => {
      const valueId = optionValues[option.id];
      const value = option.values.find((candidate) => candidate.id === valueId);
      const label = value?.label ?? valueId ?? '';
      return label
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim()
        .split(/\s+/)
        .map((part) => part.slice(0, 3).toUpperCase())
        .join('');
    })
    .filter(Boolean)
    .join('-');
}

/** Builds the full variant matrix for a product's options. */
export function generateVariantMatrix({
  productId,
  options,
  basePrice,
  compareAtPrice,
  stockByValueId = {},
  defaultStockPerValue = 20,
  defaultVariantStock = 24,
  skuPrefix,
}: GenerateVariantMatrixInput): ProductVariant[] {
  const deltaOfValue = new Map<EntityId, number>();
  const imageOfValue = new Map<EntityId, string | undefined>();
  for (const option of options) {
    for (const value of option.values) {
      deltaOfValue.set(value.id, value.priceDelta ?? 0);
      if (value.image) imageOfValue.set(value.id, value.image);
    }
  }

  if (options.length === 0) {
    return [
      {
        id: `${productId}-default`,
        sku: `${skuPrefix}-STD`,
        optionValues: {},
        price: basePrice,
        compareAtPrice,
        stock: defaultVariantStock,
      },
    ];
  }

  return optionCombinations(options).map((optionValues, index) => {
    const valueIds = Object.values(optionValues);
    const delta = valueIds.reduce((sum, valueId) => sum + (deltaOfValue.get(valueId) ?? 0), 0);
    const stock = valueIds.length
      ? Math.min(...valueIds.map((valueId) => stockByValueId[valueId] ?? defaultStockPerValue))
      : defaultVariantStock;

    const suffix = skuSuffix(optionValues, options);
    const image = valueIds.map((valueId) => imageOfValue.get(valueId)).find(Boolean);

    return {
      id: `${productId}-v${index + 1}`,
      sku: `${skuPrefix}-${suffix || String(index + 1).padStart(2, '0')}`,
      optionValues,
      price: basePrice + delta,
      compareAtPrice: compareAtPrice ? compareAtPrice + delta : undefined,
      stock,
      image,
    };
  });
}

/**
 * Recomputes every value on a product that is *derived* from its variants.
 *
 * Called after any edit (admin form, seller stock update, demo reset) so the
 * listing price, discount badge, total stock and stock status can never drift
 * away from the variant rows that actually drive the cart.
 */
export function recalculateProduct(product: Product, now: Date = new Date()): Product {
  const variants = product.variants.length > 0 ? product.variants : generateVariantMatrix({
    productId: product.id,
    options: [],
    basePrice: product.price,
    compareAtPrice: product.compareAtPrice,
    skuPrefix: product.slug.slice(0, 6).toUpperCase(),
  });

  const prices = variants.map((variant) => variant.price);
  const price = prices.length > 0 ? Math.min(...prices) : product.price;

  const compareAtCandidates = variants
    .map((variant) => variant.compareAtPrice)
    .filter((value): value is Taka => typeof value === 'number' && value > price);

  const compareAtPrice = compareAtCandidates.length > 0 ? Math.max(...compareAtCandidates) : undefined;
  const stock = totalStock({ ...product, variants });

  return {
    ...product,
    variants,
    price,
    compareAtPrice,
    discountPercent: productDiscountPercent({ ...product, price, compareAtPrice }),
    stock,
    stockStatus: productStockStatus({ ...product, variants }),
    updatedAt: now.toISOString(),
  };
}

/** Products whose cheapest variant is at or below the low-stock threshold. */
export function needsRestock(product: Product, threshold = LOW_STOCK_THRESHOLD): boolean {
  return product.variants.some((variant) => variant.stock <= threshold);
}

export interface EmptyProductDraftInput {
  sellerId: EntityId;
  categoryId: EntityId;
  brandId?: EntityId;
  title?: string;
}

/** A valid product skeleton for the admin/seller "new product" form. */
export function emptyProductDraft({
  sellerId,
  categoryId,
  brandId,
  title = '',
}: EmptyProductDraftInput): Product {
  const id = `p-new-${Math.random().toString(36).slice(2, 8)}`;
  const basePrice = 1_000;

  return {
    id,
    slug: '',
    title,
    shortDescription: '',
    description: '',
    categoryId,
    brandId,
    sellerId,
    thumbnail: '',
    images: [],
    price: basePrice,
    discountPercent: 0,
    rating: 0,
    reviewCount: 0,
    reviews: [],
    options: [],
    variants: generateVariantMatrix({
      productId: id,
      options: [],
      basePrice,
      skuPrefix: 'SDX-NEW',
      defaultVariantStock: 0,
    }),
    specifications: [],
    tags: [],
    badges: [],
    stockStatus: 'out-of-stock',
    stock: 0,
    sold: 0,
    viewCount: 0,
    returnPolicyDays: 7,
    delivery: {
      insideDhaka: { min: 1, max: 3 },
      outsideDhaka: { min: 3, max: 5 },
      deliveryFeeInsideDhaka: 60,
      deliveryFeeOutsideDhaka: 120,
      cashOnDeliveryAvailable: true,
    },
    isFeatured: false,
    isTrending: false,
    isBestSeller: false,
    isNewArrival: true,
    isFlashSale: false,
    recommendationScore: 0,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
