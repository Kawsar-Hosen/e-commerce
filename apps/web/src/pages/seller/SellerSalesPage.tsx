import { useMemo, useState } from 'react';
import type { SalesPoint } from '@shobdox/shared-types';
import { useCurrentSeller } from '@/components/layout/SellerLayout';
import { Card, DemoNotice, PageHeader, SectionHeader, SegmentedControl, StatTile } from '@/components/ui';
import { SalesTrendChart } from '@/features/seller/SalesTrendChart';
import { CategoryPieChart, ChartLegend, WeekdayBarChart } from '@/features/seller/SalesCharts';
import { TopProductsTable, type TopProductSort } from '@/features/seller/TopProductsTable';
import { categoryLabel } from '@/features/seller/utils';
import { readSellerOverview, readSellerRows } from '@/services/analytics.service';
import { useDataStore } from '@/store/data.store';
import { formatChartDate, formatTaka, toBanglaDigits } from '@/lib/format';

/**
 * Sales analytics for one seller.
 *
 * Trend history is the deterministic demo series from `readSellerOverview()`;
 * the top-product table is aggregated from the seller's actual order lines
 * (`buildSellerOrderRows` slice), falling back to catalogue `sold` counts for
 * products that only exist in the seeded history.
 */

type RangeKey = '7' | '30' | '90';

const RANGE_OPTIONS: Array<{ value: RangeKey; label: string }> = [
  { value: '7', label: '৭ দিন' },
  { value: '30', label: '৩০ দিন' },
  { value: '90', label: '৯০ দিন' },
];

const WEEKDAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];

export default function SellerSalesPage() {
  const seller = useCurrentSeller();
  const orders = useDataStore((state) => state.orders);
  const products = useDataStore((state) => state.products);
  const categories = useDataStore((state) => state.categories);
  const [range, setRange] = useState<RangeKey>('30');
  const [topSort, setTopSort] = useState<TopProductSort>('revenue');
  const days = Number(range);

// Dataset slices are dependencies on purpose: a local edit (stock, status) must recompute this.
// eslint-disable-next-line react-hooks/exhaustive-deps
  const overview = useMemo(() => readSellerOverview(seller, days), [seller, days, orders, products]);
// Dataset slices are dependencies on purpose: a local edit (stock, status) must recompute this.
// eslint-disable-next-line react-hooks/exhaustive-deps
  const rows = useMemo(() => readSellerRows(seller.id), [seller.id, orders]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (sum, row) => ({
          gross: sum.gross + row.grossAmount,
          net: sum.net + row.netPayable,
          units: sum.units + row.itemCount,
        }),
        { gross: 0, net: 0, units: 0 },
      ),
    [rows],
  );

  const averageUnitsPerOrder = rows.length > 0 ? totals.units / rows.length : 1;

  const revenueData = useMemo(
    () => overview.revenueSeries.map((point) => ({ label: formatChartDate(point.date), value: point.revenue })),
    [overview.revenueSeries],
  );

  const unitsData = useMemo(
    () =>
      overview.revenueSeries.map((point) => ({
        label: formatChartDate(point.date),
        value: Math.max(0, Math.round(point.orders * averageUnitsPerOrder)),
      })),
    [overview.revenueSeries, averageUnitsPerOrder],
  );

  const categorySplit = useMemo(() => {
    const sellerProducts = products.filter((product) => product.sellerId === seller.id);
    const map = new Map<string, number>();
    sellerProducts.forEach((product) => {
      map.set(product.categoryId, (map.get(product.categoryId) ?? 0) + product.sold * product.price);
    });
    return [...map.entries()]
      .map(([categoryId, value]) => ({ name: categoryLabel(categories, categoryId), value }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [products, categories, seller.id]);

  const weekdaySplit = useMemo(() => {
    const sums = new Array<number>(7).fill(0);
    overview.revenueSeries.forEach((point: SalesPoint) => {
      const weekday = new Date(`${point.date}T00:00:00.000Z`).getUTCDay();
      sums[weekday] = (sums[weekday] ?? 0) + point.revenue;
    });
    return WEEKDAYS.map((label, index) => ({ label, value: sums[index] ?? 0 }));
  }, [overview.revenueSeries]);

  const topProducts = useMemo(() => {
    const aggregates = new Map<string, { units: number; revenue: number }>();
    orders.forEach((order) =>
      order.items
        .filter((item) => item.sellerId === seller.id)
        .forEach((item) => {
          const current = aggregates.get(item.productId) ?? { units: 0, revenue: 0 };
          aggregates.set(item.productId, {
            units: current.units + item.quantity,
            revenue: current.revenue + item.lineTotal,
          });
        }),
    );

    return products
      .filter((product) => product.sellerId === seller.id)
      .map((product) => {
        const live = aggregates.get(product.id);
        return {
          productId: product.id,
          slug: product.slug,
          title: product.titleBn ?? product.title,
          image: product.thumbnail,
          units: live?.units ?? product.sold,
          revenue: live?.revenue ?? product.sold * product.price,
          stock: product.stock,
          stockStatus: product.stockStatus,
        };
      })
      .filter((row) => row.units > 0 || row.revenue > 0);
  }, [orders, products, seller.id]);

  const bestWeekday = [...weekdaySplit].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="space-y-5">
      <PageHeader
        title="বিক্রয় বিশ্লেষণ"
        description="আয়, ইউনিট, ক্যাটাগরি ও সেরা দিনের হিসাব — সবই আপনার স্টোরের ডেটা থেকে।"
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatTile label="মোট গ্রস বিক্রয়" value={formatTaka(totals.gross)} hint={`${toBanglaDigits(rows.length)}টি অর্ডার`} />
        <StatTile label="নিট আয়" value={formatTaka(totals.net)} tone="success" hint={`কমিশন ${toBanglaDigits(seller.commissionRate)}%`} />
        <StatTile label="বিক্রি হওয়া ইউনিট" value={toBanglaDigits(totals.units)} tone="info" />
        <StatTile
          label="সেরা দিন"
          value={bestWeekday ? bestWeekday.label : '—'}
          tone="accent"
          hint={bestWeekday ? formatTaka(bestWeekday.value) : undefined}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <SectionHeader
            title="আয়ের ধারা"
            trailing={<SegmentedControl label="সময়ের পরিসর" value={range} onChange={setRange} options={RANGE_OPTIONS} />}
          />
          <SalesTrendChart data={revenueData} label={`${days} দিনের আয়ের ধারা`} seriesName="আয়" />
        </Card>

        <Card>
          <SectionHeader title="ইউনিটের ধারা" subtitle="ডেমো হিস্ট্রি × আপনার গড় ইউনিট/অর্ডার (আনুমানিক)" />
          <SalesTrendChart data={unitsData} unit="count" tone="accent" label={`${days} দিনের ইউনিটের ধারা`} seriesName="ইউনিট" />
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <SectionHeader title="ক্যাটাগরি ভাগ" subtitle="ক্যাটালগ মূল্যের হিসাবে" />
          {categorySplit.length === 0 ? (
            <p className="rounded-card border border-dashed border-border-strong bg-surface-muted/60 px-3 py-6 text-center text-sm text-text-secondary">
              ক্যাটাগরির হিসাব দেখানোর মতো বিক্রয় নেই।
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 md:items-center">
              <CategoryPieChart data={categorySplit} label="ক্যাটাগরি অনুযায়ী বিক্রয়" />
              <ChartLegend items={categorySplit} />
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader title="সপ্তাহের সেরা দিন" subtitle="ডেমো হিস্ট্রির সাপ্তাহিক আয়" />
          <WeekdayBarChart data={weekdaySplit} label="সপ্তাহের প্রতিদিনের আয়" />
        </Card>
      </div>

      <TopProductsTable
        rows={topProducts}
        sort={topSort}
        onSortChange={setTopSort}
        periodLabel={`${days} দিন`}
      />

      <DemoNotice title="ডেমো বিশ্লেষণ">
        গ্রাফের ইতিহাস ডেমো ডেটাসেট থেকে তৈরি; সেরা পণ্যের তালিকা আপনার অর্ডার লাইন ও ক্যাটালগ `sold` সংখ্যা থেকে
        হিসাব করা। CSV ফাইল শুধু আপনার ব্রাউজারে তৈরি হয়।
      </DemoNotice>
    </div>
  );
}
