/**
 * Wishlist, persisted locally.
 *
 * Product ids only — never a copy of the product, so stale prices cannot leak
 * into the UI: the saved list is always re-read from the live catalogue.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../lib/constants';
import { asyncJsonStorage } from './persist';
import { toast } from './ui.store';

interface WishlistState {
  productIds: string[];
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

      toggle: (productId, title) => {
        const exists = get().productIds.includes(productId);
        set({
          productIds: exists
            ? get().productIds.filter((id) => id !== productId)
            : [productId, ...get().productIds],
        });

        if (exists) {
          toast({ tone: 'info', title: 'উইশলিস্ট থেকে সরানো হয়েছে', description: title });
        } else {
          toast({
            tone: 'success',
            title: 'উইশলিস্টে যোগ করা হয়েছে',
            description: title,
            actionLabel: 'উইশলিস্ট দেখুন',
            actionHref: '/(tabs)/wishlist',
          });
        }

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

      clear: () => set({ productIds: [] }),

      has: (productId) => get().productIds.includes(productId),
    }),
    {
      name: STORAGE_KEYS.wishlist,
      version: 1,
      storage: asyncJsonStorage(),
      partialize: (state) => ({ productIds: state.productIds }),
    },
  ),
);
