import { View } from 'react-native';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

/** Thin progress track — free-delivery progress, stock pressure, rating bars. */

export interface ProgressBarProps {
  /** 0–100. Values outside the range are clamped. */
  value: number;
  height?: number;
  tone?: 'primary' | 'accent' | 'success' | 'warning' | 'info';
  /** Bangla label read out by screen readers, e.g. "ফ্রি ডেলিভারির ৭২% পূর্ণ". */
  accessibilityLabel?: string;
}

export function ProgressBar({
  value,
  height = 6,
  tone = 'primary',
  accessibilityLabel,
}: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const tones = {
    primary: theme.colors.primary,
    accent: theme.colors.accent,
    success: theme.colors.success,
    warning: theme.colors.warning,
    info: theme.colors.info,
  } as const;

  return (
    <View style={{ gap: 4 }}>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel ?? `অগ্রগতি ${toBanglaDigits(clamped)}%`}
        accessibilityValue={{ min: 0, max: 100, now: clamped }}
        style={{
          height,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.surfaceMuted,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${clamped}%`,
            height,
            borderRadius: theme.radius.full,
            backgroundColor: tones[tone],
          }}
        />
      </View>
      {accessibilityLabel ? null : (
        <Text variant="caption" tone="muted">
          {`${toBanglaDigits(clamped)}%`}
        </Text>
      )}
    </View>
  );
}
