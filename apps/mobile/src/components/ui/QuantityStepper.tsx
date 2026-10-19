import { View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';
import { Text } from './Text';

/**
 * Quantity control used by the cart lines and the product page.
 *
 * The value announces itself politely so a screen reader hears the new quantity
 * after each tap instead of re-reading the whole line.
 */

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  /** Shown under the control, e.g. "স্টকে ৮ টি আছে". */
  hint?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled = false,
  hint,
}: QuantityStepperProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: 4 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space[2],
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.componentRadius.input,
          paddingHorizontal: 2,
          alignSelf: 'flex-start',
          backgroundColor: theme.colors.surface,
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          icon={<Minus size={16} color={theme.colors.text} />}
          accessibilityLabel="পরিমাণ কমান"
          disabled={disabled || value <= min}
          onPress={() => onChange(Math.max(min, value - 1))}
        />

        <Text
          variant="bodyStrong"
          align="center"
          accessibilityLiveRegion="polite"
          accessibilityLabel={`পরিমাণ ${toBanglaDigits(value)}`}
          style={{ minWidth: 28 }}
        >
          {toBanglaDigits(value)}
        </Text>

        <Button
          variant="ghost"
          size="sm"
          iconOnly
          icon={<Plus size={16} color={theme.colors.text} />}
          accessibilityLabel="পরিমাণ বাড়ান"
          disabled={disabled || value >= max}
          onPress={() => onChange(Math.min(max, value + 1))}
        />
      </View>

      {hint ? (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
