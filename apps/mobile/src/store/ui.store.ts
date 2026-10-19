/**
 * UI state that should survive a restart: toasts, theme preference, recently
 * viewed products and recent searches.
 *
 * Toasts are deliberately *not* persisted — they belong to the current session.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MAX_RECENTLY_VIEWED, MAX_RECENT_SEARCHES, STORAGE_KEYS } from '../lib/constants';
import type { ThemePreference } from '../lib/theme';
import { asyncJsonStorage } from './persist';

export interface ToastMessage {
  id: string;
  tone: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  /** In-app route opened by the toast action, e.g. `/(tabs)/cart`. */
  actionHref?: string;
  actionLabel?: string;
  /** Milliseconds; `0` keeps the toast until it is dismissed. */
  duration: number;
}

interface UiState {
  toasts: ToastMessage[];
  themePreference: ThemePreference;
  recentlyViewedIds: string[];
  recentSearches: string[];

  pushToast: (toast: Omit<ToastMessage, 'id' | 'duration'> & { duration?: number }) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;

  setThemePreference: (preference: ThemePreference) => void;

  markViewed: (productId: string) => void;
  clearRecentlyViewed: () => void;

  rememberSearch: (term: string) => void;
  forgetSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      toasts: [],
      themePreference: 'system',
      recentlyViewedIds: [],
      recentSearches: [],

      pushToast: (toast) => {
        const id = `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const entry: ToastMessage = {
          id,
          tone: toast.tone,
          title: toast.title,
          description: toast.description,
          actionHref: toast.actionHref,
          actionLabel: toast.actionLabel,
          duration: toast.duration ?? 4_000,
        };
        // Keep the newest four so a burst of actions cannot cover the screen.
        set({ toasts: [...get().toasts, entry].slice(-4) });
        return id;
      },

      dismissToast: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
      clearToasts: () => set({ toasts: [] }),

      setThemePreference: (themePreference) => set({ themePreference }),

      markViewed: (productId) =>
        set({
          recentlyViewedIds: [
            productId,
            ...get().recentlyViewedIds.filter((id) => id !== productId),
          ].slice(0, MAX_RECENTLY_VIEWED),
        }),

      clearRecentlyViewed: () => set({ recentlyViewedIds: [] }),

      rememberSearch: (term) => {
        const cleaned = term.trim();
        if (cleaned.length < 2) return;
        set({
          recentSearches: [
            cleaned,
            ...get().recentSearches.filter((entry) => entry.toLowerCase() !== cleaned.toLowerCase()),
          ].slice(0, MAX_RECENT_SEARCHES),
        });
      },

      forgetSearch: (term) =>
        set({ recentSearches: get().recentSearches.filter((entry) => entry !== term) }),

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: STORAGE_KEYS.ui,
      version: 1,
      storage: asyncJsonStorage(),
      partialize: (state) => ({
        themePreference: state.themePreference,
        recentlyViewedIds: state.recentlyViewedIds,
        recentSearches: state.recentSearches,
      }),
    },
  ),
);

/** Convenience helper for non-React code (services, event handlers). */
export function toast(input: Parameters<UiState['pushToast']>[0]): string {
  return useUiStore.getState().pushToast(input);
}
