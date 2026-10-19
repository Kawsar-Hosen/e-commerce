import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import type { ProductReview } from '@shobdox/shared-types';
import { percentOf } from '@shobdox/shared-utils';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { formatDate } from '../../lib/format';
import { useTheme } from '../../hooks/useTheme';
import { Avatar, Badge, Card, ProgressBar, Rating, Text } from '../ui';

/**
 * Ratings and reviews.
 *
 * The histogram is computed from the product's own review rows, so it always
 * matches what is listed underneath.
 */

export interface RatingBreakdownProps {
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
}

export function RatingBreakdown({ rating, reviewCount, reviews }: RatingBreakdownProps) {
  const theme = useTheme();

  const histogram = ([5, 4, 3, 2, 1] as const).map((stars) => {
    const count = reviews.filter((review) => review.rating === stars).length;
    return { stars, count, share: percentOf(count, Math.max(1, reviews.length)) };
  });

  return (
    <Card style={{ gap: theme.space[3] }}>
      <Text variant="subtitle">রেটিং ও রিভিউ</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[4] }}>
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text variant="display">{toBanglaDigits(rating.toFixed(1))}</Text>
          <Rating value={rating} showValue={false} />
          <Text variant="caption" tone="muted">
            {`${toBanglaDigits(reviewCount)}টি রিভিউ`}
          </Text>
        </View>

        <View style={{ flex: 1, gap: theme.space[1] }}>
          {histogram.map((bucket) => (
            <View key={bucket.stars} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, width: 34 }}>
                <Text variant="caption" tone="secondary">
                  {toBanglaDigits(bucket.stars)}
                </Text>
                <Star size={11} color={theme.colors.accent} fill={theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <ProgressBar
                  value={bucket.share}
                  height={6}
                  tone="accent"
                  accessibilityLabel={`${toBanglaDigits(bucket.stars)} স্টার, ${toBanglaDigits(bucket.count)}টি রিভিউ`}
                />
              </View>
              <Text variant="caption" tone="muted" style={{ width: 28, textAlign: 'right' }}>
                {toBanglaDigits(bucket.count)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {reviews.length === 0 ? (
        <Text variant="caption" tone="muted">
          এই পণ্যে এখনো বিস্তারিত রিভিউ নেই — শুধু সামগ্রিক রেটিং দেখানো হচ্ছে।
        </Text>
      ) : (
        <View style={{ gap: theme.space[3] }}>
          {reviews.slice(0, 3).map((review) => (
            <View key={review.id} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
                <Avatar name={review.authorName} uri={review.authorAvatar} size={32} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="label" numberOfLines={1}>
                    {review.authorName}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {formatDate(review.createdAt)}
                  </Text>
                </View>
                <Rating value={review.rating} showValue={false} />
              </View>

              {review.title ? (
                <Text variant="bodyStrong" numberOfLines={2}>
                  {review.title}
                </Text>
              ) : null}
              <Text variant="caption" tone="secondary" numberOfLines={4}>
                {review.body}
              </Text>

              {review.isVerifiedPurchase ? (
                <Badge label="ভেরিফায়েড ক্রেতা" tone="success" />
              ) : null}
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}
