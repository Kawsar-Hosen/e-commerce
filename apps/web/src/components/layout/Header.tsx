import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Heart,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  Store,
  User,
  X,
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { useCartCount } from '@/hooks/useCart';
import { useTopLevelCategories } from '@/hooks/useCatalog';
import { useUiStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { Drawer, SearchInput } from '@/components/ui';
import { SearchPanel } from '@/features/catalog/SearchPanel';

/** Sticky storefront header: search, category rail, account and cart. */

function IconAction({
  to,
  label,
  count,
  children,
}: {
  to: string;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="relative flex size-10 items-center justify-center rounded-button text-text-primary transition-colors hover:bg-surface-muted"
    >
      {children}
      {count && count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-accent px-1 font-num text-[10px] font-bold leading-4 text-on-accent">
          {toBanglaDigits(count)}
        </span>
      ) : null}
    </Link>
  );
}

export function Header() {
  const navigate = useNavigate();
  const categories = useTopLevelCategories();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistStore((state) => state.productIds.length);
  const user = useAuthStore((state) => state.session?.user);
  const signOut = useAuthStore((state) => state.signOut);
  const openDrawer = useUiStore((state) => state.openDrawer);
  const searchOpen = useUiStore((state) => state.searchOpen);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState('');

  // The compact header search mirrors the query string when landing on /shop.
  useEffect(() => {
    if (!searchOpen) setQuery('');
  }, [searchOpen]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    setSearchOpen(false);
    navigate(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : '/shop');
  };

  return (
    <>
      <header className="no-print sticky top-0 z-40 border-b border-border glass">
        <div className="page-shell">
          {/* mobile row */}
          <div className="flex h-14 items-center gap-1 lg:h-16">
            <button
              type="button"
              onClick={() => setCategoriesOpen(true)}
              aria-label="ক্যাটাগরি মেনু"
              className="flex size-10 items-center justify-center rounded-button text-text-primary hover:bg-surface-muted lg:hidden"
            >
              <Menu aria-hidden className="size-5" />
            </button>

            <Link to="/" className="mr-1 flex shrink-0 items-center gap-2 lg:mr-6">
              <span className="flex size-9 items-center justify-center rounded-card bg-primary font-num text-lg font-extrabold text-on-primary">
                S
              </span>
              <span className="hidden flex-col leading-none sm:flex">
                <span className="font-num text-lg font-extrabold tracking-tight text-primary-dark">{APP_NAME}</span>
                <span className="text-[10px] text-text-secondary">{APP_TAGLINE}</span>
              </span>
            </Link>

            {/* desktop search */}
            <form onSubmit={submit} role="search" className="hidden min-w-0 flex-1 lg:block">
              <div className="relative">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="পণ্য, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন…"
                  aria-label="পণ্য খুঁজুন"
                  className="h-10 w-full rounded-button border border-border-strong bg-surface pl-9 pr-3 text-base placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </form>

            <div className="ml-auto flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="খুঁজুন"
                className="flex size-10 items-center justify-center rounded-button text-text-primary hover:bg-surface-muted lg:hidden"
              >
                <Search aria-hidden className="size-5" />
              </button>

              <IconAction to="/wishlist" label="উইশলিস্ট" count={wishlistCount} >
                <Heart aria-hidden className="size-5" />
              </IconAction>

              <IconAction to="/cart" label="কার্ট" count={cartCount}>
                <ShoppingCart aria-hidden className="size-5" />
              </IconAction>

              <div className="hidden items-center gap-0.5 lg:flex">
                <button
                  type="button"
                  onClick={() => setAccountOpen(true)}
                  aria-label="অ্যাকাউন্ট"
                  className="flex h-10 items-center gap-2 rounded-button px-2 text-text-primary hover:bg-surface-muted"
                >
                  <User aria-hidden className="size-5" />
                  <span className="max-w-24 truncate text-sm font-medium">
                    {user ? user.name : 'লগইন'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* desktop category rail */}
          <nav aria-label="ক্যাটাগরি" className="hidden h-10 items-center gap-1 lg:flex">
            <button
              type="button"
              onClick={() => setCategoriesOpen(true)}
              className="flex items-center gap-1.5 rounded-button px-2 py-1 text-sm font-semibold text-primary-dark hover:bg-primary-soft"
            >
              <LayoutGrid aria-hidden className="size-4" />
              সব ক্যাটাগরি
            </button>

            <span className="mx-1 h-4 w-px bg-border" aria-hidden />

            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="whitespace-nowrap rounded-button px-2 py-1 text-sm text-text-secondary hover:bg-surface-muted hover:text-primary"
              >
                {category.nameBn}
              </Link>
            ))}

            <Link
              to="/brands"
              className="ml-auto whitespace-nowrap rounded-button px-2 py-1 text-sm text-text-secondary hover:text-primary"
            >
              ব্র্যান্ড
            </Link>
            <Link
              to="/track"
              className="whitespace-nowrap rounded-button px-2 py-1 text-sm text-text-secondary hover:text-primary"
            >
              অর্ডার ট্র্যাক
            </Link>
          </nav>
        </div>
      </header>

      {/* mobile search overlay */}
      {searchOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface lg:hidden">
          <form onSubmit={submit} role="search" className="flex items-center gap-2 border-b border-border p-3">
            <SearchInput
              value={query}
              onValueChange={setQuery}
              label="পণ্য খুঁজুন"
              className="flex-1"
              placeholder="পণ্য, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন…"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="সার্চ বন্ধ করুন"
              className="flex size-10 items-center justify-center rounded-button text-text-secondary hover:bg-surface-muted"
            >
              <X aria-hidden className="size-5" />
            </button>
          </form>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <SearchPanel query={query} onNavigate={() => setSearchOpen(false)} />
          </div>
        </div>
      ) : null}

      {/* desktop search suggestions */}
      {searchOpen ? (
        <div className="absolute inset-x-0 top-full hidden border-b border-border bg-surface shadow-lg lg:block">
          <div className="page-shell py-4">
            <SearchPanel query={query} onNavigate={() => setSearchOpen(false)} />
          </div>
        </div>
      ) : null}

      <Drawer
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
        title="সব ক্যাটাগরি"
        side="left"
        widthClassName="sm:max-w-xs"
      >
        <ul className="space-y-1">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                to={`/category/${category.slug}`}
                onClick={() => setCategoriesOpen(false)}
                className="flex items-center justify-between rounded-input px-3 py-2 text-base font-medium text-text-primary hover:bg-surface-muted"
              >
                {category.nameBn}
                <span className="font-num text-xs text-text-secondary">
                  {toBanglaDigits(category.productCount)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Drawer>

      <Drawer
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        title={user ? user.name : 'অ্যাকাউন্ট'}
        side="right"
        widthClassName="sm:max-w-xs"
      >
        <div className="space-y-1">
          {user ? (
            <>
              <p className="rounded-input bg-surface-muted px-3 py-2 text-xs text-text-secondary">
                ডেমো সেশন · {user.role === 'admin' ? 'অ্যাডমিন' : user.role === 'seller' ? 'সেলার' : 'গ্রাহক'}
              </p>
              <Link to="/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-input px-3 py-2 text-base hover:bg-surface-muted">
                <User aria-hidden className="size-4" /> আমার প্রোফাইল
              </Link>
              <Link to="/account/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-input px-3 py-2 text-base hover:bg-surface-muted">
                <Package aria-hidden className="size-4" /> আমার অর্ডার
              </Link>
              {user.role === 'admin' ? (
                <Link to="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-input px-3 py-2 text-base hover:bg-surface-muted">
                  <LayoutGrid aria-hidden className="size-4" /> অ্যাডমিন ড্যাশবোর্ড
                </Link>
              ) : null}
              {user.role === 'seller' ? (
                <Link to="/seller" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-input px-3 py-2 text-base hover:bg-surface-muted">
                  <Store aria-hidden className="size-4" /> সেলার ড্যাশবোর্ড
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  signOut();
                  setAccountOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-input px-3 py-2 text-left text-base text-error hover:bg-error-soft"
              >
                <LogOut aria-hidden className="size-4" /> লগ আউট
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                onClick={() => setAccountOpen(false)}
                className="block rounded-input bg-primary px-3 py-2 text-center text-base font-medium text-on-primary"
              >
                লগ ইন করুন
              </Link>
              <Link
                to="/signup"
                onClick={() => setAccountOpen(false)}
                className="block rounded-input px-3 py-2 text-center text-base text-primary"
              >
                নতুন অ্যাকাউন্ট খুলুন
              </Link>
              <p className="px-3 pt-2 text-xs text-text-secondary">
                ডেমো অ্যাকাউন্ট দিয়ে লগ ইন করলে গ্রাহক, অ্যাডমিন ও সেলার ড্যাশবোর্ড দেখা যাবে।
              </p>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setAccountOpen(false);
              openDrawer('cart');
            }}
            className="mt-2 flex w-full items-center gap-2 rounded-input px-3 py-2 text-left text-base hover:bg-surface-muted lg:hidden"
          >
            <ShoppingCart aria-hidden className="size-4" /> কার্ট ({toBanglaDigits(cartCount)})
          </button>
        </div>
      </Drawer>
    </>
  );
}
