import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Banner } from '@shobdox/shared-types';
import { resolveAppHrefTarget } from '../../lib/links';
import { useTheme } from '../../hooks/useTheme';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { AppImage, Button, Text } from '../ui';

/**
 * Hero carousel.
 *
 * The banner artwork is optional; when no image is available the slide renders
 * as a token-tinted panel, so the carousel never depends on the network. Paging
 * uses a plain `ScrollView` — no extra dependency, and it announces the current
 * slide after every snap.
 */

export interface HeroCarouselProps {
  banners: Banner[];
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const theme = useTheme();
  const router = useRouter();
  const reduceMotion = useReduceMotion();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [index, setIndex] = useState(0);

  const slideWidth = Math.min(width, 720) - theme.space[4] * 2;
  // Pulled out of the theme so the auto-advance effect has a stable dependency.
  const slideGap = theme.space[3];

  useEffect(() => {
    if (reduceMotion || banners.length < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * (slideWidth + slideGap), animated: true });
        return next;
      });
    }, 6_000);
    return () => clearInterval(timer);
  }, [banners.length, reduceMotion, slideWidth, slideGap]);

  if (banners.length === 0) return null;

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const step = slideWidth + theme.space[3];
    setIndex(Math.round(event.nativeEvent.contentOffset.x / step));
  };

  return (
    <View style={{ gap: theme.space[3] }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={slideWidth + theme.space[3]}
        snapToAlignment="start"
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={{ paddingHorizontal: theme.space[4], gap: theme.space[3] }}
      >
        {banners.map((banner) => (
          <View
            key={banner.id}
            accessible
            accessibilityLabel={`${banner.title}. ${banner.subtitle}`}
            style={[
              styles.slide,
              {
                width: slideWidth,
                borderRadius: theme.componentRadius.card,
                backgroundColor:
                  banner.theme === 'primary'
                    ? theme.colors.primary
                    : banner.theme === 'accent'
                      ? theme.colors.accent
                      : banner.theme === 'dark'
                        ? theme.colors.text
                        : theme.colors.primarySoft,
                overflow: 'hidden',
              },
            ]}
          >
            {banner.image ? (
              <AppImage uri={banner.image} style={styles.art} accessibilityLabel={banner.title} />
            ) : null}

            <View style={{ padding: theme.space[4], gap: theme.space[2] }}>
              <Text
                variant="title"
                style={{
                  color:
                    banner.theme === 'soft' ? theme.colors.primary : theme.colors.onPrimary,
                }}
              >
                {banner.title}
              </Text>
              <Text
                variant="caption"
                style={{
                  color:
                    banner.theme === 'soft' ? theme.colors.textSecondary : theme.colors.onPrimary,
                }}
                numberOfLines={3}
              >
                {banner.subtitle}
              </Text>
              <Button
                label={banner.ctaLabel}
                variant={banner.theme === 'soft' ? 'primary' : 'secondary'}
                onPress={() => {
                  router.push(resolveAppHrefTarget(banner.href));
                }}
                accessibilityLabel={`${banner.ctaLabel} — ${banner.title}`}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.dots, { gap: theme.space[1] }]}>
        {banners.map((banner, dotIndex) => (
          <Pressable
            key={banner.id}
            accessibilityRole="button"
            accessibilityLabel={`ব্যানার ${dotIndex + 1} দেখুন`}
            accessibilityState={{ selected: dotIndex === index }}
            hitSlop={6}
            onPress={() => {
              setIndex(dotIndex);
              scrollRef.current?.scrollTo({
                x: dotIndex * (slideWidth + theme.space[3]),
                animated: !reduceMotion,
              });
            }}
            style={{
              width: dotIndex === index ? 18 : 6,
              height: 6,
              borderRadius: theme.radius.full,
              backgroundColor: dotIndex === index ? theme.colors.primary : theme.colors.borderStrong,
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flexDirection: 'column',
  },
  art: {
    width: '100%',
    height: 132,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
