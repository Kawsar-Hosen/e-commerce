import { Link } from 'react-router';
import { XCircle } from 'lucide-react';
import type { Order } from '@shobdox/shared-types';
import { Button, ButtonLink, Card, Thumb } from '@/components/ui';
import { formatDate, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { canCustomerCancel } from '@/services/order.service';
import { OrderStatusBadge } from './OrderStatusBadge';

/**
 * Order history list.
 *
 * Phones get stacked cards, `lg`+ gets a table — the same data and the same
 * actions in both, so nothing is only reachable on one viewport size.
 */

export interface OrderHistoryListProps {
  orders: Order[];
  onCancel: (order: Order) => void;
}

function unitCount(order: Order): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

function ItemThumbs({ order }: { order: Order }) {
  const preview = order.items.slice(0, 3);
  const hidden = order.items.length - preview.length;

  return (
    <div className="flex items-center gap-1.5">
      {preview.map((item) => (
        <Thumb
          key={item.id}
          src={item.image}
          alt={item.titleBn ?? item.title}
          label={item.titleBn ?? item.title}
          className="size-9"
        />
      ))}
      {hidden > 0 ? (
        <span className="flex size-9 items-center justify-center rounded-image border border-border bg-surface-muted font-num text-xs text-text-secondary">
          +{toBanglaDigits(hidden)}
        </span>
      ) : null}
    </div>
  );
}

function OrderActions({ order, onCancel, size = 'sm' }: { order: Order; onCancel: (order: Order) => void; size?: 'sm' | 'md' }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ButtonLink to={`/account/orders/${order.id}`} variant="outline" size={size}>
        বিস্তারিত
      </ButtonLink>
      <ButtonLink to={`/track?order=${order.orderNumber}`} variant="ghost" size={size}>
        ট্র্যাক
      </ButtonLink>
      {canCustomerCancel(order) ? (
        <Button
          variant="ghost"
          size={size}
          className="text-error hover:bg-error-soft"
          onClick={() => onCancel(order)}
          leftIcon={<XCircle aria-hidden className="size-4" />}
        >
          বাতিল
        </Button>
      ) : null}
    </div>
  );
}

export function OrderHistoryList({ orders, onCancel }: OrderHistoryListProps) {
  return (
    <>
      {/* Mobile: card list */}
      <ul className="space-y-3 lg:hidden">
        {orders.map((order) => (
          <li key={order.id}>
            <Card className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="font-num text-base font-semibold text-text-primary hover:text-primary hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {formatDate(order.placedAt)} · {toBanglaDigits(unitCount(order))}টি পণ্য
                  </p>
                </div>
                <OrderStatusBadge status={order.status} size="sm" />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <ItemThumbs order={order} />
                <span className="font-num text-base font-bold text-text-primary">
                  {formatTaka(order.totals.total)}
                </span>
              </div>

              <div className="mt-3 border-t border-divider pt-3">
                <OrderActions order={order} onCancel={onCancel} />
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full">
          <caption className="sr-only">আপনার অর্ডারের তালিকা</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
              <th scope="col" className="px-3 py-2.5">অর্ডার</th>
              <th scope="col" className="px-3 py-2.5">পণ্য</th>
              <th scope="col" className="px-3 py-2.5">মোট</th>
              <th scope="col" className="px-3 py-2.5">অবস্থা</th>
              <th scope="col" className="px-3 py-2.5 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-3 py-3 align-middle">
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="font-num text-sm font-semibold text-text-primary hover:text-primary hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-xs text-text-secondary">{formatDate(order.placedAt)}</p>
                  <p className="text-xs text-text-muted">{toBanglaDigits(unitCount(order))}টি পণ্য</p>
                </td>
                <td className="px-3 py-3 align-middle">
                  <ItemThumbs order={order} />
                </td>
                <td className="px-3 py-3 align-middle font-num font-semibold text-text-primary">
                  {formatTaka(order.totals.total)}
                </td>
                <td className="px-3 py-3 align-middle">
                  <OrderStatusBadge status={order.status} size="sm" />
                </td>
                <td className="px-3 py-3 align-middle">
                  <div className="flex justify-end">
                    <OrderActions order={order} onCancel={onCancel} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
