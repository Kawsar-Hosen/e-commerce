import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CircleAlert, CircleCheckBig, Info, TriangleAlert, X } from 'lucide-react-native';
import { resolveAppHrefTarget } from '../../lib/links';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useTheme } from '../../hooks/useTheme';
import { useUiStore, type ToastMessage } from '../../store/ui.store';
import { Text } from './Text';

/**
 * Toast host — mounted once at the root, above the navigation stack.
 *
 * Messages come from the UI store, auto-dismiss after their duration and offer a
 * real action (usually a navigation) when one is attached.
 */

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const toasts = useUiStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { top: insets.top + 8, zIndex: 90 }]}
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

function ToastCard({ toast }: { toast: ToastMessage }) {
  const theme = useTheme();
  const router = useRouter();
  const reduceMotion = useReduceMotion();
  const dismissToast = useUiStore((state) => state.dismissToast);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: reduceMotion ? 0 : theme.duration.base });
    if (toast.duration <= 0) return undefined;
    const timer = setTimeout(() => dismissToast(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, toast.id, dismissToast, progress, reduceMotion, theme.duration.base]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (progress.value - 1) * 16 }],
  }));

  const tone = {
    success: { icon: <CircleCheckBig size={18} color={theme.colors.success} />, accent: theme.colors.success },
    error: { icon: <CircleAlert size={18} color={theme.colors.error} />, accent: theme.colors.error },
    warning: { icon: <TriangleAlert size={18} color={theme.colors.warning} />, accent: theme.colors.warning },
    info: { icon: <Info size={18} color={theme.colors.info} />, accent: theme.colors.info },
  }[toast.tone];

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.card,
        animatedStyle,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.componentRadius.card,
          ...theme.shadow.md,
        },
      ]}
    >
      <View style={{ paddingTop: 2 }}>{tone.icon}</View>

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="label" style={{ color: tone.accent }}>
          {toast.title}
        </Text>
        {toast.description ? (
          <Text variant="caption" tone="secondary" numberOfLines={3}>
            {toast.description}
          </Text>
        ) : null}

        {toast.actionHref && toast.actionLabel ? (
          <Pressable
            onPress={() => {
              dismissToast(toast.id);
              router.push(resolveAppHrefTarget(toast.actionHref ?? '/(tabs)'));
            }}
            accessibilityRole="button"
            accessibilityLabel={toast.actionLabel}
            hitSlop={6}
            style={{ paddingVertical: 6 }}
          >
            <Text variant="label" tone="primary">
              {toast.actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={() => dismissToast(toast.id)}
        accessibilityRole="button"
        accessibilityLabel="নোটিশ বন্ধ করুন"
        hitSlop={8}
        style={styles.close}
      >
        <X size={16} color={theme.colors.textSecondary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 12,
    right: 12,
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderWidth: 1,
  },
  close: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
