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
import { ImageOff } from 'lucide-react-native';
import type { Product } from '@shobdox/shared-types';
import { useTheme } from '../../hooks/useTheme';
import { AppImage, Text } from '../ui';

/**
 * Product gallery.
 *
 * Swipes through the product photos plus the resolved variant's own image. When
 * a photo cannot load, `AppImage` swaps in the token placeholder — the gallery
 * therefore works offline, which the demo needs.
 */

export interface ProductGalleryProps {
  product: Product;
  /** Variant image, shown first when present. */
  variantImage?: string;
}

export function ProductGallery({ product, variantImage }: ProductGalleryProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [index, setIndex] = useState(0);

  const photos = [variantImage, product.thumbnail, ...product.images.map((image) => image.url)]
    .filter((uri): uri is string => Boolean(uri))
    .filter((uri, position, all) => all.indexOf(uri) === position);

  const slideWidth = Math.min(width, 720);

  // A new variant may bring its own photo; go back to the first slide.
  useEffect(() => setIndex(0), [variantImage]);

  if (photos.length === 0) {
    return (
      <View
        style={{
          height: slideWidth * 0.8,
          backgroundColor: theme.colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.space[2],
        }}
      >
        <ImageOff size={28} color={theme.colors.textMuted} />
        <Text variant="caption" tone="muted">
          ছবি নেই
        </Text>
      </View>
    );
  }

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / slideWidth));
  };

  return (
    <View style={{ gap: theme.space[3] }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        accessibilityLabel={`${product.titleBn ?? product.title} — ছবি গ্যালারি`}
      >
        {photos.map((uri, position) => (
          <AppImage
            key={`${uri}-${position}`}
            uri={uri}
            fallbackLabel={product.titleBn ?? product.title}
            style={{ width: slideWidth, height: slideWidth * 0.8, backgroundColor: theme.colors.surfaceMuted }}
            contentFit="contain"
            priority={position === 0 ? 'high' : 'normal'}
            accessibilityLabel={`ছবি ${position + 1} / ${photos.length}`}
          />
        ))}
      </ScrollView>

      {photos.length > 1 ? (
        <View style={[styles.dots, { gap: theme.space[1] }]}>
          {photos.map((uri, position) => (
            <Pressable
              key={`${uri}-dot-${position}`}
              accessibilityRole="button"
              accessibilityLabel={`ছবি ${position + 1} দেখান`}
              accessibilityState={{ selected: position === index }}
              hitSlop={6}
              onPress={() => {
                setIndex(position);
                scrollRef.current?.scrollTo({ x: position * slideWidth, animated: true });
              }}
              style={{
                width: position === index ? 18 : 6,
                height: 6,
                borderRadius: theme.radius.full,
                backgroundColor:
                  position === index ? theme.colors.primary : theme.colors.borderStrong,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
