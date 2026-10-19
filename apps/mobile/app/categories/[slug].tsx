import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { LayoutGrid } from 'lucide-react-native';
import { EMPTY_PRODUCT_FILTERS } from '@shobdox/shared-types';
import { runProductQuery } from '@shobdox/shared-business-logic';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { DEFAULT_PAGE_SIZE } from '../../src/lib/constants';
import { accentTint, categoryIcon } from '../../src/lib/icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useBrands, useCategories, useProducts } from '../../src/hooks/useProducts';
import {
  categoriesWithCounts,
  categoryIdsForSlug,
  childCategories,
  findCategoryById,
  findCategoryBySlug,
} from '../../src/services/catalog.service';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  ProductGrid,
  Screen,
  SectionHeader,
  Text,
} from '../../src/components/ui';

/**
 * Category landing.
 *
 * Shows the category header, its children as chips and the first page of its
 * products (children included). "সব পণ্য দেখুন" hands the shopper to the full
 * search screen with the category filter applied, so sorting and faceting keep
 * working exactly as they do everywhere else.
 */

export default function CategoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const products = useProducts();
  const categories = useCategories();
  const brands = useBrands();

  const withCounts = useMemo(
    () => categoriesWithCounts(categories, products),
    [categories, products],
  );

  const category = useMemo(
    () => (slug ? findCategoryBySlug(slug, withCounts) : undefined),
    [slug, withCounts],
  );

  const children = useMemo(
    () => (category ? childCategories(category.id, withCounts) : []),
    [category, withCounts],
  );

  const parent = useMemo(
    () => (category?.parentId ? findCategoryById(category.parentId, withCounts) : undefined),
    [category, withCounts],
  );

  const result = useMemo(() => {
    if (!category) return undefined;
    const ids = categoryIdsForSlug(category.slug, categories);
    return runProductQuery(
      products,
      { ...EMPTY_PRODUCT_FILTERS, categoryIds: ids },
      { categories, brands },
      1,
      DEFAULT_PAGE_SIZE,
    );
  }, [brands, categories, category, products]);

  if (!category || !result) {
    return (
      <Screen>
        <ErrorState
          title="ক্যাটাগরিটি পাওয়া যায়নি"
          description="লিংকটি পুরনো হতে পারে, অথবা ডেমো ডেটা রিসেটে ক্যাটাগরিটি মুছে গেছে।"
          actionLabel="ক্যাটাগরিতে ফিরুন"
          onRetry={() => router.replace('/(tabs)/categories')}
        />
      </Screen>
    );
  }

  const Icon = categoryIcon(category.icon);
  const tint = accentTint(category.accent, theme);
  const openSearch = () =>
    router.push({ pathname: '/search', params: { category: category.slug } });

  return (
    <Screen>
      <ProductGrid
        products={result.items}
        ListHeaderComponent={
          <View style={{ gap: theme.space[4], paddingBottom: theme.space[3] }}>
            <Card style={{ gap: theme.space[3] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: theme.radius.full,
                    backgroundColor: tint.background,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={26} color={tint.foreground} />
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="heading" numberOfLines={2}>
                    {category.nameBn}
                  </Text>
                  <Text variant="caption" tone="secondary" numberOfLines={3}>
                    {category.description}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.space[2],
                  flexWrap: 'wrap',
                }}
              >
                <Badge
                  label={`${toBanglaDigits(category.productCount)}টি পণ্য`}
                  tone={category.productCount > 0 ? 'success' : 'neutral'}
                />
                {parent ? (
                  <Chip
                    size="sm"
                    label={`উপরে: ${parent.nameBn}`}
                    onPress={() => router.push(`/categories/${parent.slug}`)}
                    accessibilityLabel={`${parent.nameBn} ক্যাটাগরিতে যান`}
                  />
                ) : null}
              </View>

              {children.length > 0 ? (
                <View style={{ gap: theme.space[2] }}>
                  <Text variant="label">উপ-ক্যাটাগরি</Text>
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
                </View>
              ) : null}

              <Button
                variant="outline"
                fullWidth
                label="ফিল্টার ও সর্টিংসহ দেখুন"
                icon={<LayoutGrid size={16} color={theme.colors.primary} />}
                accessibilityLabel="সব পণ্য ফিল্টার ও সর্টিংসহ দেখুন"
                onPress={openSearch}
              />
            </Card>

            <SectionHeader
              title="পণ্য"
              subtitle={`${toBanglaDigits(result.total)}টি পণ্য এই ক্যাটাগরিতে`}
              actionLabel="সব দেখুন"
              onAction={openSearch}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={<LayoutGrid size={28} color={theme.colors.primary} />}
            title="এই ক্যাটাগরিতে পণ্য নেই"
            description="অন্য ক্যাটাগরি দেখুন বা পুরো ক্যাটালগে ফিরে যান।"
            actionLabel="সব পণ্য দেখুন"
            onAction={() => router.push('/search')}
          />
        }
      />
    </Screen>
  );
}
