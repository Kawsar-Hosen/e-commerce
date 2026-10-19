/**
 * Demo authentication.
 *
 * There is no backend and no credential check. Any of the three demo accounts
 * opens with the password listed in `DEMO_CREDENTIALS`, or with one tap from the
 * account screen. The session lives on this device only and the UI says so
 * wherever a session is created.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, User } from '@shobdox/shared-types';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@shobdox/shared-types';
import {
  DEMO_CREDENTIALS,
  MOCK_ADMIN_USER,
  MOCK_PRIMARY_CUSTOMER,
  MOCK_SELLER_USER,
} from '@shobdox/shared-mock-data';
import { STORAGE_KEYS } from '../lib/constants';
import { asyncJsonStorage } from './persist';

export type DemoRole = keyof typeof DEMO_CREDENTIALS;

interface AuthState {
  session?: Session;
  /** `true` once the persisted session has been rehydrated. */
  hydrated: boolean;
  signIn: (input: { phone: string; password: string; remember?: boolean }) => { ok: boolean; error?: string };
  signInAs: (role: DemoRole) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<User>) => void;
  setHydrated: (hydrated: boolean) => void;
}

const SESSION_HOURS = 12;

/** The demo user behind each role button. */
export const DEMO_ROLE_USERS: Record<DemoRole, User> = {
  customer: MOCK_PRIMARY_CUSTOMER,
  admin: MOCK_ADMIN_USER,
  seller: MOCK_SELLER_USER,
};

export const DEMO_ROLE_LABELS: Record<DemoRole, string> = {
  customer: 'ডেমো গ্রাহক',
  admin: 'ডেমো অ্যাডমিন',
  seller: 'ডেমো সেলার',
};

function createSession(user: User): Session {
  const issuedAt = new Date();
  return {
    user,
    provider: 'mock',
    issuedAt: issuedAt.toISOString(),
    expiresAt: new Date(issuedAt.getTime() + SESSION_HOURS * 3_600_000).toISOString(),
  };
}

function userForRole(role: DemoRole): User {
  const base = DEMO_ROLE_USERS[role];
  // A defensive copy keeps store edits from mutating the shared fixture.
  return { ...base, notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES, ...base.notificationPreferences } };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: undefined,
      hydrated: false,

      signIn: ({ phone, password }) => {
        const normalised = phone.replace(/\s+/g, '');
        const match = (Object.entries(DEMO_CREDENTIALS) as Array<[DemoRole, { phone: string; password: string }]>).find(
          ([, credentials]) => credentials.phone === normalised && credentials.password === password,
        );

        if (!match) {
          return {
            ok: false,
            error:
              'এই ডেমোতে ফোন নম্বর ও পাসওয়ার্ড মিলছে না। নিচের যেকোনো ডেমো অ্যাকাউন্ট এক ট্যাপে ব্যবহার করুন।',
          };
        }

        set({ session: createSession(userForRole(match[0])) });
        return { ok: true };
      },

      signInAs: (role) => set({ session: createSession(userForRole(role)) }),

      signOut: () => set({ session: undefined }),

      updateProfile: (patch) => {
        const session = get().session;
        if (!session) return;
        set({ session: { ...session, user: { ...session.user, ...patch } } });
      },

      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: STORAGE_KEYS.auth,
      version: 1,
      storage: asyncJsonStorage(),
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
