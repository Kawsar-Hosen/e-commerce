import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { RotateCcw, Save } from 'lucide-react';
import { productFormSchema, type ProductFormParsed } from '@shobdox/shared-validation';
import type { Product } from '@shobdox/shared-types';
import { Button, Card, KeyValue } from '@/components/ui';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { ProductCard } from '@/features/catalog/ProductCard';
import { useBrands, useCategories, useSellers } from '@/hooks/useCatalog';
import {
  emptyProductFormValues,
  productFromFormValues,
  productToFormValues,
} from '@/services/admin.service';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { previewProduct, type ProductFormInput, type ProductFormReturn } from './productFormModel';
import { ProductBasicSection, ProductOrganisationSection } from './ProductFormSections';
import { ProductMediaSection } from './ProductFormMedia';
import { ProductDeliverySection, ProductPricingSection, ProductSpecificationsSection } from './ProductFormLogistics';
import { ProductOptionsEditor } from './ProductOptionsEditor';
import { VariantMatrixEditor } from './VariantMatrixEditor';

/**
 * Admin product form.
 *
 * One react-hook-form instance drives every section and the live preview.
 * Without options the product has a single default variant, so for that case
 * the base price/SKU/stock are copied onto it before preview and submit — the
 * saved record is always built by `productFromFormValues()` /
 * `recalculateProduct()`, never assembled by hand here.
 */

export function ProductForm({ product }: { product?: Product }) {
  const navigate = useNavigate();
  const categories = useCategories();
  const brands = useBrands();
  const sellers = useSellers();
  const fallbackSellerId = sellers[0]?.id ?? 'seller-demo';

  const initialValues = useMemo(
    () =>
      product
        ? productToFormValues(product)
        : emptyProductFormValues(fallbackSellerId, categories[0]?.id),
    // Re-seed only when a different product is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product?.id],
  );

  const form: ProductFormReturn = useForm<ProductFormInput, unknown, ProductFormParsed>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [initialValues, form]);

  const watched = useWatch({ control: form.control }) as ProductFormInput;
  const values = withBaseVariant(watched);
  const preview = useMemo(() => previewProduct(values, fallbackSellerId), [values, fallbackSellerId]);
  const totalStock = values.variants.reduce(
    (sum, variant) => sum + (Number.isFinite(variant.stock) ? variant.stock : 0),
    0,
  );

  const onSubmit = form.handleSubmit((parsed) => {
    const record = productFromFormValues(withBaseVariant(parsed), {
      existing: product,
      sellerId: fallbackSellerId,
    });
    useDataStore.getState().upsertProduct(record);
    toast({
      tone: 'success',
      title: product ? 'পণ্য আপডেট হয়েছে' : 'নতুন পণ্য যোগ হয়েছে',
      description: record.titleBn ?? record.title,
    });
    navigate('/admin/products');
  });

  return (
    <form id="admin-product-form" onSubmit={onSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]" noValidate>
      <div className="min-w-0 space-y-5">
        <ProductBasicSection form={form} />
        <ProductMediaSection form={form} />
        <ProductOrganisationSection form={form} categories={categories} brands={brands} sellers={sellers} />
        <ProductPricingSection form={form} />
        <ProductDeliverySection form={form} />
        <ProductOptionsEditor form={form} productId={product?.id} />
        <VariantMatrixEditor form={form} />
        <ProductSpecificationsSection form={form} />
      </div>

      <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
        <Card>
          <h2 className="text-lg font-semibold text-text-primary">লাইভ প্রিভিউ</h2>
          <p className="mt-0.5 text-sm text-text-secondary">স্টোরফ্রন্টের কার্ডে যেমন দেখাবে।</p>

          <div className="mx-auto mt-3 max-w-56">
            <ProductCard product={preview} interactive={false} />
          </div>

          <dl className="mt-4 border-t border-divider pt-2">
            <KeyValue label="ভ্যারিয়েন্ট">{toBanglaDigits(values.variants.length)}টি</KeyValue>
            <KeyValue label="মোট স্টক">{toBanglaDigits(totalStock)}</KeyValue>
            <KeyValue label="লিস্টিং দাম">{formatTaka(preview.price)}</KeyValue>
            {preview.compareAtPrice ? (
              <KeyValue label="আগের দাম">{formatTaka(preview.compareAtPrice)}</KeyValue>
            ) : null}
          </dl>

          <div className="mt-4 flex flex-col gap-2">
            <Button type="submit" leftIcon={<Save aria-hidden className="size-4" />}>
              {product ? 'পরিবর্তন সংরক্ষণ করুন' : 'পণ্য সংরক্ষণ করুন'}
            </Button>
            <Button
              variant="ghost"
              leftIcon={<RotateCcw aria-hidden className="size-4" />}
              onClick={() => form.reset(initialValues)}
            >
              ফর্ম রিসেট করুন
            </Button>
            <Button variant="ghost" onClick={() => navigate('/admin/products')}>
              বাতিল করুন
            </Button>
          </div>
        </Card>
      </aside>
    </form>
  );
}

/**
 * Without options the matrix has one row that must mirror the base fields, so
 * the preview and the saved record agree with what the form shows. The cast is
 * contained here: the spread keeps every other field of `values` as-is.
 */
interface BaseVariantShape {
  sku: string;
  price: number;
  compareAtPrice?: number | undefined;
  stock: number;
  options?: ReadonlyArray<unknown> | undefined;
  variants: Array<{
    id: string;
    sku: string;
    optionValues: Record<string, string>;
    price: number;
    compareAtPrice?: number | undefined;
    stock: number;
  }>;
}

function withBaseVariant<T extends BaseVariantShape>(values: T): T {
  const options = values.options ?? [];
  const [first] = values.variants;
  if (options.length > 0 || !first) return values;

  const next = {
    ...first,
    sku: values.sku,
    price: values.price,
    compareAtPrice: values.compareAtPrice,
    stock: values.stock,
  };

  return { ...values, variants: [next] } as T;
}
