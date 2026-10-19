import { CircleAlert, RefreshCw } from 'lucide-react-native';
import { View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';
import { Text } from './Text';

/** Failure state. The demo has no network, but a missing record is real. */

export interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Retry / reset action. */
  actionLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'কিছু একটা ভুল হয়েছে',
  description = 'তথ্যটি পাওয়া যায়নি। আবার চেষ্টা করুন বা ডেমো ডেটা রিসেট করুন।',
  actionLabel = 'আবার চেষ্টা করুন',
  onRetry,
}: ErrorStateProps) {
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
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.errorSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircleAlert size={28} color={theme.colors.error} />
      </View>

      <Text variant="subtitle" align="center">
        {title}
      </Text>
      <Text variant="body" tone="secondary" align="center">
        {description}
      </Text>

      {onRetry ? (
        <Button
          label={actionLabel}
          variant="outline"
          icon={<RefreshCw size={16} color={theme.colors.primary} />}
          onPress={onRetry}
        />
      ) : null}
    </View>
  );
}
