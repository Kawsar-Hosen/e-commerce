import type { EntityId, IsoDateString } from './common';

export type UserRole = 'customer' | 'admin' | 'seller';

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  priceDrops: boolean;
  newsletter: boolean;
  smsAlerts: boolean;
  /** Channels are shown in the UI but never actually dispatch in this phase. */
  channelEmail: boolean;
  channelSms: boolean;
  channelPush: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  orderUpdates: true,
  promotions: true,
  priceDrops: false,
  newsletter: true,
  smsAlerts: true,
  channelEmail: true,
  channelSms: true,
  channelPush: false,
};

export interface Address {
  id: EntityId;
  label?: string;
  fullName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  landmark?: string;
  postcode?: string;
  isDefault: boolean;
}

export interface User {
  id: EntityId;
  name: string;
  /** Bangladeshi mobile number in `01XXXXXXXXX` format. */
  phone: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  addresses: Address[];
  notificationPreferences: NotificationPreferences;
  createdAt: IsoDateString;
  /** Demo-only loyalty balance rendered in the profile. */
  loyaltyPoints: number;
  /** Present for seller accounts; links the user to their store. */
  sellerId?: EntityId;
}

/** The subset kept in the client session store after a mock sign-in. */
export interface Session {
  user: User;
  /** Always `mock` in this phase — surfaced in the UI so nobody is misled. */
  provider: 'mock';
  issuedAt: IsoDateString;
  /** Demo sessions simply expire after a fixed window. */
  expiresAt: IsoDateString;
}

export interface SignInInput {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpInput {
  name: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
