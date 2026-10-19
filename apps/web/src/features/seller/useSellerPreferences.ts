import { useCallback, useEffect, useState } from 'react';

/**
 * Seller dashboard preferences.
 *
 * There is no server and no seller-settings column in the demo dataset, so the
 * values live in `localStorage` under a seller-scoped key. The settings screen
 * states plainly that nothing is emailed or posted anywhere.
 */

export interface SellerPreferences {
  notifyNewOrders: boolean;
  notifyLowStock: boolean;
  lowStockThreshold: number;
  weeklySummaryEmail: boolean;
}

export const DEFAULT_SELLER_PREFERENCES: SellerPreferences = {
  notifyNewOrders: true,
  notifyLowStock: true,
  lowStockThreshold: 8,
  weeklySummaryEmail: false,
};

function storageKey(sellerId: string): string {
  return `shobdox.seller-prefs.v1.${sellerId}`;
}

function readPreferences(sellerId: string): SellerPreferences {
  if (typeof window === 'undefined') return DEFAULT_SELLER_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(storageKey(sellerId));
    if (!raw) return DEFAULT_SELLER_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<SellerPreferences>;
    return {
      notifyNewOrders: parsed.notifyNewOrders ?? DEFAULT_SELLER_PREFERENCES.notifyNewOrders,
      notifyLowStock: parsed.notifyLowStock ?? DEFAULT_SELLER_PREFERENCES.notifyLowStock,
      lowStockThreshold:
        typeof parsed.lowStockThreshold === 'number' && parsed.lowStockThreshold > 0
          ? parsed.lowStockThreshold
          : DEFAULT_SELLER_PREFERENCES.lowStockThreshold,
      weeklySummaryEmail: parsed.weeklySummaryEmail ?? DEFAULT_SELLER_PREFERENCES.weeklySummaryEmail,
    };
  } catch {
    return DEFAULT_SELLER_PREFERENCES;
  }
}

export function useSellerPreferences(sellerId: string): {
  preferences: SellerPreferences;
  save: (next: SellerPreferences) => void;
} {
  const [preferences, setPreferences] = useState<SellerPreferences>(() => readPreferences(sellerId));

  useEffect(() => {
    setPreferences(readPreferences(sellerId));
  }, [sellerId]);

  const save = useCallback(
    (next: SellerPreferences) => {
      setPreferences(next);
      try {
        window.localStorage.setItem(storageKey(sellerId), JSON.stringify(next));
      } catch {
        // Private-mode storage failures must not break the demo.
      }
    },
    [sellerId],
  );

  return { preferences, save };
}
