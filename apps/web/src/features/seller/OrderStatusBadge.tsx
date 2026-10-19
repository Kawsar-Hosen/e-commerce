import type { OrderStatus, OrderStatusTone } from '@shobdox/shared-types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '@shobdox/shared-types';
import { Badge, type Tone } from '@/components/ui';

/** Badge tones use `danger` where the order tone map says `error`. */
const TONE_MAP: Record<OrderStatusTone, Tone> = {
  neutral: 'neutral',
  info: 'info',
  warning: 'warning',
  success: 'success',
  error: 'danger',
};

/** Bangla status chip reused by every seller order surface. */
export function OrderStatusBadge({ status, size = 'sm' }: { status: OrderStatus; size?: 'sm' | 'md' }) {
  return (
    <Badge tone={TONE_MAP[ORDER_STATUS_TONES[status]]} size={size}>
      {ORDER_STATUS_LABELS[status].bn}
    </Badge>
  );
}
