import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Truck } from 'lucide-react';
import type { OrderStatus, SellerOrderRow } from '@shobdox/shared-types';
import { ORDER_STATUS_LABELS } from '@shobdox/shared-types';
import { nextStatuses } from '@shobdox/shared-business-logic';
import { useCurrentSeller } from '@/components/layout/SellerLayout';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  SearchInput,
  Tabs,
} from '@/components/ui';
import { OrderStatusBadge } from '@/features/seller/OrderStatusBadge';
import { readSellerRows } from '@/services/analytics.service';
import { updateOrderStatus } from '@/services/order.service';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { formatDate, formatTaka, toBanglaDigits } from '@/lib/format';

/**
 * Orders that contain this seller's items.
 *
 * Totals (`grossAmount`, `commission`, `netPayable`) come from
 * `buildSellerOrderRows()`, so an order with several sellers only ever shows
 * this seller's slice. The advance button is limited to `nextStatuses()`.
 */

const PAGE_SIZE = 10;

const FORWARD_STEPS: OrderStatus[] = ['confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered'];

const ADVANCE_LABELS: Partial<Record<OrderStatus, string>> = {
  confirmed: 'নিশ্চিত করুন',
  processing: 'প্রস্তুত শুরু',
  shipped: 'শিপিং-এ পাঠান',
  'out-for-delivery': 'ডেলিভারিতে পাঠান',
  delivered: 'ডেলিভারি সম্পন্ন',
};

export default function SellerOrdersPage() {
  const seller = useCurrentSeller();
  const orders = useDataStore((state) => state.orders);
  const [query, setQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | OrderStatus>('all');
  const [page, setPage] = useState(1);

// Dataset slices are dependencies on purpose: a local edit (stock, status) must recompute this.
// eslint-disable-next-line react-hooks/exhaustive-deps
  const rows = useMemo(() => readSellerRows(seller.id), [seller.id, orders]);
  const actor = `${seller.ownerName} (সেলার ড্যাশবোর্ড)`;

  useEffect(() => {
    setPage(1);
  }, [query, statusTab]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery =
        needle === '' || `${row.orderNumber} ${row.customerName} ${row.district}`.toLowerCase().includes(needle);
      const matchesStatus = statusTab === 'all' || row.status === statusTab;
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusTab]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (sum, row) => ({
          gross: sum.gross + row.grossAmount,
          commission: sum.commission + row.commission,
          net: sum.net + row.netPayable,
          units: sum.units + row.itemCount,
        }),
        { gross: 0, commission: 0, net: 0, units: 0 },
      ),
    [filtered],
  );

  const tabs = useMemo(() => {
    const all: Array<{ id: 'all' | OrderStatus; label: string; count: number }> = [
      { id: 'all', label: 'সব', count: rows.length },
    ];
    (Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).forEach((status) => {
      const count = rows.filter((row) => row.status === status).length;
      if (count > 0) all.push({ id: status, label: ORDER_STATUS_LABELS[status].bn, count });
    });
    return all;
  }, [rows]);

  const advance = (row: SellerOrderRow, target: OrderStatus) => {
    if (!nextStatuses(row.status).includes(target)) return;
    updateOrderStatus(row.id, target, undefined, actor);
    toast({
      tone: 'success',
      title: 'স্ট্যাটাস আপডেট হয়েছে',
      description: `${row.orderNumber} → ${ORDER_STATUS_LABELS[target].bn}`,
    });
  };

  const nextStep = (row: SellerOrderRow): OrderStatus | undefined =>
    nextStatuses(row.status).find((candidate) => FORWARD_STEPS.includes(candidate));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <PageHeader
        title="অর্ডার"
        description="শুধু আপনার পণ্যসহ অর্ডারগুলো — গ্রস, কমিশন ও নিট আপনার অংশের হিসাব।"
        actions={<ButtonLink to="/seller/sales" variant="outline">বিক্রয় বিশ্লেষণ</ButtonLink>}
      />

      <Card className="space-y-4">
        <SearchInput
          className="max-w-md"
          value={query}
          onValueChange={setQuery}
          placeholder="অর্ডার নম্বর, গ্রাহক বা জেলা…"
          label="অর্ডার খুঁজুন"
        />
        <Tabs
          items={tabs.map((tab) => ({ id: tab.id, label: tab.label, count: tab.count }))}
          activeId={statusTab}
          onChange={(id) => setStatusTab(id as 'all' | OrderStatus)}
          aria-label="অর্ডার অবস্থা"
        />
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span className="text-text-secondary">
            গ্রস: <span className="font-num font-semibold text-text-primary">{formatTaka(totals.gross)}</span>
          </span>
          <span className="text-text-secondary">
            কমিশন: <span className="font-num font-semibold text-text-primary">{formatTaka(totals.commission)}</span>
          </span>
          <span className="text-text-secondary">
            নিট: <span className="font-num font-semibold text-success">{formatTaka(totals.net)}</span>
          </span>
          <span className="text-text-secondary">
            ইউনিট: <span className="font-num font-semibold text-text-primary">{toBanglaDigits(totals.units)}</span>
          </span>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="কোনো অর্ডার নেই" description="ফিল্টার বদলে দেখুন বা নতুন অর্ডারের অপেক্ষা করুন।" />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-card border border-border bg-surface shadow-xs lg:block">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">আপনার অর্ডারের তালিকা</caption>
              <thead className="bg-surface-muted/70">
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-secondary">
                  <th scope="col" className="px-3 py-2.5 font-medium">অর্ডার</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">গ্রস</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">কমিশন</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">নিট</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">অবস্থা</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((row) => {
                  const step = nextStep(row);
                  return (
                    <tr key={row.id} className="border-b border-divider last:border-0 hover:bg-surface-muted/60">
                      <th scope="row" className="px-3 py-3 text-left font-normal">
                        <Link to={`/seller/orders/${row.id}`} className="font-num text-sm font-semibold text-primary hover:underline">
                          {row.orderNumber}
                        </Link>
                        <p className="mt-0.5 text-xs text-text-secondary">
                          {row.customerName} · {row.district} · {formatDate(row.placedAt, { withYear: false })}
                        </p>
                        <p className="text-xs text-text-muted">{toBanglaDigits(row.itemCount)}টি ইউনিট</p>
                      </th>
                      <td className="px-3 py-3 text-right font-num text-sm">{formatTaka(row.grossAmount)}</td>
                      <td className="px-3 py-3 text-right font-num text-sm text-text-secondary">−{formatTaka(row.commission)}</td>
                      <td className="px-3 py-3 text-right font-num text-sm font-semibold text-success">{formatTaka(row.netPayable)}</td>
                      <td className="px-3 py-3">
                        <OrderStatusBadge status={row.status} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {step ? (
                            <Button size="sm" variant="outline" onClick={() => advance(row, step)}>
                              {ADVANCE_LABELS[step]}
                            </Button>
                          ) : (
                            <Badge tone="neutral" size="sm">শেষ ধাপ</Badge>
                          )}
                          <ButtonLink to={`/seller/orders/${row.id}`} variant="ghost" size="icon" aria-label="অর্ডার বিস্তারিত">
                            <ArrowRight aria-hidden className="size-4" />
                          </ButtonLink>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 lg:hidden">
            {paged.map((row) => {
              const step = nextStep(row);
              return (
                <li key={row.id} className="rounded-card border border-border bg-surface p-3 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to={`/seller/orders/${row.id}`} className="font-num text-sm font-semibold text-primary hover:underline">
                        {row.orderNumber}
                      </Link>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {row.customerName} · {row.district}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatDate(row.placedAt, { withYear: false })} · {toBanglaDigits(row.itemCount)}টি ইউনিট
                      </p>
                    </div>
                    <OrderStatusBadge status={row.status} />
                  </div>

                  <dl className="mt-2 grid grid-cols-3 gap-2 rounded-card bg-surface-muted/70 px-2 py-1.5 text-xs">
                    <div>
                      <dt className="text-text-secondary">গ্রস</dt>
                      <dd className="font-num font-semibold text-text-primary">{formatTaka(row.grossAmount)}</dd>
                    </div>
                    <div>
                      <dt className="text-text-secondary">কমিশন</dt>
                      <dd className="font-num font-semibold text-text-primary">−{formatTaka(row.commission)}</dd>
                    </div>
                    <div>
                      <dt className="text-text-secondary">নিট</dt>
                      <dd className="font-num font-semibold text-success">{formatTaka(row.netPayable)}</dd>
                    </div>
                  </dl>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {step ? (
                      <Button size="sm" leftIcon={<Truck aria-hidden className="size-4" />} onClick={() => advance(row, step)}>
                        {ADVANCE_LABELS[step]}
                      </Button>
                    ) : null}
                    <ButtonLink to={`/seller/orders/${row.id}`} variant="outline" size="sm">
                      বিস্তারিত
                    </ButtonLink>
                  </div>
                </li>
              );
            })}
          </ul>

          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
