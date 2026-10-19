import { Pressable, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

/** Checkbox row with a 44dp target and a Bangla label. */

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  error?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, description, error, disabled = false }: CheckboxProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => onChange(!checked)}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityState={{ checked, disabled }}
        android_ripple={{ color: theme.colors.overlay }}
        style={[styles.row, { minHeight: theme.layout.minTouchTarget, opacity: disabled ? 0.5 : 1 }]}
      >
        <View
          style={[
            styles.box,
            {
              borderColor: checked ? theme.colors.primary : error ? theme.colors.error : theme.colors.borderStrong,
              backgroundColor: checked ? theme.colors.primary : theme.colors.surface,
              borderRadius: theme.radius.sm,
            },
          ]}
        >
          {checked ? <Check size={16} color={theme.colors.onPrimary} /> : null}
        </View>

        <View style={styles.labels}>
          <Text variant="body">{label}</Text>
          {description ? (
            <Text variant="caption" tone="secondary">
              {description}
            </Text>
          ) : null}
        </View>
      </Pressable>

      {error ? (
        <Text variant="caption" tone="error" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  labels: {
    flex: 1,
    gap: 2,
  },
});
