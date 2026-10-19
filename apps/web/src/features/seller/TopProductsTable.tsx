import { Link } from 'react-router';
import { Download } from 'lucide-react';
import { Button, Card, Price, SegmentedControl, SectionHeader, StockBadge, Thumb } from '@/components/ui';
import { toBanglaDigits } from '@/lib/format';
import { downloadCsv } from './utils';

/** Top-selling seller products, sortable by revenue or units. */

export interface TopProductRow {
  productId: string;
  slug: string;
  title: string;
  image: string;
  units: number;
  revenue: number;
  stock: number;
  stockStatus: string;
}

export type TopProductSort = 'revenue' | 'units';

export function TopProductsTable({
  rows,
  sort,
  onSortChange,
  periodLabel,
}: {
  rows: TopProductRow[];
  sort: TopProductSort;
  onSortChange: (sort: TopProductSort) => void;
  periodLabel: string;
}) {
  const sorted = [...rows].sort((a, b) => (sort === 'revenue' ? b.revenue - a.revenue : b.units - a.units));

  const exportCsv = () => {
    downloadCsv(
      'shobdox-top-products.csv',
      ['পণ্য', 'ইউনিট', 'আয় (৳)', 'স্টক'],
      sorted.map((row) => [row.title, row.units, row.revenue, row.stock]),
    );
  };

  return (
    <Card>
      <SectionHeader
        title="সেরা পণ্য"
        subtitle={`${periodLabel} সময়ের হিসাব`}
        trailing={
          <SegmentedControl
            label="সাজানোর ধরন"
            value={sort}
            onChange={onSortChange}
            options={[
              { value: 'revenue', label: 'আয়' },
              { value: 'units', label: 'ইউনিট' },
            ]}
          />
        }
      />

      <div className="mb-3 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download aria-hidden className="size-4" />}
          onClick={exportCsv}
          disabled={sorted.length === 0}
        >
          CSV ডাউনলোড
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-strong bg-surface-muted/60 px-3 py-6 text-center text-sm text-text-secondary">
          এই সময়ে কোনো বিক্রয় নেই।
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">সেরা পণ্যের তালিকা</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-secondary">
                  <th scope="col" className="px-3 py-2 font-medium">
                    পণ্য
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    ইউনিট
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    আয়
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    স্টক
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.productId} className="border-b border-divider last:border-0 hover:bg-surface-muted/60">
                    <th scope="row" className="px-3 py-2 text-left font-normal">
                      <div className="flex items-center gap-3">
                        <Thumb src={row.image} alt={row.title} label={row.title} className="size-10" />
                        <Link to={`/product/${row.slug}`} className="font-medium text-text-primary hover:text-primary">
                          {row.title}
                        </Link>
                      </div>
                    </th>
                    <td className="px-3 py-2 text-right font-num">{toBanglaDigits(row.units)}</td>
                    <td className="px-3 py-2 text-right">
                      <Price value={row.revenue} size="sm" inline />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <StockBadge status={row.stockStatus} stock={row.stock} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 lg:hidden">
            {sorted.map((row) => (
              <li key={row.productId} className="flex items-center gap-3 rounded-card border border-border p-2.5">
                <Thumb src={row.image} alt={row.title} label={row.title} className="size-12" />
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${row.slug}`} className="line-clamp-2 text-sm font-medium text-text-primary hover:text-primary">
                    {row.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    ইউনিট: <span className="font-num text-text-primary">{toBanglaDigits(row.units)}</span>
                  </p>
                </div>
                <Price value={row.revenue} size="sm" className="shrink-0" />
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
