import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

/** Small status pill — order states, stock states, discount flags. */

export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  accessibilityLabel?: string;
}

export function Badge({ label, tone = 'neutral', size = 'sm', accessibilityLabel }: BadgeProps) {
  const theme = useTheme();

  const tones: Record<BadgeTone, { background: string; text: string }> = {
    neutral: { background: theme.colors.surfaceMuted, text: theme.colors.textSecondary },
    primary: { background: theme.colors.primary, text: theme.colors.onPrimary },
    accent: { background: theme.colors.accent, text: theme.colors.onAccent },
    success: { background: theme.colors.successSoft, text: theme.colors.success },
    warning: { background: theme.colors.warningSoft, text: theme.colors.warning },
    error: { background: theme.colors.errorSoft, text: theme.colors.error },
    info: { background: theme.colors.infoSoft, text: theme.colors.info },
  };

  const palette = tones[tone];

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.base,
        {
          backgroundColor: palette.background,
          borderRadius: theme.componentRadius.chip,
          paddingHorizontal: size === 'md' ? theme.space[3] : theme.space[2],
          paddingVertical: size === 'md' ? theme.space[1] : 2,
        },
      ]}
    >
      <Text variant="caption" weight="semibold" style={{ color: palette.text }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
  },
});
