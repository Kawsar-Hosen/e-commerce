import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppNotification,
  Banner,
  Category,
  Coupon,
  Order,
  OrderStatus,
  Product,
  ProductReview,
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
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * The single mutable dataset behind every screen.
 *
 * Everything the demo can change — admin product edits, category and coupon
 * management, newly placed orders, stock adjustments, notification read state —
 * lives here and is persisted to `localStorage`, so a reload keeps the work you
 * did. `resetDemoData()` restores the original fixtures.
 *
 * The shape deliberately mirrors what a REST/GraphQL backend would return, so
 * swapping this store for real network calls means rewriting the thin service
 * modules in `src/services`, not the screens.
 */

export const DATA_SCHEMA_VERSION = 2;

interface DataSnapshot {
  products: Product[];
  categories: Category[];
  brands: typeof MOCK_BRANDS;
  sellers: Seller[];
  customers: User[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  notifications: AppNotification[];
  /** Increments each time an order is placed so demo numbers stay unique. */
  orderSequence: number;
  lastResetAt: string;
  schemaVersion: number;
}

interface DataActions {
  resetDemoData: () => void;

  /* products */
  upsertProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  duplicateProduct: (productId: string) => Product | undefined;
  setProductStock: (productId: string, variantId: string, stock: number) => void;
  adjustProductSales: (productId: string, units: number) => void;

  /* orders */
  addOrder: (order: Order) => void;
  setOrderStatus: (orderId: string, status: OrderStatus, note?: string, actor?: string) => void;

  /* catalogue administration */
  upsertCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  upsertCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;
  upsertBanner: (banner: Banner) => void;
  deleteBanner: (bannerId: string) => void;
  setSellerStatus: (sellerId: string, status: SellerStatus) => void;

  /* account */
  updateCustomer: (customer: User) => void;
  /** Appends a customer review and re-derives the product's average rating. */
  addProductReview: (productId: string, review: ProductReview) => void;
  addNotification: (notification: AppNotification) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  consumeOrderSequence: () => number;
}

export type DataState = DataSnapshot & DataActions;

/** Sellers always carry the commission rate of the tier their sales earn. */
function withComputedTier(seller: Seller): Seller {
  const tier = tierForSales(seller.totalSales);
  return { ...seller, tier, commissionRate: commissionRateForTier(tier) };
}

/** Fresh fixtures. Called on first load, on schema change and on reset. */
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

      resetDemoData: () => set(createInitialData()),

      /* ------------------------------------------------------------ products */
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

      deleteProduct: (productId) =>
        set((state) => ({ products: state.products.filter((product) => product.id !== productId) })),

      duplicateProduct: (productId) => {
        const source = get().products.find((product) => product.id === productId);
        if (!source) return undefined;

        const copyId = `p-copy-${Date.now().toString(36)}`;
        const copy: Product = {
          ...source,
          id: copyId,
          slug: `${source.slug}-copy`,
          title: `${source.title} (কপি)`,
          status: 'draft',
          sold: 0,
          viewCount: 0,
          reviews: [],
          reviewCount: 0,
          rating: 0,
          isFlashSale: false,
          flashSaleEndsAt: undefined,
          badges: source.badges.filter((badge) => badge !== 'flash-sale'),
          variants: source.variants.map((variant, index) => ({
            ...variant,
            id: `${copyId}-v${index + 1}`,
            sku: variant.sku.replace(source.slug.slice(0, 6).toUpperCase(), 'SDX-CPY'),
          })),
          images: [...source.images],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({ products: [copy, ...state.products] }));
        return copy;
      },

      setProductStock: (productId, variantId, stock) =>
        set((state) => ({
          products: state.products.map((product) => {
            if (product.id !== productId) return product;
            return recalculateProduct({
              ...product,
              variants: product.variants.map((variant) =>
                variant.id === variantId ? { ...variant, stock: Math.max(0, Math.floor(stock)) } : variant,
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

      /* -------------------------------------------------------------- orders */
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

      setOrderStatus: (orderId, status, note, actor = 'SHOBDOX অপারেশন টিম') =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? applyStatusChange(order, status, { note, actor }) : order,
          ),
        })),

      /* ----------------------------------------------------------- catalogue */
      upsertCategory: (category) =>
        set((state) => {
          const exists = state.categories.some((candidate) => candidate.id === category.id);
          return {
            categories: exists
              ? state.categories.map((candidate) =>
                  candidate.id === category.id ? category : candidate,
                )
              : [...state.categories, category],
          };
        }),

      deleteCategory: (categoryId) =>
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== categoryId),
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

      deleteCoupon: (couponId) =>
        set((state) => ({ coupons: state.coupons.filter((coupon) => coupon.id !== couponId) })),

      upsertBanner: (banner) =>
        set((state) => {
          const exists = state.banners.some((candidate) => candidate.id === banner.id);
          return {
            banners: exists
              ? state.banners.map((candidate) => (candidate.id === banner.id ? banner : candidate))
              : [...state.banners, banner],
          };
        }),

      deleteBanner: (bannerId) =>
        set((state) => ({ banners: state.banners.filter((banner) => banner.id !== bannerId) })),

      setSellerStatus: (sellerId, status) =>
        set((state) => ({
          sellers: state.sellers.map((seller) =>
            seller.id === sellerId ? { ...seller, status } : seller,
          ),
        })),

      /* ------------------------------------------------------------ account */
      updateCustomer: (customer) =>
        set((state) => ({
          customers: state.customers.map((candidate) =>
            candidate.id === customer.id ? customer : candidate,
          ),
        })),

      addProductReview: (productId, review) =>
        set((state) => ({
          products: state.products.map((product) => {
            if (product.id !== productId) return product;

            // The seeded rating is an aggregate of many ratings we do not model
            // individually, so a new review is folded in as a weighted average
            // instead of replacing the score.
            const reviewCount = product.reviewCount + 1;
            const rating =
              Math.round(((product.rating * product.reviewCount + review.rating) / reviewCount) * 10) / 10;

            return {
              ...product,
              reviews: [review, ...product.reviews],
              reviewCount,
              rating,
              updatedAt: new Date().toISOString(),
            };
          }),
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

      consumeOrderSequence: () => {
        const next = get().orderSequence + 1;
        set({ orderSequence: next });
        return next;
      },
    }),
    {
      name: STORAGE_KEYS.data,
      version: DATA_SCHEMA_VERSION,
      // A fixture or schema change must not leave a stale dataset in place.
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
    },
  ),
);

/** Non-React access for services and event handlers. */
export const dataStore = {
  get: () => useDataStore.getState(),
  set: useDataStore.setState,
  subscribe: useDataStore.subscribe,
};

/** Wipes every persisted demo artefact, including the cart and wishlist. */
export async function resetEverything(): Promise<void> {
  useDataStore.getState().resetDemoData();
  const [{ useCartStore }, { useWishlistStore }] = await Promise.all([
    import('./cart.store'),
    import('./wishlist.store'),
  ]);
  useCartStore.getState().clear();
  useWishlistStore.getState().clear();
}
