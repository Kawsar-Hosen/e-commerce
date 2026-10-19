import { View } from 'react-native';
import {
  CircleCheckBig,
  CircleX,
  Navigation,
  Package,
  ShoppingBag,
  Truck,
  Undo2,
} from 'lucide-react-native';
import type { Order, OrderStatus } from '@shobdox/shared-types';
import { ORDER_STATUS_LABELS } from '@shobdox/shared-types';
import { orderProgressPercent } from '@shobdox/shared-business-logic';
import { formatDateTime } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { ProgressBar, Text } from '../ui';

/**
 * Vertical order timeline.
 *
 * Renders the events already stored on the order (the state machine writes
 * them), so an illegal jump can never show up here. The last event is marked as
 * current and the progressbar mirrors the shared step index.
 */

export interface OrderTimelineProps {
  order: Order;
}

function StatusIcon({ status, color, size }: { status: OrderStatus; color: string; size: number }) {
  switch (status) {
    case 'placed':
      return <ShoppingBag size={size} color={color} />;
    case 'confirmed':
      return <CircleCheckBig size={size} color={color} />;
    case 'processing':
      return <Package size={size} color={color} />;
    case 'shipped':
      return <Truck size={size} color={color} />;
    case 'out-for-delivery':
      return <Navigation size={size} color={color} />;
    case 'delivered':
      return <CircleCheckBig size={size} color={color} />;
    case 'cancelled':
      return <CircleX size={size} color={color} />;
    case 'returned':
      return <Undo2 size={size} color={color} />;
  }
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const theme = useTheme();
  const events = order.timeline;
  const progress = orderProgressPercent(order.status);

  return (
    <View style={{ gap: theme.space[3] }}>
      <ProgressBar
        value={progress}
        tone={order.status === 'cancelled' || order.status === 'returned' ? 'warning' : 'primary'}
        accessibilityLabel={`অর্ডারের অগ্রগতি ${ORDER_STATUS_LABELS[order.status].bn}`}
      />

      <View style={{ gap: theme.space[1] }}>
        {events.map((event, index) => {
          const isLast = index === events.length - 1;
          const accent = isLast ? theme.colors.primary : theme.colors.textMuted;

          return (
            <View key={event.id} style={{ flexDirection: 'row', gap: theme.space[3] }}>
              <View style={{ alignItems: 'center', width: 28 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: theme.radius.full,
                    backgroundColor: isLast ? theme.colors.primarySoft : theme.colors.surfaceMuted,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StatusIcon status={event.status} color={accent} size={16} />
                </View>
                {isLast ? null : (
                  <View style={{ flex: 1, width: 2, backgroundColor: theme.colors.divider, minHeight: 12 }} />
                )}
              </View>

              <View style={{ flex: 1, gap: 2, paddingBottom: theme.space[2] }}>
                <Text variant={isLast ? 'bodyStrong' : 'label'} tone={isLast ? 'default' : 'secondary'}>
                  {ORDER_STATUS_LABELS[event.status].bn}
                </Text>
                <Text variant="caption" tone="secondary">
                  {event.note}
                </Text>
                <Text variant="caption" tone="muted">
                  {formatDateTime(event.at)}
                  {event.location ? ` · ${event.location}` : ''}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
