import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Search, Store, Tag } from 'lucide-react-native';
import type { Category } from '@shobdox/shared-types';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { accentTint, categoryIcon } from '../../src/lib/icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useCategories, useProducts } from '../../src/hooks/useProducts';
import {
  categoriesWithCounts,
  childCategories,
  topLevelCategories,
} from '../../src/services/catalog.service';
import {
  Card,
  Chip,
  EmptyState,
  Screen,
  ScreenHeader,
  Text,
} from '../../src/components/ui';

/**
 * Category browser.
 *
 * Every top-level category opens a card with its children as chips, so the
 * shopper can jump straight to "পুরুষদের পোশাক" without a mega-menu.
 */

export default function CategoriesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const products = useProducts();
  const categories = useCategories();

  const withCounts = useMemo(
    () => categoriesWithCounts(categories, products),
    [categories, products],
  );
  const topLevel = useMemo(() => topLevelCategories(withCounts), [withCounts]);

  const renderCategory = useCallback(
    ({ item }: { item: Category }) => {
      const children = childCategories(item.id, withCounts);
      const Icon = categoryIcon(item.icon);
      const tint = accentTint(item.accent, theme);

      return (
        <Card style={{ gap: theme.space[3] }}>
          <Pressable
            onPress={() => router.push(`/categories/${item.slug}`)}
            accessibilityRole="button"
            accessibilityLabel={`${item.nameBn}, ${toBanglaDigits(item.productCount)}টি পণ্য`}
            android_ripple={{ color: theme.colors.overlay }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.space[3],
              minHeight: theme.layout.minTouchTarget,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.radius.full,
                backgroundColor: tint.background,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={24} color={tint.foreground} />
            </View>

            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="subtitle" numberOfLines={1}>
                {item.nameBn}
              </Text>
              <Text variant="caption" tone="secondary" numberOfLines={2}>
                {item.description}
              </Text>
              <Text variant="caption" tone="muted">
                {`${toBanglaDigits(item.productCount)}টি পণ্য`}
              </Text>
            </View>

            <ChevronRight size={20} color={theme.colors.textMuted} />
          </Pressable>

          {children.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
              {children.map((child) => (
                <Chip
                  key={child.id}
                  size="sm"
                  label={child.nameBn}
                  count={toBanglaDigits(child.productCount)}
                  onPress={() => router.push(`/categories/${child.slug}`)}
                  accessibilityLabel={`${child.nameBn}, ${toBanglaDigits(child.productCount)}টি পণ্য`}
                />
              ))}
            </View>
          ) : null}
        </Card>
      );
    },
    [router, theme, withCounts],
  );

  return (
    <Screen background="surface">
      <ScreenHeader
        title="ক্যাটাগরি"
        subtitle={`${toBanglaDigits(topLevel.length)}টি প্রধান ক্যাটাগরি`}
        right={
          <Pressable
            onPress={() => router.push('/search')}
            accessibilityRole="button"
            accessibilityLabel="পণ্য খুঁজুন"
            hitSlop={8}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Search size={20} color={theme.colors.text} />
          </Pressable>
        }
      />

      <FlatList
        data={topLevel}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={{
          padding: theme.space[4],
          gap: theme.space[4],
          paddingBottom: theme.space[8],
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', gap: theme.space[3] }}>
            <Card style={{ flex: 1, gap: 6 }}>
              <Tag size={20} color={theme.colors.primary} />
              <Text variant="label">সব পণ্য</Text>
              <Text variant="caption" tone="secondary">
                ফিল্টার ও সর্টিংসহ পুরো ক্যাটালগ
              </Text>
              <Chip
                size="sm"
                label="দেখুন"
                onPress={() => router.push('/search')}
                accessibilityLabel="সব পণ্য দেখুন"
              />
            </Card>

            <Card style={{ flex: 1, gap: 6 }}>
              <Store size={20} color={theme.colors.primary} />
              <Text variant="label">ব্র্যান্ড</Text>
              <Text variant="caption" tone="secondary">
                ব্র্যান্ড অনুযায়ী পণ্য দেখুন
              </Text>
              <Chip
                size="sm"
                label="তালিকা"
                onPress={() => router.push('/brands')}
                accessibilityLabel="ব্র্যান্ডের তালিকা দেখুন"
              />
            </Card>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="কোনো ক্যাটাগরি নেই"
            description="ডেমো ডেটা রিসেট করলে ক্যাটাগরিগুলো ফিরে আসবে।"
            actionLabel="ডেমো ডেটা রিসেট"
            onAction={() => router.push('/(tabs)/account')}
          />
        }
      />
    </Screen>
  );
}
