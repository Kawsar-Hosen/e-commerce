import type { OrderStatus } from '@shobdox/shared-types';
import { Badge } from '@/components/ui';
import { orderStatusLabel, orderStatusTone } from './labels';

/** Order status chip used by the order list, detail page and notifications. */
export function OrderStatusBadge({ status, size = 'md' }: { status: OrderStatus; size?: 'sm' | 'md' }) {
  return (
    <Badge tone={orderStatusTone(status)} size={size}>
      {orderStatusLabel(status)}
    </Badge>
  );
}
