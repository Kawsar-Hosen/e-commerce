import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { Bell, LayoutDashboard, LogOut, Menu, RotateCcw, ShieldCheck, Store } from 'lucide-react';
import { cn } from '@/lib/cn';
import { APP_NAME } from '@/lib/constants';
import { useAuthStore } from '@/store/auth.store';
import { useUnreadNotificationCount } from '@/hooks/useCatalog';
import { resetEverything } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { Alert, Button, ConfirmDialog, Drawer, ToastHost } from '@/components/ui';

/**
 * Shell for the admin and seller dashboards.
 *
 * One component serves both roles: the nav items, the role badge and the guard
 * are passed in. Desktop gets a permanent sidebar, phones get a drawer, and a
 * user whose role does not match sees a one-tap demo sign-in instead of an
 * empty screen (there is no real authentication in this project).
 */

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  badge?: number;
  description?: string;
}

export interface DashboardNavGroup {
  title: string;
  items: DashboardNavItem[];
}

export interface DashboardLayoutProps {
  role: 'admin' | 'seller';
  /** Shown in the sidebar header and the mobile top bar. */
  title: string;
  subtitle: string;
  nav: DashboardNavGroup[];
  /** Extra actions in the top bar (e.g. "নতুন পণ্য"). */
  actions?: ReactNode;
}

const ROLE_COPY = {
  admin: { label: 'অ্যাডমিন', description: 'পুরো মার্কেটপ্লেস' },
  seller: { label: 'সেলার', description: 'আপনার স্টোর' },
} as const;

export function DashboardLayout({ role, title, subtitle, nav, actions }: DashboardLayoutProps) {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.session?.user);
  const signInAs = useAuthStore((state) => state.signInAs);
  const signOut = useAuthStore((state) => state.signOut);
  const unread = useUnreadNotificationCount();

  const [navOpen, setNavOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  const authorised = user?.role === role;

  const sidebar = (
    <nav aria-label={`${ROLE_COPY[role].label} নেভিগেশন`} className="flex h-full flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-card font-num text-lg font-extrabold text-on-primary',
            role === 'admin' ? 'bg-primary' : 'bg-accent text-on-accent',
          )}
        >
          S
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-bold text-text-primary">{title}</span>
          <span className="truncate text-xs text-text-secondary">{subtitle}</span>
        </span>
      </div>

      <div className="rounded-card border border-border bg-surface-muted/70 px-3 py-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
          <ShieldCheck aria-hidden className="size-3.5 text-primary" />
          {ROLE_COPY[role].label} ডেমো সেশন
        </p>
        <p className="mt-0.5 text-xs text-text-secondary">
          {user?.name ?? 'লগ ইন করা হয়নি'} · {ROLE_COPY[role].description}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto">
        {nav.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-button px-2.5 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-soft text-primary-dark'
                          : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
                      )
                    }
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="rounded-full bg-accent px-1.5 font-num text-[10px] font-bold leading-4 text-on-accent">
                        {item.badge}
                      </span>
                    ) : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="space-y-1 border-t border-divider pt-3">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-button px-2.5 py-2 text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary"
        >
          <Store aria-hidden className="size-4" />
          শপে ফিরে যান
        </Link>
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-button px-2.5 py-2 text-left text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary"
        >
          <RotateCcw aria-hidden className="size-4" />
          ডেমো ডেটা রিসেট
        </button>
        {user ? (
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-button px-2.5 py-2 text-left text-sm text-error hover:bg-error-soft"
          >
            <LogOut aria-hidden className="size-4" />
            লগ আউট
          </button>
        ) : null}
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      {/* desktop sidebar */}
      <aside className="no-print sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-border bg-surface p-4 lg:block">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="no-print sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border glass px-3 lg:px-5">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="ড্যাশবোর্ড মেনু"
            className="flex size-10 items-center justify-center rounded-button text-text-primary hover:bg-surface-muted lg:hidden"
          >
            <Menu aria-hidden className="size-5" />
          </button>

          <p className="hidden items-center gap-2 text-sm font-semibold text-text-primary lg:flex">
            <LayoutDashboard aria-hidden className="size-4 text-primary" />
            {title}
          </p>

          <div className="ml-auto flex items-center gap-2">
            {actions}

            <Link
              to={`/${role}/settings`}
              aria-label={unread > 0 ? `নোটিফিকেশন, ${unread}টি অপঠিত` : 'নোটিফিকেশন'}
              className="relative flex size-10 items-center justify-center rounded-button text-text-primary hover:bg-surface-muted"
            >
              <Bell aria-hidden className="size-5" />
              {unread > 0 ? (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-error" aria-hidden />
              ) : null}
            </Link>

            <span className="hidden items-center gap-2 rounded-button border border-border px-2.5 py-1.5 sm:flex">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full font-num text-xs font-bold',
                  role === 'admin' ? 'bg-primary-soft text-primary-dark' : 'bg-accent-soft text-amber-800',
                )}
              >
                {(user?.name ?? 'ড').charAt(0)}
              </span>
              <span className="max-w-32 truncate text-sm font-medium text-text-primary">
                {user?.name ?? 'ডেমো ব্যবহারকারী'}
              </span>
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-3 pb-16 lg:p-5">
          {authorised ? (
            <Outlet />
          ) : (
            <div className="mx-auto max-w-xl py-10">
              <Alert tone="warning" title="ডেমো রোল প্রয়োজন">
                এই ড্যাশবোর্ডটি শুধু {ROLE_COPY[role].label} রোলের জন্য। প্রকৃত লগইন সিস্টেম নেই — নিচের বাটনে চাপ
                দিলে {ROLE_COPY[role].label} ডেমো অ্যাকাউন্টে প্রবেশ করবেন।
              </Alert>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    signInAs(role);
                    toast({ tone: 'success', title: `${ROLE_COPY[role].label} ডেমো সেশনে প্রবেশ করেছেন` });
                  }}
                >
                  {ROLE_COPY[role].label} হিসেবে দেখুন
                </Button>
                <Button variant="outline" onClick={() => signInAs('customer')}>
                  গ্রাহক হিসেবে দেখুন
                </Button>
                <Link
                  to={role === 'admin' ? '/seller' : '/admin'}
                  className="inline-flex h-10 items-center rounded-button border border-border-strong px-4 text-sm font-medium text-text-primary hover:border-primary hover:text-primary"
                >
                  {role === 'admin' ? 'সেলার ড্যাশবোর্ড' : 'অ্যাডমিন ড্যাশবোর্ড'}
                </Link>
              </div>

              <p className="mt-4 text-xs text-text-secondary">
                ডেমো অ্যাকাউন্ট তথ্য: <span className="font-num">{APP_NAME}</span> README-তে দেওয়া আছে।
              </p>
            </div>
          )}
        </main>
      </div>

      <Drawer open={navOpen} onClose={() => setNavOpen(false)} title={title} side="left" widthClassName="sm:max-w-xs">
        {sidebar}
      </Drawer>

      <ToastHost />

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="ডেমো ডেটা রিসেট করবেন?"
        message="সব পণ্য, অর্ডার, কুপন ও অ্যাডমিন এডিট প্রাথমিক অবস্থায় ফিরে যাবে। কার্ট ও উইশলিস্টও খালি হয়ে যাবে।"
        confirmLabel="রিসেট করুন"
        onConfirm={() => {
          void resetEverything().then(() => toast({ tone: 'success', title: 'ডেমো ডেটা রিসেট হয়েছে' }));
          setResetOpen(false);
        }}
      />
    </div>
  );
}
