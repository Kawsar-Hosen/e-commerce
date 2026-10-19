import { useMemo } from 'react';
import { Link } from 'react-router';
import type { Order, OrderStatus } from '@shobdox/shared-types';
import { nextStatuses } from '@shobdox/shared-business-logic';
import { updateOrderStatus } from '@/services/order.service';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { Button, ButtonLink, Card, EmptyState, SectionHeader } from '@/components/ui';
import { formatRelativeTime, toBanglaDigits } from '@/lib/format';
import { OrderStatusBadge } from './OrderStatusBadge';

/** The transitions the seller can perform straight from the queue. */
const QUEUE_ACTIONS: Partial<Record<OrderStatus, { label: string; target: OrderStatus }>> = {
  confirmed: { label: 'প্রস্তুত করা শুরু', target: 'processing' },
  processing: { label: 'শিপিং-এ পাঠান', target: 'shipped' },
};

/**
 * Orders that contain this seller's items and still need action.
 *
 * Only transitions that `nextStatuses()` allows are offered, so the inline
 * button can never push the order into an illegal state.
 */
export function ShipQueueCard({ sellerId, actor, limit = 5 }: { sellerId: string; actor: string; limit?: number }) {
  const orders = useDataStore((state) => state.orders);

  const queue = useMemo(
    () =>
      orders
        .filter(
          (order) =>
            order.items.some((item) => item.sellerId === sellerId) &&
            (order.status === 'confirmed' || order.status === 'processing'),
        )
        .sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime())
        .slice(0, limit),
    [orders, sellerId, limit],
  );

  const advance = (order: Order, target: OrderStatus) => {
    if (!nextStatuses(order.status).includes(target)) return;
    updateOrderStatus(order.id, target, undefined, actor);
    toast({
      tone: 'success',
      title: 'স্ট্যাটাস আপডেট হয়েছে',
      description: `${order.orderNumber} · ${target === 'shipped' ? 'শিপিং-এ পাঠানো হয়েছে' : 'প্রস্তুত করা শুরু হয়েছে'}`,
    });
  };

  return (
    <Card>
      <SectionHeader
        title="প্যাক করার অপেক্ষায়"
        subtitle="নিশ্চিত ও প্রক্রিয়াধীন অর্ডারগুলো"
        href="/seller/orders"
        linkLabel="সব অর্ডার"
      />

      {queue.length === 0 ? (
        <EmptyState
          title="প্যাক করার মতো অর্ডার নেই"
          description="নতুন নিশ্চিত অর্ডার এলেই এখানে দেখা যাবে।"
          action={<ButtonLink to="/seller/orders" variant="outline">অর্ডার তালিকা দেখুন</ButtonLink>}
        />
      ) : (
        <ul className="divide-y divide-divider">
          {queue.map((order) => {
            const units = order.items
              .filter((item) => item.sellerId === sellerId)
              .reduce((total, item) => total + item.quantity, 0);
            const action = QUEUE_ACTIONS[order.status];

            return (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link
                    to={`/seller/orders/${order.id}`}
                    className="font-num text-sm font-semibold text-primary hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {order.customerName} · {toBanglaDigits(units)}টি ইউনিট · {formatRelativeTime(order.placedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  {action ? (
                    <Button size="sm" onClick={() => advance(order, action.target)}>
                      {action.label}
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
