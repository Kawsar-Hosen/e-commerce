import { useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

/**
 * Labelled text field.
 *
 * The label, helper and error copy are all readable by a screen reader, errors
 * are announced through an `accessibilityLiveRegion`, and the secure-entry eye
 * toggle is a real 44dp control.
 */

export interface InputProps {
  label?: string;
  value: string;
  onChangeText?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onSubmitEditing?: () => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  secureTextEntry?: boolean;
  multiline?: boolean;
  maxLength?: number;
  editable?: boolean;
  autoFocus?: boolean;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  onBlur,
  onFocus,
  onSubmitEditing,
  placeholder,
  error,
  helperText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = false,
  returnKeyType,
  secureTextEntry = false,
  multiline = false,
  maxLength,
  editable = true,
  autoFocus = false,
  leftIcon,
  rightSlot,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const borderColor = error
    ? theme.colors.error
    : focused
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text variant="label" tone={error ? 'error' : 'default'}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.field,
          {
            borderColor,
            borderRadius: theme.componentRadius.input,
            backgroundColor: editable ? theme.colors.surface : theme.colors.surfaceMuted,
            paddingHorizontal: theme.space[3],
            minHeight: theme.layout.minTouchTarget,
          },
        ]}
      >
        {leftIcon ? <View style={styles.affix}>{leftIcon}</View> : null}

        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          secureTextEntry={secureTextEntry && !revealed}
          multiline={multiline}
          maxLength={maxLength}
          editable={editable}
          autoFocus={autoFocus}
          accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
          accessibilityHint={accessibilityHint}
          // Bangla text renders through the platform font stack.
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontSize: theme.font.size.base,
              lineHeight: Math.round(theme.font.size.base * theme.font.banglaLineHeight.normal),
              minHeight: multiline ? theme.layout.minTouchTarget * 1.4 : undefined,
              paddingVertical: theme.space[2],
            },
          ]}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setRevealed((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
            hitSlop={8}
            style={styles.eye}
          >
            {revealed ? (
              <EyeOff size={18} color={theme.colors.textSecondary} />
            ) : (
              <Eye size={18} color={theme.colors.textSecondary} />
            )}
          </Pressable>
        ) : (
          (rightSlot ?? null)
        )}
      </View>

      {error ? (
        <Text variant="caption" tone="error" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" tone="muted">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  input: {
    flex: 1,
  },
  affix: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
