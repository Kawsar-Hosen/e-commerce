import { Link, NavLink } from 'react-router';
import { Heart, Home, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { useCartCount } from '@/hooks/useCart';
import { useWishlistStore } from '@/store/wishlist.store';

/** Fixed bottom tab bar for phones and small tablets (hidden from lg up). */

const TABS = [
  { to: '/', label: 'হোম', icon: Home, end: true },
  { to: '/categories', label: 'ক্যাটাগরি', icon: LayoutGrid, end: false },
  { to: '/wishlist', label: 'উইশলিস্ট', icon: Heart, end: false },
  { to: '/cart', label: 'কার্ট', icon: ShoppingCart, end: false },
  { to: '/account', label: 'অ্যাকাউন্ট', icon: User, end: false },
] as const;

export function BottomNav() {
  const cartCount = useCartCount();
  const wishlistCount = useWishlistStore((state) => state.productIds.length);

  return (
    <nav
      aria-label="প্রধান নেভিগেশন"
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur safe-bottom lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const badge = tab.to === '/cart' ? cartCount : tab.to === '/wishlist' ? wishlistCount : 0;

          return (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    'relative flex h-[var(--shobdox-bottom-nav-height)] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-text-secondary',
                  )
                }
              >
                <span className="relative">
                  <Icon aria-hidden className="size-5" />
                  {badge > 0 ? (
                    <span className="absolute -right-2 -top-1 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 font-num text-[9px] font-bold leading-4 text-on-accent">
                      {toBanglaDigits(badge)}
                    </span>
                  ) : null}
                </span>
                {tab.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Guest/account banner shown above the footer on mobile. */
export function SignInPrompt() {
  return (
    <div className="rounded-card border border-border bg-surface p-4 lg:hidden">
      <p className="text-base font-semibold text-text-primary">অর্ডার ট্র্যাক করতে লগ ইন করুন</p>
      <p className="mt-1 text-sm text-text-secondary">
        ডেমো অ্যাকাউন্ট দিয়ে লগ ইন করলে সেভ করা ঠিকানা ও অর্ডার ইতিহাস দেখা যাবে।
      </p>
      <div className="mt-3 flex gap-2">
        <Link
          to="/signin"
          className="flex-1 rounded-button bg-primary px-4 py-2 text-center text-sm font-medium text-on-primary"
        >
          লগ ইন
        </Link>
        <Link
          to="/signup"
          className="flex-1 rounded-button border border-border-strong px-4 py-2 text-center text-sm font-medium text-text-primary"
        >
          রেজিস্টার
        </Link>
      </div>
    </div>
  );
}
