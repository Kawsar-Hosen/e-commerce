import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

/**
 * Primary action control.
 *
 * Touch targets always meet the token minimum (`layout.minTouchTarget`, 44dp),
 * icon-only buttons require an explicit `accessibilityLabel`, and the Android
 * ripple is used instead of a bespoke press animation so feedback matches the
 * platform.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Renders a square button; `accessibilityLabel` becomes mandatory in practice. */
  iconOnly?: boolean;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const SIZE_PADDING: Record<ButtonSize, { paddingHorizontal: number; paddingVertical: number; icon: number }> = {
  sm: { paddingHorizontal: 12, paddingVertical: 8, icon: 16 },
  md: { paddingHorizontal: 16, paddingVertical: 10, icon: 18 },
  lg: { paddingHorizontal: 20, paddingVertical: 14, icon: 20 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconOnly = false,
  icon,
  rightIcon,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const sizing = SIZE_PADDING[size];

  const background: Record<ButtonVariant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.primarySoft,
    outline: 'transparent',
    ghost: 'transparent',
    danger: theme.colors.error,
  };

  const foreground: Record<ButtonVariant, string> = {
    primary: theme.colors.onPrimary,
    secondary: theme.colors.primary,
    outline: theme.colors.primary,
    ghost: theme.colors.text,
    danger: theme.colors.textInverse,
  };

  const border: Record<ButtonVariant, string | undefined> = {
    primary: undefined,
    secondary: undefined,
    outline: theme.colors.borderStrong,
    ghost: undefined,
    danger: undefined,
  };

  return (
    <Pressable
      testID={testID}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      android_ripple={{
        // A light ripple on filled buttons, a dark one on transparent variants.
        color:
          variant === 'primary' || variant === 'danger'
            ? theme.colors.textInverse
            : theme.colors.overlay,
        foreground: variant === 'outline',
      }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: background[variant],
          borderColor: border[variant],
          borderWidth: border[variant] ? 1 : 0,
          borderRadius: theme.componentRadius.button,
          minHeight: theme.layout.minTouchTarget,
          minWidth: iconOnly ? theme.layout.minTouchTarget : undefined,
          paddingHorizontal: iconOnly ? 0 : sizing.paddingHorizontal,
          paddingVertical: iconOnly ? 0 : sizing.paddingVertical,
          opacity: isDisabled ? 0.5 : pressed ? 0.92 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={foreground[variant]} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          {label ? (
            <Text
              variant={size === 'lg' ? 'subtitle' : 'label'}
              weight="semibold"
              style={{ color: foreground[variant] }}
            >
              {label}
            </Text>
          ) : null}
          {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
