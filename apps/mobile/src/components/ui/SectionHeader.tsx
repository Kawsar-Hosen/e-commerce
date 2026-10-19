import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

/** Rail / section heading with an optional "সব দেখুন" action. */

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Rendered next to the title, e.g. a flash-sale countdown. */
  trailing?: React.ReactNode;
  compact?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel = 'সব দেখুন',
  onAction,
  trailing,
  compact = false,
}: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.space[3],
        marginBottom: compact ? theme.space[2] : theme.space[3],
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2], flexWrap: 'wrap' }}>
          <Text variant={compact ? 'subtitle' : 'heading'} numberOfLines={2}>
            {title}
          </Text>
          {trailing}
        </View>
        {subtitle ? (
          <Text variant="caption" tone="secondary" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={`${title} — ${actionLabel}`}
          hitSlop={8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            minHeight: theme.layout.minTouchTarget,
            paddingLeft: theme.space[2],
          }}
        >
          <Text variant="label" tone="primary">
            {actionLabel}
          </Text>
          <ChevronRight size={16} color={theme.colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}
