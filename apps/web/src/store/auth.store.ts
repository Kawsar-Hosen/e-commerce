import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, User } from '@shobdox/shared-types';
import { STORAGE_KEYS } from '@/lib/constants';
import { DEMO_CREDENTIALS, MOCK_ADMIN_USER, MOCK_PRIMARY_CUSTOMER, MOCK_SELLER_USER } from '@shobdox/shared-mock-data';

/**
 * Demo authentication.
 *
 * There is no backend and no real credential checking. Any of the three demo
 * accounts can be opened with the listed password, or by pressing the matching
 * "continue as …" button. The UI states this plainly wherever a session is
 * created, and the session lives only in this browser.
 */

interface AuthState {
  session?: Session;
  /** `true` once the persisted session has been rehydrated. */
  hydrated: boolean;
  signIn: (input: { phone: string; password: string; remember?: boolean }) => { ok: boolean; error?: string };
  signInAs: (role: 'customer' | 'admin' | 'seller') => void;
  signUp: (input: { name: string; phone: string; email?: string }) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<User>) => void;
  setHydrated: (hydrated: boolean) => void;
}

const SESSION_HOURS = 12;

function createSession(user: User): Session {
  const issuedAt = new Date();
  return {
    user,
    provider: 'mock',
    issuedAt: issuedAt.toISOString(),
    expiresAt: new Date(issuedAt.getTime() + SESSION_HOURS * 3_600_000).toISOString(),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: undefined,
      hydrated: false,

      signIn: ({ phone, password }) => {
        const normalised = phone.replace(/\s+/g, '');
        const match = Object.entries(DEMO_CREDENTIALS).find(
          ([, credentials]) => credentials.phone === normalised && credentials.password === password,
        );

        if (!match) {
          return {
            ok: false,
            error: 'ডেমো ইমেইলের বদলে ফোন নম্বর ও পাসওয়ার্ড ব্যবহার করুন। নিচের ডেমো অ্যাকাউন্ট থেকে একটি বেছে নিন।',
          };
        }

        const role = match[0] as keyof typeof DEMO_CREDENTIALS;
        const user =
          role === 'admin' ? MOCK_ADMIN_USER : role === 'seller' ? MOCK_SELLER_USER : MOCK_PRIMARY_CUSTOMER;

        set({ session: createSession(user) });
        return { ok: true };
      },

      signInAs: (role) => {
        const credentials = DEMO_CREDENTIALS[role];
        get().signIn({ phone: credentials.phone, password: credentials.password });
      },

      signUp: ({ name, phone, email }) => {
        const user: User = {
          ...MOCK_PRIMARY_CUSTOMER,
          id: `user-demo-${Date.now().toString(36)}`,
          name,
          phone,
          email,
          addresses: [],
          createdAt: new Date().toISOString(),
          loyaltyPoints: 100,
        };
        set({ session: createSession(user) });
      },

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
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

/** The signed-in user, or `undefined` for a guest session. */
export function useCurrentUser(): User | undefined {
  return useAuthStore((state) => state.session?.user);
}

export function isAdmin(user?: User): boolean {
  return user?.role === 'admin';
}

export function isSeller(user?: User): boolean {
  return user?.role === 'seller';
}
