import type { OrderStatus } from '@shobdox/shared-types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '@shobdox/shared-types';
import { Badge } from '../ui';

/**
 * Order state pill.
 *
 * Labels and tones come from the shared status maps so the app, the website and
 * the demo dashboards never disagree about what "প্রস্তুত হচ্ছে" looks like.
 */

export interface OrderStatusChipProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export function OrderStatusChip({ status, size = 'sm' }: OrderStatusChipProps) {
  const label = ORDER_STATUS_LABELS[status].bn;

  return (
    <Badge
      label={label}
      tone={ORDER_STATUS_TONES[status]}
      size={size}
      accessibilityLabel={`অর্ডারের অবস্থা: ${label}`}
    />
  );
}
