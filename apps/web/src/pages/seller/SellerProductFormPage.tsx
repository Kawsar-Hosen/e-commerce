import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Store } from 'lucide-react';
import type { ProductFormParsed, ProductFormValues } from '@shobdox/shared-validation';
import { productFormSchema } from '@shobdox/shared-validation';
import { useCurrentSeller } from '@/components/layout/SellerLayout';
import { Alert, Badge, Breadcrumbs, Button, ButtonLink, Card, PageHeader } from '@/components/ui';
import {
  BadgesAndFlagsSection,
  BasicInfoSection,
  DeliverySection,
  MediaSection,
  PricingSection,
  TaxonomySection,
} from '@/features/seller/ProductFormSections';
import { OptionsVariantsEditor, SpecificationsEditor } from '@/features/seller/ProductFormVariants';
import { emptyProductFormValues, productFromFormValues, productToFormValues } from '@/services/admin.service';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';

/**
 * Add / edit product for the signed-in seller.
 *
 * The form shape is identical to the admin product form, but `sellerId` is
 * forced to the current seller and the seller field is not editable. A product
 * that belongs to another seller can never be opened here.
 */
export default function SellerProductFormPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const seller = useCurrentSeller();
  const products = useDataStore((state) => state.products);
  const categories = useDataStore((state) => state.categories);
  const brands = useDataStore((state) => state.brands);
  const upsertProduct = useDataStore((state) => state.upsertProduct);

  const existing = productId ? products.find((product) => product.id === productId) : undefined;
  const draftId = useMemo(() => existing?.id ?? `p-seller-${Date.now().toString(36)}`, [existing?.id]);

  const form = useForm<ProductFormValues, unknown, ProductFormParsed>({
    resolver: zodResolver(productFormSchema),
    defaultValues: existing ? productToFormValues(existing) : emptyProductFormValues(seller.id, categories[0]?.id),
  });

  const notFound = Boolean(productId) && !existing;
  const foreign = Boolean(existing) && existing?.sellerId !== seller.id;

  if (notFound || foreign) {
    return (
      <div className="space-y-5">
        <PageHeader title="পণ্য সম্পাদনা" description="ডেমো সীমাবদ্ধতা" />
        <Alert tone="warning" title={foreign ? 'এই পণ্যটি আপনার নয়' : 'পণ্যটি পাওয়া যায়নি'}>
          {foreign
            ? 'এই পণ্যটি অন্য একটি সেলারের স্টোরের অধীনে — নিরাপত্তার স্বার্থে আপনি শুধু নিজের পণ্যই সম্পাদনা করতে পারেন।'
            : 'সংশ্লিষ্ট পণ্যটি ডেমো ডেটাসেটে নেই — সম্ভবত এটি মুছে ফেলা হয়েছে।'}
          <div className="mt-3">
            <ButtonLink to="/seller/products" variant="outline">
              আমার পণ্যে ফিরে যান
            </ButtonLink>
          </div>
        </Alert>
      </div>
    );
  }

  const onSubmit = (values: ProductFormParsed) => {
    const product = productFromFormValues(values, { existing, sellerId: seller.id });
    upsertProduct(product);
    toast({
      tone: 'success',
      title: existing ? 'পণ্য আপডেট হয়েছে' : 'পণ্য যোগ হয়েছে',
      description: product.titleBn ?? product.title,
    });
    navigate('/seller/products');
  };

  const errorCount = Object.keys(form.formState.errors).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title={existing ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য'}
        description={
          existing
            ? `${existing.titleBn ?? existing.title} — পরিবর্তন সংরক্ষণ করলে স্টোরফ্রন্টেও আপডেট হবে।`
            : 'আপনার স্টোরে নতুন পণ্য যোগ করুন। সব তথ্য এই ব্রাউজারে সংরক্ষিত হয়।'
        }
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'সেলার', href: '/seller' },
              { label: 'আমার পণ্য', href: '/seller/products' },
              { label: existing ? 'সম্পাদনা' : 'নতুন' },
            ]}
          />
        }
        actions={
          <>
            <ButtonLink to="/seller/products" variant="ghost">
              বাতিল
            </ButtonLink>
            <Button type="submit" form="seller-product-form" leftIcon={<Save aria-hidden className="size-4" />}>
              {existing ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </Button>
          </>
        }
      />

      <Card className="flex flex-wrap items-center gap-2 py-2.5">
        <Badge tone="primary" size="sm">
          <Store aria-hidden className="size-3" />
          সেলার নির্ধারিত
        </Badge>
        <span className="text-sm text-text-primary">{seller.profile.storeNameBn ?? seller.profile.storeName}</span>
        <span className="text-xs text-text-secondary">
          পণ্যটি ডেমোতে শুধু এই স্টোরের অধীনে যোগ করা যাবে।
        </span>
      </Card>

      {form.formState.isSubmitted && errorCount > 0 ? (
        <Alert tone="error" title="ফর্মে কিছু ত্রুটি আছে">
          হাইলাইট করা ফিল্ডগুলো ঠিক করে আবার সংরক্ষণ করুন। ({errorCount}টি ক্ষেত্র)
        </Alert>
      ) : null}

      <form id="seller-product-form" className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <BasicInfoSection form={form} />
        <div className="grid gap-5 xl:grid-cols-2">
          <TaxonomySection form={form} categories={categories} brands={brands} />
          <MediaSection form={form} />
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <PricingSection form={form} />
          <DeliverySection form={form} />
        </div>
        <OptionsVariantsEditor form={form} productId={draftId} />
        <SpecificationsEditor form={form} />
        <BadgesAndFlagsSection form={form} />

        <div className="flex flex-wrap items-center justify-end gap-2">
          <ButtonLink to="/seller/products" variant="ghost">
            বাতিল
          </ButtonLink>
          <Button type="submit" leftIcon={<Save aria-hidden className="size-4" />} loading={form.formState.isSubmitting}>
            {existing ? 'পণ্য আপডেট করুন' : 'পণ্য সংরক্ষণ করুন'}
          </Button>
        </div>

        <p className="text-xs text-text-secondary">
          টিপ: ছবি আপলোড ডেমোতে নেই — <Link to="/seller/products" className="text-primary hover:underline">আমার পণ্য</Link> থেকে
          পরে URL বদলে দিতে পারবেন।
        </p>
      </form>
    </div>
  );
}
