import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Category } from '@shobdox/shared-types';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { accentTint, categoryIcon } from '../../lib/icons';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../ui';

/**
 * Category shortcuts.
 *
 * A horizontal strip of the top-level categories. Counts come from the live
 * catalogue (`categoriesWithCounts`), so the numbers match the listings.
 */

export interface CategoryStripProps {
  categories: Category[];
}

const TILE_WIDTH = 84;

export function CategoryStrip({ categories }: CategoryStripProps) {
  const theme = useTheme();
  const router = useRouter();

  if (categories.length === 0) return null;

  return (
    <View style={{ gap: theme.space[3] }}>
      <Text variant="heading" style={{ paddingHorizontal: theme.space[4] }}>
        ক্যাটাগরি
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.space[4], gap: theme.space[3] }}
      >
        {categories.map((category) => {
          const Icon = categoryIcon(category.icon);
          const tint = accentTint(category.accent, theme);

          return (
            <Pressable
              key={category.id}
              onPress={() => router.push(`/categories/${category.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={`${category.nameBn}, ${toBanglaDigits(category.productCount)}টি পণ্য`}
              android_ripple={{ color: theme.colors.overlay, borderless: true }}
              style={[styles.tile, { width: TILE_WIDTH, gap: theme.space[2] }]}
            >
              <View
                style={[
                  styles.iconWell,
                  { backgroundColor: tint.background, borderRadius: theme.radius.full },
                ]}
              >
                <Icon size={26} color={tint.foreground} />
              </View>

              <Text variant="caption" align="center" numberOfLines={2} style={styles.label}>
                {category.nameBn}
              </Text>
              <Text variant="caption" tone="muted" align="center">
                {`${toBanglaDigits(category.productCount)}টি`}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
  },
  iconWell: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    minHeight: 32,
  },
});
