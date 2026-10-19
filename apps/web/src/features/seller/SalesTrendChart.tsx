import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatTaka, formatTakaCompact, toBanglaDigits } from '@/lib/format';

/**
 * Single-series area chart used by the overview, sales and commission screens.
 *
 * Colours come from the generated CSS custom properties, so the chart tracks the
 * design tokens instead of copying hex values into chart props.
 */

export interface TrendDatum {
  label: string;
  value: number;
}

export interface SalesTrendChartProps {
  data: TrendDatum[];
  /** `taka` formats the axis and tooltip as money, `count` as units. */
  unit?: 'taka' | 'count';
  tone?: 'primary' | 'accent';
  height?: number;
  label: string;
  seriesName?: string;
}

export function SalesTrendChart({
  data,
  unit = 'taka',
  tone = 'primary',
  height = 240,
  label,
  seriesName,
}: SalesTrendChartProps) {
  const color = tone === 'accent' ? 'var(--color-accent)' : 'var(--color-primary)';
  const gradientId = `seller-trend-${unit}-${tone}`;

  const formatValue = (value: number): string =>
    unit === 'taka' ? formatTaka(value) : `${toBanglaDigits(value)} ইউনিট`;

  return (
    <div role="img" aria-label={label} style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.03} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={false}
            width={unit === 'taka' ? 60 : 44}
            tickFormatter={(value: number) => (unit === 'taka' ? formatTakaCompact(value) : toBanglaDigits(value))}
          />
          <Tooltip
            formatter={(value) => formatValue(Number(value))}
            labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name={seriesName ?? label}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
