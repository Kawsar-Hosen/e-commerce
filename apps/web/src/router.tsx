import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { StorefrontLayout } from '@/components/layout/StorefrontLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { SellerLayout } from '@/components/layout/SellerLayout';
import { AccountLayout } from '@/components/layout/AccountLayout';
import { ProductGridSkeleton, Spinner, TableSkeleton } from '@/components/ui';

/**
 * Route table.
 *
 * Every page is a separate chunk (`React.lazy`), so the storefront entry loads
 * without pulling in recharts or the dashboards. Suspense fallbacks mirror the
 * shape of the content that is about to appear (grid, table, text) instead of a
 * blank screen.
 */

/* storefront */
const HomePage = lazy(() => import('@/pages/storefront/HomePage'));
const ShopPage = lazy(() => import('@/pages/storefront/ShopPage'));
const SearchPage = lazy(() => import('@/pages/storefront/SearchPage'));
const CategoriesPage = lazy(() => import('@/pages/storefront/CategoriesPage'));
const CategoryPage = lazy(() => import('@/pages/storefront/CategoryPage'));
const ProductPage = lazy(() => import('@/pages/storefront/ProductPage'));
const BrandsPage = lazy(() => import('@/pages/storefront/BrandsPage'));
const CartPage = lazy(() => import('@/pages/storefront/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/storefront/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/storefront/OrderConfirmationPage'));
const TrackOrderPage = lazy(() => import('@/pages/storefront/TrackOrderPage'));
const WishlistPage = lazy(() => import('@/pages/storefront/WishlistPage'));
const InfoPage = lazy(() => import('@/pages/storefront/InfoPage'));
const NotFoundPage = lazy(() => import('@/pages/storefront/NotFoundPage'));

/* auth + account */
const SignInPage = lazy(() => import('@/pages/auth/SignInPage'));
const SignUpPage = lazy(() => import('@/pages/auth/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'));
const AccountOrdersPage = lazy(() => import('@/pages/account/AccountOrdersPage'));
const AccountOrderDetailPage = lazy(() => import('@/pages/account/AccountOrderDetailPage'));
const AddressesPage = lazy(() => import('@/pages/account/AddressesPage'));
const NotificationsPage = lazy(() => import('@/pages/account/NotificationsPage'));
const AccountSettingsPage = lazy(() => import('@/pages/account/AccountSettingsPage'));

/* admin */
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('@/pages/admin/AdminProductFormPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/AdminOrderDetailPage'));
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'));
const AdminCouponsPage = lazy(() => import('@/pages/admin/AdminCouponsPage'));
const AdminBannersPage = lazy(() => import('@/pages/admin/AdminBannersPage'));
const AdminSellersPage = lazy(() => import('@/pages/admin/AdminSellersPage'));
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));

/* seller */
const SellerOverviewPage = lazy(() => import('@/pages/seller/SellerOverviewPage'));
const SellerProductsPage = lazy(() => import('@/pages/seller/SellerProductsPage'));
const SellerProductFormPage = lazy(() => import('@/pages/seller/SellerProductFormPage'));
const SellerOrdersPage = lazy(() => import('@/pages/seller/SellerOrdersPage'));
const SellerOrderDetailPage = lazy(() => import('@/pages/seller/SellerOrderDetailPage'));
const SellerSalesPage = lazy(() => import('@/pages/seller/SellerSalesPage'));
const SellerRevenuePage = lazy(() => import('@/pages/seller/SellerRevenuePage'));
const SellerCommissionPage = lazy(() => import('@/pages/seller/SellerCommissionPage'));
const SellerPayoutsPage = lazy(() => import('@/pages/seller/SellerPayoutsPage'));
const SellerReviewsPage = lazy(() => import('@/pages/seller/SellerReviewsPage'));
const SellerStorePage = lazy(() => import('@/pages/seller/SellerStorePage'));
const SellerSettingsPage = lazy(() => import('@/pages/seller/SellerSettingsPage'));

/** Suspense wrapper with a content-shaped fallback. */
function Page({ children, fallback = 'grid' }: { children: ReactNode; fallback?: 'grid' | 'table' | 'text' }) {
  return (
    <Suspense
      fallback={
        <div className="py-6" role="status" aria-live="polite">
          {fallback === 'grid' ? (
            <ProductGridSkeleton count={8} />
          ) : fallback === 'table' ? (
            <TableSkeleton rows={6} columns={4} />
          ) : (
            <div className="space-y-3">
              <Spinner />
            </div>
          )}
          <span className="sr-only">লোড হচ্ছে…</span>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <StorefrontLayout />,
    children: [
      { index: true, element: <Page><HomePage /></Page> },
      { path: 'shop', element: <Page><ShopPage /></Page> },
      { path: 'search', element: <Page><SearchPage /></Page> },
      { path: 'categories', element: <Page><CategoriesPage /></Page> },
      { path: 'category/:slug', element: <Page><CategoryPage /></Page> },
      { path: 'product/:slug', element: <Page><ProductPage /></Page> },
      { path: 'brands', element: <Page><BrandsPage /></Page> },
      { path: 'cart', element: <Page><CartPage /></Page> },
      { path: 'checkout', element: <Page fallback="text"><CheckoutPage /></Page> },
      { path: 'order-confirmation/:orderId', element: <Page fallback="text"><OrderConfirmationPage /></Page> },
      { path: 'track', element: <Page fallback="text"><TrackOrderPage /></Page> },
      { path: 'wishlist', element: <Page><WishlistPage /></Page> },
      { path: 'help/:topic', element: <Page fallback="text"><InfoPage /></Page> },
      { path: 'signin', element: <Page fallback="text"><SignInPage /></Page> },
      { path: 'signup', element: <Page fallback="text"><SignUpPage /></Page> },
      { path: 'forgot-password', element: <Page fallback="text"><ForgotPasswordPage /></Page> },
      {
        path: 'account',
        element: <AccountLayout />,
        children: [
          { index: true, element: <Page fallback="text"><ProfilePage /></Page> },
          { path: 'orders', element: <Page fallback="table"><AccountOrdersPage /></Page> },
          { path: 'orders/:orderId', element: <Page fallback="text"><AccountOrderDetailPage /></Page> },
          { path: 'addresses', element: <Page fallback="text"><AddressesPage /></Page> },
          { path: 'notifications', element: <Page fallback="text"><NotificationsPage /></Page> },
          { path: 'settings', element: <Page fallback="text"><AccountSettingsPage /></Page> },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Page fallback="text"><AdminOverviewPage /></Page> },
      { path: 'products', element: <Page fallback="table"><AdminProductsPage /></Page> },
      { path: 'products/new', element: <Page fallback="text"><AdminProductFormPage /></Page> },
      { path: 'products/:productId/edit', element: <Page fallback="text"><AdminProductFormPage /></Page> },
      { path: 'categories', element: <Page fallback="table"><AdminCategoriesPage /></Page> },
      { path: 'orders', element: <Page fallback="table"><AdminOrdersPage /></Page> },
      { path: 'orders/:orderId', element: <Page fallback="text"><AdminOrderDetailPage /></Page> },
      { path: 'customers', element: <Page fallback="table"><AdminCustomersPage /></Page> },
      { path: 'coupons', element: <Page fallback="table"><AdminCouponsPage /></Page> },
      { path: 'banners', element: <Page fallback="table"><AdminBannersPage /></Page> },
      { path: 'sellers', element: <Page fallback="table"><AdminSellersPage /></Page> },
      { path: 'reports', element: <Page fallback="text"><AdminReportsPage /></Page> },
      { path: 'settings', element: <Page fallback="text"><AdminSettingsPage /></Page> },
    ],
  },
  {
    path: '/seller',
    element: <SellerLayout />,
    children: [
      { index: true, element: <Page fallback="text"><SellerOverviewPage /></Page> },
      { path: 'products', element: <Page fallback="table"><SellerProductsPage /></Page> },
      { path: 'products/new', element: <Page fallback="text"><SellerProductFormPage /></Page> },
      { path: 'products/:productId/edit', element: <Page fallback="text"><SellerProductFormPage /></Page> },
      { path: 'orders', element: <Page fallback="table"><SellerOrdersPage /></Page> },
      { path: 'orders/:orderId', element: <Page fallback="text"><SellerOrderDetailPage /></Page> },
      { path: 'sales', element: <Page fallback="text"><SellerSalesPage /></Page> },
      { path: 'revenue', element: <Page fallback="text"><SellerRevenuePage /></Page> },
      { path: 'commission', element: <Page fallback="text"><SellerCommissionPage /></Page> },
      { path: 'payouts', element: <Page fallback="table"><SellerPayoutsPage /></Page> },
      { path: 'reviews', element: <Page fallback="table"><SellerReviewsPage /></Page> },
      { path: 'store', element: <Page fallback="text"><SellerStorePage /></Page> },
      { path: 'settings', element: <Page fallback="text"><SellerSettingsPage /></Page> },
    ],
  },
  { path: '*', element: <Page fallback="text"><NotFoundPage /></Page> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
