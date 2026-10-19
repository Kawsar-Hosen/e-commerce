/**
 * The single mutable dataset behind every screen.
 *
 * Everything the demo can change — stock movements from placed orders,
 * notification read state, a customer's saved address — lives here and is
 * persisted to AsyncStorage, so closing the app keeps the work you did.
 * `resetDemoData()` restores the original fixtures.
 *
 * The shape mirrors what a REST/GraphQL backend would return, so swapping this
 * store for network calls means rewriting the thin services, not the screens.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppNotification,
  Banner,
  Brand,
  Category,
  Coupon,
  Order,
  OrderStatus,
  Product,
  Seller,
  SellerStatus,
  User,
} from '@shobdox/shared-types';
import {
  applyStatusChange,
  commissionRateForTier,
  recalculateProduct,
  tierForSales,
} from '@shobdox/shared-business-logic';
import {
  MOCK_BANNERS,
  MOCK_BRANDS,
  MOCK_CATEGORIES,
  MOCK_COUPONS,
  MOCK_CUSTOMERS,
  MOCK_NOTIFICATIONS,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_SELLERS,
} from '@shobdox/shared-mock-data';
import { STORAGE_KEYS } from '../lib/constants';
import { asyncJsonStorage } from './persist';

export const DATA_SCHEMA_VERSION = 1;

interface DataSnapshot {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  sellers: Seller[];
  customers: User[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  notifications: AppNotification[];
  /** Incremented for each demo order so the numbers stay unique. */
  orderSequence: number;
  lastResetAt: string;
  schemaVersion: number;
}

interface DataActions {
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  resetDemoData: () => void;

  upsertProduct: (product: Product) => void;
  setProductStock: (productId: string, variantId: string, stock: number) => void;
  adjustProductSales: (productId: string, units: number) => void;

  addOrder: (order: Order) => void;
  setOrderStatus: (orderId: string, status: OrderStatus, note?: string, actor?: string) => void;
  consumeOrderSequence: () => number;

  updateCustomer: (customer: User) => void;
  addNotification: (notification: AppNotification) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;

  upsertCoupon: (coupon: Coupon) => void;
  setSellerStatus: (sellerId: string, status: SellerStatus) => void;
}

export type DataState = DataSnapshot & DataActions;

/** Sellers always carry the commission rate of the tier their sales earn. */
function withComputedTier(seller: Seller): Seller {
  const tier = tierForSales(seller.totalSales);
  return { ...seller, tier, commissionRate: commissionRateForTier(tier) };
}

/** Fresh fixtures — first load, schema change and the demo reset. */
export function createInitialData(): DataSnapshot {
  return {
    products: MOCK_PRODUCTS.map((product) => recalculateProduct(product)),
    categories: MOCK_CATEGORIES,
    brands: MOCK_BRANDS,
    sellers: MOCK_SELLERS.map(withComputedTier),
    customers: MOCK_CUSTOMERS,
    orders: MOCK_ORDERS,
    coupons: MOCK_COUPONS,
    banners: MOCK_BANNERS,
    notifications: MOCK_NOTIFICATIONS,
    orderSequence: 1021,
    lastResetAt: new Date().toISOString(),
    schemaVersion: DATA_SCHEMA_VERSION,
  };
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      ...createInitialData(),
      hydrated: false,

      setHydrated: (hydrated) => set({ hydrated }),

      resetDemoData: () => set(createInitialData()),

      upsertProduct: (product) =>
        set((state) => {
          const normalised = recalculateProduct(product);
          const exists = state.products.some((candidate) => candidate.id === normalised.id);
          return {
            products: exists
              ? state.products.map((candidate) =>
                  candidate.id === normalised.id ? normalised : candidate,
                )
              : [normalised, ...state.products],
          };
        }),

      setProductStock: (productId, variantId, stock) =>
        set((state) => ({
          products: state.products.map((product) => {
            if (product.id !== productId) return product;
            return recalculateProduct({
              ...product,
              variants: product.variants.map((variant) =>
                variant.id === variantId
                  ? { ...variant, stock: Math.max(0, Math.floor(stock)) }
                  : variant,
              ),
            });
          }),
        })),

      adjustProductSales: (productId, units) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  sold: Math.max(0, product.sold + units),
                  variants: product.variants.map((variant) => ({
                    ...variant,
                    stock: Math.max(0, variant.stock - units),
                  })),
                }
              : product,
          ),
        })),

      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

      setOrderStatus: (orderId, status, note, actor = 'SHOBDOX ডেমো অপারেশন টিম') =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? applyStatusChange(order, status, { note, actor }) : order,
          ),
        })),

      consumeOrderSequence: () => {
        const next = get().orderSequence + 1;
        set({ orderSequence: next });
        return next;
      },

      updateCustomer: (customer) =>
        set((state) => ({
          customers: state.customers.map((candidate) =>
            candidate.id === customer.id ? customer : candidate,
          ),
        })),

      addNotification: (notification) =>
        set((state) => ({ notifications: [notification, ...state.notifications].slice(0, 40) })),

      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId ? { ...notification, read: true } : notification,
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
        })),

      upsertCoupon: (coupon) =>
        set((state) => {
          const exists = state.coupons.some((candidate) => candidate.id === coupon.id);
          return {
            coupons: exists
              ? state.coupons.map((candidate) => (candidate.id === coupon.id ? coupon : candidate))
              : [coupon, ...state.coupons],
          };
        }),

      setSellerStatus: (sellerId, status) =>
        set((state) => ({
          sellers: state.sellers.map((seller) =>
            seller.id === sellerId ? { ...seller, status } : seller,
          ),
        })),
    }),
    {
      name: STORAGE_KEYS.data,
      version: DATA_SCHEMA_VERSION,
      storage: asyncJsonStorage(),
      // A fixture or schema change must never leave a stale dataset behind.
      migrate: () => createInitialData(),
      partialize: (state) => ({
        products: state.products,
        categories: state.categories,
        brands: state.brands,
        sellers: state.sellers,
        customers: state.customers,
        orders: state.orders,
        coupons: state.coupons,
        banners: state.banners,
        notifications: state.notifications,
        orderSequence: state.orderSequence,
        lastResetAt: state.lastResetAt,
        schemaVersion: state.schemaVersion,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

/** Non-React access for services and event handlers. */
export const dataStore = {
  get: () => useDataStore.getState(),
  set: useDataStore.setState,
  subscribe: useDataStore.subscribe,
};
