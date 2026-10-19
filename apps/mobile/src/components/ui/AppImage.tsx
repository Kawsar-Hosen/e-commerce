import { useEffect, useState } from 'react';
import { Image, type ImageContentFit, type ImageStyle } from 'expo-image';
import type { StyleProp } from 'react-native';
import { fallbackImage, IMAGE_PLACEHOLDER } from '../../lib/image';
import { useReduceMotion } from '../../hooks/useReduceMotion';

/**
 * `expo-image` wrapper with the demo's offline guarantee.
 *
 * Any load failure swaps the source for `placeholderImage()` — an inline SVG data
 * URI generated from the design tokens — so a blocked CDN still renders a
 * designed tile instead of a broken box.
 */

export interface AppImageProps {
  uri?: string;
  /** Label drawn inside the placeholder when the photo cannot load. */
  fallbackLabel?: string;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  /** Set on list rows so recycled cells never flash the previous photo. */
  recyclingKey?: string;
  accessibilityLabel?: string;
  priority?: 'low' | 'normal' | 'high';
}

export function AppImage({
  uri,
  fallbackLabel,
  style,
  contentFit = 'cover',
  recyclingKey,
  accessibilityLabel,
  priority = 'normal',
}: AppImageProps) {
  const reduceMotion = useReduceMotion();
  const [failed, setFailed] = useState(false);

  // A new URI deserves a fresh attempt even if the previous one failed.
  useEffect(() => setFailed(false), [uri]);

  const source = !uri || failed ? fallbackImage(fallbackLabel) : uri;

  return (
    <Image
      source={{ uri: source }}
      placeholder={failed ? { uri: IMAGE_PLACEHOLDER } : undefined}
      style={style}
      contentFit={contentFit}
      transition={reduceMotion ? 0 : 220}
      recyclingKey={recyclingKey ?? uri}
      priority={priority}
      onError={() => setFailed(true)}
      accessibilityLabel={accessibilityLabel}
      accessibilityIgnoresInvertColors
    />
  );
}
