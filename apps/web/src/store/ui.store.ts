import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * UI state that should survive a reload: toast queue, open drawers, theme
 * preference, recently-viewed product ids and the mobile nav state.
 */

export interface Toast {
  id: string;
  tone: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  /** Milliseconds; `0` keeps the toast until it is dismissed. */
  duration: number;
}

export type DrawerId = 'cart' | 'filters' | 'account' | 'categories' | 'search' | null;

interface UiState {
  toasts: Toast[];
  drawer: DrawerId;
  searchOpen: boolean;
  locationPromptDismissed: boolean;
  recentlyViewedIds: string[];
  recentSearches: string[];
  compactMode: boolean;
  pushToast: (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
  openDrawer: (drawer: Exclude<DrawerId, null>) => void;
  closeDrawer: () => void;
  setSearchOpen: (open: boolean) => void;
  dismissLocationPrompt: () => void;
  markViewed: (productId: string) => void;
  clearRecentlyViewed: () => void;
  pushSearch: (term: string) => void;
  clearSearches: () => void;
  setCompactMode: (compact: boolean) => void;
}

const MAX_RECENTLY_VIEWED = 12;

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      toasts: [],
      drawer: null,
      searchOpen: false,
      locationPromptDismissed: false,
      recentlyViewedIds: [],
      recentSearches: [],
      compactMode: false,

      pushToast: (toast) => {
        const id = `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const entry: Toast = {
          id,
          tone: toast.tone,
          title: toast.title,
          description: toast.description,
          actionLabel: toast.actionLabel,
          actionHref: toast.actionHref,
          duration: toast.duration ?? 4_000,
        };
        set({ toasts: [...get().toasts, entry].slice(-4) });
        return id;
      },

      dismissToast: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),

      clearToasts: () => set({ toasts: [] }),

      openDrawer: (drawer) => set({ drawer }),

      closeDrawer: () => set({ drawer: null }),

      setSearchOpen: (searchOpen) => set({ searchOpen }),

      dismissLocationPrompt: () => set({ locationPromptDismissed: true }),

      markViewed: (productId) => {
        const next = [productId, ...get().recentlyViewedIds.filter((id) => id !== productId)].slice(
          0,
          MAX_RECENTLY_VIEWED,
        );
        set({ recentlyViewedIds: next });
      },

      clearRecentlyViewed: () => set({ recentlyViewedIds: [] }),

      pushSearch: (term) => {
        const trimmed = term.trim();
        if (trimmed.length < 2) return;
        const next = [trimmed, ...get().recentSearches.filter((value) => value !== trimmed)].slice(0, 6);
        set({ recentSearches: next });
      },

      clearSearches: () => set({ recentSearches: [] }),

      setCompactMode: (compactMode) => set({ compactMode }),
    }),
    {
      name: STORAGE_KEYS.ui,
      version: 1,
      // Toasts and open drawers are session state; only preferences persist.
      partialize: (state) => ({
        recentlyViewedIds: state.recentlyViewedIds,
        recentSearches: state.recentSearches,
        locationPromptDismissed: state.locationPromptDismissed,
        compactMode: state.compactMode,
      }),
    },
  ),
);

/** Convenience helper for non-React code (services, event handlers). */
export function toast(input: Parameters<UiState['pushToast']>[0]): string {
  return useUiStore.getState().pushToast(input);
}
