/**
 * "ডেমো ডেটা রিসেট" and sign-out helpers.
 *
 * Kept outside the stores so no store has to import the others (which would
 * create a cycle). Screens call these from the account tab.
 */

import { useAuthStore } from './auth.store';
import { useCartStore } from './cart.store';
import { useDataStore } from './data.store';
import { useUiStore } from './ui.store';
import { useWishlistStore } from './wishlist.store';

export interface ResetSummary {
  products: number;
  orders: number;
}

/** Wipes the session, the cart, the wishlist and all recent-activity memory. */
export function resetEverything(): ResetSummary {
  useDataStore.getState().resetDemoData();
  useCartStore.getState().clear();
  useWishlistStore.getState().clear();
  useAuthStore.getState().signOut();
  useUiStore.getState().clearToasts();
  useUiStore.getState().clearRecentSearches();
  useUiStore.getState().clearRecentlyViewed();

  const state = useDataStore.getState();
  return { products: state.products.length, orders: state.orders.length };
}

/** Signs out and drops the persisted session key, keeping the demo catalogue. */
export async function signOutAndClear(): Promise<void> {
  useCartStore.getState().clear();
  useWishlistStore.getState().clear();
  useAuthStore.getState().signOut();
  await useAuthStore.persist.clearStorage();
}
