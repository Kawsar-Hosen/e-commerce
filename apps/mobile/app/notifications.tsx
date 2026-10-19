import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BellRing,
  CheckCheck,
  Package,
  Tag,
  TrendingDown,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import type { AppNotification, NotificationKind } from '@shobdox/shared-types';
import { NOTIFICATION_KIND_LABELS } from '@shobdox/shared-types';
import { formatRelativeTime, toBanglaDigits } from '@shobdox/shared-utils';
import { resolveAppHrefTarget } from '../src/lib/links';
import { useTheme } from '../src/hooks/useTheme';
import { useNotifications, useUnreadNotificationCount } from '../src/hooks/useProducts';
import { useDataStore } from '../src/store/data.store';
import { Badge, Button, Card, EmptyState, Screen, Text } from '../src/components/ui';

/**
 * Notification centre.
 *
 * Rows come from the persisted dataset, so the unread badge in the account tab
 * and this list always agree. Tapping a row marks it read and follows the
 * fixture `href` through `resolveAppHref()`, which maps web-style links onto
 * native routes.
 */

const KIND_ICONS: Record<NotificationKind, LucideIcon> = {
  order: Package,
  promotion: Tag,
  'price-drop': TrendingDown,
  account: UserRound,
  system: BellRing,
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const notifications = useNotifications();
  const unread = useUnreadNotificationCount();
  const markNotificationRead = useDataStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useDataStore((state) => state.markAllNotificationsRead);

  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  const open = useCallback(
    (notification: AppNotification) => {
      markNotificationRead(notification.id);
      if (!notification.href) return;
      router.push(resolveAppHrefTarget(notification.href));
    },
    [markNotificationRead, router],
  );

  const renderRow = useCallback(
    ({ item }: { item: AppNotification }) => {
      const Icon = KIND_ICONS[item.kind];

      return (
        <Card padded={false}>
          <Pressable
            onPress={() => open(item)}
            accessibilityRole="button"
            accessibilityLabel={`${NOTIFICATION_KIND_LABELS[item.kind]}: ${item.title}${item.read ? '' : ' — অপঠিত'}`}
            accessibilityHint={item.href ? 'বিস্তারিত দেখতে খুলুন' : undefined}
            android_ripple={{ color: theme.colors.overlay }}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: theme.space[3],
              padding: theme.space[4],
              minHeight: theme.layout.minTouchTarget,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: theme.radius.full,
                backgroundColor: item.read ? theme.colors.surfaceMuted : theme.colors.primarySoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={18} color={item.read ? theme.colors.textMuted : theme.colors.primary} />
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
                <Text variant="label" style={{ flex: 1 }} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.read ? null : (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: theme.radius.full,
                      backgroundColor: theme.colors.primary,
                    }}
                  />
                )}
              </View>

              <Text variant="caption" tone="secondary" numberOfLines={3}>
                {item.body}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.space[2],
                  flexWrap: 'wrap',
                }}
              >
                <Badge label={NOTIFICATION_KIND_LABELS[item.kind]} tone="neutral" />
                <Text variant="caption" tone="muted">
                  {formatRelativeTime(item.createdAt)}
                </Text>
              </View>
            </View>
          </Pressable>
        </Card>
      );
    },
    [open, theme],
  );

  return (
    <Screen>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        contentContainerStyle={{
          padding: theme.space[4],
          gap: theme.space[3],
          paddingBottom: theme.space[8],
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        ListHeaderComponent={
          <View style={{ gap: theme.space[3] }}>
            <Text variant="heading">
              {unread > 0 ? `${toBanglaDigits(unread)}টি অপঠিত` : 'সব পড়া হয়েছে'}
            </Text>
            {unread > 0 ? (
              <Button
                variant="outline"
                size="sm"
                label="সব পড়া হিসেবে চিহ্নিত করুন"
                icon={<CheckCheck size={16} color={theme.colors.primary} />}
                accessibilityLabel="সব নোটিফিকেশন পড়া হিসেবে চিহ্নিত করুন"
                onPress={markAllNotificationsRead}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={<BellRing size={28} color={theme.colors.primary} />}
            title="কোনো নোটিফিকেশন নেই"
            description="ডেমো ডেটা রিসেট করলে স্যাম্পল নোটিফিকেশনগুলো ফিরে আসবে।"
            actionLabel="অ্যাকাউন্টে যান"
            onAction={() => router.push('/(tabs)/account')}
          />
        }
      />
    </Screen>
  );
}
