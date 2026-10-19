import { useCallback, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MOCK_ANNOUNCEMENTS } from '@shobdox/shared-mock-data';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { DEMO_DATA_NOTICE } from '../../src/lib/constants';
import { useTheme } from '../../src/hooks/useTheme';
import { useCategories, useProducts } from '../../src/hooks/useProducts';
import { useAuthStore } from '../../src/store/auth.store';
import { useDataStore } from '../../src/store/data.store';
import { useUiStore } from '../../src/store/ui.store';
import { useWishlistStore } from '../../src/store/wishlist.store';
import {
  buildHomeRails,
  categoriesWithCounts,
  recommendedForYou,
  topLevelCategories,
  type ProductRail as ProductRailData,
} from '../../src/services/catalog.service';
import { AnnouncementStrip } from '../../src/components/home/AnnouncementStrip';
import { BenefitStrip } from '../../src/components/home/BenefitStrip';
import { CategoryStrip } from '../../src/components/home/CategoryStrip';
import { HeroCarousel } from '../../src/components/home/HeroCarousel';
import { HomeHeader } from '../../src/components/home/HomeHeader';
import { ProductRail } from '../../src/components/home/ProductRail';
import {
  Countdown,
  DemoNotice,
  Screen,
  SectionHeader,
  Skeleton,
  earliestFlashSaleEnd,
} from '../../src/components/ui';

/**
 * Home.
 *
 * A single vertical list of rails, like the website's homepage: hero banners,
 * category shortcuts, the shopper's own recommendations, the flash sale with its
 * countdown, then the merchandised rails from `buildHomeRails()`.
 */

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  const products = useProducts();
  const categories = useCategories();
  const banners = useDataStore((state) => state.banners);
  const recentIds = useUiStore((state) => state.recentlyViewedIds);
  const wishlistIds = useWishlistStore((state) => state.productIds);
  const userName = useAuthStore((state) => state.session?.user.name);

  const chips = useMemo(
    () => topLevelCategories(categoriesWithCounts(categories, products)),
    [categories, products],
  );

  const heroBanners = useMemo(
    () =>
      banners
        .filter((banner) => banner.isActive && banner.placement === 'hero')
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [banners],
  );

  const rails = useMemo<ProductRailData[]>(() => {
    const built = buildHomeRails(products, categories);
    const forYou = recommendedForYou(products, recentIds, wishlistIds);

    if (forYou.length === 0) return built;

    return [
      {
        id: 'for-you',
        title: 'আপনার জন্য নির্বাচিত',
        subtitle:
          recentIds.length > 0 || wishlistIds.length > 0
            ? 'আপনার দেখা ও পছন্দের পণ্যের ভিত্তিতে'
            : 'সবচেয়ে জনপ্রিয় পণ্য দিয়ে শুরু করুন',
        href: '/search?sort=relevance',
        products: forYou,
        variant: 'default',
      },
      ...built,
    ];
  }, [categories, products, recentIds, wishlistIds]);

  const flashEnd = useMemo(
    () => earliestFlashSaleEnd(products.filter((p) => p.isFlashSale).map((p) => p.flashSaleEndsAt)),
    [products],
  );

  const renderRail = useCallback(
    ({ item }: { item: ProductRailData }) => (
      <View style={{ marginBottom: theme.space[6] }}>
        <ProductRail
          title={item.title}
          subtitle={item.subtitle}
          products={item.products}
          href={item.href}
          compact={item.variant === 'compact'}
          trailing={
            item.id === 'flash' ? <Countdown target={flashEnd} prefix="শেষ হবে" /> : undefined
          }
        />
      </View>
    ),
    [flashEnd, theme.space],
  );

  const header = useMemo(
    () => (
      <View style={{ gap: theme.space[6], marginBottom: theme.space[5] }}>
        <HomeHeader
          userName={userName}
          areaLabel={
            wishlistIds.length > 0
              ? `উইশলিস্টে ${toBanglaDigits(wishlistIds.length)}টি পণ্য`
              : 'সারা দেশে ডেলিভারি'
          }
        />

        <AnnouncementStrip announcements={MOCK_ANNOUNCEMENTS} />
        <HeroCarousel banners={heroBanners} />
        <CategoryStrip categories={chips} />

        <View style={{ paddingHorizontal: theme.space[4], gap: theme.space[3] }}>
          <SectionHeader
            title="আজকের অফার"
            subtitle="কুপন ও ছাড়ের জন্য কার্টে যোগ করুন"
            actionLabel="সব অফার"
            onAction={() => router.push('/search?sort=discount')}
          />
          <DemoNotice message={DEMO_DATA_NOTICE} />
        </View>

        <BenefitStrip />
      </View>
    ),
    [chips, heroBanners, router, theme.space, userName, wishlistIds.length],
  );

  return (
    <Screen includeTopInset>
      <FlatList
        data={rails}
        keyExtractor={(item) => item.id}
        renderItem={renderRail}
        ListHeaderComponent={header}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.space[8] }}
        removeClippedSubviews={false}
        ListEmptyComponent={
          <View style={{ padding: theme.space[4], gap: theme.space[3] }}>
            <Skeleton height={160} />
            <Skeleton height={90} />
            <Skeleton height={90} />
          </View>
        }
      />
    </Screen>
  );
}
