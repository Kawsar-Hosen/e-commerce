import {
  BadgePercent,
  BarChart3,
  Bell,
  Boxes,
  Image as ImageIcon,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import { DashboardLayout, type DashboardNavGroup } from './DashboardLayout';
import { useDataStore } from '@/store/data.store';

/** Admin shell: catalogue, orders, customers, marketing, sellers, reports. */

export function useAdminBadges() {
  const orders = useDataStore((state) => state.orders);
  const products = useDataStore((state) => state.products);
  const sellers = useDataStore((state) => state.sellers);

  return {
    awaitingAction: orders.filter((order) => order.status === 'placed' || order.status === 'confirmed').length,
    lowStock: products.filter((product) => product.stockStatus === 'low-stock' || product.stockStatus === 'out-of-stock').length,
    pendingSellers: sellers.filter((seller) => seller.status === 'pending-review').length,
  };
}

export function AdminLayout() {
  const badges = useAdminBadges();

  const nav: DashboardNavGroup[] = [
    {
      title: 'সারসংক্ষেপ',
      items: [
        { to: '/admin', label: 'ওভারভিউ', icon: <LayoutDashboard aria-hidden className="size-4" />, end: true },
        { to: '/admin/reports', label: 'রিপোর্ট ও অ্যানালিটিক্স', icon: <BarChart3 aria-hidden className="size-4" /> },
      ],
    },
    {
      title: 'ক্যাটালগ',
      items: [
        { to: '/admin/products', label: 'পণ্য', icon: <Package aria-hidden className="size-4" />, badge: badges.lowStock },
        { to: '/admin/categories', label: 'ক্যাটাগরি', icon: <Tags aria-hidden className="size-4" /> },
      ],
    },
    {
      title: 'বিক্রয়',
      items: [
        { to: '/admin/orders', label: 'অর্ডার', icon: <ShoppingBag aria-hidden className="size-4" />, badge: badges.awaitingAction },
        { to: '/admin/customers', label: 'গ্রাহক', icon: <Users aria-hidden className="size-4" /> },
      ],
    },
    {
      title: 'মার্কেটিং',
      items: [
        { to: '/admin/coupons', label: 'কুপন ও ছাড়', icon: <BadgePercent aria-hidden className="size-4" /> },
        { to: '/admin/banners', label: 'ব্যানার ও ঘোষণা', icon: <Megaphone aria-hidden className="size-4" /> },
      ],
    },
    {
      title: 'মার্কেটপ্লেস',
      items: [
        { to: '/admin/sellers', label: 'সেলার', icon: <Store aria-hidden className="size-4" />, badge: badges.pendingSellers },
        { to: '/admin/settings', label: 'সেটিংস', icon: <Settings aria-hidden className="size-4" /> },
      ],
    },
  ];

  return (
    <DashboardLayout
      role="admin"
      title="অ্যাডমিন প্যানেল"
      subtitle="SHOBDOX মার্কেটপ্লেস"
      nav={nav}
      actions={
        <>
          <span className="hidden items-center gap-1.5 rounded-chip bg-warning-soft px-2 py-1 text-xs font-medium text-amber-900 sm:flex">
            <Bell aria-hidden className="size-3.5" />
            ডেমো ডেটা
          </span>
          <span className="hidden items-center gap-1.5 rounded-chip bg-surface-muted px-2 py-1 text-xs text-text-secondary md:flex">
            <Truck aria-hidden className="size-3.5" />
            {badges.awaitingAction}টি অর্ডার প্রক্রিয়াধীন
          </span>
          <span className="hidden items-center gap-1.5 rounded-chip bg-surface-muted px-2 py-1 text-xs text-text-secondary xl:flex">
            <Boxes aria-hidden className="size-3.5" />
            {badges.lowStock}টি স্টক সতর্কতা
          </span>
          <span className="hidden items-center gap-1.5 rounded-chip bg-surface-muted px-2 py-1 text-xs text-text-secondary xl:flex">
            <Wallet aria-hidden className="size-3.5" />
            কমিশন ১২% পর্যন্ত
          </span>
          <span className="hidden items-center gap-1.5 rounded-chip bg-surface-muted px-2 py-1 text-xs text-text-secondary 2xl:flex">
            <ImageIcon aria-hidden className="size-3.5" />
            ছবি: ডেমো CDN
          </span>
        </>
      }
    />
  );
}
