import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';
import { toast } from './ui.store';

/** Wishlist, persisted locally. Stores product ids only — never a copy of the product. */

interface WishlistState {
  productIds: string[];
  /** Product ids whose wishlist button was just pressed, for the heart animation. */
  recentlyToggled: string[];
  toggle: (productId: string, title?: string) => boolean;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  has: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      recentlyToggled: [],

      toggle: (productId, title) => {
        const exists = get().productIds.includes(productId);
        const productIds = exists
          ? get().productIds.filter((id) => id !== productId)
          : [productId, ...get().productIds];

        set({ productIds, recentlyToggled: [productId] });

        toast(
          exists
            ? { tone: 'info', title: 'উইশলিস্ট থেকে সরানো হয়েছে', description: title }
            : {
                tone: 'success',
                title: 'উইশলিস্টে যোগ করা হয়েছে',
                description: title,
                actionLabel: 'উইশলিস্ট দেখুন',
                actionHref: '/wishlist',
              },
        );

        return !exists;
      },

      add: (productId) =>
        set({
          productIds: get().productIds.includes(productId)
            ? get().productIds
            : [productId, ...get().productIds],
        }),

      remove: (productId) =>
        set({ productIds: get().productIds.filter((id) => id !== productId) }),

      clear: () => set({ productIds: [], recentlyToggled: [] }),

      has: (productId) => get().productIds.includes(productId),
    }),
    {
      name: STORAGE_KEYS.wishlist,
      version: 1,
      partialize: (state) => ({ productIds: state.productIds }),
    },
  ),
);
