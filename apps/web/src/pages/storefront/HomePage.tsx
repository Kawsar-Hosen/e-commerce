import { useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BadgeCheck, Headphones, RotateCcw, Truck, Wallet } from 'lucide-react';
import { CUSTOMER_BENEFITS } from '@shobdox/shared-mock-data';
import { featuredProducts, newArrivals } from '@shobdox/shared-business-logic';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { Alert, SectionHeader } from '@/components/ui';
import { ProductGrid } from '@/features/catalog/ProductCard';
import { CategoryTiles } from '@/features/catalog/CategoryTiles';
import { HomeHero, PromoStrip } from '@/features/catalog/HomeHero';
import { ProductRail } from '@/features/catalog/ProductRail';
import { buildHomeRails, recommendedForYou } from '@/services/catalog.service';
import { useBanners, useBrands, useCategories, useProducts, useTopLevelCategories } from '@/hooks/useCatalog';
import { useUiStore } from '@/store/ui.store';
import { useWishlistStore } from '@/store/wishlist.store';

/**
 * Storefront home.
 *
 * Every rail is produced by `buildHomeRails()` / the recommendation engine in
 * `@shobdox/shared-business-logic`, which is also what the Expo app renders —
 * so merchandising rules exist exactly once.
 */

const BENEFIT_ICONS = {
  Truck: Truck,
  Wallet: Wallet,
  RotateCcw: RotateCcw,
  Headphones: Headphones,
} as const;

export default function HomePage() {
  const products = useProducts();
  const categories = useCategories();
  const topLevel = useTopLevelCategories();
  const banners = useBanners();
  const brands = useBrands();
  const recentIds = useUiStore((state) => state.recentlyViewedIds);
  const wishlistIds = useWishlistStore((state) => state.productIds);

  const heroBanners = useMemo(
    () =>
      banners
        .filter((banner) => banner.isActive && banner.placement === 'hero')
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [banners],
  );

  const stripBanners = useMemo(
    () =>
      banners
        .filter((banner) => banner.isActive && banner.placement === 'strip')
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .slice(0, 3),
    [banners],
  );

  const rails = useMemo(() => buildHomeRails(products, categories), [products, categories]);
  const recommendations = useMemo(
    () => recommendedForYou(products, recentIds, wishlistIds),
    [products, recentIds, wishlistIds],
  );
  const featured = useMemo(() => featuredProducts(products).slice(0, 8), [products]);
  const fresh = useMemo(() => newArrivals(products).slice(0, 8), [products]);
  const recentlyViewed = useMemo(
    () =>
      recentIds
        .map((id) => products.find((product) => product.id === id))
        .filter((product): product is NonNullable<typeof product> => Boolean(product))
        .slice(0, 8),
    [products, recentIds],
  );

  const flashRail = rails.find((rail) => rail.variant === 'flash');
  const otherRails = rails.filter((rail) => rail.variant !== 'flash');

  return (
    <div className="space-y-8 pb-4">
      <HomeHero banners={heroBanners} />

      {/* benefits */}
      <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {CUSTOMER_BENEFITS.map((benefit) => {
          const Icon = BENEFIT_ICONS[benefit.icon as keyof typeof BENEFIT_ICONS] ?? BadgeCheck;
          return (
            <li
              key={benefit.id}
              className="flex items-start gap-2.5 rounded-card border border-border bg-surface p-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-card bg-primary-soft text-primary-dark">
                <Icon aria-hidden className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-text-primary">{benefit.title}</span>
                <span className="block text-xs leading-relaxed text-text-secondary">
                  {benefit.description}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <CategoryTiles categories={topLevel.slice(0, 12)} />

      {flashRail ? <ProductRail rail={flashRail} priorityCount={2} /> : null}

      <PromoStrip banners={stripBanners} />

      {recommendations.length > 0 ? (
        <section aria-labelledby="home-recommended">
          <div id="home-recommended">
            <SectionHeader
              title="আপনার জন্য প্রস্তাবিত"
              subtitle={
                recentlyViewed.length > 0 || wishlistIds.length > 0
                  ? 'আপনার দেখা ও পছন্দের পণ্যের ভিত্তিতে'
                  : 'গ্রাহকদের পছন্দের পণ্য থেকে বাছাই করা'
              }
              href="/shop?sort=popularity"
            />
          </div>

          <ProductGrid products={recommendations.slice(0, 8)} priorityCount={2} />
        </section>
      ) : null}

      {otherRails.map((rail) => (
        <ProductRail key={rail.id} rail={rail} />
      ))}

      {featured.length > 0 ? (
        <section aria-labelledby="home-featured">
          <div id="home-featured">
            <SectionHeader
              title="নির্বাচিত পণ্য"
              subtitle="সম্পাদকীয় বাছাই — সবচেয়ে জনপ্রিয় ও প্রিমিয়াম পণ্য"
              href="/shop"
            />
          </div>
          <ProductGrid products={featured} />
        </section>
      ) : null}

      {fresh.length > 0 ? (
        <section aria-labelledby="home-new">
          <div id="home-new">
            <SectionHeader
              title="সদ্য এসেছে"
              subtitle="নতুন পণ্য প্রতিদিন যোগ হচ্ছে (ডেমো)"
              href="/shop?sort=newest"
            />
          </div>
          <ProductGrid products={fresh} />
        </section>
      ) : null}

      <section aria-labelledby="home-brands">
        <div id="home-brands">
          <SectionHeader
            title="জনপ্রিয় ব্র্যান্ড"
            subtitle="বাংলাদেশে ও আন্তর্জাতিকভাবে পরিচিত ব্র্যান্ড"
            href="/brands"
          />
        </div>

        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {brands
            .filter((brand) => brand.isFeatured)
            .slice(0, 10)
            .map((brand) => (
              <li key={brand.id}>
                <Link
                  to={`/shop?brand=${brand.slug}`}
                  className="flex h-full flex-col items-start gap-1 rounded-card border border-border bg-surface p-3 transition-colors hover:border-primary"
                >
                  <span className="font-num text-base font-bold text-text-primary">{brand.wordmark}</span>
                  <span className="text-xs text-text-secondary">{brand.nameBn ?? brand.name}</span>
                  <span className="mt-auto pt-1 font-num text-xs text-text-muted">
                    {toBanglaDigits(brand.productCount)}টি পণ্য
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </section>

      {recentlyViewed.length > 0 ? (
        <section aria-labelledby="home-viewed">
          <div id="home-viewed">
            <SectionHeader
              title="আপনি সম্প্রতি দেখেছেন"
              subtitle="আপনার দেখা সর্বশেষ পণ্যগুলো"
              href="/shop"
              linkLabel="আরও দেখুন"
            />
          </div>
          <ProductGrid products={recentlyViewed} />
        </section>
      ) : null}

      <Alert tone="warning" title="এটি একটি ডেমো মার্কেটপ্লেস">
        সব পণ্য, দাম, রিভিউ ও অর্ডার নমুনা ডেটা। কোনো প্রকৃত পেমেন্ট, অর্ডার বা ডেলিভারি হয় না এবং কোনো তথ্য কোনো
        সার্ভারে পাঠানো হয় না — সব কিছু শুধু আপনার ব্রাউজারে সংরক্ষিত।{' '}
        <Link to="/help/about" className="font-medium underline">
          বিস্তারিত
        </Link>
      </Alert>

      <div className="flex justify-center">
        <Link
          to="/shop"
          className="inline-flex h-11 items-center gap-2 rounded-button bg-primary px-6 text-base font-semibold text-on-primary hover:bg-primary-dark"
        >
          পুরো ক্যাটালগ দেখুন
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </div>
  );
}
