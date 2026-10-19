import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Banknote, PackageSearch, ShoppingBag, ShoppingCart, Users, XCircle } from 'lucide-react';
import { ORDER_STATUS_LABELS } from '@shobdox/shared-types';
import {
  ButtonLink,
  Card,
  DemoNotice,
  PageHeader,
  Progress,
  SectionHeader,
  SegmentedControl,
  StatTile,
  Thumb,
} from '@/components/ui';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { readAdminOverview } from '@/services/analytics.service';
import { useDataStore } from '@/store/data.store';
import { CategoryBarChart, RevenueAreaChart, TrafficPieChart } from '@/features/admin/Charts';
import { InventoryAlertsCard } from '@/features/admin/InventoryAlertsCard';

/**
 * Admin dashboard.
 *
 * `readAdminOverview()` reads the store directly, so the page subscribes to the
 * slices the overview is derived from and recomputes inside `useMemo` — a new
 * demo order moves every card without a reload.
 */

type DaysOption = '7' | '30' | '90';

const DAYS_OPTIONS: Array<{ value: DaysOption; label: string }> = [
  { value: '7', label: '৭ দিন' },
  { value: '30', label: '৩০ দিন' },
  { value: '90', label: '৯০ দিন' },
];

const KPI_ICONS: Record<string, ReactNode> = {
  revenue: <Banknote aria-hidden className="size-4" />,
  orders: <ShoppingBag aria-hidden className="size-4" />,
  aov: <ShoppingCart aria-hidden className="size-4" />,
  customers: <Users aria-hidden className="size-4" />,
  products: <PackageSearch aria-hidden className="size-4" />,
  'cancel-rate': <XCircle aria-hidden className="size-4" />,
};

const KPI_TONES: Record<string, 'primary' | 'accent' | 'success' | 'info' | 'error'> = {
  revenue: 'primary',
  orders: 'info',
  aov: 'success',
  customers: 'accent',
  products: 'primary',
  'cancel-rate': 'error',
};

export default function AdminOverviewPage() {
  const [days, setDays] = useState<DaysOption>('30');
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');

  const orders = useDataStore((state) => state.orders);
  const products = useDataStore((state) => state.products);
  const customers = useDataStore((state) => state.customers);
  const categories = useDataStore((state) => state.categories);
  const brands = useDataStore((state) => state.brands);

  const overview = useMemo(
    () => readAdminOverview(Number(days)),
    // The slices are the inputs `readAdminOverview()` reads from the store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [days, orders, products, customers, categories, brands],
  );

  const maxStatusCount = Math.max(1, ...overview.orderStatusBreakdown.map((row) => row.count));
  const topProducts = overview.topProducts.slice(0, 5);

  return (
    <>
      <PageHeader
        title="ড্যাশবোর্ড"
        description="মার্কেটপ্লেসের আয়, অর্ডার, স্টক ও ট্রাফিক — সব ডেমো ডেটা থেকে লাইভ হিসাব করা।"
        actions={
          <>
            <SegmentedControl label="সময়ের পরিসর" value={days} onChange={setDays} options={DAYS_OPTIONS} />
            <ButtonLink to="/admin/reports" variant="outline">
              রিপোর্ট
            </ButtonLink>
          </>
        }
      />

      <DemoNotice className="mb-5" title="ডেমো অ্যানালিটিক্স">
        সংখ্যাগুলো আপনার ব্রাউজারে সংরক্ষিত অর্ডার ও পণ্য থেকে এখনই হিসাব করা হয়েছে — কোনো বাহ্যিক অ্যানালিটিক্স
        সেবা যুক্ত নয়।
      </DemoNotice>

      <section aria-label="মূল সূচক" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {overview.kpis.map((kpi) => (
          <StatTile
            key={kpi.id}
            label={kpi.label}
            value={kpi.formatted}
            delta={kpi.deltaPercent}
            trend={kpi.trend}
            hint={kpi.hint}
            icon={KPI_ICONS[kpi.id]}
            tone={KPI_TONES[kpi.id] ?? 'primary'}
          />
        ))}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <SectionHeader
            title="আয় ও অর্ডারের ধারা"
            subtitle={`শেষ ${toBanglaDigits(Number(days))} দিন`}
            action={
              <SegmentedControl
                label="চার্টের মেট্রিক"
                value={metric}
                onChange={setMetric}
                options={[
                  { value: 'revenue', label: 'আয়' },
                  { value: 'orders', label: 'অর্ডার' },
                ]}
              />
            }
          />
          <RevenueAreaChart series={overview.revenueSeries} metric={metric} />
        </Card>

        <Card>
          <SectionHeader title="স্ট্যাটাস অনুযায়ী অর্ডার" subtitle="ভাগের হিসাব দৈনিক নয় — পুরো অর্ডার ইতিহাস" />
          <ul className="space-y-3">
            {overview.orderStatusBreakdown.map((row) => (
              <li key={row.status}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-text-primary">{ORDER_STATUS_LABELS[row.status].bn}</span>
                  <span className="font-num text-text-secondary">{toBanglaDigits(row.count)}</span>
                </div>
                <Progress
                  className="mt-1"
                  size="sm"
                  tone={row.status === 'cancelled' || row.status === 'returned' ? 'error' : 'primary'}
                  value={row.count}
                  max={maxStatusCount}
                  label={ORDER_STATUS_LABELS[row.status].bn}
                />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <SectionHeader title="ক্যাটাগরিভিত্তিক আয়" subtitle="সর্বোচ্চ আয় করা ক্যাটাগরিগুলো" />
          <CategoryBarChart rows={overview.categoryPerformance} />
        </Card>

        <Card>
          <SectionHeader title="ট্রাফিকের উৎস" subtitle="ডেমো সেশন ভাগ — প্রকৃত ভিজিটর ট্র্যাকিং নয়" />
          <TrafficPieChart rows={overview.trafficSources} />
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card>
          <SectionHeader
            title="শীর্ষ বিক্রীত পণ্য"
            subtitle="বিক্রয়ের হিসাবে সর্বোচ্চ"
            href="/admin/products"
          />
          <div className="hidden md:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">সর্বাধিক বিক্রীত পণ্য</caption>
              <thead>
                <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  <th scope="col" className="px-2 py-2">
                    পণ্য
                  </th>
                  <th scope="col" className="px-2 py-2 text-right">
                    বিক্রয়
                  </th>
                  <th scope="col" className="px-2 py-2 text-right">
                    আয়
                  </th>
                  <th scope="col" className="px-2 py-2 text-right">
                    স্টক
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {topProducts.map((row) => (
                  <tr key={row.productId}>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <Thumb src={row.image} alt={row.titleBn ?? row.title} className="size-9" />
                        <div className="min-w-0">
                          <Link
                            to={`/admin/products/${row.productId}/edit`}
                            className="block truncate font-medium text-text-primary hover:text-primary"
                          >
                            {row.titleBn ?? row.title}
                          </Link>
                          <p className="text-xs text-text-secondary">{row.categoryName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right font-num">{toBanglaDigits(row.unitsSold)}</td>
                    <td className="px-2 py-2 text-right font-num">{formatTaka(row.revenue)}</td>
                    <td className="px-2 py-2 text-right font-num">{toBanglaDigits(row.stock)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {topProducts.map((row) => (
              <li key={row.productId} className="flex items-center gap-3">
                <Thumb src={row.image} alt={row.titleBn ?? row.title} className="size-10" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/admin/products/${row.productId}/edit`}
                    className="block truncate text-sm font-medium text-text-primary hover:text-primary"
                  >
                    {row.titleBn ?? row.title}
                  </Link>
                  <p className="text-xs text-text-secondary">
                    {toBanglaDigits(row.unitsSold)} বিক্রয় · {formatTaka(row.revenue)}
                  </p>
                </div>
                <span className="font-num text-xs text-text-secondary">স্টক {toBanglaDigits(row.stock)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <InventoryAlertsCard alerts={overview.inventoryAlerts} limit={6} />
      </div>
    </>
  );
}
