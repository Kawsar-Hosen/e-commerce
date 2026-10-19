import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Package } from 'lucide-react-native';
import type { Order } from '@shobdox/shared-types';
import { findDeliveryMethod } from '@shobdox/shared-business-logic';
import { formatDate, formatDateTime, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { AppImage, Card, Text } from '../ui';
import { OrderStatusChip } from './OrderStatusChip';

/**
 * One row in the order history.
 *
 * Every value is read from the stored order — nothing is recalculated from the
 * catalogue, because a receipt must show what was actually recorded.
 */

export interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const theme = useTheme();
  const router = useRouter();

  const units = order.items.reduce((total, item) => total + item.quantity, 0);
  const firstItem = order.items[0];
  const firstTitle = firstItem ? firstItem.titleBn ?? firstItem.title : '';
  const extraCount = order.items.length - 1;
  const delivery = findDeliveryMethod(order.deliveryMethod);

  const open = () => router.push(`/order/${order.id}`);

  return (
    <Card padded={false}>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`অর্ডার ${order.orderNumber}, ${units} টি পণ্য, মোট ${formatTaka(order.totals.total)}`}
        accessibilityHint="অর্ডারের বিস্তারিত ও ট্র্যাকিং খুলবে"
        android_ripple={{ color: theme.colors.overlay }}
        style={{ padding: theme.space[4], gap: theme.space[3] }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.space[2] }}>
          <Text variant="mono" numberOfLines={1} style={{ flexShrink: 1 }}>
            {order.orderNumber}
          </Text>
          <OrderStatusChip status={order.status} />
        </View>

        <View style={{ flexDirection: 'row', gap: theme.space[3], alignItems: 'center' }}>
          {firstItem ? (
            <AppImage
              uri={firstItem.image}
              fallbackLabel={firstTitle}
              recyclingKey={firstItem.id}
              accessibilityLabel={firstTitle}
              style={{ width: 56, height: 56, borderRadius: theme.componentRadius.image }}
            />
          ) : (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: theme.componentRadius.image,
                backgroundColor: theme.colors.surfaceMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={22} color={theme.colors.textMuted} />
            </View>
          )}

          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="label" numberOfLines={2}>
              {firstTitle}
              {extraCount > 0 ? ` + আরও ${toBanglaDigits(extraCount)} টি` : ''}
            </Text>
            <Text variant="caption" tone="secondary">
              {formatDateTime(order.placedAt)}
            </Text>
            <Text variant="caption" tone="secondary">
              {delivery.nameBn} · {formatDate(order.estimatedDelivery)} নাগাদ
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text variant="bodyStrong" accessibilityLabel={`মোট ${formatTaka(order.totals.total)}`}>
              {formatTaka(order.totals.total)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text variant="caption" tone="primary">
                বিস্তারিত
              </Text>
              <ChevronRight size={14} color={theme.colors.primary} />
            </View>
          </View>
        </View>
      </Pressable>
    </Card>
  );
}
