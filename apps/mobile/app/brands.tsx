import { useCallback, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Store } from 'lucide-react-native';
import type { Brand } from '@shobdox/shared-types';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { useBrands, useProducts } from '../src/hooks/useProducts';
import { brandsWithCounts } from '../src/services/catalog.service';
import { useTheme } from '../src/hooks/useTheme';
import { Badge, Card, Chip, EmptyState, Input, Screen, Text } from '../src/components/ui';

/**
 * Brand directory.
 *
 * Counts come from the live catalogue, so a brand that has no active products
 * says so instead of linking to an empty listing. The text field filters the
 * already-loaded list — no network, no debounce needed.
 */

export default function BrandsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const brands = useBrands();
  const products = useProducts();

  const [term, setTerm] = useState('');

  const withCounts = useMemo(
    () =>
      [...brandsWithCounts(brands, products)].sort(
        (a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name),
      ),
    [brands, products],
  );

  const visible = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return withCounts;
    return withCounts.filter((brand) =>
      [brand.name, brand.nameBn ?? '', brand.wordmark, brand.origin]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [term, withCounts]);

  const openBrand = useCallback(
    (brand: Brand) => {
      router.push({ pathname: '/search', params: { brand: brand.slug } });
    },
    [router],
  );

  const renderBrand = useCallback(
    ({ item }: { item: Brand }) => (
      <Card style={{ gap: theme.space[3] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: theme.componentRadius.card,
              backgroundColor: theme.colors.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 4,
            }}
          >
            <Text variant="label" tone="primary" numberOfLines={1}>
              {item.wordmark}
            </Text>
          </View>

          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="subtitle" numberOfLines={1}>
              {item.nameBn ?? item.name}
            </Text>
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {item.origin}
            </Text>
          </View>

          {item.isFeatured ? <Badge label="ফিচার্ড" tone="accent" /> : null}
        </View>

        <Text variant="caption" tone="secondary" numberOfLines={2}>
          {item.description}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.space[2],
          }}
        >
          <Text variant="caption" tone={item.productCount > 0 ? 'secondary' : 'muted'}>
            {item.productCount > 0
              ? `${toBanglaDigits(item.productCount)}টি পণ্য`
              : 'এই ডেমোতে পণ্য নেই'}
          </Text>

          <Chip
            size="sm"
            label="পণ্য দেখুন"
            disabled={item.productCount === 0}
            onPress={() => openBrand(item)}
            accessibilityLabel={`${item.nameBn ?? item.name} এর পণ্য দেখুন`}
          />
        </View>
      </Card>
    ),
    [openBrand, theme],
  );

  return (
    <Screen>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={renderBrand}
        contentContainerStyle={{
          padding: theme.space[4],
          gap: theme.space[3],
          paddingBottom: theme.space[8],
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: theme.space[3] }}>
            <Input
              value={term}
              onChangeText={setTerm}
              placeholder="ব্র্যান্ড খুঁজুন"
              autoCapitalize="none"
              accessibilityLabel="ব্র্যান্ড খুঁজুন"
              helperText={`${toBanglaDigits(visible.length)}টি ব্র্যান্ড`}
            />
            <Text variant="caption" tone="muted">
              ব্র্যান্ডে ট্যাপ করলে ফিল্টার করা পণ্য তালিকা খুলবে।
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Store size={28} color={theme.colors.primary} />}
            title="কোনো ব্র্যান্ড মেলেনি"
            description={term ? 'অন্য নাম দিয়ে খুঁজুন বা সার্চ মুছে ফেলুন।' : 'ডেমো ডেটা রিসেট করলে ব্র্যান্ডগুলো ফিরে আসবে।'}
            actionLabel={term ? 'সার্চ মুছুন' : 'অ্যাকাউন্টে যান'}
            onAction={() => (term ? setTerm('') : router.push('/(tabs)/account'))}
          />
        }
      />
    </Screen>
  );
}
