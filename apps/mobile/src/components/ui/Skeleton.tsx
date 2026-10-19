import { useEffect } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useTheme } from '../../hooks/useTheme';

/**
 * Loading placeholder.
 *
 * The shimmer is a Reanimated loop; when the OS asks for reduced motion the
 * block simply holds a static tone instead.
 */

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 14, radius, style }: SkeletonProps) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 0.5;
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: 1_100, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + progress.value * 0.55,
  }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: radius ?? theme.radius.md,
          backgroundColor: theme.colors.skeleton,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** A product card's worth of skeletons, used by the grids while data loads. */
export function ProductSkeleton({ height = 220 }: { height?: number }) {
  const theme = useTheme();

  return (
    <Animated.View
      style={{
        gap: theme.space[3],
        padding: theme.space[3],
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.componentRadius.card,
        backgroundColor: theme.colors.surface,
      }}
    >
      <Skeleton height={height * 0.55} radius={theme.radius.md} />
      <Skeleton height={14} width="80%" />
      <Skeleton height={14} width="50%" />
      <Skeleton height={20} width="40%" />
    </Animated.View>
  );
}
