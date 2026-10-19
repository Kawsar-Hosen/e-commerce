import type {
  Banner,
  Brand,
  Category,
  Coupon,
  Product,
  Seller,
  SellerTier,
} from '@shobdox/shared-types';
import {
  bestSellers,
  cartUpsell,
  categoryRails,
  discountedProducts,
  featuredProducts,
  flashSaleProducts,
  newArrivals,
  recommendedProducts,
  relatedProducts,
  frequentlyBoughtTogether,
  recentlyViewedProducts,
  sameBrandProducts,
  trendingProducts,
} from '@shobdox/shared-business-logic';
import { useDataStore } from '@/store/data.store';

/**
 * Read-only catalogue access.
 *
 * Screens never import the mock dataset directly — they go through these
 * functions, which is what makes a future backend swap a contained change.
 */

/** Categories with a live `productCount` (children included for parent rows). */
export function categoriesWithCounts(categories: Category[], products: Product[]): Category[] {
  return categories.map((category) => {
    const childIds = categories
      .filter((candidate) => candidate.parentId === category.id)
      .map((candidate) => candidate.id);

    const ids = new Set([category.id, ...childIds]);
    const count = products.filter((product) => product.status === 'active' && ids.has(product.categoryId)).length;

    return { ...category, productCount: count };
  });
}

export function brandsWithCounts(brands: Brand[], products: Product[]): Brand[] {
  return brands.map((brand) => ({
    ...brand,
    productCount: products.filter((product) => product.brandId === brand.id && product.status === 'active').length,
  }));
}

export function sellersWithCounts(sellers: Seller[], products: Product[]): Seller[] {
  return sellers.map((seller) => ({
    ...seller,
    productCount: products.filter((product) => product.sellerId === seller.id).length,
  }));
}

/** Category slug plus every descendant slug id, so "Fashion" lists its children. */
export function categoryIdsForSlug(slug: string, categories: Category[]): string[] {
  const match = categories.find((category) => category.slug === slug);
  if (!match) return [];

  const children = categories.filter((category) => category.parentId === match.id);
  return [match.id, ...children.map((child) => child.id)];
}

export function findCategoryBySlug(slug: string, categories: Category[]): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function findBrandBySlug(slug: string, brands: Brand[]): Brand | undefined {
  return brands.find((brand) => brand.slug === slug);
}

export function findSellerBySlug(slug: string, sellers: Seller[]): Seller | undefined {
  return sellers.find((seller) => seller.slug === slug);
}

export function findProductBySlug(slug: string, products: Product[]): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function findProductById(id: string, products: Product[]): Product | undefined {
  return products.find((product) => product.id === id);
}

export function bannerFor(banners: Banner[], placement: Banner['placement'], index = 0): Banner | undefined {
  return banners
    .filter((banner) => banner.isActive && banner.placement === placement)
    .sort((a, b) => a.displayOrder - b.displayOrder)[index];
}

/* --------------------------------------------------------------- home rails */

export interface ProductRail {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  products: Product[];
  /** `flash` renders the countdown header. */
  variant?: 'default' | 'flash' | 'compact';
}

export function buildHomeRails(products: Product[], categories: Category[]): ProductRail[] {
  const flash = flashSaleProducts(products);
  const rails: ProductRail[] = [];

  if (flash.length > 0) {
    rails.push({
      id: 'flash',
      title: 'ফ্ল্যাশ সেল',
      subtitle: 'সীমিত সময়ের জন্য বিশেষ ছাড়',
      href: '/shop?flash=1',
      products: flash,
      variant: 'flash',
    });
  }

  rails.push(
    {
      id: 'trending',
      title: 'এখন ট্রেন্ডিং',
      subtitle: 'এই সপ্তাহে সবচেয়ে বেশি দেখা পণ্য',
      href: '/shop?sort=popularity',
      products: trendingProducts(products),
    },
    {
      id: 'best-sellers',
      title: 'বেস্ট সেলার',
      subtitle: 'গ্রাহকদের সবচেয়ে পছন্দের পণ্য',
      href: '/shop?sort=popularity',
      products: bestSellers(products),
    },
    {
      id: 'new-arrivals',
      title: 'নতুন এসেছে',
      subtitle: 'সদ্য যোগ হওয়া পণ্য',
      href: '/shop?sort=newest',
      products: newArrivals(products),
    },
    {
      id: 'discounts',
      title: 'সেরা ছাড়',
      subtitle: 'সর্বোচ্চ ছাড়ে পাওয়া যাচ্ছে',
      href: '/shop?sort=discount',
      products: discountedProducts(products),
    },
  );

  for (const rail of categoryRails(categories, products, 6)) {
    rails.push({
      id: `category-${rail.category.id}`,
      title: rail.category.nameBn,
      subtitle: rail.category.description,
      href: `/category/${rail.category.slug}`,
      products: rail.products,
      variant: 'compact',
    });
  }

  return rails.filter((rail) => rail.products.length > 0);
}

export function recommendedForYou(products: Product[], recentIds: string[], wishlistIds: string[]): Product[] {
  return recommendedProducts({
    products,
    recentProductIds: recentIds,
    wishlistProductIds: wishlistIds,
    limit: 10,
  });
}

export function railsForProduct(product: Product, products: Product[], recentIds: string[]): {
  related: Product[];
  sameBrand: Product[];
  bundle: Product[];
  viewed: Product[];
} {
  return {
    related: relatedProducts(product, products),
    sameBrand: sameBrandProducts(product, products),
    bundle: frequentlyBoughtTogether(product, products),
    viewed: recentlyViewedProducts(products, recentIds).filter((candidate) => candidate.id !== product.id),
  };
}

export function upsellForCart(products: Product[], cartItems: Parameters<typeof cartUpsell>[1]): Product[] {
  return cartUpsell(products, cartItems);
}

export function featuredForHome(products: Product[]): Product[] {
  return featuredProducts(products);
}

/** Tier badge + commission copy for the seller dashboards. */
export const SELLER_TIER_LABELS: Record<SellerTier, string> = {
  bronze: 'ব্রোঞ্জ',
  silver: 'সিলভার',
  gold: 'গোল্ড',
  platinum: 'প্ল্যাটিনাম',
};

/** Reads the live dataset outside React (services, event handlers). */
export function readCatalogue(): {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  sellers: Seller[];
  coupons: Coupon[];
  banners: Banner[];
} {
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
