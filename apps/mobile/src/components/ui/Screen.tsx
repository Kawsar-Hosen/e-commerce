import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';
import { Text } from './Text';

/**
 * Page shell.
 *
 * `Screen` is a plain background container; `ScreenHeader` is the in-app header
 * used by the tab screens (the stack screens get the native header from the root
 * layout instead). Both respect the safe-area insets.
 */

export interface ScreenProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  background?: 'default' | 'surface';
  /** Adds the status-bar inset — used by screens that draw their own header. */
  includeTopInset?: boolean;
}

export function Screen({ children, style, background = 'default', includeTopInset = false }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: background === 'surface' ? theme.colors.surface : theme.colors.background,
          paddingTop: includeTopInset ? insets.top : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
  includeTopInset?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  right,
  includeTopInset = true,
}: ScreenHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingTop: includeTopInset ? insets.top : 0,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space[2],
          paddingHorizontal: theme.space[3],
          minHeight: theme.layout.headerHeight.mobile,
        }}
      >
        {showBack ? (
          <Button
            iconOnly
            variant="ghost"
            accessibilityLabel="পিছনে যান"
            icon={<ChevronLeft size={22} color={theme.colors.text} />}
            onPress={() => router.back()}
          />
        ) : null}

        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="subtitle" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right}
      </View>
    </View>
  );
}
