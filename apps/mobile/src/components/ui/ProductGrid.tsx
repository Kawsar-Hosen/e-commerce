import type { ReactElement } from 'react';
import { useCallback } from 'react';
import { FlatList, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import type { Product } from '@shobdox/shared-types';
import { useTheme } from '../../hooks/useTheme';
import { ProductCard } from './ProductCard';

/**
 * Responsive product grid.
 *
 * Columns switch on the window width instead of a fixed pixel size, so the same
 * screen works from a 320dp phone up to a tablet. `key` changes with the column
 * count, which is what tells FlatList to rebuild its layout.
 */

export interface ProductGridProps {
  products: Product[];
  /** Header rendered inside the list so it scrolls with the content. */
  ListHeaderComponent?: ReactElement;
  ListFooterComponent?: ReactElement;
  ListEmptyComponent?: ReactElement;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Fixed column count for special layouts; otherwise derived from width. */
  columns?: number;
  testID?: string;
}

export function useGridColumns(): number {
  const { width } = useWindowDimensions();
  if (width >= 1_024) return 4;
  if (width >= 768) return 3;
  return 2;
}

export function ProductGrid({
  products,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  onEndReached,
  refreshing = false,
  onRefresh,
  contentContainerStyle,
  columns,
  testID,
}: ProductGridProps) {
  const theme = useTheme();
  const responsiveColumns = useGridColumns();
  const resolvedColumns = columns ?? responsiveColumns;

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={{ flex: 1 / resolvedColumns, padding: theme.space[1] }}>
        <ProductCard product={item} variant="grid" />
      </View>
    ),
    [resolvedColumns, theme.space],
  );

  return (
    <FlatList
      testID={testID}
      key={`grid-${resolvedColumns}`}
      data={products}
      numColumns={resolvedColumns}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      columnWrapperStyle={resolvedColumns > 1 ? { paddingHorizontal: theme.space[2] } : undefined}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      refreshing={refreshing}
      onRefresh={onRefresh}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[{ paddingBottom: theme.space[8] }, contentContainerStyle]}
      removeClippedSubviews={false}
    />
  );
}
