import { Link, useParams } from 'react-router';
import { Save } from 'lucide-react';
import { Button, ButtonLink, ErrorState, PageHeader } from '@/components/ui';
import { useProductById } from '@/hooks/useCatalog';
import { ProductForm } from '@/features/admin/ProductForm';

/**
 * "Add product" / "Edit product" screen.
 *
 * The heavy lifting lives in `features/admin/ProductForm`; this page only
 * resolves the route parameter, renders the header actions and handles the
 * not-found case (e.g. the product was deleted in another tab).
 */
export default function AdminProductFormPage() {
  const { productId } = useParams<{ productId: string }>();
  const product = useProductById(productId);
  const isEdit = Boolean(productId);

  if (isEdit && !product) {
    return (
      <>
        <PageHeader title="পণ্য সম্পাদনা" description="অনুরোধ করা পণ্যটি ডেমো স্টেটে নেই।" />
        <ErrorState title="পণ্যটি খুঁজে পাওয়া যায়নি" description="সম্ভবত এটি মোছে ফেলা হয়েছে বা লিংকটি পুরনো।">
          <ButtonLink to="/admin/products">পণ্য তালিকায় ফিরুন</ButtonLink>
        </ErrorState>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isEdit ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য'}
        description={
          isEdit
            ? 'দাম, স্টক, ছবি ও ভ্যারিয়েন্ট পরিবর্তন করে সংরক্ষণ করুন — স্টোরফ্রন্টে সাথে সাথে আপডেট হবে।'
            : 'ডান দিকের লাইভ প্রিভিউতে দেখতে দেখতে পণ্যের সব তথ্য পূরণ করুন।'
        }
        breadcrumbs={
          <nav aria-label="ব্রেডক্রাম্ব" className="mb-2 text-xs text-text-secondary">
            <Link to="/admin/products" className="hover:text-primary hover:underline">
              পণ্য
            </Link>{' '}
            / <span className="font-medium text-text-primary">{isEdit ? 'সম্পাদনা' : 'নতুন পণ্য'}</span>
          </nav>
        }
        actions={
          <>
            <ButtonLink to="/admin/products" variant="ghost">
              বাতিল
            </ButtonLink>
            <Button type="submit" form="admin-product-form" leftIcon={<Save aria-hidden className="size-4" />}>
              {isEdit ? 'পরিবর্তন সংরক্ষণ করুন' : 'পণ্য সংরক্ষণ করুন'}
            </Button>
          </>
        }
      />

      <ProductForm product={product} />
    </>
  );
}
