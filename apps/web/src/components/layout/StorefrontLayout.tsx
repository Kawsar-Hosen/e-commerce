import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { AnnouncementBar } from './AnnouncementBar';
import { BottomNav } from './BottomNav';
import { CartDrawer } from './CartDrawer';
import { Footer } from './Footer';
import { Header } from './Header';
import { ToastHost } from '@/components/ui';
import { useUiStore } from '@/store/ui.store';

/**
 * Storefront shell: announcement bar, sticky header, routed content, footer and
 * the mobile bottom tab bar.
 *
 * Also owns two global behaviours: closing the header search overlay whenever
 * the route changes, and scrolling to the top on navigation (so a product page
 * never opens half-way down).
 */

export function StorefrontLayout() {
  const { pathname, search } = useLocation();
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const closeDrawer = useUiStore((state) => state.closeDrawer);

  useEffect(() => {
    setSearchOpen(false);
    closeDrawer();
  }, [pathname, search, setSearchOpen, closeDrawer]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded-button focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        মূল কন্টেন্টে যান
      </a>

      <AnnouncementBar />
      <Header />

      <main id="main" className="page-shell with-bottom-nav flex-1 py-4 lg:py-6">
        <Outlet />
      </main>

      <Footer />
      <BottomNav />
      <CartDrawer />
      <ToastHost />
    </div>
  );
}
