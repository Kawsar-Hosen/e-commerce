import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, MapPin, Search } from 'lucide-react-native';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { useUnreadNotificationCount } from '../../hooks/useProducts';
import { Text } from '../ui';

/**
 * Home header.
 *
 * Greets the shopper by name when a demo session exists, shows the delivery
 * area, and offers the two destinations people reach for first: search and the
 * notification list (with a live unread badge).
 */

const GREETINGS: Array<{ until: number; label: string }> = [
  { until: 12, label: 'শুভ সকাল' },
  { until: 16, label: 'শুভ দুপুর' },
  { until: 19, label: 'শুভ বিকেল' },
  { until: 24, label: 'শুভ সন্ধ্যা' },
];

function greetingFor(date: Date): string {
  const hour = date.getHours();
  return GREETINGS.find((entry) => hour < entry.until)?.label ?? 'স্বাগতম';
}

export interface HomeHeaderProps {
  userName?: string;
  areaLabel?: string;
}

export function HomeHeader({ userName, areaLabel = 'সারা দেশে ডেলিভারি' }: HomeHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const unread = useUnreadNotificationCount();
  const greeting = greetingFor(new Date());

  return (
    <View style={{ backgroundColor: theme.colors.surface, paddingTop: theme.space[4], paddingBottom: theme.space[3] }}>
      <View style={[styles.row, { paddingHorizontal: theme.space[4] }]}>
        <View style={styles.grow}>
          <Text variant="caption" tone="secondary">
            {greeting}
            {userName ? `, ${userName}` : ''}
          </Text>
          <View style={styles.location}>
            <MapPin size={14} color={theme.colors.primary} />
            <Text variant="label" tone="primary" numberOfLines={1}>
              {areaLabel}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/notifications')}
          accessibilityRole="button"
          accessibilityLabel={
            unread > 0 ? `নোটিফিকেশন, ${toBanglaDigits(unread)} টি অপঠিত` : 'নোটিফিকেশন'
          }
          android_ripple={{ color: theme.colors.overlay, borderless: true }}
          style={[styles.iconButton, { borderColor: theme.colors.border }]}
        >
          <Bell size={20} color={theme.colors.text} />
          {unread > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.accent }]}>
              <Text variant="caption" weight="bold" style={{ color: theme.colors.onAccent }}>
                {toBanglaDigits(unread)}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push('/search')}
        accessibilityRole="search"
        accessibilityLabel="পণ্য খুঁজুন"
        accessibilityHint="অনুসন্ধান স্ক্রিন খুলবে"
        android_ripple={{ color: theme.colors.overlay }}
        style={[
          styles.search,
          {
            marginTop: theme.space[3],
            marginHorizontal: theme.space[4],
            borderColor: theme.colors.border,
            borderRadius: theme.componentRadius.input,
            backgroundColor: theme.colors.surfaceMuted,
            minHeight: theme.layout.minTouchTarget,
            paddingHorizontal: theme.space[3],
          },
        ]}
      >
        <Search size={18} color={theme.colors.textMuted} />
        <Text variant="body" tone="muted" numberOfLines={1} style={styles.grow}>
          পণ্য, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  grow: {
    flex: 1,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
