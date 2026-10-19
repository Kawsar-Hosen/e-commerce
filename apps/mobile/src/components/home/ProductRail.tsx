import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import type { Product } from '@shobdox/shared-types';
import { resolveAppHref } from '../../lib/links';
import { formatBanglaCount } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { ProductCard, SectionHeader } from '../ui';

/**
 * Horizontal product rail.
 *
 * Used for every home section and for the "আরও দেখুন" rails on the product page.
 * The tile width is derived from the window so a 320dp phone shows a peeking
 * second card while a tablet shows most of five.
 */

export interface ProductRailProps {
  title: string;
  subtitle?: string;
  products: Product[];
  /** Fixture/web href for the "সব দেখুন" action. */
  href?: string;
  /** Custom action, e.g. a native route the fixture does not cover. */
  onSeeAll?: () => void;
  /** Rendered next to the heading, e.g. the flash-sale countdown. */
  trailing?: ReactNode;
  compact?: boolean;
}

export function ProductRail({
  title,
  subtitle,
  products,
  href,
  onSeeAll,
  trailing,
  compact = false,
}: ProductRailProps) {
  const theme = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const tileWidth = width >= 768 ? 208 : Math.min(172, Math.round(width * 0.44));

  const seeAll = useCallback(() => {
    if (onSeeAll) {
      onSeeAll();
      return;
    }
    if (!href) return;
    const { pathname, params } = resolveAppHref(href);
    router.push({ pathname, params });
  }, [href, onSeeAll, router]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard product={item} variant="rail" width={tileWidth} />
    ),
    [tileWidth],
  );

  if (products.length === 0) return null;

  return (
    <View style={{ gap: theme.space[2] }}>
      <View style={{ paddingHorizontal: theme.space[4] }}>
        <SectionHeader
          title={title}
          subtitle={subtitle}
          compact={compact}
          trailing={trailing}
          onAction={href || onSeeAll ? seeAll : undefined}
          actionLabel="সব দেখুন"
        />
      </View>

      <FlatList
        horizontal
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.space[4], gap: theme.space[3] }}
        accessibilityLabel={`${title}, ${formatBanglaCount(products.length)} পণ্য`}
        // Horizontal lists inside a vertical scroll view are cheap here: the
        // rails hold at most ten tiles each.
        initialNumToRender={4}
        windowSize={3}
        removeClippedSubviews={false}
      />
    </View>
  );
}
