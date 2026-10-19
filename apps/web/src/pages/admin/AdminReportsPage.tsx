import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { MOCK_REPORTS } from '@shobdox/shared-mock-data';
import { formatRelativeTime, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import {
  Badge,
  Button,
  Card,
  DemoNotice,
  PageHeader,
  SectionHeader,
  SegmentedControl,
  StatTile,
} from '@/components/ui';
import { readAdminOverview } from '@/services/analytics.service';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { CategoryBarChart, RevenueAreaChart, TrafficPieChart } from '@/features/admin/Charts';
import { exportCsv } from '@/features/admin/csv';

type DaysOption = '7' | '30' | '90';

const DAYS_OPTIONS: Array<{ value: DaysOption; label: string }> = [
  { value: '7', label: '৭ দিন' },
  { value: '30', label: '৩০ দিন' },
  { value: '90', label: '৯০ দিন' },
];

/** Reports: the same analytics engine as the dashboard, plus CSV exports. */
export default function AdminReportsPage() {
  const [days, setDays] = useState<DaysOption>('30');
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');

  const orders = useDataStore((state) => state.orders);
  const products = useDataStore((state) => state.products);
  const customers = useDataStore((state) => state.customers);
  const categories = useDataStore((state) => state.categories);
  const brands = useDataStore((state) => state.brands);
  const coupons = useDataStore((state) => state.coupons);

  const overview = useMemo(
    () => readAdminOverview(Number(days)),
    // The slices are the inputs `readAdminOverview()` reads from the store, so
    // an order-status change on the dashboard must recompute the chart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [days, orders, products, customers, categories, brands],
  );

  const downloadReport = (reportId: string) => {
    switch (reportId) {
      case 'rep-sales':
        exportCsv(
          'shobdox-daily-sales.csv',
          [
            { header: 'তারিখ', value: (point) => point.date.slice(0, 10) },
            { header: 'আয় (৳)', value: (point) => point.revenue },
            { header: 'অর্ডার', value: (point) => point.orders },
            { header: 'গড় অর্ডার (৳)', value: (point) => point.averageOrderValue },
            { header: 'ভিজিটর', value: (point) => point.visitors },
          ],
          overview.revenueSeries,
        );
        return;
      case 'rep-products':
        exportCsv(
          'shobdox-product-performance.csv',
          [
            { header: 'পণ্য', value: (row) => row.titleBn ?? row.title },
            { header: 'ক্যাটাগরি', value: (row) => row.categoryName },
            { header: 'বিক্রয় (ইউনিট)', value: (row) => row.unitsSold },
            { header: 'আয় (৳)', value: (row) => row.revenue },
            { header: 'স্টক', value: (row) => row.stock },
          ],
          overview.topProducts,
        );
        return;
      case 'rep-inventory':
        exportCsv(
          'shobdox-inventory.csv',
          [
            { header: 'পণ্য', value: (alert) => alert.productTitle },
            { header: 'ভ্যারিয়েন্ট', value: (alert) => alert.variantLabel },
            { header: 'SKU', value: (alert) => alert.sku },
            { header: 'স্টক', value: (alert) => alert.stock },
            { header: 'সতর্কতা', value: (alert) => alert.severity },
          ],
          overview.inventoryAlerts,
        );
        return;
      case 'rep-coupons':
        exportCsv(
          'shobdox-coupon-usage.csv',
          [
            { header: 'কোড', value: (coupon) => coupon.code },
            { header: 'ব্যবহৃত', value: (coupon) => coupon.usedCount },
            { header: 'সীমা', value: (coupon) => coupon.usageLimit },
            { header: 'সক্রিয়', value: (coupon) => (coupon.isActive ? 'হ্যাঁ' : 'না') },
          ],
          coupons,
        );
        return;
      default:
        toast({
          tone: 'info',
          title: 'PDF ডেমোতে তৈরি হয় না',
          description: 'এই রিপোর্টটি CSV ফরম্যাটে ডাউনলোড করে দেখুন — সব হিসাব লাইভ ডেটা থেকে আসে।',
        });
    }
  };

  const totalRevenue = overview.revenueSeries.reduce((sum, point) => sum + point.revenue, 0);
  const totalOrders = overview.revenueSeries.reduce((sum, point) => sum + point.orders, 0);

  return (
    <>
      <PageHeader
        title="রিপোর্ট"
        description="বিক্রয়, পণ্য, স্টক ও ট্রাফিকের বিশ্লেষণ — সব সংখ্যা এখনকার ডেমো স্টেট থেকে।"
        actions={
          <>
            <SegmentedControl label="সময়ের পরিসর" value={days} onChange={setDays} options={DAYS_OPTIONS} />
            <Button variant="outline" leftIcon={<Printer aria-hidden className="size-4" />} onClick={() => window.print()}>
              প্রিন্ট
            </Button>
          </>
        }
      />

      <DemoNotice className="mb-5" title="ডেমো রিপোর্ট">
        CSV ফাইল ব্রাউজারেই তৈরি হয় (কোনো সার্ভার কল নেই); PDF সারি শুধু ডেমোর সীমাবদ্ধতা বোঝাতে দেখানো।
      </DemoNotice>

      <section aria-label="রিপোর্ট সূচক" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overview.kpis.slice(0, 6).map((kpi) => (
          <StatTile key={kpi.id} label={kpi.label} value={kpi.formatted} delta={kpi.deltaPercent} trend={kpi.trend} hint={kpi.hint} />
        ))}
      </section>

      <Card className="mt-5">
        <SectionHeader
          title="আয়ের ধারা"
          subtitle={`শেষ ${toBanglaDigits(Number(days))} দিনে মোট ${formatTaka(totalRevenue)} · ${toBanglaDigits(totalOrders)} অর্ডার`}
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
        <RevenueAreaChart series={overview.revenueSeries} metric={metric} height={300} />
      </Card>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <SectionHeader title="ক্যাটাগরি পারফরম্যান্স" subtitle="আয়, অর্ডার ও ইউনিট বিক্রয়" />
          <CategoryBarChart rows={overview.categoryPerformance} />
        </Card>

        <Card>
          <SectionHeader title="ট্রাফিক সোর্স" subtitle="ডেমো সেশন — প্রকৃত ভিজিটর ট্র্যাকিং নয়" />
          <TrafficPieChart rows={overview.trafficSources} />
        </Card>
      </div>

      <Card className="mt-5">
        <SectionHeader title="সংরক্ষিত রিপোর্ট" subtitle="ডেমো রিপোর্টের তালিকা — ডাউনলোড করলে এখনকার ডেটা যায়" />
        <ul className="divide-y divide-divider">
          {MOCK_REPORTS.map((report) => (
            <li key={report.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-start gap-2">
                <FileSpreadsheet aria-hidden className="mt-0.5 size-4 shrink-0 text-text-secondary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{report.name}</p>
                  <p className="text-xs text-text-secondary">{report.description}</p>
                  <p className="mt-0.5 text-xs text-text-muted">আপডেট: {formatRelativeTime(report.updatedAt)}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={report.format === 'CSV' ? 'success' : 'info'} size="sm">
                  {report.format}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Download aria-hidden className="size-4" />}
                  onClick={() => downloadReport(report.id)}
                >
                  {report.format === 'CSV' ? 'CSV ডাউনলোড' : 'প্রয়োগ করুন'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
