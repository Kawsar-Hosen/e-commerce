import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

/**
 * Star rating.
 *
 * Stars are Lucide `Star` icons; the filled/empty decision uses `Math.round` so
 * 4.6 reads as five stars, matching the website. The whole row is one
 * accessibility node with a Bangla description.
 */

export interface RatingProps {
  value: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
}

export function Rating({ value, reviewCount, size = 'sm', showValue = true }: RatingProps) {
  const theme = useTheme();
  const iconSize = size === 'sm' ? 14 : 18;
  const filled = Math.round(Math.max(0, Math.min(5, value)));

  const label = `${toBanglaDigits(value.toFixed(1))} রেটিং${
    reviewCount !== undefined ? `, ${toBanglaDigits(reviewCount)}টি রিভিউ` : ''
  }`;

  return (
    <View
      accessible
      accessibilityLabel={label}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={iconSize}
          color={star <= filled ? theme.colors.accent : theme.colors.borderStrong}
          fill={star <= filled ? theme.colors.accent : 'transparent'}
        />
      ))}
      {showValue ? (
        <Text variant="caption" tone="secondary" style={{ marginLeft: 4 }}>
          {toBanglaDigits(value.toFixed(1))}
          {reviewCount !== undefined ? ` (${toBanglaDigits(reviewCount)})` : ''}
        </Text>
      ) : null}
    </View>
  );
}
