import type {
  AdminOverview,
  CategoryPerformance,
  CustomerRow,
  InventoryAlert,
  Kpi,
  Order,
  OrderStatusBreakdown,
  Product,
  SalesPoint,
  SellerOverview,
  SellerOrderRow,
  TopProductRow,
  TrafficSourcePoint,
  Brand,
  Category,
} from '@shobdox/shared-types';
import {
  createSeededRandom,
  eachDay,
  percentChange,
  percentOf,
  roundTo,
  toDayKey,
} from '@shobdox/shared-utils';
import { productDiscountPercent } from './pricing';
import { LOW_STOCK_THRESHOLD } from './stock';

/**
 * Deterministic demo analytics.
 *
 * History is generated from a seeded PRNG so the charts are stable between
 * renders and reloads, while orders that the shopper actually creates in the
 * demo are folded in on top of the generated baseline.
 */

const HISTORY_SEED = 20260118;

export interface SeriesOptions {
  days?: number;
  /** Average daily order count used as the baseline. */
  dailyOrders?: number;
  averageOrderValue?: number;
  /** Growth applied across the window, e.g. `0.35` for +35%. */
  growth?: number;
  endDate?: Date;
}

/**
 * Builds a plausible daily revenue series: a gentle upward trend, a weekly
 * weekend bump and a small amount of noise.
 */
export function buildSalesSeries({
  days = 30,
  dailyOrders = 42,
  averageOrderValue = 1_850,
  growth = 0.3,
  endDate = new Date(),
}: SeriesOptions = {}): SalesPoint[] {
  const random = createSeededRandom(HISTORY_SEED + days);
  const start = new Date(endDate.getTime() - (days - 1) * 86_400_000);
  const dayKeys = eachDay(start, endDate);

  return dayKeys.map((dateKey, index) => {
    const progress = days <= 1 ? 1 : index / (days - 1);
    const trend = 1 + growth * progress;
    const weekday = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
    const weekendBump = weekday === 5 || weekday === 6 ? 1.18 : weekday === 0 ? 1.06 : 0.97;
    const noise = 0.88 + random() * 0.26;

    const orders = Math.max(3, Math.round(dailyOrders * trend * weekendBump * noise));
    const orderValue = Math.round(averageOrderValue * (0.92 + random() * 0.18));
    const revenue = orders * orderValue;

    return {
      date: dateKey,
      revenue,
      orders,
      averageOrderValue: orderValue,
      visitors: Math.round(orders * (16 + random() * 9)),
    };
  });
}

function sumRevenue(points: SalesPoint[]): number {
  return points.reduce((total, point) => total + point.revenue, 0);
}

function sumOrders(points: SalesPoint[]): number {
  return points.reduce((total, point) => total + point.orders, 0);
}

/** Splits a series into two halves so every KPI can show a real delta. */
function splitHalves(points: SalesPoint[]): { previous: SalesPoint[]; current: SalesPoint[] } {
  const middle = Math.floor(points.length / 2);
  return { previous: points.slice(0, middle), current: points.slice(middle) };
}

function sparklineFrom(points: SalesPoint[], key: 'revenue' | 'orders' | 'visitors' = 'revenue'): number[] {
  const step = Math.max(1, Math.floor(points.length / 12));
  return points.filter((_, index) => index % step === 0).map((point) => point[key]);
}

function trendOf(delta: number): Kpi['trend'] {
  if (delta > 0.4) return 'up';
  if (delta < -0.4) return 'down';
  return 'flat';
}

export interface KpiInput {
  series: SalesPoint[];
  products: Product[];
  customers: CustomerRow[];
  orders: Order[];
}

/** The six headline figures on the admin overview. */
export function computeAdminKpis({ series, products, customers, orders }: KpiInput): Kpi[] {
  const { previous, current } = splitHalves(series);

  const revenue = sumRevenue(current);
  const previousRevenue = sumRevenue(previous);
  const ordersPlaced = sumOrders(current);
  const previousOrders = sumOrders(previous);
  const averageOrderValue = ordersPlaced > 0 ? Math.round(revenue / ordersPlaced) : 0;
  const previousAov = previousOrders > 0 ? Math.round(previousRevenue / previousOrders) : 0;

  const newCustomers = customers.filter(
    (customer) => Date.now() - new Date(customer.joinedAt).getTime() < 30 * 86_400_000,
  ).length;

  const cancellations = orders.filter((order) => order.status === 'cancelled').length;
  const cancelRate = percentOf(cancellations, Math.max(1, orders.length), 1);

  const formatTakaCompactLocal = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1_00_00_000) return `৳ ${(value / 1_00_00_000).toFixed(2)}Cr`;
    if (abs >= 1_00_000) return `৳ ${(value / 1_00_000).toFixed(2)}L`;
    if (abs >= 1_000) return `৳ ${(value / 1_000).toFixed(1)}K`;
    return `৳ ${value}`;
  };

  const revenueDelta = percentChange(revenue, previousRevenue);
  const ordersDelta = percentChange(ordersPlaced, previousOrders);
  const aovDelta = percentChange(averageOrderValue, previousAov);

  return [
    {
      id: 'revenue',
      label: 'Total revenue',
      labelBn: 'মোট আয়',
      value: revenue,
      formatted: formatTakaCompactLocal(revenue),
      deltaPercent: revenueDelta,
      trend: trendOf(revenueDelta),
      sparkline: sparklineFrom(current),
      hint: 'নির্বাচিত সময়ের মোট বিক্রয়',
    },
    {
      id: 'orders',
      label: 'Orders',
      labelBn: 'অর্ডার',
      value: ordersPlaced,
      formatted: ordersPlaced.toLocaleString('en-US'),
      deltaPercent: ordersDelta,
      trend: trendOf(ordersDelta),
      sparkline: sparklineFrom(current, 'orders'),
      hint: 'নিশ্চিত + প্রক্রিয়াধীন অর্ডার',
    },
    {
      id: 'aov',
      label: 'Average order value',
      labelBn: 'গড় অর্ডার মূল্য',
      value: averageOrderValue,
      formatted: formatTakaCompactLocal(averageOrderValue),
      deltaPercent: aovDelta,
      trend: trendOf(aovDelta),
      sparkline: current.map((point) => point.averageOrderValue),
      hint: 'আয় ÷ অর্ডার সংখ্যা',
    },
    {
      id: 'customers',
      label: 'New customers',
      labelBn: 'নতুন গ্রাহক',
      value: newCustomers,
      formatted: newCustomers.toLocaleString('en-US'),
      deltaPercent: percentChange(newCustomers, Math.max(1, Math.round(newCustomers * 0.82))),
      trend: 'up',
      sparkline: sparklineFrom(current, 'visitors'),
      hint: 'গত ৩০ দিনে যোগ দিয়েছেন',
    },
    {
      id: 'products',
      label: 'Active products',
      labelBn: 'সক্রিয় পণ্য',
      value: products.filter((product) => product.status === 'active').length,
      formatted: products.filter((product) => product.status === 'active').length.toLocaleString('en-US'),
      deltaPercent: 4.2,
      trend: 'up',
      sparkline: [12, 14, 13, 16, 18, 17, 19, products.length],
      hint: 'ক্যাটালগে থাকা পণ্য',
    },
    {
      id: 'cancel-rate',
      label: 'Cancellation rate',
      labelBn: 'বাতিলের হার',
      value: cancelRate,
      formatted: `${cancelRate}%`,
      deltaPercent: -0.8,
      trend: 'down',
      invertTrendColors: true,
      sparkline: [4.1, 3.8, 3.5, 3.9, 3.2, 3.1, 2.9, cancelRate],
      hint: 'মোট অর্ডারের শতাংশ',
    },
  ];
}

export function computeCategoryPerformance(
  products: Product[],
  categories: Category[],
  series: SalesPoint[],
): CategoryPerformance[] {
  const totalRevenue = sumRevenue(series);
  const random = createSeededRandom(HISTORY_SEED + 7);

  const rows = categories.map((category) => {
    const categoryProducts = products.filter((product) => product.categoryId === category.id);
    const units = categoryProducts.reduce((total, product) => total + product.sold, 0);
    const gross = categoryProducts.reduce((total, product) => total + product.sold * product.price, 0);

    return {
      categoryId: category.id,
      name: category.name,
      nameBn: category.nameBn,
      revenue: gross,
      orders: Math.round(gross / (1_900 + random() * 900)),
      unitsSold: units,
      sharePercent: percentOf(gross, Math.max(1, totalRevenue * 1.6)),
      deltaPercent: roundTo(-12 + random() * 34, 1),
    };
  });

  return rows.sort((a, b) => b.revenue - a.revenue);
}

export function computeTopProducts(products: Product[], limit = 8): TopProductRow[] {
  return [...products]
    .sort((a, b) => b.sold * b.price - a.sold * a.price)
    .slice(0, limit)
    .map((product) => ({
      productId: product.id,
      title: product.title,
      titleBn: product.titleBn,
      image: product.thumbnail,
      categoryName: product.tags[0] ?? '',
      unitsSold: product.sold,
      revenue: product.sold * product.price,
      stock: product.stock,
      rating: product.rating,
    }));
}

export function computeInventoryAlerts(products: Product[], limit = 8): InventoryAlert[] {
  const alerts: InventoryAlert[] = [];

  for (const product of products) {
    for (const variant of product.variants) {
      if (variant.stock > LOW_STOCK_THRESHOLD) continue;

      const optionLabels = Object.entries(variant.optionValues)
        .map(([optionId, valueId]) => {
          const option = product.options.find((candidate) => candidate.id === optionId);
          const value = option?.values.find((candidate) => candidate.id === valueId);
          return value?.labelBn ?? value?.label ?? '';
        })
        .filter(Boolean)
        .join(' / ');

      alerts.push({
        id: `${product.id}-${variant.id}`,
        productId: product.id,
        productTitle: product.titleBn ?? product.title,
        variantLabel: optionLabels || 'ডিফল্ট',
        sku: variant.sku,
        stock: variant.stock,
        threshold: LOW_STOCK_THRESHOLD,
        severity: variant.stock === 0 ? 'critical' : variant.stock <= 3 ? 'warning' : 'info',
        updatedAt: product.updatedAt,
      });
    }
  }

  return alerts
    .sort((a, b) => a.stock - b.stock)
    .slice(0, limit);
}

export function computeOrderStatusBreakdown(orders: Order[]): OrderStatusBreakdown[] {
  const counts = new Map<string, number>();
  for (const order of orders) counts.set(order.status, (counts.get(order.status) ?? 0) + 1);

  return Array.from(counts.entries())
    .map(([status, count]) => ({ status: status as Order['status'], count }))
    .sort((a, b) => b.count - a.count);
}

const TRAFFIC_SOURCES = [
  'Facebook Ads',
  'Direct / App',
  'Google Search',
  'TikTok',
  'YouTube',
  'Email & SMS',
] as const;

export function computeTrafficSources(seed = HISTORY_SEED, totalSessions = 148_500): TrafficSourcePoint[] {
  const random = createSeededRandom(seed + 31);
  const weights = TRAFFIC_SOURCES.map(() => 0.4 + random());

  const sum = weights.reduce((total, weight) => total + weight, 0);
  return TRAFFIC_SOURCES.map((source, index) => {
    const weight = (weights[index] ?? 1) / sum;
    const sessions = Math.round(totalSessions * weight);
    return {
      source,
      sessions,
      sharePercent: percentOf(sessions, totalSessions, 1),
    };
  }).sort((a, b) => b.sessions - a.sessions);
}

/** Folds orders created inside the demo into the generated history. */
export function applyLiveOrdersToSeries(series: SalesPoint[], orders: Order[]): SalesPoint[] {
  const demos = orders.filter((order) => order.isDemo);
  if (demos.length === 0) return series;

  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (const order of demos) {
    const key = toDayKey(order.placedAt);
    const current = byDay.get(key) ?? { revenue: 0, orders: 0 };
    current.revenue += order.totals.total;
    current.orders += 1;
    byDay.set(key, current);
  }

  return series.map((point) => {
    const extra = byDay.get(point.date);
    if (!extra) return point;
    const orders = point.orders + extra.orders;
    const revenue = point.revenue + extra.revenue;
    return { ...point, orders, revenue, averageOrderValue: Math.round(revenue / orders) };
  });
}

export interface AdminOverviewInput {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
  customers: CustomerRow[];
  days?: number;
}

export function buildAdminOverview({
  products,
  categories,
  orders,
  customers,
  days = 30,
}: AdminOverviewInput): AdminOverview {
  const baseSeries = buildSalesSeries({ days, endDate: new Date() });
  const series = applyLiveOrdersToSeries(baseSeries, orders);

  return {
    kpis: computeAdminKpis({ series, products, customers, orders }),
    revenueSeries: series,
    categoryPerformance: computeCategoryPerformance(products, categories, series),
    topProducts: computeTopProducts(products),
    inventoryAlerts: computeInventoryAlerts(products),
    orderStatusBreakdown: computeOrderStatusBreakdown(orders),
    trafficSources: computeTrafficSources(),
  };
}

/* -------------------------------------------------------------- seller side */

export function buildSellerOrderRows(
  orders: Order[],
  sellerId: string,
  commissionRate: number,
): SellerOrderRow[] {
  return orders
    .map<SellerOrderRow | null>((order) => {
      const sellerLines = order.items.filter((item) => item.sellerId === sellerId);
      if (sellerLines.length === 0) return null;

      const gross = sellerLines.reduce((total, item) => total + item.lineTotal, 0);
      const commission = Math.round((gross * commissionRate) / 100);

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        status: order.status,
        itemCount: sellerLines.reduce((total, item) => total + item.quantity, 0),
        grossAmount: gross,
        commission,
        netPayable: gross - commission,
        placedAt: order.placedAt,
        district: order.shippingAddress.district,
      };
    })
    .filter((row): row is SellerOrderRow => row !== null)
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
}

export interface SellerOverviewInput {
  products: Product[];
  orders: Order[];
  sellerId: string;
  commissionRate: number;
  days?: number;
}

export function buildSellerOverview({
  products,
  orders,
  sellerId,
  commissionRate,
  days = 30,
}: SellerOverviewInput): SellerOverview {
  const sellerProducts = products.filter((product) => product.sellerId === sellerId);
  const sellerRows = buildSellerOrderRows(orders, sellerId, commissionRate);

  const grossSales = sellerRows.reduce((total, row) => total + row.grossAmount, 0);
  const commissionEarned = sellerRows.reduce((total, row) => total + row.commission, 0);

  const share = products.reduce((total, product) => total + product.sold * product.price, 0);
  const sellerShare = sellerProducts.reduce((total, product) => total + product.sold * product.price, 0);
  const shareOfMarketplace = share > 0 ? sellerShare / share : 0.12;

  const baseSeries = buildSalesSeries({
    days,
    dailyOrders: Math.max(3, Math.round(sellerProducts.length * 1.6)),
    averageOrderValue: 1_650,
    growth: 0.22,
    endDate: new Date(),
  });

  const scaledSeries = baseSeries.map((point) => ({
    ...point,
    revenue: Math.round(point.revenue * shareOfMarketplace * 0.6),
    orders: Math.max(1, Math.round(point.orders * shareOfMarketplace * 0.6)),
  }));

  const { previous, current } = splitHalves(scaledSeries);
  const revenueNow = sumRevenue(current);
  const revenueBefore = sumRevenue(previous);
  const ordersNow = sumOrders(current);
  const ordersBefore = sumOrders(previous);
  const revenueDelta = percentChange(revenueNow, revenueBefore);
  const ordersDelta = percentChange(ordersNow, ordersBefore);

  const formatShort = (value: number) =>
    value >= 1_00_000
      ? `৳ ${(value / 1_00_000).toFixed(2)}L`
      : value >= 1_000
        ? `৳ ${(value / 1_000).toFixed(1)}K`
        : `৳ ${Math.round(value)}`;

  const lowStock = sellerProducts.filter((product) =>
    product.variants.some((variant) => variant.stock <= LOW_STOCK_THRESHOLD),
  ).length;

  const kpis: Kpi[] = [
    {
      id: 'seller-revenue',
      label: 'Net revenue',
      labelBn: 'নিট আয়',
      value: revenueNow,
      formatted: formatShort(revenueNow),
      deltaPercent: revenueDelta,
      trend: trendOf(revenueDelta),
      sparkline: sparklineFrom(current),
      hint: 'কমিশন বাদ দেওয়ার পরে',
    },
    {
      id: 'seller-orders',
      label: 'Orders',
      labelBn: 'অর্ডার',
      value: ordersNow,
      formatted: ordersNow.toLocaleString('en-US'),
      deltaPercent: ordersDelta,
      trend: trendOf(ordersDelta),
      sparkline: sparklineFrom(current, 'orders'),
      hint: 'নির্বাচিত সময়ে',
    },
    {
      id: 'seller-commission',
      label: 'Commission paid',
      labelBn: 'কমিশন',
      value: commissionEarned,
      formatted: formatShort(commissionEarned),
      deltaPercent: revenueDelta,
      trend: 'flat',
      invertTrendColors: true,
      sparkline: current.map((point) => Math.round(point.revenue * (commissionRate / 100))),
      hint: `${commissionRate}% হারে`,
    },
    {
      id: 'seller-products',
      label: 'Listed products',
      labelBn: 'তালিকাভুক্ত পণ্য',
      value: sellerProducts.length,
      formatted: sellerProducts.length.toLocaleString('en-US'),
      deltaPercent: 2.1,
      trend: 'up',
      sparkline: [8, 9, 9, 11, 12, 12, 13, sellerProducts.length],
      hint: `${lowStock} টি পণ্যে স্টক কম`,
    },
  ];

  return {
    kpis,
    revenueSeries: scaledSeries,
    topProducts: computeTopProducts(sellerProducts, 6),
    inventoryAlerts: computeInventoryAlerts(sellerProducts, 6),
    pendingPayout: Math.round(grossSales * (1 - commissionRate / 100) * 0.28),
    commissionRate,
  };
}

export { sumRevenue, sumOrders, splitHalves, sparklineFrom, trendOf };

/** Share of catalogue value that is currently discounted. */
export function discountCoverage(products: Product[]): number {
  const discounted = products.filter((product) => productDiscountPercent(product) > 0).length;
  return percentOf(discounted, Math.max(1, products.length), 1);
}
