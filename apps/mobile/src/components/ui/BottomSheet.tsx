import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

/**
 * Slide-up sheet built on the native `Modal`.
 *
 * The drag handle is functional: dragging down more than ~120dp dismisses the
 * sheet, a short drag springs back. Motion is skipped entirely when the OS
 * "remove animations" setting is on.
 */

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Set when the content itself scrolls (long option lists, forms). */
  scrollable?: boolean;
  testID?: string;
}

const DISMISS_DISTANCE = 120;

export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  scrollable = true,
  testID,
}: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const { height } = useWindowDimensions();

  const progress = useSharedValue(0);
  const dragY = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);

  const duration = reduceMotion ? 0 : theme.duration.base;

  useEffect(() => {
    if (visible) setMounted(true);
    progress.value = withTiming(visible ? 1 : 0, {
      duration,
      easing: Easing.out(Easing.cubic),
    });

    if (visible) return undefined;

    dragY.value = 0;
    const timer = setTimeout(() => setMounted(false), duration + 20);
    return () => clearTimeout(timer);
  }, [visible, duration, progress, dragY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) => gesture.dy > 6,
        onPanResponderMove: (_event, gesture) => {
          dragY.value = Math.max(0, gesture.dy);
        },
        onPanResponderRelease: (_event, gesture) => {
          if (gesture.dy > DISMISS_DISTANCE) {
            dragY.value = 0;
            onClose();
            return;
          }
          dragY.value = withTiming(0, { duration: reduceMotion ? 0 : theme.duration.fast });
        },
      }),
    [dragY, onClose, reduceMotion, theme.duration.fast],
  );

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height * 0.7 + dragY.value }],
  }));

  if (!mounted) return null;

  const body = <View style={{ gap: theme.space[3] }}>{children}</View>;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle, { backgroundColor: theme.colors.overlay }]}>
          <Pressable
            style={styles.fill}
            accessibilityRole="button"
            accessibilityLabel="শিট বন্ধ করুন"
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          testID={testID}
          accessibilityViewIsModal
          style={[
            styles.sheet,
            sheetStyle,
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.componentRadius.sheet,
              borderTopRightRadius: theme.componentRadius.sheet,
              maxHeight: height * 0.88,
              paddingBottom: Math.max(insets.bottom, theme.space[4]),
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={[styles.handle, { backgroundColor: theme.colors.borderStrong }]} />
          </View>

          <View style={[styles.header, { paddingHorizontal: theme.space[4] }]}>
            <View style={styles.headerText}>
              {title ? (
                <Text variant="subtitle" numberOfLines={2}>
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text variant="caption" tone="secondary">
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="বন্ধ করুন"
              hitSlop={8}
              style={[styles.close, { backgroundColor: theme.colors.surfaceMuted }]}
            >
              <X size={18} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          {scrollable ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: theme.space[4],
                paddingBottom: theme.space[2],
              }}
            >
              {body}
            </ScrollView>
          ) : (
            <View style={{ paddingHorizontal: theme.space[4] }}>{body}</View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  fill: {
    flex: 1,
  },
  sheet: {
    borderTopWidth: 1,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
