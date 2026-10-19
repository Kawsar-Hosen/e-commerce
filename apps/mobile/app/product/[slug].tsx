import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, Share2, ShoppingBag, Zap } from 'lucide-react-native';
import { formatTaka, isInsideDhakaCity, toBanglaDigits } from '@shobdox/shared-utils';
import {
  cheapestVariant,
  defaultOptionSelection,
  findVariantByOptions,
  formatPriceRange,
  productPriceRange,
  priceWithOptionDeltas,
  STOCK_STATUS_LABELS,
  stockUrgencyCopy,
  variantCompareAtPrice,
} from '@shobdox/shared-business-logic';
import { useCart } from '../../src/hooks/useCart';
import { useProductBySlug, useProducts, useSellers } from '../../src/hooks/useProducts';
import { useTheme } from '../../src/hooks/useTheme';
import { useUiStore } from '../../src/store/ui.store';
import { useCartStore } from '../../src/store/cart.store';
import { useWishlistStore } from '../../src/store/wishlist.store';
import { toast } from '../../src/store/ui.store';
import { track } from '../../src/services/analytics.service';
import { railsForProduct } from '../../src/services/catalog.service';
import { ProductFacts } from '../../src/components/catalog/ProductFacts';
import { ProductGallery } from '../../src/components/catalog/ProductGallery';
import { OptionSelector } from '../../src/components/catalog/OptionSelector';
import { RatingBreakdown } from '../../src/components/catalog/RatingBreakdown';
import { ProductRail } from '../../src/components/home/ProductRail';
import {
  Badge,
  Button,
  Card,
  DemoPaymentNotice,
  ErrorState,
  Price,
  QuantityStepper,
  Rating,
  Screen,
  Text,
} from '../../src/components/ui';

/**
 * Product detail.
 *
 * One screen holds the gallery, the option matrix, live stock, the seller and
 * delivery promises, reviews and the related rails. Prices come from the shared
 * pricing helpers; stock availability per option value comes from
 * `availableValuesFor()` so a shopper can never build an unbuyable combination.
 */

export default function ProductScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const product = useProductBySlug(slug);
  const products = useProducts();
  const sellers = useSellers();
  const recentIds = useUiStore((state) => state.recentlyViewedIds);
  const markViewed = useUiStore((state) => state.markViewed);
  const savedInWishlist = useWishlistStore((state) =>
    product ? state.productIds.includes(product.id) : false,
  );
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const addItem = useCartStore((state) => state.addItem);
  const { address } = useCart();

  const [selection, setSelection] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // Reset the option matrix whenever a different product is opened.
  useEffect(() => {
    if (!product) return;
    setSelection(defaultOptionSelection(product));
    setQuantity(1);
    markViewed(product.id);
    track('product_view', { productId: product.id, slug: product.slug });
  }, [product, markViewed]);

  const variant = useMemo(
    () => (product ? findVariantByOptions(product, selection) : undefined),
    [product, selection],
  );

  const rails = useMemo(
    () => (product ? railsForProduct(product, products, recentIds) : undefined),
    [product, products, recentIds],
  );

  const onOptionChange = useCallback((optionId: string, valueId: string) => {
    setSelection((current) => ({ ...current, [optionId]: valueId }));
  }, []);

  if (!product) {
    return (
      <Screen>
        <ErrorState
          title="পণ্যটি পাওয়া যায়নি"
          description="লিংকটি পুরনো হতে পারে, অথবা ডেমো ডেটা রিসেট হয়েছে।"
          actionLabel="সব পণ্য দেখুন"
          onRetry={() => router.replace('/search')}
        />
      </Screen>
    );
  }

  const seller = sellers.find((candidate) => candidate.id === product.sellerId);
  const insideDhaka = isInsideDhakaCity(address.division, address.district);
  const priceRange = productPriceRange(product);
  const unitPrice = variant ? priceWithOptionDeltas(product, variant, selection) : priceRange.min;
  const compareAt = variant ? variantCompareAtPrice(product, variant) : product.compareAtPrice;
  const stock = variant ? variant.stock : product.stock;
  const stockLabel = STOCK_STATUS_LABELS[product.stockStatus];
  const urgency = stockUrgencyCopy(product);
  const cheapest = cheapestVariant(product);

  const addToCart = () => {
    if (!variant || variant.stock <= 0) {
      toast({ tone: 'error', title: 'স্টক নেই', description: 'অন্য ভ্যারিয়েন্ট বেছে নিন।' });
      return;
    }
    addItem(product, variant, quantity);
    track('add_to_cart', { productId: product.id, quantity });
  };

  const buyNow = () => {
    if (!variant || variant.stock <= 0) {
      toast({ tone: 'error', title: 'স্টক নেই', description: 'অন্য ভ্যারিয়েন্ট বেছে নিন।' });
      return;
    }
    addItem(product, variant, quantity);
    track('buy_now', { productId: product.id, quantity });
    router.push('/checkout');
  };

  const shareProduct = () => {
    void Share.share({
      message: `${product.titleBn ?? product.title} — ${formatTaka(unitPrice)} · SHOBDOX ডেমো অ্যাপ`,
    }).catch(() => toast({ tone: 'info', title: 'শেয়ার বাতিল হয়েছে' }));
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: product.titleBn ?? product.title }} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: theme.space[8] }}
        showsVerticalScrollIndicator={false}
      >
        <ProductGallery product={product} variantImage={variant?.image} />

        <View style={{ padding: theme.space[4], gap: theme.space[4] }}>
          <View style={{ gap: theme.space[2] }}>
            <Text variant="title">{product.titleBn ?? product.title}</Text>
            {product.titleBn ? (
              <Text variant="caption" tone="muted">
                {product.title}
              </Text>
            ) : null}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3], flexWrap: 'wrap' }}>
              <Rating value={product.rating} reviewCount={product.reviewCount} />
              <Badge label={stockLabel.bn} tone={product.stockStatus === 'in-stock' ? 'success' : 'warning'} />
              {product.isFlashSale ? <Badge label="ফ্ল্যাশ সেল" tone="error" /> : null}
            </View>

            <Price
              price={unitPrice}
              compareAtPrice={compareAt}
              size="lg"
              rangeLabel={variant ? undefined : formatPriceRange(priceRange, formatTaka)}
            />
            {cheapest && priceRange.isRange ? (
              <Text variant="caption" tone="muted">
                {`সবচেয়ে কম ${formatTaka(priceRange.min)} থেকে শুরু`}
              </Text>
            ) : null}
          </View>

          <Card style={{ gap: theme.space[3] }}>
            <OptionSelector product={product} selection={selection} onChange={onOptionChange} />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.space[3] }}>
              <QuantityStepper
                value={quantity}
                min={1}
                max={Math.max(1, Math.min(stock, 10))}
                disabled={stock <= 0}
                onChange={setQuantity}
                hint={stock > 0 ? `স্টকে ${toBanglaDigits(stock)}টি আছে` : 'স্টক শেষ'}
              />
              {urgency ? (
                <Text variant="caption" tone="warning" weight="semibold" numberOfLines={2} style={{ flex: 1 }}>
                  {urgency}
                </Text>
              ) : null}
            </View>
          </Card>

          <Text variant="body" tone="secondary">
            {product.descriptionBn ?? product.description}
          </Text>

          <ProductFacts product={product} seller={seller} insideDhaka={insideDhaka} />

          {product.specifications.length > 0 ? (
            <Card style={{ gap: theme.space[2] }}>
              <Text variant="subtitle">স্পেসিফিকেশন</Text>
              {product.specifications.map((spec) => (
                <View key={spec.label} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.space[3] }}>
                  <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
                    {spec.label}
                  </Text>
                  <Text variant="caption" style={{ flex: 1.4 }} numberOfLines={2}>
                    {spec.value}
                  </Text>
                </View>
              ))}
            </Card>
          ) : null}

          <RatingBreakdown
            rating={product.rating}
            reviewCount={product.reviewCount}
            reviews={product.reviews}
          />

          <DemoPaymentNotice />
        </View>

        {rails ? (
          <View style={{ gap: theme.space[6] }}>
            <ProductRail title="একই ধরনের পণ্য" products={rails.related} compact />
            <ProductRail title="একই ব্র্যান্ডের" products={rails.sameBrand} compact />
            <ProductRail title="একসাথে কিনলে ভালো" products={rails.bundle} compact />
            <ProductRail title="আপনি আগে দেখেছেন" products={rails.viewed} compact />
          </View>
        ) : null}
      </ScrollView>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: theme.space[3],
          gap: theme.space[2],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
          <Pressable
            onPress={() => toggleWishlist(product.id, product.titleBn ?? product.title)}
            accessibilityRole="button"
            accessibilityState={{ selected: savedInWishlist }}
            accessibilityLabel={
              savedInWishlist ? 'উইশলিস্ট থেকে সরান' : 'উইশলিস্টে যোগ করুন'
            }
            android_ripple={{ color: theme.colors.overlay, borderless: true }}
            style={{
              width: 44,
              height: 44,
              borderRadius: theme.radius.full,
              borderWidth: 1,
              borderColor: theme.colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart
              size={20}
              color={savedInWishlist ? theme.colors.error : theme.colors.textSecondary}
              fill={savedInWishlist ? theme.colors.error : 'transparent'}
            />
          </Pressable>

          <Pressable
            onPress={shareProduct}
            accessibilityRole="button"
            accessibilityLabel="পণ্যটি শেয়ার করুন"
            android_ripple={{ color: theme.colors.overlay, borderless: true }}
            style={{
              width: 44,
              height: 44,
              borderRadius: theme.radius.full,
              borderWidth: 1,
              borderColor: theme.colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Share2 size={20} color={theme.colors.textSecondary} />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Button
              fullWidth
              size="lg"
              variant="secondary"
              label="কার্টে যোগ করুন"
              icon={<ShoppingBag size={18} color={theme.colors.primary} />}
              disabled={stock <= 0}
              accessibilityLabel="কার্টে যোগ করুন"
              onPress={addToCart}
            />
          </View>
        </View>

        <Button
          fullWidth
          size="lg"
          label="এখনই কিনুন"
          icon={<Zap size={18} color={theme.colors.onPrimary} />}
          disabled={stock <= 0}
          accessibilityLabel="এখনই কিনুন, চেকআউটে যান"
          onPress={buyNow}
        />
      </View>
    </Screen>
  );
}
