import { useCallback, useMemo } from 'react';
import { Alert, FlatList, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Search, ShoppingBag, Trash } from 'lucide-react-native';
import type { Product } from '@shobdox/shared-types';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { productPriceRange } from '@shobdox/shared-business-logic';
import { useTheme } from '../../src/hooks/useTheme';
import { useProducts } from '../../src/hooks/useProducts';
import { useWishlistStore } from '../../src/store/wishlist.store';
import { toast, useUiStore } from '../../src/store/ui.store';
import { addProductsToCart } from '../../src/services/cart.service';
import { Button, EmptyState, ProductCard, Screen, ScreenHeader, Text } from '../../src/components/ui';

/**
 * Wishlist.
 *
 * Saved ids are re-read from the live catalogue, so prices and availability are
 * never stale. The footer action adds every directly-addable product in one go.
 */

export default function WishlistScreen() {
  const theme = useTheme();
  const router = useRouter();

  const products = useProducts();
  const productIds = useWishlistStore((state) => state.productIds);
  const clearWishlist = useWishlistStore((state) => state.clear);
  const clearToasts = useUiStore((state) => state.clearToasts);

  const saved = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    return productIds
      .map((id) => byId.get(id))
      .filter((product): product is Product => Boolean(product));
  }, [productIds, products]);

  const totalValue = useMemo(
    () => saved.reduce((total, product) => total + productPriceRange(product).min, 0),
    [saved],
  );

  const addAll = useCallback(() => {
    clearToasts();
    const result = addProductsToCart(saved);

    if (result.added === 0) {
      toast({
        tone: 'warning',
        title: 'এখনো যোগ করা যায়নি',
        description: 'সব পণ্যের জন্য ভ্যারিয়েন্ট নির্বাচন করা দরকার — বিস্তারিত পাতায় যান।',
      });
      return;
    }

    toast({
      tone: 'success',
      title: `${toBanglaDigits(result.added)}টি পণ্য কার্টে যোগ হয়েছে`,
      description:
        result.skipped > 0
          ? `${toBanglaDigits(result.skipped)}টি পণ্যে ভ্যারিয়েন্ট নির্বাচন করতে হবে।`
          : result.addedTitles.slice(0, 2).join(', '),
      actionLabel: 'কার্ট দেখুন',
      actionHref: '/cart',
    });
  }, [clearToasts, saved]);

  const confirmClear = useCallback(() => {
    Alert.alert(
      'উইশলিস্ট খালি করবেন?',
      'উইশলিস্ট থেকে সব পণ্য সরানো হবে। এটি ডেমো ডেটা — পরে আবার যোগ করা যাবে।',
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'সব সরান',
          style: 'destructive',
          onPress: () => {
            clearWishlist();
            toast({ tone: 'info', title: 'উইশলিস্ট খালি করা হয়েছে' });
          },
        },
      ],
    );
  }, [clearWishlist]);

  return (
    <Screen background="surface">
      <ScreenHeader
        title="উইশলিস্ট"
        subtitle={
          saved.length > 0
            ? `${toBanglaDigits(saved.length)}টি পণ্য · ${formatTaka(totalValue)}`
            : 'এখনো কিছু সংরক্ষণ করা হয়নি'
        }
        right={
          saved.length > 0 ? (
            <Pressable
              onPress={confirmClear}
              accessibilityRole="button"
              accessibilityLabel="উইশলিস্ট খালি করুন"
              hitSlop={8}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Trash size={20} color={theme.colors.error} />
            </Pressable>
          ) : null
        }
      />

      <FlatList
        data={saved}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: theme.space[3] }}>
            <ProductCard product={item} variant="list" />
          </View>
        )}
        contentContainerStyle={{
          padding: theme.space[4],
          paddingBottom: theme.space[8],
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Heart size={28} color={theme.colors.primary} />}
            title="উইশলিস্ট খালি"
            description="পণ্যের হৃদয় আইকনে চাপ দিলে সেটি এখানে জমা থাকবে।"
            actionLabel="পণ্য খুঁজুন"
            onAction={() => router.push('/search')}
          >
            <Button
              variant="ghost"
              label="হোমে ফিরুন"
              icon={<Search size={16} color={theme.colors.primary} />}
              onPress={() => router.push('/(tabs)')}
            />
          </EmptyState>
        }
        ListFooterComponent={
          saved.length > 0 ? (
            <View style={{ gap: theme.space[3], marginTop: theme.space[2] }}>
              <Button
                fullWidth
                size="lg"
                label="সব কার্টে যোগ করুন"
                icon={<ShoppingBag size={18} color={theme.colors.onPrimary} />}
                accessibilityLabel="উইশলিস্টের সব যোগযোগ্য পণ্য কার্টে যোগ করুন"
                onPress={addAll}
              />
              <Text variant="caption" tone="muted" align="center">
                অপশনসহ পণ্য সরাসরি যোগ হয় না — বিস্তারিত পাতায় ভ্যারিয়েন্ট বেছে নিন।
              </Text>
            </View>
          ) : undefined
        }
      />
    </Screen>
  );
}
