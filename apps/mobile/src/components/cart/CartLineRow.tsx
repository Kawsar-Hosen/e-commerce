import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Trash } from 'lucide-react-native';
import type { CartItem } from '@shobdox/shared-types';
import type { CartLineIssue } from '@shobdox/shared-business-logic';
import { formatTaka } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { useCartStore } from '../../store/cart.store';
import { AppImage, Card, Price, QuantityStepper, Text } from '../ui';

/**
 * One cart line.
 *
 * The row reads the store directly for quantity changes, so a tap never lags
 * behind the render. A catalogue mismatch (price change or stock-out) is shown
 * inline instead of hiding the line.
 */

export interface CartLineRowProps {
  item: CartItem;
  issue?: CartLineIssue;
}

export function CartLineRow({ item, issue }: CartLineRowProps) {
  const theme = useTheme();
  const router = useRouter();

  const increment = useCartStore((state) => state.incrementItem);
  const decrement = useCartStore((state) => state.decrementItem);
  const remove = useCartStore((state) => state.removeItem);

  const title = item.titleBn ?? item.title;
  const optionText = Object.entries(item.selectedOptions)
    .map(([name, value]) => `${name}: ${value}`)
    .join(' · ');

  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', gap: theme.space[3], padding: theme.space[3] }}>
        <Pressable
          onPress={() => router.push(`/product/${item.slug}`)}
          accessibilityRole="button"
          accessibilityLabel={`${title} — বিস্তারিত দেখুন`}
        >
          <AppImage
            uri={item.image}
            fallbackLabel={title}
            recyclingKey={item.id}
            accessibilityLabel={title}
            style={{
              width: 84,
              height: 84,
              borderRadius: theme.componentRadius.image,
            }}
          />
        </Pressable>

        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="label" numberOfLines={2}>
            {title}
          </Text>
          {optionText ? (
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              {optionText}
            </Text>
          ) : null}

          <Price price={item.unitPrice} compareAtPrice={item.compareAtPrice} size="sm" />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: theme.space[2],
              marginTop: 2,
            }}
          >
            <QuantityStepper
              value={item.quantity}
              min={1}
              max={Math.max(1, Math.min(item.availableStock, 10))}
              onChange={(next) => (next > item.quantity ? increment(item.id) : decrement(item.id))}
              hint={
                item.availableStock > 0
                  ? `স্টকে ${item.availableStock}টি`
                  : 'স্টক শেষ'
              }
            />

            <Text variant="bodyStrong">{formatTaka(item.unitPrice * item.quantity)}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => remove(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`${title} — কার্ট থেকে সরান`}
          hitSlop={8}
          style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
        >
          <Trash size={18} color={theme.colors.error} />
        </Pressable>
      </View>

      {issue ? (
        <View
          accessibilityLiveRegion="polite"
          style={{
            backgroundColor:
              issue.severity === 'error' ? theme.colors.errorSoft : theme.colors.warningSoft,
            paddingHorizontal: theme.space[3],
            paddingVertical: theme.space[2],
          }}
        >
          <Text
            variant="caption"
            tone={issue.severity === 'error' ? 'error' : 'warning'}
            weight="semibold"
          >
            {issue.message}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}
