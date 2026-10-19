import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';
import type { CategoryPerformance, SalesPoint, TrafficSourcePoint } from '@shobdox/shared-types';
import { formatChartDate, formatTaka, formatTakaCompact, toBanglaDigits } from '@shobdox/shared-utils';

/**
 * Recharts wrappers for the admin dashboards.
 *
 * Every colour is a design-token CSS variable (`var(--color-primary)`), so the
 * charts follow the theme instead of carrying their own palette. Sizes are
 * passed in from the page; only the chart geometry lives here.
 */

const AXIS_PROPS = {
  stroke: 'var(--color-border)',
  tickLine: false,
  axisLine: false,
  tick: { fill: 'var(--color-text-secondary)' },
} as const;

const PIE_COLORS = [
  'var(--color-primary)',
  'var(--color-accent)',
  'var(--color-info)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-error)',
];

type TooltipEntry = TooltipContentProps<number, string>['payload'][number];

function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipEntry>;
  label?: ReactNode;
  format: 'taka' | 'count';
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-card border border-border bg-surface px-3 py-2 shadow-md">
      <p className="text-xs text-text-secondary">{formatChartDate(String(label))}</p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="font-num text-sm font-semibold text-text-primary">
          {format === 'count'
            ? `${toBanglaDigits(Math.round(Number(entry.value ?? 0)))} টি`
            : formatTaka(Math.round(Number(entry.value ?? 0)))}
        </p>
      ))}
    </div>
  );
}

/** Daily revenue (or order count) over the selected window. */
export function RevenueAreaChart({
  series,
  metric = 'revenue',
  height = 260,
}: {
  series: SalesPoint[];
  metric?: 'revenue' | 'orders';
  height?: number;
}) {
  const dataKey = metric === 'revenue' ? 'revenue' : 'orders';

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="date"
            interval="preserveStartEnd"
            minTickGap={28}
            tickFormatter={(value: string) => formatChartDate(value)}
            {...AXIS_PROPS}
          />
          <YAxis
            width={64}
            tickFormatter={(value: number) =>
              metric === 'revenue' ? formatTakaCompact(value) : toBanglaDigits(value)
            }
            {...AXIS_PROPS}
          />
          <Tooltip content={<ChartTooltip format={metric === 'revenue' ? 'taka' : 'count'} />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            name={metric === 'revenue' ? 'আয়' : 'অর্ডার'}
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#adminRevenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Revenue by category — horizontal bars, Bangla category names on the axis. */
export function CategoryBarChart({ rows }: { rows: CategoryPerformance[] }) {
  const data = rows.filter((row) => row.revenue > 0).slice(0, 8);
  const height = Math.max(240, data.length * 36 + 40);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
          <XAxis type="number" tickFormatter={(value: number) => formatTakaCompact(value)} {...AXIS_PROPS} />
          <YAxis type="category" dataKey="nameBn" width={104} {...AXIS_PROPS} />
          <Tooltip content={<ChartTooltip format="taka" />} />
          <Bar dataKey="revenue" name="আয়" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Traffic source share. Sessions are demo analytics, not tracked visitors. */
export function TrafficPieChart({ rows }: { rows: TrafficSourcePoint[] }) {
  return (
    <div style={{ height: 280 }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip format="count" />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Pie data={rows} dataKey="sessions" nameKey="source" innerRadius={48} outerRadius={92} paddingAngle={2}>
            {rows.map((row, index) => (
              <Cell key={row.source} fill={PIE_COLORS[index % PIE_COLORS.length] ?? 'var(--color-primary)'} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
