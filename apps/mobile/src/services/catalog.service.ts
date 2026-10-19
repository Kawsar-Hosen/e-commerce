/**
 * Read-only catalogue access for the mobile app.
 *
 * Screens never import the mock dataset directly — they call these helpers,
 * which is what makes a future backend swap a contained change. All ordering
 * comes from `@shobdox/shared-business-logic`, so the phone and the website
 * always show the same rails in the same order.
 */

import type {
  Banner,
  Brand,
  Category,
  Coupon,
  Product,
  Seller,
} from '@shobdox/shared-types';
import {
  bestSellers,
  categoryRails,
  discountedProducts,
  featuredProducts,
  flashSaleProducts,
  frequentlyBoughtTogether,
  newArrivals,
  recentlyViewedProducts,
  recommendedProducts,
  relatedProducts,
  sameBrandProducts,
  trendingProducts,
} from '@shobdox/shared-business-logic';
import { useDataStore } from '../store/data.store';

export interface Catalogue {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  sellers: Seller[];
  coupons: Coupon[];
  banners: Banner[];
}

/** Non-React read of the live dataset (services, handlers, tests). */
export function readCatalogue(): Catalogue {
  const state = useDataStore.getState();
  return {
    products: state.products,
    categories: state.categories,
    brands: state.brands,
    sellers: state.sellers,
    coupons: state.coupons,
    banners: state.banners,
  };
}

/**
 * Categories with a live `productCount`. Children count towards their parent,
 * which is why "ফ্যাশন" shows more products than it owns directly.
 */
export function categoriesWithCounts(categories: Category[], products: Product[]): Category[] {
  return categories.map((category) => {
    const childIds = categories
      .filter((candidate) => candidate.parentId === category.id)
      .map((candidate) => candidate.id);

    const ids = new Set([category.id, ...childIds]);
    const productCount = products.filter(
      (product) => product.status === 'active' && ids.has(product.categoryId),
    ).length;

    return { ...category, productCount };
  });
}

export function brandsWithCounts(brands: Brand[], products: Product[]): Brand[] {
  return brands.map((brand) => ({
    ...brand,
    productCount: products.filter(
      (product) => product.brandId === brand.id && product.status === 'active',
    ).length,
  }));
}

export function topLevelCategories(categories: Category[]): Category[] {
  return categories.filter((category) => !category.parentId);
}

export function childCategories(categoryId: string, categories: Category[]): Category[] {
  return categories.filter((category) => category.parentId === categoryId);
}

/** A category slug and every descendant id, so "Fashion" lists its children. */
export function categoryIdsForSlug(slug: string, categories: Category[]): string[] {
  const match = categories.find((category) => category.slug === slug);
  if (!match) return [];
  return [match.id, ...childCategories(match.id, categories).map((child) => child.id)];
}

export function findCategoryBySlug(slug: string, categories: Category[]): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function findCategoryById(id: string, categories: Category[]): Category | undefined {
  return categories.find((category) => category.id === id);
}

export function findBrandById(id: string | undefined, brands: Brand[]): Brand | undefined {
  return id ? brands.find((brand) => brand.id === id) : undefined;
}

export function findProductBySlug(slug: string, products: Product[]): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function findSellerById(id: string, sellers: Seller[]): Seller | undefined {
  return sellers.find((seller) => seller.id === id);
}

export function bannerFor(
  banners: Banner[],
  placement: Banner['placement'],
  index = 0,
): Banner | undefined {
  return banners
    .filter((banner) => banner.isActive && banner.placement === placement)
    .sort((a, b) => a.displayOrder - b.displayOrder)[index];
}

/* ----------------------------------------------------------------- home rails */

export interface ProductRail {
  id: string;
  title: string;
  subtitle?: string;
  /** Route the "সব দেখুন" link opens. */
  href: string;
  products: Product[];
  variant: 'default' | 'flash' | 'compact';
}

/** The home rails, in the same order as the website. */
export function buildHomeRails(products: Product[], categories: Category[]): ProductRail[] {
  const rails: ProductRail[] = [];

  const flash = flashSaleProducts(products);
  if (flash.length > 0) {
    rails.push({
      id: 'flash',
      title: 'ফ্ল্যাশ সেল',
      subtitle: 'সীমিত সময়ের জন্য বিশেষ ছাড়',
      href: '/search?flash=1',
      products: flash,
      variant: 'flash',
    });
  }

  rails.push(
    {
      id: 'trending',
      title: 'এখন ট্রেন্ডিং',
      subtitle: 'এই সপ্তাহে সবচেয়ে বেশি দেখা পণ্য',
      href: '/search?sort=popularity',
      products: trendingProducts(products),
      variant: 'default',
    },
    {
      id: 'best-sellers',
      title: 'বেস্ট সেলার',
      subtitle: 'গ্রাহকদের সবচেয়ে পছন্দের পণ্য',
      href: '/search?sort=popularity',
      products: bestSellers(products),
      variant: 'default',
    },
    {
      id: 'new-arrivals',
      title: 'নতুন এসেছে',
      subtitle: 'সদ্য যোগ হওয়া পণ্য',
      href: '/search?sort=newest',
      products: newArrivals(products),
      variant: 'default',
    },
    {
      id: 'discounts',
      title: 'সেরা ছাড়',
      subtitle: 'সর্বোচ্চ ছাড়ে পাওয়া যাচ্ছে',
      href: '/search?sort=discount',
      products: discountedProducts(products),
      variant: 'default',
    },
    {
      id: 'featured',
      title: 'নির্বাচিত পণ্য',
      subtitle: 'শব্দক্সের বাছাই করা কালেকশন',
      href: '/search?sort=relevance',
      products: featuredProducts(products),
      variant: 'default',
    },
  );

  for (const rail of categoryRails(categories, products, 6)) {
    rails.push({
      id: `category-${rail.category.id}`,
      title: rail.category.nameBn,
      subtitle: rail.category.description,
      href: `/categories/${rail.category.slug}`,
      products: rail.products,
      variant: 'compact',
    });
  }

  return rails.filter((rail) => rail.products.length > 0);
}

/** Personalised rail for the shopper's own signals. */
export function recommendedForYou(
  products: Product[],
  recentIds: string[],
  wishlistIds: string[],
): Product[] {
  return recommendedProducts({
    products,
    recentProductIds: recentIds,
    wishlistProductIds: wishlistIds,
    limit: 10,
  });
}

export interface ProductPageRails {
  related: Product[];
  sameBrand: Product[];
  bundle: Product[];
  viewed: Product[];
}

export function railsForProduct(
  product: Product,
  products: Product[],
  recentIds: string[],
): ProductPageRails {
  return {
    related: relatedProducts(product, products),
    sameBrand: sameBrandProducts(product, products),
    bundle: frequentlyBoughtTogether(product, products),
    viewed: recentlyViewedProducts(products, recentIds).filter(
      (candidate) => candidate.id !== product.id,
    ),
  };
}
