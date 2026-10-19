import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatTaka, formatTakaCompact } from '@/lib/format';

/**
 * Revenue, commission and net per month.
 *
 * Commission and net are stacked so the top of each bar is the gross figure —
 * the same maths `summarizeCommission()` performs on the commission screen.
 */

export interface RevenueMonthPoint {
  label: string;
  commission: number;
  net: number;
}

export function MonthlyRevenueChart({
  data,
  height = 260,
  label,
}: {
  data: RevenueMonthPoint[];
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
            width={64}
            tickFormatter={(value: number) => formatTakaCompact(value)}
          />
          <Tooltip
            formatter={(value) => formatTaka(Number(value))}
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              fontSize: 12,
            }}
          />
          <Bar dataKey="net" name="নিট আয়" stackId="revenue" fill="var(--color-primary)" isAnimationActive={false} />
          <Bar
            dataKey="commission"
            name="কমিশন"
            stackId="revenue"
            fill="var(--color-accent)"
            radius={[6, 6, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
