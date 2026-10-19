import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatTaka, formatTakaCompact, toBanglaDigits } from '@/lib/format';

/**
 * Sales-page charts: category split and best weekday.
 *
 * Pie slices use the design-token CSS variables in a fixed order so colours are
 * stable between reloads (no random palette).
 */

export const CHART_COLORS = [
  'var(--color-primary)',
  'var(--color-accent)',
  'var(--color-primary-light)',
  'var(--color-info)',
  'var(--color-cyan-600)',
  'var(--color-purple-600)',
  'var(--color-amber-700)',
  'var(--color-slate-400)',
];

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 10,
  fontSize: 12,
} as const;

export function CategoryPieChart({
  data,
  height = 220,
  label,
}: {
  data: Array<{ name: string; value: number }>;
  height?: number;
  label: string;
}) {
  return (
    <div role="img" aria-label={label} style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="52%"
            outerRadius="82%"
            paddingAngle={2}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="var(--color-surface)" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatTaka(Number(value))}
            contentStyle={TOOLTIP_STYLE}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeekdayBarChart({
  data,
  height = 220,
  label,
}: {
  data: Array<{ label: string; value: number }>;
  height?: number;
  label: string;
}) {
  return (
    <div role="img" aria-label={label} style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={false}
            width={60}
            tickFormatter={(value: number) => formatTakaCompact(value)}
          />
          <Tooltip
            formatter={(value) => formatTaka(Number(value))}
            contentStyle={TOOLTIP_STYLE}
          />
          <Bar dataKey="value" name="আয়" fill="var(--color-primary)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** HTML legend rendered beside the pie chart (charts are decorative for AT). */
export function ChartLegend({ items }: { items: Array<{ name: string; value: number }> }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span className="truncate text-text-secondary">{item.name}</span>
          </span>
          <span className="shrink-0 font-num text-xs text-text-primary">
            {formatTaka(item.value)}
            {total > 0 ? <span className="ml-1 text-text-muted">({toBanglaDigits(Math.round((item.value / total) * 100))}%)</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
