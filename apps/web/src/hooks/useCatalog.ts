import { useMemo } from 'react';
import type { Order, Product, Seller } from '@shobdox/shared-types';
import { useDataStore } from '@/store/data.store';
import {
  brandsWithCounts,
  categoriesWithCounts,
  findProductBySlug,
  sellersWithCounts,
} from '@/services/catalog.service';

/** React bindings for the demo dataset. Components subscribe, services read. */

export function useProducts(): Product[] {
  return useDataStore((state) => state.products);
}

export function useActiveProducts(): Product[] {
  const products = useProducts();
  return useMemo(() => products.filter((product) => product.status === 'active'), [products]);
}

export function useProductBySlug(slug?: string): Product | undefined {
  const products = useProducts();
  return useMemo(() => (slug ? findProductBySlug(slug, products) : undefined), [products, slug]);
}

export function useProductById(id?: string): Product | undefined {
  const products = useProducts();
  return useMemo(() => products.find((product) => product.id === id), [products, id]);
}

export function useProductsByIds(ids: string[]): Product[] {
  const products = useProducts();
  return useMemo(() => {
    const wanted = new Set(ids);
    return products.filter((product) => wanted.has(product.id));
  }, [products, ids]);
}

export function useCategories() {
  const categories = useDataStore((state) => state.categories);
  const products = useProducts();

  return useMemo(() => categoriesWithCounts(categories, products), [categories, products]);
}

export function useTopLevelCategories() {
  const categories = useCategories();
  return useMemo(
    () =>
      categories
        .filter((category) => !category.parentId)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [categories],
  );
}

export function useChildCategories(parentId: string) {
  const categories = useCategories();
  return useMemo(
    () => categories.filter((category) => category.parentId === parentId),
    [categories, parentId],
  );
}

export function useBrands() {
  const brands = useDataStore((state) => state.brands);
  const products = useProducts();
  return useMemo(() => brandsWithCounts(brands, products), [brands, products]);
}

export function useSellers() {
  const sellers = useDataStore((state) => state.sellers);
  const products = useProducts();
  return useMemo(() => sellersWithCounts(sellers, products), [sellers, products]);
}

export function useSeller(idOrSlug?: string): Seller | undefined {
  const sellers = useSellers();
  return useMemo(
    () =>
      idOrSlug
        ? sellers.find((seller) => seller.id === idOrSlug || seller.slug === idOrSlug)
        : undefined,
    [sellers, idOrSlug],
  );
}

export function useSellerProducts(sellerId?: string): Product[] {
  const products = useProducts();
  return useMemo(
    () => (sellerId ? products.filter((product) => product.sellerId === sellerId) : []),
    [products, sellerId],
  );
}

export function useCoupons() {
  return useDataStore((state) => state.coupons);
}

export function useBanners() {
  return useDataStore((state) => state.banners);
}

export function useOrders(): Order[] {
  return useDataStore((state) => state.orders);
}

export function useOrder(idOrNumber?: string): Order | undefined {
  const orders = useOrders();
  return useMemo(
    () => (idOrNumber ? orders.find((order) => order.id === idOrNumber || order.orderNumber === idOrNumber) : undefined),
    [orders, idOrNumber],
  );
}

export function useCustomerOrders(customerId?: string): Order[] {
  const orders = useOrders();
  return useMemo(
    () =>
      customerId
        ? orders
            .filter((order) => order.customerId === customerId)
            .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
        : [],
    [orders, customerId],
  );
}

export function useNotifications() {
  return useDataStore((state) => state.notifications);
}

export function useUnreadNotificationCount(): number {
  const notifications = useNotifications();
  return useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);
}
