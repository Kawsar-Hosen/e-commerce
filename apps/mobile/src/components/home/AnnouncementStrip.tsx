import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Megaphone } from 'lucide-react-native';
import type { Announcement } from '@shobdox/shared-types';
import { resolveAppHrefTarget } from '../../lib/links';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../ui';

/**
 * Announcement bar.
 *
 * Shows the first active announcement from the shared content fixture. When the
 * fixture carries a link the whole bar is tappable and routes natively.
 */

export interface AnnouncementStripProps {
  announcements: Announcement[];
}

export function AnnouncementStrip({ announcements }: AnnouncementStripProps) {
  const theme = useTheme();
  const router = useRouter();
  const announcement = announcements.find((entry) => entry.isActive);

  if (!announcement) return null;

  const background =
    announcement.tone === 'primary'
      ? theme.colors.primarySoft
      : announcement.tone === 'accent'
        ? theme.colors.accentSoft
        : theme.colors.surfaceMuted;

  const foreground =
    announcement.tone === 'primary'
      ? theme.colors.primary
      : announcement.tone === 'accent'
        ? theme.colors.accent
        : theme.colors.textSecondary;

  const open = () => {
    if (!announcement.href) return;
    router.push(resolveAppHrefTarget(announcement.href));
  };

  return (
    <Pressable
      onPress={announcement.href ? open : undefined}
      disabled={!announcement.href}
      accessibilityRole={announcement.href ? 'button' : 'text'}
      accessibilityLabel={announcement.messageBn ?? announcement.message}
      android_ripple={{ color: theme.colors.overlay }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space[2],
        backgroundColor: background,
        borderRadius: theme.componentRadius.card,
        marginHorizontal: theme.space[4],
        paddingHorizontal: theme.space[3],
        minHeight: theme.layout.minTouchTarget,
      }}
    >
      <Megaphone size={16} color={foreground} />
      <View style={{ flex: 1 }}>
        <Text variant="caption" weight="semibold" style={{ color: foreground }} numberOfLines={2}>
          {announcement.messageBn ?? announcement.message}
        </Text>
      </View>
    </Pressable>
  );
}
