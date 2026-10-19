import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import type { SellerOrderRow } from '@shobdox/shared-types';
import { Card, Pagination, SectionHeader } from '@/components/ui';
import { formatRelativeTime, formatTaka, toBanglaDigits } from '@/lib/format';

/**
 * Per-order commission table for the seller commission screen.
 *
 * Sorting and paging happen on the rows the parent already filtered, so the
 * totals above the table stay untouched by what is visible here.
 */

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: 'recent', label: 'সাম্প্রতিক আগে' },
  { value: 'commission', label: 'কমিশন বেশি আগে' },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]['value'];

export function CommissionOrderTable({ rows, rate }: { rows: SellerOrderRow[]; rate: number }) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>('recent');

  useEffect(() => {
    setPage(1);
  }, [sort]);

  const sorted = useMemo(() => {
    const list = [...rows];
    if (sort === 'commission') {
      return list.sort((a, b) => b.commission - a.commission);
    }
    return list.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  }, [rows, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-end justify-between gap-3 p-4 pb-0">
        <SectionHeader
          title="অর্ডারভিত্তিক কমিশন"
          subtitle={`মোট ${toBanglaDigits(sorted.length)}টি অর্ডার — প্রতিটিতে আপনার অংশের হিসাব।`}
          className="mb-0"
        />
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          সাজান:
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="h-9 rounded-input border border-border-strong bg-surface px-2 text-sm text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/25"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {paged.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-text-secondary">এখনো কোনো অর্ডার নেই।</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto p-4 lg:block">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">অর্ডারভিত্তিক কমিশনের তালিকা</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-secondary">
                  <th scope="col" className="px-2 py-2 font-medium">অর্ডার</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">গ্রস</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">হার</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">কমিশন</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">নিট</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((row) => (
                  <tr key={row.id} className="border-b border-divider last:border-0 hover:bg-surface-muted/60">
                    <th scope="row" className="px-2 py-2.5 text-left font-normal">
                      <Link
                        to={`/seller/orders/${row.id}`}
                        className="font-num text-sm font-semibold text-primary hover:underline"
                      >
                        {row.orderNumber}
                      </Link>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {row.customerName} · {formatRelativeTime(row.placedAt)}
                      </p>
                    </th>
                    <td className="px-2 py-2.5 text-right font-num">{formatTaka(row.grossAmount)}</td>
                    <td className="px-2 py-2.5 text-right font-num text-text-secondary">{toBanglaDigits(rate)}%</td>
                    <td className="px-2 py-2.5 text-right font-num text-accent">−{formatTaka(row.commission)}</td>
                    <td className="px-2 py-2.5 text-right font-num font-semibold text-success">
                      {formatTaka(row.netPayable)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 p-4 lg:hidden">
            {paged.map((row) => (
              <li key={row.id} className="rounded-card border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/seller/orders/${row.id}`}
                    className="font-num text-sm font-semibold text-primary hover:underline"
                  >
                    {row.orderNumber}
                  </Link>
                  <span className="text-xs text-text-secondary">{formatRelativeTime(row.placedAt)}</span>
                </div>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-text-secondary">গ্রস</dt>
                    <dd className="font-num font-semibold text-text-primary">{formatTaka(row.grossAmount)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">কমিশন ({toBanglaDigits(rate)}%)</dt>
                    <dd className="font-num font-semibold text-accent">−{formatTaka(row.commission)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">নিট</dt>
                    <dd className="font-num font-semibold text-success">{formatTaka(row.netPayable)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          <div className="px-4 pb-4">
            <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </Card>
  );
}
