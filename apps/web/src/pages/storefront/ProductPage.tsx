import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { PackageSearch, ShieldCheck, Truck } from 'lucide-react';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { railsForProduct } from '@/services/catalog.service';
import { Alert, Breadcrumbs, ButtonLink, Card, EmptyState, SectionHeader } from '@/components/ui';
import { ProductGallery } from '@/features/catalog/ProductGallery';
import { ProductBuyBox } from '@/features/catalog/ProductBuyBox';
import { ReviewSection } from '@/features/catalog/ReviewSection';
import { ProductDescription, ProductSpecifications, ProductQuickFacts, SellerCard } from '@/features/catalog/ProductInfo';
import { DeliveryEstimator } from '@/features/catalog/DeliveryEstimator';
import { ProductGrid } from '@/features/catalog/ProductCard';
import { useBrands, useCategories, useProductBySlug, useProducts, useSellers } from '@/hooks/useCatalog';
import { useUiStore } from '@/store/ui.store';

/**
 * Product detail.
 *
 * Layout, long-form information and merchandising rails are split across
 * `features/catalog` components; this page only wires the demo dataset to them
 * and records the visit for the "recently viewed" rail.
 */

export default function ProductPage() {
  const { slug = '' } = useParams();
  const product = useProductBySlug(slug);
  const products = useProducts();
  const categories = useCategories();
  const brands = useBrands();
  const sellers = useSellers();
  const markViewed = useUiStore((state) => state.markViewed);
  const recentIds = useUiStore((state) => state.recentlyViewedIds);

  const productId = product?.id;

  useEffect(() => {
    if (productId) markViewed(productId);
  }, [productId, markViewed]);

  if (!product) {
    return (
      <EmptyState
        icon={<PackageSearch aria-hidden className="size-6" />}
        title="পণ্যটি পাওয়া যায়নি"
        description="লিংকটি হয়তো পুরোনো বা পণ্যটি ডেমো ডেটা থেকে সরিয়ে ফেলা হয়েছে।"
        action={
          <>
            <ButtonLink to="/shop">সব পণ্য দেখুন</ButtonLink>
            <ButtonLink to="/search" variant="outline">
              খুঁজুন
            </ButtonLink>
          </>
        }
      />
    );
  }

  const category = categories.find((candidate) => candidate.id === product.categoryId);
  const parentCategory = category?.parentId
    ? categories.find((candidate) => candidate.id === category.parentId)
    : undefined;
  const brand = brands.find((candidate) => candidate.id === product.brandId);
  const seller = sellers.find((candidate) => candidate.id === product.sellerId);
  const rails = railsForProduct(product, products, recentIds);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'হোম', href: '/' },
          { label: 'শপ', href: '/shop' },
          ...(parentCategory ? [{ label: parentCategory.nameBn, href: `/category/${parentCategory.slug}` }] : []),
          ...(category ? [{ label: category.nameBn, href: `/category/${category.slug}` }] : []),
          { label: product.titleBn ?? product.title },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-7">
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <ProductGallery product={product} />
        </div>

        <div className="min-w-0 space-y-4">
          <ProductBuyBox product={product} />
          <DeliveryEstimator product={product} />
        </div>
      </div>

      <ProductQuickFacts product={product} brand={brand} />

      <ul className="grid gap-3 sm:grid-cols-3">
        <li className="flex items-start gap-2.5 rounded-card border border-border bg-surface p-3">
          <Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="text-sm text-text-secondary">
            {toBanglaDigits(product.delivery.insideDhaka.min)}–{toBanglaDigits(product.delivery.insideDhaka.max)} দিনে ঢাকায়,
            ঢাকার বাইরে {toBanglaDigits(product.delivery.outsideDhaka.min)}–{toBanglaDigits(product.delivery.outsideDhaka.max)} দিন।
          </span>
        </li>
        <li className="flex items-start gap-2.5 rounded-card border border-border bg-surface p-3">
          <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="text-sm text-text-secondary">
            {product.warranty ?? 'ওয়ারেন্টি তথ্য নেই'} · {toBanglaDigits(product.returnPolicyDays)} দিনের রিটার্ন সুবিধা।
          </span>
        </li>
        <li className="flex items-start gap-2.5 rounded-card border border-border bg-surface p-3">
          <PackageSearch aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="text-sm text-text-secondary">
            ডেমো ইনভেন্টরি: {toBanglaDigits(product.variants.length)}টি ভ্যারিয়েন্ট, মোট {toBanglaDigits(product.stock)}টি ইউনিট।
          </span>
        </li>
      </ul>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="min-w-0 space-y-5">
          <ProductDescription product={product} />
          <ProductSpecifications product={product} />
        </div>

        <div className="space-y-5">
          {seller ? <SellerCard seller={seller} category={category} /> : null}

          <Card className="space-y-2">
            <h2 className="text-lg font-bold text-text-primary">ডেলিভারি ও রিটার্ন</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              অর্ডার প্রক্রিয়া সম্পূর্ণ ডেমো — কোনো পার্সেল পাঠানো হয় না। রিটার্ন অনুরোধ ডেমো অর্ডারে
              “রিটার্ন” অবস্থা হিসেবে দেখানো যাবে।
            </p>
            <Link to="/help/returns" className="inline-flex text-sm font-semibold text-primary hover:underline">
              রিটার্ন নীতি পড়ুন →
            </Link>
          </Card>
        </div>
      </div>

      <ReviewSection product={product} />

      {rails.bundle.length > 0 ? (
        <section aria-labelledby="product-bundle">
          <div id="product-bundle">
            <SectionHeader
              title="একসাথে কিনলে ভালো মানায়"
              subtitle="একই ক্রেতারা সাধারণত এই পণ্যগুলো একসাথে কেনেন"
            />
          </div>
          <ProductGrid products={rails.bundle} />
        </section>
      ) : null}

      {rails.related.length > 0 ? (
        <section aria-labelledby="product-related">
          <div id="product-related">
            <SectionHeader title="একই ধরনের পণ্য" href={category ? `/category/${category.slug}` : '/shop'} />
          </div>
          <ProductGrid products={rails.related.slice(0, 8)} />
        </section>
      ) : null}

      {rails.sameBrand.length > 0 ? (
        <section aria-labelledby="product-brand">
          <div id="product-brand">
            <SectionHeader
              title={brand ? `${brand.name} এর অন্যান্য পণ্য` : 'একই ব্র্যান্ডের পণ্য'}
              href={brand ? `/shop?brand=${brand.slug}` : '/brands'}
            />
          </div>
          <ProductGrid products={rails.sameBrand.slice(0, 8)} />
        </section>
      ) : null}

      {rails.viewed.length > 0 ? (
        <section aria-labelledby="product-viewed">
          <div id="product-viewed">
            <SectionHeader title="আপনি সম্প্রতি দেখেছেন" href="/shop" />
          </div>
          <ProductGrid products={rails.viewed.slice(0, 4)} />
        </section>
      ) : null}

      <Alert tone="info" title="ডেমো তথ্য">
        এই পণ্যের দাম, স্টক, রেটিং ও বিক্রেতার তথ্য সম্পূর্ণ নমুনা। অর্ডার করলে শুধু আপনার ব্রাউজারে একটি ডেমো
        অর্ডার তৈরি হবে — কোনো পেমেন্ট বা ডেলিভারি হবে না।{' '}
        <Link to="/help/payment" className="font-medium underline">
          পেমেন্ট সম্পর্কে
        </Link>
      </Alert>
    </div>
  );
}
