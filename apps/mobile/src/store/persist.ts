/**
 * Shared persistence helpers.
 *
 * Every store persists through `AsyncStorage` instead of the browser's
 * `localStorage`, but the *shape* of what is persisted stays identical to the
 * web app: shopper intent only, never derived values.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** JSON storage adapter for zustand's `persist` middleware. */
export function asyncJsonStorage() {
  return createJSONStorage(() => AsyncStorage);
}

/** Clears every SHOBDOX key — used by the demo-data reset and by sign-out. */
export async function clearStorageKeys(keys: string[]): Promise<void> {
  await AsyncStorage.multiRemove(keys);
}
