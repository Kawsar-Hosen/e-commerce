import { memo } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Plus, ShoppingBag } from 'lucide-react-native';
import type { Product } from '@shobdox/shared-types';
import { PRODUCT_BADGE_LABELS } from '@shobdox/shared-types';
import {
  defaultOptionSelection,
  findVariantByOptions,
  formatPriceRange,
  productCompareAtPrice,
  productDiscountPercent,
  productPriceRange,
  STOCK_STATUS_LABELS,
} from '@shobdox/shared-business-logic';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { useCartStore } from '../../store/cart.store';
import { useWishlistStore } from '../../store/wishlist.store';
import { track } from '../../services/analytics.service';
import { AppImage } from './AppImage';
import { Badge } from './Badge';
import { Button } from './Button';
import { Price } from './Price';
import { Rating } from './Rating';
import { Text } from './Text';

/**
 * Product tile.
 *
 * Three layouts — `grid` for two-column listings, `list` for the wishlist and
 * `rail` for horizontal home rows. The quick-add button only adds when the
 * product has a single variant; products with options open the detail screen so
 * the shopper picks a real variant.
 */

export type ProductCardVariant = 'grid' | 'list' | 'rail';

export interface ProductCardProps {
  product: Product;
  variant?: ProductCardVariant;
  /** Fixed width for rail tiles; grids stretch to their column. */
  width?: number;
  onPress?: (product: Product) => void;
  style?: StyleProp<ViewStyle>;
}

function ProductCardComponent({ product, variant = 'grid', width, onPress, style }: ProductCardProps) {  const theme = useTheme();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const saved = useWishlistStore((state) => state.productIds.includes(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggle);

  const title = product.titleBn ?? product.title;
  const priceRange = productPriceRange(product);
  const compareAt = productCompareAtPrice(product);
  const discount = productDiscountPercent(product);
  const stockLabel = STOCK_STATUS_LABELS[product.stockStatus];
  const badge = product.badges[0];
  const isOutOfStock = product.stockStatus === 'out-of-stock';
  const isList = variant === 'list';

  const priceLabel = formatPriceRange(priceRange, formatTaka);
  const accessibilityLabel = `${title}, ${priceLabel}${
    discount > 0 ? `, ${toBanglaDigits(discount)}% ছাড়` : ''
  }, ${stockLabel.bn}`;

  const openDetail = () => {
    track('product_view', { productId: product.id, slug: product.slug });
    if (onPress) onPress(product);
    else router.push(`/product/${product.slug}`);
  };

  const quickAdd = () => {
    const variantMatch = findVariantByOptions(product, defaultOptionSelection(product));
    if (!variantMatch || variantMatch.stock <= 0) {
      openDetail();
      return;
    }
    // Products with options must be configured on the detail screen.
    if (product.options.length > 0) {
      openDetail();
      return;
    }
    addItem(product, variantMatch, 1);
    track('add_to_cart', { productId: product.id, source: 'card' });
  };

  const imageStyle = isList
    ? { width: 104, height: 104, borderRadius: theme.componentRadius.image }
    : { width: '100%' as const, aspectRatio: 1, borderRadius: theme.componentRadius.image };

  return (
    <Pressable
      onPress={openDetail}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: theme.colors.overlay }}
      style={[
        styles.card,
        {
          flexDirection: isList ? 'row' : 'column',
          gap: theme.space[3],
          padding: theme.space[3],
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.componentRadius.card,
        },
        width ? { width } : null,
        style,
      ]}
    >
      <View style={isList ? undefined : { width: '100%' }}>
        <AppImage
          uri={product.thumbnail}
          fallbackLabel={title}
          style={imageStyle}
          recyclingKey={product.id}
          accessibilityLabel={title}
        />
        {badge ? (
          <View style={styles.badge}>
            <Badge
              label={PRODUCT_BADGE_LABELS[badge]}
              tone={badge === 'flash-sale' ? 'error' : badge === 'new' ? 'info' : 'primary'}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text variant="label" numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          <Pressable
            onPress={() => toggleWishlist(product.id, title)}
            accessibilityRole="button"
            accessibilityLabel={saved ? `${title} — উইশলিস্ট থেকে সরান` : `${title} — উইশলিস্টে যোগ করুন`}
            accessibilityState={{ selected: saved }}
            hitSlop={10}
            style={styles.heart}
          >
            <Heart
              size={18}
              color={saved ? theme.colors.error : theme.colors.textMuted}
              fill={saved ? theme.colors.error : 'transparent'}
            />
          </Pressable>
        </View>

        {isList ? (
          <Text variant="caption" tone="secondary" numberOfLines={2}>
            {product.shortDescription}
          </Text>
        ) : null}

        <Rating value={product.rating} reviewCount={product.reviewCount} />

        <Price price={priceRange.min} compareAtPrice={compareAt} rangeLabel={priceRange.isRange ? priceLabel : undefined} />

        <View style={styles.footer}>
          <Text variant={isOutOfStock ? 'caption' : 'caption'} tone={isOutOfStock ? 'error' : 'success'}>
            {stockLabel.bn}
          </Text>

          <Button
            size="sm"
            variant={isOutOfStock ? 'outline' : 'secondary'}
            icon={
              isOutOfStock ? (
                <ShoppingBag size={16} color={theme.colors.primary} />
              ) : (
                <Plus size={16} color={theme.colors.primary} />
              )
            }
            label={isOutOfStock ? 'বিস্তারিত' : product.options.length > 0 ? 'নিন' : 'কার্টে'}
            accessibilityLabel={`${title} — ${isOutOfStock ? 'বিস্তারিত দেখুন' : 'কার্টে যোগ করুন'}`}
            onPress={quickAdd}
            style={{ minHeight: theme.layout.minTouchTarget - 4 }}
          />
        </View>
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  body: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
  },
  heart: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 'auto',
  },
});
