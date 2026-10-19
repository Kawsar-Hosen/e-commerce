import {
  BarChart3,
  Coins,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { DashboardLayout, type DashboardNavGroup } from './DashboardLayout';
import { useAuthStore } from '@/store/auth.store';
import { useDataStore } from '@/store/data.store';
import { MOCK_PRIMARY_SELLER } from '@shobdox/shared-mock-data';

/**
 * Seller shell.
 *
 * The seller is taken from the signed-in demo user's `sellerId`, falling back to
 * the seeded primary seller so the dashboard is browsable from a customer
 * session too (the layout shows the role prompt in that case).
 */
export function useCurrentSeller() {
  const user = useAuthStore((state) => state.session?.user);
  const sellers = useDataStore((state) => state.sellers);
  const sellerId = user?.sellerId ?? MOCK_PRIMARY_SELLER.id;
  return sellers.find((seller) => seller.id === sellerId) ?? MOCK_PRIMARY_SELLER;
}

export function useSellerBadges(sellerId: string) {
  const orders = useDataStore((state) => state.orders);
  const products = useDataStore((state) => state.products);

  const sellerOrders = orders.filter((order) => order.items.some((item) => item.sellerId === sellerId));

  return {
    newOrders: sellerOrders.filter((order) => order.status === 'placed' || order.status === 'confirmed').length,
    toShip: sellerOrders.filter((order) => order.status === 'processing').length,
    lowStock: products.filter(
      (product) => product.sellerId === sellerId && (product.stockStatus === 'low-stock' || product.stockStatus === 'out-of-stock'),
    ).length,
  };
}

export function SellerLayout() {
  const seller = useCurrentSeller();
  const badges = useSellerBadges(seller.id);

  const nav: DashboardNavGroup[] = [
    {
      title: 'সারসংক্ষেপ',
      items: [
        { to: '/seller', label: 'ওভারভিউ', icon: <LayoutDashboard aria-hidden className="size-4" />, end: true },
        { to: '/seller/sales', label: 'বিক্রয়', icon: <TrendingUp aria-hidden className="size-4" /> },
        { to: '/seller/revenue', label: 'আয় ও খরচ', icon: <BarChart3 aria-hidden className="size-4" /> },
      ],
    },
    {
      title: 'স্টোর',
      items: [
        { to: '/seller/products', label: 'আমার পণ্য', icon: <Package aria-hidden className="size-4" />, badge: badges.lowStock },
        { to: '/seller/orders', label: 'অর্ডার', icon: <ShoppingBag aria-hidden className="size-4" />, badge: badges.newOrders },
        { to: '/seller/reviews', label: 'রিভিউ ও রেটিং', icon: <Star aria-hidden className="size-4" /> },
      ],
    },
    {
      title: 'পেমেন্ট',
      items: [
        { to: '/seller/commission', label: 'কমিশন', icon: <Coins aria-hidden className="size-4" /> },
        { to: '/seller/payouts', label: 'পেআউট', icon: <Wallet aria-hidden className="size-4" /> },
      ],
    },
    {
      title: 'সেটিংস',
      items: [
        { to: '/seller/store', label: 'স্টোর প্রোফাইল', icon: <Store aria-hidden className="size-4" /> },
        { to: '/seller/settings', label: 'প্রেফারেন্স', icon: <Settings aria-hidden className="size-4" /> },
      ],
    },
  ];

  return (
    <DashboardLayout
      role="seller"
      title={seller.profile.storeNameBn ?? seller.profile.storeName}
      subtitle={`${seller.tier.toUpperCase()} · কমিশন ${seller.commissionRate}%`}
      nav={nav}
      actions={
        <>
          <span className="hidden items-center gap-1.5 rounded-chip bg-accent-soft px-2 py-1 text-xs font-medium text-amber-900 sm:flex">
            {seller.tier === 'platinum' ? 'প্ল্যাটিনাম' : seller.tier === 'gold' ? 'গোল্ড' : seller.tier === 'silver' ? 'সিলভার' : 'ব্রোঞ্জ'} সেলার
          </span>
          {badges.toShip > 0 ? (
            <span className="hidden items-center gap-1.5 rounded-chip bg-surface-muted px-2 py-1 text-xs text-text-secondary md:flex">
              {badges.toShip}টি প্যাক করতে হবে
            </span>
          ) : null}
        </>
      }
    />
  );
}
