import { View } from 'react-native';
import { initialsOf } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { AppImage } from './AppImage';
import { Text } from './Text';

/** Circular avatar: a photo when one exists, Bangla initials otherwise. */

export interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  accessibilityLabel?: string;
}

export function Avatar({ name, uri, size = 44, accessibilityLabel }: AvatarProps) {
  const theme = useTheme();

  const shared = {
    width: size,
    height: size,
    borderRadius: theme.radius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (uri) {
    return (
      <AppImage
        uri={uri}
        style={[shared, { backgroundColor: theme.colors.primarySoft }]}
        accessibilityLabel={accessibilityLabel ?? name}
      />
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? name}
      style={[shared, { backgroundColor: theme.colors.primary }]}
    >
      <Text
        variant="bodyStrong"
        style={{ color: theme.colors.onPrimary, fontSize: Math.round(size * 0.36) }}
      >
        {initialsOf(name)}
      </Text>
    </View>
  );
}
