import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormParsed, ProductFormValues } from '@shobdox/shared-validation';

/**
 * Shared typing for the seller product form.
 *
 * `useForm<ProductFormValues, unknown, ProductFormParsed>` is required because
 * the Zod schema has `.default()` fields: the input type has optional properties
 * while the parsed output has them filled in.
 */
export type ProductForm = UseFormReturn<ProductFormValues, unknown, ProductFormParsed>;

export type ProductOptionDraft = NonNullable<ProductFormValues['options']>[number];
export type ProductOptionValueDraft = ProductOptionDraft['values'][number];
export type ProductVariantDraft = NonNullable<ProductFormValues['variants']>[number];
export type SpecificationDraft = NonNullable<ProductFormValues['specifications']>[number];
