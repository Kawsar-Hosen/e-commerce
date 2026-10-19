import { Switch, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

/**
 * Label + switch row.
 *
 * Wraps the platform `Switch` so the thumb colours come from the design tokens
 * and the label is part of the same accessibility node.
 */

export interface SwitchRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function SwitchRow({ label, description, value, onValueChange, disabled = false }: SwitchRowProps) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3], minHeight: theme.layout.minTouchTarget }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body">{label}</Text>
        {description ? (
          <Text variant="caption" tone="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        trackColor={{ false: theme.colors.borderStrong, true: theme.colors.primaryLight }}
        thumbColor={value ? theme.colors.primary : theme.colors.surface}
        ios_backgroundColor={theme.colors.borderStrong}
      />
    </View>
  );
}
