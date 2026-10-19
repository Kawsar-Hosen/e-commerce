import type { CartItem, Category, Product } from '@shobdox/shared-types';
import { productDiscountPercent } from './pricing';
import { isPurchasable } from './stock';

/**
 * Merchandising rails and recommendation rules. Every rail on the homepage and
 * every suggested product on the mobile app comes from here, so the two
 * platforms never invent their own ordering.
 */

export function activeProducts(products: Product[]): Product[] {
  return products.filter((product) => product.status === 'active');
}

export function byIds(products: Product[], ids: string[]): Product[] {
  return ids
    .map((id) => products.find((product) => product.id === id || product.slug === id))
    .filter((product): product is Product => Boolean(product));
}

export function flashSaleProducts(products: Product[], limit = 8): Product[] {
  return activeProducts(products)
    .filter((product) => product.isFlashSale && isPurchasable(product))
    .sort((a, b) => productDiscountPercent(b) - productDiscountPercent(a))
    .slice(0, limit);
}

export function trendingProducts(products: Product[], limit = 8): Product[] {
  return activeProducts(products)
    .filter((product) => product.isTrending)
    .sort((a, b) => b.viewCount - a.viewCount || b.sold - a.sold)
    .slice(0, limit);
}

export function bestSellers(products: Product[], limit = 8): Product[] {
  return activeProducts(products)
    .filter((product) => product.isBestSeller)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
}

export function newArrivals(products: Product[], limit = 8): Product[] {
  return activeProducts(products)
    .filter((product) => product.isNewArrival)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function featuredProducts(products: Product[], limit = 10): Product[] {
  return activeProducts(products)
    .filter((product) => product.isFeatured)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

export function discountedProducts(products: Product[], limit = 8): Product[] {
  return activeProducts(products)
    .filter((product) => productDiscountPercent(product) > 0)
    .sort((a, b) => productDiscountPercent(b) - productDiscountPercent(a))
    .slice(0, limit);
}

export function recentlyViewedProducts(products: Product[], recentIds: string[], limit = 8): Product[] {
  return byIds(activeProducts(products), recentIds).slice(0, limit);
}

export interface RecommendationInput {
  products: Product[];
  /** Product ids currently in the cart — excluded from "recommended for you". */
  cartProductIds?: string[];
  /** Product ids in the wishlist — they boost related products. */
  wishlistProductIds?: string[];
  recentProductIds?: string[];
  categoryIds?: string[];
  limit?: number;
}

/**
 * "Recommended for you": blends the shopper's own signals (wishlist, recently
 * viewed, cart contents) with the merchandising score. Falls back to the
 * highest-scoring catalogue items so the rail is never empty.
 */
export function recommendedProducts({
  products,
  cartProductIds = [],
  wishlistProductIds = [],
  recentProductIds = [],
  categoryIds = [],
  limit = 10,
}: RecommendationInput): Product[] {
  const signals = new Set([...wishlistProductIds, ...recentProductIds]);
  const interests = new Set(categoryIds);

  // Learn categories from the products the shopper already engaged with.
  for (const id of signals) {
    const product = products.find((candidate) => candidate.id === id);
    if (product) interests.add(product.categoryId);
  }

  const scored = activeProducts(products)
    .filter((product) => !cartProductIds.includes(product.id))
    .map((product) => {
      let score = product.recommendationScore;
      if (interests.has(product.categoryId)) score += 25;
      if (signals.has(product.id)) score -= 40;
      if (wishlistProductIds.includes(product.id)) score += 10;
      if (!isPurchasable(product)) score -= 100;
      if (product.rating >= 4.5) score += 8;
      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product);

  const personalised = scored.filter((product) => interests.has(product.categoryId));
  return (personalised.length >= limit ? personalised : scored).slice(0, limit);
}

/**
 * Related products for a product page: same category first, then shared tags,
 * then brand, then overall rating.
 */
export function relatedProducts(product: Product, products: Product[], limit = 8): Product[] {
  return activeProducts(products)
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => {
      let score = 0;
      if (candidate.categoryId === product.categoryId) score += 50;
      if (candidate.brandId && candidate.brandId === product.brandId) score += 20;
      score += candidate.tags.filter((tag) => product.tags.includes(tag)).length * 6;
      score += candidate.rating;
      if (Math.abs(candidate.price - product.price) < product.price * 0.35) score += 6;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

/** Bundles shown as "একসাথে কিনলে সাশ্রয়" on the product page. */
export function frequentlyBoughtTogether(product: Product, products: Product[], limit = 3): Product[] {
  const related = relatedProducts(product, products, limit * 3);

  const byCategoryFit = related.filter((candidate) => candidate.categoryId !== product.categoryId);
  const pool = byCategoryFit.length >= limit ? byCategoryFit : related;
  return pool.slice(0, limit);
}

export function categoryRails(categories: Category[], products: Product[], perCategory = 6) {
  return categories
    .filter((category) => category.isFeatured)
    .map((category) => ({
      category,
      products: activeProducts(products)
        .filter((product) => product.categoryId === category.id)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, perCategory),
    }))
    .filter((rail) => rail.products.length > 0);
}

/** Cross-sell strip under the cart summary. */
export function cartUpsell(products: Product[], items: CartItem[], limit = 4): Product[] {
  const inCart = items.map((item) => item.productId);
  const cheapestInCart = items.reduce((lowest, item) => Math.min(lowest, item.unitPrice), Number.POSITIVE_INFINITY);
  const budget = Number.isFinite(cheapestInCart) ? cheapestInCart * 0.35 : 500;

  return activeProducts(products)
    .filter((product) => !inCart.includes(product.id) && isPurchasable(product) && product.price <= budget)
    .sort((a, b) => b.rating - a.rating || b.sold - a.sold)
    .slice(0, limit);
}

/** "একই ব্র্যান্ডের" rail on the product page. */
export function sameBrandProducts(product: Product, products: Product[], limit = 6): Product[] {
  if (!product.brandId) return [];
  return activeProducts(products)
    .filter((candidate) => candidate.brandId === product.brandId && candidate.id !== product.id)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
}
