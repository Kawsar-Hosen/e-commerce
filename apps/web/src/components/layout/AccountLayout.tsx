import { NavLink, Outlet, useLocation } from 'react-router';
import { Bell, Home, LogOut, MapPin, Package, Settings, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/auth.store';
import { DemoSignInCard } from '@/features/auth/DemoSignInCard';
import { ToastHost } from '@/components/ui';

/** Customer account shell: profile, orders, addresses, notifications, settings. */

const ACCOUNT_NAV = [
  { to: '/account', label: 'প্রোফাইল', icon: User, end: true },
  { to: '/account/orders', label: 'আমার অর্ডার', icon: Package, end: false },
  { to: '/account/addresses', label: 'ঠিকানা', icon: MapPin, end: false },
  { to: '/account/notifications', label: 'নোটিফিকেশন', icon: Bell, end: false },
  { to: '/account/settings', label: 'সেটিংস', icon: Settings, end: false },
] as const;

export function AccountLayout() {
  const user = useAuthStore((state) => state.session?.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { pathname } = useLocation();

  return (
    <div className="with-bottom-nav">
      <nav aria-label="অ্যাকাউন্ট নেভিগেশন" className="no-scrollbar -mx-3 mb-4 flex gap-1 overflow-x-auto border-b border-border px-3 lg:hidden">
        {ACCOUNT_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium',
                  isActive ? 'border-primary text-primary' : 'border-transparent text-text-secondary',
                )
              }
            >
              <Icon aria-hidden className="size-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-6">
        <aside className="hidden lg:block">
          <div className="rounded-card border border-border bg-surface p-3">
            <div className="mb-3 flex items-center gap-2.5 border-b border-divider pb-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft font-num font-bold text-primary-dark">
                {(user?.name ?? 'অ').charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-text-primary">
                  {user?.name ?? 'অতিথি'}
                </span>
                <span className="block truncate text-xs text-text-secondary">
                  {user ? user.phone : 'লগ ইন করা হয়নি'}
                </span>
              </span>
            </div>

            <ul className="space-y-0.5">
              {ACCOUNT_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-button px-2.5 py-2 text-sm font-medium',
                          isActive ? 'bg-primary-soft text-primary-dark' : 'text-text-secondary hover:bg-surface-muted',
                        )
                      }
                    >
                      <Icon aria-hidden className="size-4" />
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}

              <li>
                <NavLink
                  to="/"
                  className="flex items-center gap-2.5 rounded-button px-2.5 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted"
                >
                  <Home aria-hidden className="size-4" />
                  শপে ফিরে যান
                </NavLink>
              </li>

              {user ? (
                <li>
                  <button
                    type="button"
                    onClick={signOut}
                    className="flex w-full items-center gap-2.5 rounded-button px-2.5 py-2 text-left text-sm font-medium text-error hover:bg-error-soft"
                  >
                    <LogOut aria-hidden className="size-4" />
                    লগ আউট
                  </button>
                </li>
              ) : null}
            </ul>
          </div>
        </aside>

        <div className="min-w-0">
          {user ? <Outlet /> : <DemoSignInCard redirectTo={pathname} />}
        </div>
      </div>

      <ToastHost />
    </div>
  );
}
