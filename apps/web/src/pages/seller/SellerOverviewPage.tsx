import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Package, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import { useCurrentSeller } from '@/components/layout/SellerLayout';
import {
  Badge,
  ButtonLink,
  Card,
  DemoNotice,
  KeyValue,
  PageHeader,
  Rating,
  SectionHeader,
  SegmentedControl,
  StatTile,
} from '@/components/ui';
import { SalesTrendChart } from '@/features/seller/SalesTrendChart';
import { ShipQueueCard } from '@/features/seller/ShipQueueCard';
import { LowStockPanel } from '@/features/seller/LowStockPanel';
import { readCommissionSummary, readSellerOverview, readSellerRows } from '@/services/analytics.service';
import { useDataStore } from '@/store/data.store';
import { formatChartDate, formatRelativeTime, formatTaka, toBanglaDigits } from '@/lib/format';

/**
 * Seller overview — the signed-in seller's own numbers only.
 *
 * Every figure is recomputed from live demo state through the analytics
 * service, so a stock tweak or a status advance is visible immediately.
 */

type RangeKey = '7' | '30' | '90';

const RANGE_OPTIONS: Array<{ value: RangeKey; label: string }> = [
  { value: '7', label: '৭ দিন' },
  { value: '30', label: '৩০ দিন' },
  { value: '90', label: '৯০ দিন' },
];

export default function SellerOverviewPage() {
  const seller = useCurrentSeller();
  const products = useDataStore((state) => state.products);
  const orders = useDataStore((state) => state.orders);
  const [range, setRange] = useState<RangeKey>('30');
  const days = Number(range);

// Dataset slices are dependencies on purpose: a local edit (stock, status) must recompute this.
// eslint-disable-next-line react-hooks/exhaustive-deps
  const overview = useMemo(() => readSellerOverview(seller, days), [seller, products, orders, days]);
// Dataset slices are dependencies on purpose: a local edit (stock, status) must recompute this.
// eslint-disable-next-line react-hooks/exhaustive-deps
  const rows = useMemo(() => readSellerRows(seller.id), [seller.id, orders]);
// Dataset slices are dependencies on purpose: a local edit (stock, status) must recompute this.
// eslint-disable-next-line react-hooks/exhaustive-deps
  const commission = useMemo(() => readCommissionSummary(seller), [seller, products, orders]);

  const grossSales = rows.reduce((total, row) => total + row.grossAmount, 0);
  const ordersCount = rows.length;
  const unitsSold = rows.reduce((total, row) => total + row.itemCount, 0);
  const averageOrderValue = ordersCount > 0 ? Math.round(grossSales / ordersCount) : 0;

  const kpi = (id: string) => overview.kpis.find((entry) => entry.id === id);

  const trendData = useMemo(
    () => overview.revenueSeries.map((point) => ({ label: formatChartDate(point.date), value: point.revenue })),
    [overview.revenueSeries],
  );

  const recentReviews = useMemo(() => {
    return products
      .filter((product) => product.sellerId === seller.id)
      .flatMap((product) => product.reviews.map((review) => ({ product, review })))
      .sort((a, b) => new Date(b.review.createdAt).getTime() - new Date(a.review.createdAt).getTime())
      .slice(0, 4);
  }, [products, seller.id]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="সেলার সারসংক্ষেপ"
        description={`${seller.profile.storeNameBn ?? seller.profile.storeName} — আপনার স্টোরের সর্বশেষ অবস্থা।`}
        actions={<ButtonLink to="/seller/products/new" leftIcon={<Package aria-hidden className="size-4" />}>নতুন পণ্য</ButtonLink>}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="মোট বিক্রয় (গ্রস)"
          value={formatTaka(grossSales)}
          hint={`${toBanglaDigits(ordersCount)}টি অর্ডার`}
          icon={<Wallet aria-hidden className="size-4" />}
        />
        <StatTile
          label="নিট আয় (কমিশন বাদে)"
          value={formatTaka(commission.netEarnings)}
          delta={kpi('seller-revenue')?.deltaPercent}
          trend={kpi('seller-revenue')?.trend}
          hint={`কমিশন ${toBanglaDigits(seller.commissionRate)}%`}
          tone="success"
          icon={<TrendingUp aria-hidden className="size-4" />}
        />
        <StatTile
          label="অর্ডার"
          value={toBanglaDigits(ordersCount)}
          delta={kpi('seller-orders')?.deltaPercent}
          trend={kpi('seller-orders')?.trend}
          hint="আপনার পণ্যসহ সব অর্ডার"
          tone="info"
          icon={<ShoppingBag aria-hidden className="size-4" />}
        />
        <StatTile
          label="বিক্রি হওয়া ইউনিট"
          value={toBanglaDigits(unitsSold)}
          hint="সব অর্ডারের মোট ইউনিট"
          icon={<Package aria-hidden className="size-4" />}
        />
        <StatTile
          label="গড় অর্ডার মূল্য"
          value={formatTaka(averageOrderValue)}
          hint="গ্রস বিক্রয় ÷ অর্ডার"
          tone="accent"
        />
        <StatTile
          label="সময়মতো ডেলিভারি"
          value={`${toBanglaDigits(seller.onTimeDeliveryRate)}%`}
          hint="ডেমো ডেটার হিসাব"
          tone="success"
        />
      </div>

      <Card>
        <SectionHeader
          title="বিক্রয়ের ধারা"
          subtitle="প্রতিদিনের বিক্রয় (ডেমো হিস্ট্রি + লাইভ অর্ডার)"
          trailing={<SegmentedControl label="সময়ের পরিসর" value={range} onChange={setRange} options={RANGE_OPTIONS} />}
        />
        <SalesTrendChart data={trendData} label={`${days} দিনের বিক্রয়ের ধারা`} seriesName="বিক্রয়" />
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <ShipQueueCard sellerId={seller.id} actor={`${seller.ownerName} (সেলার ড্যাশবোর্ড)`} />
        <LowStockPanel alerts={overview.inventoryAlerts} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <SectionHeader title="সাম্প্রতিক রিভিউ" href="/seller/reviews" linkLabel="সব রিভিউ" />
          {recentReviews.length === 0 ? (
            <p className="rounded-card border border-dashed border-border-strong bg-surface-muted/60 px-3 py-6 text-center text-sm text-text-secondary">
              এখনো কোনো রিভিউ আসেনি।
            </p>
          ) : (
            <ul className="space-y-3">
              {recentReviews.map(({ product, review }) => (
                <li key={review.id} className="rounded-card border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Rating value={review.rating} size="sm" showValue={false} label={`রেটিং ${review.rating} / ৫`} />
                    <span className="text-xs text-text-secondary">{formatRelativeTime(review.createdAt)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{review.body}</p>
                  <Link
                    to={`/product/${product.slug}`}
                    className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    {product.titleBn ?? product.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <SectionHeader
            title="কমিশন সারসংক্ষেপ"
            subtitle="সেটেলমেন্ট হিসাব (ডেমো)"
            href="/seller/commission"
            linkLabel="বিস্তারিত"
          />
          <dl className="divide-y divide-divider">
            <KeyValue label="মোট গ্রস বিক্রয়">{formatTaka(commission.grossSales)}</KeyValue>
            <KeyValue label={`প্ল্যাটফর্ম কমিশন (${toBanglaDigits(commission.rate)}%)`}>
              −{formatTaka(commission.commissionEarned)}
            </KeyValue>
            <KeyValue label="নিট আয়">{formatTaka(commission.netEarnings)}</KeyValue>
            <KeyValue label="সেটেলমেন্টের অপেক্ষায়">
              <span className="flex items-center gap-2">
                {formatTaka(commission.pendingPayout)}
                <Badge tone="warning" size="sm">
                  অপেক্ষমাণ
                </Badge>
              </span>
            </KeyValue>
          </dl>
          <p className="mt-3 text-xs text-text-secondary">
            পরিশোধিত আজ পর্যন্ত: <span className="font-num">{formatTaka(commission.paid)}</span>
          </p>
          <DemoNotice title="ডেমো হিসাব" className="mt-3">
            সব সংখ্যা কেবল এই ব্রাউজারের ডেটা থেকে হিসাব করা — প্রকৃত কোনো পেমেন্ট বা পেআউট হয় না।
          </DemoNotice>
        </Card>
      </div>
    </div>
  );
}
