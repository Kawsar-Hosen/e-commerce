import { View } from 'react-native';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { discountPercentOf } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

/**
 * Price block: selling price, struck-through compare-at and the discount flag.
 * Prices always render in Western digits with the `৳` glyph (`formatTaka`).
 */

export interface PriceProps {
  price: number;
  compareAtPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  /** `৳ 1,299 – ৳ 1,599` style range label from shared pricing helpers. */
  rangeLabel?: string;
  showDiscount?: boolean;
}

export function Price({ price, compareAtPrice, size = 'md', rangeLabel, showDiscount = true }: PriceProps) {
  const theme = useTheme();
  const percent = discountPercentOf(price, compareAtPrice);

  return (
    <View style={{ gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Text variant={size === 'lg' ? 'priceLarge' : 'price'} style={{ color: theme.colors.text }}>
          {rangeLabel ?? formatTaka(price)}
        </Text>

        {showDiscount && percent > 0 ? (
          <Text
            variant="caption"
            weight="bold"
            style={{
              color: theme.colors.onAccent,
              backgroundColor: theme.colors.accent,
              borderRadius: theme.radius.xs,
              paddingHorizontal: 4,
              paddingVertical: 1,
            }}
          >
            {`-${toBanglaDigits(percent)}%`}
          </Text>
        ) : null}
      </View>

      {compareAtPrice && compareAtPrice > price ? (
        <Text
          variant="caption"
          tone="muted"
          style={{ textDecorationLine: 'line-through' }}
          accessibilityLabel={`আগের দাম ${formatTaka(compareAtPrice)}`}
        >
          {formatTaka(compareAtPrice)}
        </Text>
      ) : null}
    </View>
  );
}
