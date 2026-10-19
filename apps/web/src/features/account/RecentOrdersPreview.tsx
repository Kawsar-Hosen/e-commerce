import { Link } from 'react-router';
import type { Order } from '@shobdox/shared-types';
import { formatDate, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { OrderStatusBadge } from './OrderStatusBadge';

/** Compact three-row order preview used on the profile page. */
export function RecentOrdersPreview({ orders, limit = 3 }: { orders: Order[]; limit?: number }) {
  const preview = orders.slice(0, limit);

  if (preview.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        এখনো কোনো অর্ডার নেই।{' '}
        <Link to="/shop" className="font-medium text-primary hover:underline">
          শপে গিয়ে
        </Link>{' '}
        প্রথম ডেমো অর্ডার করুন।
      </p>
    );
  }

  return (
    <ul className="divide-y divide-divider">
      {preview.map((order) => (
        <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <Link
              to={`/account/orders/${order.id}`}
              className="font-num text-sm font-semibold text-text-primary hover:text-primary hover:underline"
            >
              {order.orderNumber}
            </Link>
            <p className="text-xs text-text-secondary">
              {formatDate(order.placedAt)} · {toBanglaDigits(order.items.length)} ধরনের পণ্য
            </p>
          </div>

          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} size="sm" />
            <span className="font-num text-sm font-semibold text-text-primary">
              {formatTaka(order.totals.total)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
