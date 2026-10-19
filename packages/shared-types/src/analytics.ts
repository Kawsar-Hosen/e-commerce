import type { EntityId, IsoDateString, Taka } from './common';
import type { OrderStatus } from './order';

export type TrendDirection = 'up' | 'down' | 'flat';

/**
 * A dashboard headline figure. `value` is the raw number so charts and tables
 * can reuse it, while `formatted` is what the card renders.
 */
export interface Kpi {
  id: string;
  label: string;
  labelBn?: string;
  value: number;
  formatted: string;
  /** Percentage change against the previous comparable period. */
  deltaPercent: number;
  trend: TrendDirection;
  /** `true` when a rise is bad, e.g. cancellations. Drives the colour. */
  invertTrendColors?: boolean;
  /** Small series rendered inside the KPI card. */
  sparkline: number[];
  hint?: string;
}

export interface SalesPoint {
  /** ISO date, one point per day. */
  date: IsoDateString;
  revenue: Taka;
  orders: number;
  /** Average order value for the day. */
  averageOrderValue: Taka;
  visitors: number;
}

export interface CategoryPerformance {
  categoryId: EntityId;
  name: string;
  nameBn: string;
  revenue: Taka;
  orders: number;
  unitsSold: number;
  /** Share of total revenue, 0–100. */
  sharePercent: number;
  /** Percentage change against the previous period. */
  deltaPercent: number;
}

export interface TopProductRow {
  productId: EntityId;
  title: string;
  titleBn?: string;
  image: string;
  categoryName: string;
  unitsSold: number;
  revenue: Taka;
  stock: number;
  rating: number;
}

export type InventoryAlertSeverity = 'critical' | 'warning' | 'info';

export interface InventoryAlert {
  id: EntityId;
  productId: EntityId;
  productTitle: string;
  variantLabel: string;
  sku: string;
  stock: number;
  /** Stock at or below this number raises the alert. */
  threshold: number;
  severity: InventoryAlertSeverity;
  updatedAt: IsoDateString;
}

export interface CustomerRow {
  id: EntityId;
  name: string;
  phone: string;
  email?: string;
  district: string;
  orders: number;
  totalSpent: Taka;
  /** Average order value. */
  averageOrderValue: Taka;
  lastOrderAt?: IsoDateString;
  joinedAt: IsoDateString;
  segment: 'new' | 'returning' | 'vip' | 'at-risk';
  status: 'active' | 'blocked';
}

export interface TrafficSourcePoint {
  source: string;
  sessions: number;
  sharePercent: number;
}

export interface OrderStatusBreakdown {
  status: OrderStatus;
  count: number;
}

export interface AdminOverview {
  kpis: Kpi[];
  revenueSeries: SalesPoint[];
  categoryPerformance: CategoryPerformance[];
  topProducts: TopProductRow[];
  inventoryAlerts: InventoryAlert[];
  orderStatusBreakdown: OrderStatusBreakdown[];
  trafficSources: TrafficSourcePoint[];
}

export interface SellerOverview {
  kpis: Kpi[];
  revenueSeries: SalesPoint[];
  topProducts: TopProductRow[];
  inventoryAlerts: InventoryAlert[];
  pendingPayout: Taka;
  commissionRate: number;
}

export interface ReportSummary {
  id: string;
  name: string;
  description: string;
  /** File the demo "export" would produce. Nothing is actually generated. */
  format: 'CSV' | 'PDF';
  updatedAt: IsoDateString;
}
