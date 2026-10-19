import type { EntityId, IsoDateString } from './common';

export type NotificationKind = 'order' | 'promotion' | 'price-drop' | 'account' | 'system';

export interface AppNotification {
  id: EntityId;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: IsoDateString;
  read: boolean;
  /** In-app route the row links to when tapped. */
  href?: string;
  /** Thumbnail or icon accent, resolved from design tokens by the UI. */
  image?: string;
}

export const NOTIFICATION_KIND_LABELS: Record<NotificationKind, string> = {
  order: 'অর্ডার',
  promotion: 'অফার',
  'price-drop': 'দাম কমেছে',
  account: 'অ্যাকাউন্ট',
  system: 'সিস্টেম',
};
