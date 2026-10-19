import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Bell, BellOff, CheckCheck, Info, Package, Percent, ShieldCheck, type LucideIcon } from 'lucide-react';
import {
  NOTIFICATION_KIND_LABELS,
  type AppNotification,
  type NotificationKind,
} from '@shobdox/shared-types';
import { formatRelativeTime, toBanglaDigits } from '@shobdox/shared-utils';
import { Alert, Badge, Button, Card, EmptyState, PageHeader, Tabs } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useNotifications, useUnreadNotificationCount } from '@/hooks/useCatalog';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';

/**
 * In-app notification centre.
 *
 * Every row is generated locally by the demo dataset; opening one only flips a
 * local read flag. Nothing is emailed, texted or pushed anywhere.
 */

type FilterId = 'all' | 'unread' | 'order' | 'promotion';

const KIND_ICONS: Record<NotificationKind, LucideIcon> = {
  order: Package,
  promotion: Percent,
  'price-drop': Percent,
  account: ShieldCheck,
  system: Info,
};

function matchesFilter(notification: AppNotification, filter: FilterId): boolean {
  switch (filter) {
    case 'unread':
      return !notification.read;
    case 'order':
      return notification.kind === 'order';
    case 'promotion':
      return notification.kind === 'promotion' || notification.kind === 'price-drop';
    default:
      return true;
  }
}

export default function NotificationsPage() {
  const notifications = useNotifications();
  const unreadCount = useUnreadNotificationCount();
  const markNotificationRead = useDataStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useDataStore((state) => state.markAllNotificationsRead);

  const [filter, setFilter] = useState<FilterId>('all');

  const tabs = useMemo(
    () => [
      { id: 'all', label: 'সব', count: notifications.length },
      { id: 'unread', label: 'অপঠিত', count: unreadCount },
      { id: 'order', label: 'অর্ডার', count: notifications.filter((item) => item.kind === 'order').length },
      {
        id: 'promotion',
        label: 'অফার',
        count: notifications.filter((item) => item.kind === 'promotion' || item.kind === 'price-drop').length,
      },
    ],
    [notifications, unreadCount],
  );

  const filtered = useMemo(
    () => notifications.filter((notification) => matchesFilter(notification, filter)),
    [notifications, filter],
  );

  const onOpen = (notification: AppNotification) => {
    if (!notification.read) markNotificationRead(notification.id);
  };

  const onMarkReadOnly = (notification: AppNotification) => {
    if (notification.read) return;
    markNotificationRead(notification.id);
    toast({ tone: 'info', title: 'পড়া হয়েছে হিসেবে চিহ্নিত', description: notification.title });
  };

  const markAll = () => {
    markAllNotificationsRead();
    toast({
      tone: 'success',
      title: 'সব নোটিফিকেশন পড়া হয়েছে',
      description: 'অপঠিত তালিকা এখন খালি — এটি শুধু লোকাল ডেমো অবস্থা।',
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="নোটিফিকেশন"
        description="অর্ডার, দাম কমা ও অফারের ডেমো আপডেট — সবই এই ব্রাউজারে তৈরি।"
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={unreadCount === 0}
            title={unreadCount === 0 ? 'পড়ার মতো নতুন নোটিফিকেশন নেই' : undefined}
            leftIcon={<CheckCheck aria-hidden className="size-4" />}
            onClick={markAll}
          >
            সব পড়া হয়েছে
          </Button>
        }
      />

      <Alert tone="info" title="নোটিফিকেশনগুলো কোথা থেকে আসে?">
        এগুলো ডেমো ডেটাসেট থেকে লোকালভাবে তৈরি — কোনো প্রকৃত ইমেইল, SMS বা পুশ নোটিফিকেশন পাঠানো হয় না।
      </Alert>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs
          items={tabs}
          activeId={filter}
          onChange={(id) => setFilter(id as FilterId)}
          aria-label="নোটিফিকেশন ফিল্টার"
        />
        {unreadCount > 0 ? (
          <Badge tone="danger" size="sm">
            {toBanglaDigits(unreadCount)}টি অপঠিত
          </Badge>
        ) : (
          <Badge tone="success" size="sm">
            সব পড়া হয়েছে
          </Badge>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BellOff aria-hidden className="size-6" />}
          title="কোনো নোটিফিকেশন নেই"
          description={
            filter === 'all'
              ? 'নতুন অর্ডার বা অফার এলে এখানে দেখা যাবে (ডেমো)।'
              : 'এই ফিল্টারে কিছু নেই — অন্য ট্যাব দেখুন।'
          }
          action={filter !== 'all' ? <Button variant="outline" onClick={() => setFilter('all')}>সব দেখুন</Button> : undefined}
        />
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((notification) => {
            const Icon = KIND_ICONS[notification.kind];
            const rowClass = cn(
              'flex w-full items-start gap-3 rounded-card border p-3 text-left transition-colors',
              notification.read
                ? 'border-border bg-surface hover:border-border-strong'
                : 'border-primary/30 bg-primary-soft/50 hover:bg-primary-soft',
            );

            const body = (
              <>
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-card',
                    notification.read ? 'bg-surface-muted text-text-secondary' : 'bg-primary-soft text-primary-dark',
                  )}
                >
                  <Icon aria-hidden className="size-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="text-base font-semibold text-text-primary">{notification.title}</span>
                    <Badge tone="neutral" size="sm">
                      {NOTIFICATION_KIND_LABELS[notification.kind]}
                    </Badge>
                    {!notification.read ? <span className="size-2 rounded-full bg-primary" aria-label="অপঠিত" /> : null}
                  </span>

                  <span className="mt-0.5 block text-sm leading-relaxed text-text-secondary">
                    {notification.body}
                  </span>

                  <span className="mt-1 block text-xs text-text-muted">
                    {formatRelativeTime(notification.createdAt)}
                    {notification.href ? ' · ট্যাপ করে সংশ্লিষ্ট পেজে যান' : ''}
                  </span>
                </span>
              </>
            );

            return (
              <li key={notification.id}>
                {notification.href ? (
                  <Link to={notification.href} className={rowClass} onClick={() => onOpen(notification)}>
                    {body}
                  </Link>
                ) : notification.read ? (
                  <div className={rowClass}>{body}</div>
                ) : (
                  <button type="button" className={rowClass} onClick={() => onMarkReadOnly(notification)}>
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Card className="flex items-start gap-2.5 p-3">
        <Bell aria-hidden className="mt-0.5 size-4 shrink-0 text-text-muted" />
        <p className="text-xs leading-relaxed text-text-secondary">
          পড়া/না-পড়া অবস্থা লোকাল স্টোরেজে সংরক্ষিত। নতুন নোটিফিকেশন তৈরি হলে সর্বোচ্চ ৪০টি রাখা হয়।{' '}
          <Link to="/account/settings" className="font-medium text-primary hover:underline">
            নোটিফিকেশন পছন্দ বদলাতে সেটিংসে যান
          </Link>
          ।
        </p>
      </Card>
    </div>
  );
}
