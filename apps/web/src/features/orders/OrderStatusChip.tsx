import { Badge, type Tone } from '@/components/ui';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  type OrderStatus,
  type OrderStatusTone,
} from '@shobdox/shared-types';

/**
 * Bangla status chip shared by tracking, confirmation and order lists.
 * The tone mapping lives here so every surface shows the same colour.
 */
const TONE_MAP: Record<OrderStatusTone, Tone> = {
  neutral: 'neutral',
  info: 'info',
  warning: 'warning',
  success: 'success',
  error: 'danger',
};

export function OrderStatusChip({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <Badge tone={TONE_MAP[ORDER_STATUS_TONES[status]]} className={className}>
      {ORDER_STATUS_LABELS[status].bn}
    </Badge>
  );
}
