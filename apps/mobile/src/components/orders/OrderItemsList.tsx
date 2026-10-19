import { View } from 'react-native';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { AppImage, Text } from '../ui';

/**
 * Read-only list of ordered lines.
 *
 * Accepts both a live `CartItem` and a stored `OrderLineItem` (the fields it
 * needs are shared), so the checkout preview and the order screens render the
 * same row.
 */

export interface OrderItemRow {
  id: string;
  slug: string;
  title: string;
  titleBn?: string;
  image: string;
  selectedOptions: Record<string, string>;
  unitPrice: number;
  quantity: number;
}

export interface OrderItemsListProps {
  items: OrderItemRow[];
  /** Hidden in tight spaces such as the order card summary. */
  showImages?: boolean;
}

export function OrderItemsList({ items, showImages = true }: OrderItemsListProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.space[3] }}>
      {items.map((item) => {
        const title = item.titleBn ?? item.title;
        const options = Object.entries(item.selectedOptions)
          .map(([name, value]) => `${name}: ${value}`)
          .join(' · ');

        return (
          <View key={item.id} style={{ flexDirection: 'row', gap: theme.space[3], alignItems: 'center' }}>
            {showImages ? (
              <AppImage
                uri={item.image}
                fallbackLabel={title}
                recyclingKey={item.id}
                accessibilityLabel={title}
                style={{ width: 56, height: 56, borderRadius: theme.componentRadius.image }}
              />
            ) : null}

            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="label" numberOfLines={2}>
                {title}
              </Text>
              {options ? (
                <Text variant="caption" tone="muted" numberOfLines={1}>
                  {options}
                </Text>
              ) : null}
              <Text variant="caption" tone="secondary">
                {formatTaka(item.unitPrice)} × {toBanglaDigits(item.quantity)}
              </Text>
            </View>

            <Text variant="bodyStrong" accessibilityLabel={`লাইন মোট ${formatTaka(item.unitPrice * item.quantity)}`}>
              {formatTaka(item.unitPrice * item.quantity)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
