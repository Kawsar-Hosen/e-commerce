import { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { BottomSheet } from './BottomSheet';
import { Text } from './Text';

/**
 * Action-sheet select.
 *
 * Android has no native `<select>`, so the list opens in the shared
 * `BottomSheet`; every row is a 48dp target and the current value is marked with
 * a check plus an `accessibilityState.selected` flag.
 */

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectProps {
  label?: string;
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  title?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Select({
  label,
  value,
  options,
  placeholder = 'নির্বাচন করুন',
  onChange,
  error,
  helperText,
  disabled = false,
  title,
  style,
  accessibilityLabel,
}: SelectProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text variant="label" tone={error ? 'error' : 'default'}>
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
        accessibilityValue={{ text: selected?.label ?? placeholder }}
        accessibilityState={{ disabled, expanded: open }}
        android_ripple={{ color: theme.colors.overlay }}
        style={[
          styles.field,
          {
            borderColor: error ? theme.colors.error : theme.colors.border,
            borderRadius: theme.componentRadius.input,
            backgroundColor: disabled ? theme.colors.surfaceMuted : theme.colors.surface,
            paddingHorizontal: theme.space[3],
            minHeight: theme.layout.minTouchTarget,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Text
          variant="body"
          tone={selected ? 'default' : 'muted'}
          numberOfLines={1}
          style={styles.value}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={18} color={theme.colors.textSecondary} />
      </Pressable>

      {error ? (
        <Text variant="caption" tone="error" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" tone="muted">
          {helperText}
        </Text>
      ) : null}

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={title ?? label ?? placeholder}
        scrollable={options.length > 8}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option.label}
              android_ripple={{ color: theme.colors.overlay }}
              style={[
                styles.option,
                {
                  borderRadius: theme.componentRadius.card,
                  backgroundColor: isSelected ? theme.colors.primarySoft : 'transparent',
                  minHeight: theme.layout.minTouchTarget,
                  paddingHorizontal: theme.space[3],
                },
              ]}
            >
              <View style={styles.optionText}>
                <Text variant={isSelected ? 'bodyStrong' : 'body'}>{option.label}</Text>
                {option.description ? (
                  <Text variant="caption" tone="secondary">
                    {option.description}
                  </Text>
                ) : null}
              </View>
              {isSelected ? <Check size={18} color={theme.colors.primary} /> : null}
            </Pressable>
          );
        })}
      </BottomSheet>
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
    justifyContent: 'space-between',
    gap: 8,
    borderWidth: 1,
  },
  value: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
});
