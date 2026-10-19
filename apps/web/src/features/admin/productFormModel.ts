import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormParsed, ProductFormValues } from '@shobdox/shared-validation';
import type { Product, ProductBadge } from '@shobdox/shared-types';
import { emptyProductDraft, normaliseOptions, recalculateProduct } from '@shobdox/shared-business-logic';
import { slugify } from '@shobdox/shared-utils';

/**
 * Shared types and helpers for the admin product form.
 *
 * The form drives the schema's *input* type and submits its parsed output, so
 * `useForm<ProductFormInput, unknown, ProductFormParsed>` matches the resolver
 * that `zodResolver(productFormSchema)` returns exactly — no cast required.
 * Defaulted arrays stay optional in the input type; the form initialises them
 * from `emptyProductFormValues()` / `productToFormValues()`.
 */

export type ProductFormInput = ProductFormValues;
export type ProductFormReturn = UseFormReturn<ProductFormInput, unknown, ProductFormParsed>;

export const PRODUCT_BADGE_OPTIONS: ProductBadge[] = [
  'new',
  'featured',
  'trending',
  'best-seller',
  'flash-sale',
  'limited-stock',
  'free-delivery',
  'official-warranty',
];

export const PRODUCT_STATUS_OPTIONS = [
  { value: 'active', label: 'সক্রিয় (স্টোরফ্রন্টে দেখা যাবে)' },
  { value: 'draft', label: 'খসড়া (শুধু ড্যাশবোর্ডে)' },
  { value: 'archived', label: 'আর্কাইভড (লুকানো)' },
];

/** `register` options for optional numeric fields: empty input becomes `undefined`. */
export const OPTIONAL_NUMBER = {
  setValueAs: (value: string) => (value === '' ? undefined : Number(value)),
};

/**
 * Builds the product the preview card renders.
 *
 * It reuses `emptyProductDraft()` + `recalculateProduct()`, so the preview goes
 * through exactly the same derivation as the record that will be saved: lowest
 * variant price, total stock and stock status can never disagree.
 */
export function previewProduct(values: ProductFormInput, fallbackSellerId: string): Product {
  const sellerId = values.sellerId || fallbackSellerId;
  const draft = emptyProductDraft({ sellerId, categoryId: values.categoryId || 'cat-preview' });
  const gallery = values.gallery ?? [];
  const images = [values.thumbnail, ...gallery].filter((url): url is string => Boolean(url));
  const price = Number.isFinite(values.price) ? values.price : 0;

  return recalculateProduct({
    ...draft,
    id: 'admin-preview',
    slug: slugify(values.title || 'admin-preview', 'product'),
    title: values.title || 'পণ্যের নাম দিন',
    titleBn: values.titleBn,
    shortDescription: values.shortDescription || 'সংক্ষিপ্ত বিবরণ এখানে দেখা যাবে।',
    description: values.description || 'বিবরণ এখানে দেখা যাবে।',
    descriptionBn: values.descriptionBn,
    categoryId: values.categoryId || draft.categoryId,
    brandId: values.brandId,
    sellerId,
    thumbnail: images[0] ?? '',
    images: images.map((url, index) => ({
      id: `preview-img-${index + 1}`,
      url,
      alt: values.titleBn ?? values.title,
    })),
    price,
    compareAtPrice: values.compareAtPrice,
    variants: values.variants.map((variant, index) => ({
      id: variant.id || `preview-v${index + 1}`,
      sku: variant.sku,
      optionValues: variant.optionValues,
      price: Number.isFinite(variant.price) ? variant.price : price,
      compareAtPrice: variant.compareAtPrice,
      stock: Number.isFinite(variant.stock) ? variant.stock : 0,
    })),
    options: normaliseOptions(
      (values.options ?? []).map((option) => ({
        id: option.id,
        name: option.name,
        display: option.display,
        values: option.values.map((value) => ({
          label: value.label,
          labelBn: value.labelBn,
          hex: value.hex,
          priceDelta: value.priceDelta,
        })),
      })),
    ),
    specifications: values.specifications ?? [],
    tags: values.tags ?? [],
    badges: (values.badges ?? []) as ProductBadge[],
    status: values.status,
  });
}

/** Resolves an option-value id to its customer-facing label, for tables. */
export function optionValueLabel(product: { options: Product['options'] }, optionId: string, valueId: string): string {
  const option = product.options.find((candidate) => candidate.id === optionId);
  const value = option?.values.find((candidate) => candidate.id === valueId);
  return value?.labelBn ?? value?.label ?? valueId;
}
