import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';
import { Text } from './Text';

/** Friendly zero-state with an optional action. */

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Extra content under the action, e.g. suggested rails. */
  children?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        gap: theme.space[3],
        paddingVertical: theme.space[8],
        paddingHorizontal: theme.space[6],
      }}
    >
      {icon ? (
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      ) : null}

      <Text variant="subtitle" align="center">
        {title}
      </Text>

      {description ? (
        <Text variant="body" tone="secondary" align="center">
          {description}
        </Text>
      ) : null}

      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}

      {children}
    </View>
  );
}
