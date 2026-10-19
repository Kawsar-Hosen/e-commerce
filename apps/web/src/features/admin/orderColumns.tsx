import { Link } from 'react-router';
import type { Order, OrderStatus } from '@shobdox/shared-types';
import { formatRelativeTime, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import type { AdminColumn } from './ResponsiveTable';
import { OrderStatusMenu } from './OrderStatusMenu';
import { OrderStatusBadge, PaymentStatusBadge } from './StatusBadges';

/**
 * Column definition for the admin order table.
 *
 * The page owns filtering and pagination; this module only decides how an
 * order row is drawn. The "next step" column renders `OrderStatusMenu`, which
 * itself lists only the statuses that are legal from the current one.
 */

export function buildOrderColumns(onAdvance: (order: Order, next: OrderStatus) => void): AdminColumn<Order>[] {
  return [
    {
      id: 'order',
      header: 'অর্ডার',
      render: (order) => (
        <div>
          <Link to={`/admin/orders/${order.id}`} className="font-num font-medium text-text-primary hover:text-primary">
            {order.orderNumber}
          </Link>
          <p className="text-xs text-text-secondary">
            {formatRelativeTime(order.placedAt)} · {toBanglaDigits(order.items.length)} আইটেম
          </p>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'গ্রাহক',
      mobileLabel: 'গ্রাহক',
      render: (order) => (
        <div>
          <p className="text-sm text-text-primary">{order.customerName}</p>
          <p className="font-num text-xs text-text-secondary">{order.customerPhone}</p>
        </div>
      ),
    },
    {
      id: 'total',
      header: 'মোট',
      mobileLabel: 'মোট',
      align: 'right',
      render: (order) => <span className="font-num font-semibold">{formatTaka(order.totals.total)}</span>,
    },
    {
      id: 'payment',
      header: 'পেমেন্ট',
      mobileLabel: 'পেমেন্ট',
      render: (order) => <PaymentStatusBadge status={order.paymentStatus} />,
    },
    {
      id: 'status',
      header: 'স্ট্যাটাস',
      mobileLabel: 'স্ট্যাটাস',
      render: (order) => <OrderStatusBadge status={order.status} />,
    },
    {
      id: 'actions',
      header: 'পরবর্তী ধাপ',
      align: 'right',
      render: (order) => <OrderStatusMenu status={order.status} onSelect={(next) => onAdvance(order, next)} />,
    },
  ];
}
