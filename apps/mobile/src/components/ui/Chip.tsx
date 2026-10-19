import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

/**
 * Selectable pill. Used for category shortcuts, sort options, filter facets and
 * coupon chips — anything the shopper toggles in place.
 */

export interface ChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
  /** Trailing count, e.g. the number of products in a facet. */
  count?: string;
  size?: 'sm' | 'md';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  icon,
  count,
  size = 'md',
  accessibilityLabel,
  style,
}: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      android_ripple={{ color: theme.colors.overlay, borderless: false }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.componentRadius.chip,
          minHeight: theme.layout.minTouchTarget - 8,
          paddingHorizontal: size === 'sm' ? theme.space[3] : theme.space[4],
          paddingVertical: size === 'sm' ? theme.space[1] : theme.space[2],
          opacity: disabled ? 0.45 : pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon ?? null}
        <Text
          variant={size === 'sm' ? 'caption' : 'label'}
          weight="semibold"
          style={{ color: selected ? theme.colors.onPrimary : theme.colors.text }}
        >
          {label}
        </Text>
        {count ? (
          <Text
            variant="caption"
            weight="medium"
            style={{ color: selected ? theme.colors.onPrimary : theme.colors.textMuted }}
          >
            {count}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
