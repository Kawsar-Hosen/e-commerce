import { useMemo } from 'react';
import type {
  AppNotification,
  Brand,
  Category,
  Coupon,
  Order,
  Product,
  Seller,
} from '@shobdox/shared-types';
import { useDataStore } from '../store/data.store';
import { useAuthStore } from '../store/auth.store';

/**
 * Catalogue hooks.
 *
 * These read the persisted data store directly (no effects, no loading spinners)
 * because the demo dataset is local. A backend swap only has to change the
 * selectors here.
 */

export function useProducts(): Product[] {
  return useDataStore((state) => state.products);
}

export function useCategories(): Category[] {
  return useDataStore((state) => state.categories);
}

export function useBrands(): Brand[] {
  return useDataStore((state) => state.brands);
}

export function useSellers(): Seller[] {
  return useDataStore((state) => state.sellers);
}

export function useCoupons(): Coupon[] {
  return useDataStore((state) => state.coupons);
}

export function useOrders(): Order[] {
  return useDataStore((state) => state.orders);
}

export function useNotifications(): AppNotification[] {
  return useDataStore((state) => state.notifications);
}

export function useProductBySlug(slug: string | undefined): Product | undefined {
  const products = useProducts();
  return useMemo(
    () => (slug ? products.find((product) => product.slug === slug) : undefined),
    [products, slug],
  );
}

/** Orders belonging to the signed-in customer, newest first. */
export function useCustomerOrders(): Order[] {
  const orders = useOrders();
  const userId = useAuthStore((state) => state.session?.user.id);

  return useMemo(() => {
    const scoped = userId ? orders.filter((order) => order.customerId === userId) : orders;
    return [...scoped].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    );
  }, [orders, userId]);
}

/** Unread notification count for the header bell. */
export function useUnreadNotificationCount(): number {
  return useDataStore((state) => state.notifications.filter((notification) => !notification.read).length);
}
