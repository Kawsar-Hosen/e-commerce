/**
 * Local shopping cart — the mobile twin of `apps/web/src/store/cart.store.ts`.
 *
 * The store only holds the shopper's *intent* (which variant, how many, which
 * delivery/payment method). Every price shown anywhere in the app is recomputed
 * from the current catalogue through `computeCartTotals()`, so a price change or
 * a stock-out shows up immediately instead of hiding behind a cached number.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CartItem,
  DeliveryMethodId,
  PaymentMethodId,
  Product,
  ProductVariant,
} from '@shobdox/shared-types';
import {
  addLineToCart,
  clampQuantity,
  createCartLine,
  removeLineFromCart,
  updateLineQuantity,
} from '@shobdox/shared-business-logic';
import { STORAGE_KEYS } from '../lib/constants';
import { asyncJsonStorage } from './persist';
import { toast } from './ui.store';

interface CartState {
  items: CartItem[];
  couponCode?: string;
  deliveryMethod: DeliveryMethodId;
  paymentMethod: PaymentMethodId;
  note?: string;
  /** Highlighted right after an add-to-cart action. */
  lastAddedLineId?: string;

  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  incrementItem: (lineId: string) => void;
  decrementItem: (lineId: string) => void;
  removeItem: (lineId: string) => void;
  removeProduct: (productId: string) => void;
  clear: () => void;

  applyCoupon: (code?: string) => void;
  setDeliveryMethod: (method: DeliveryMethodId) => void;
  setPaymentMethod: (method: PaymentMethodId) => void;
  setNote: (note: string) => void;

  /** Replaces lines after a catalogue reprice; keeps the shopper's intent. */
  replaceItems: (items: CartItem[]) => void;
  clearLastAdded: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryMethod: 'standard',
      paymentMethod: 'cod',

      addItem: (product, variant, quantity = 1) => {
        if (variant.stock <= 0) {
          toast({
            tone: 'error',
            title: 'স্টক নেই',
            description: 'এই ভ্যারিয়েন্টটি বর্তমানে স্টকে নেই।',
          });
          return;
        }

        const line = createCartLine(product, variant, clampQuantity(quantity, variant.stock));
        set({ items: addLineToCart(get().items, line), lastAddedLineId: line.id });

        toast({
          tone: 'success',
          title: 'কার্টে যোগ করা হয়েছে',
          description: line.titleBn ?? line.title,
          actionLabel: 'কার্ট দেখুন',
          actionHref: '/(tabs)/cart',
        });
      },

      setQuantity: (lineId, quantity) =>
        set({ items: updateLineQuantity(get().items, lineId, Math.max(1, Math.floor(quantity))) }),

      incrementItem: (lineId) => {
        const line = get().items.find((item) => item.id === lineId);
        if (!line) return;

        const next = line.quantity + 1;
        if (next > line.availableStock) {
          toast({
            tone: 'warning',
            title: 'স্টকের সীমা',
            description: `এই ভ্যারিয়েন্টে সর্বোচ্চ ${line.availableStock} টি যোগ করা যাবে।`,
          });
          return;
        }
        set({ items: updateLineQuantity(get().items, lineId, next) });
      },

      decrementItem: (lineId) => {
        const line = get().items.find((item) => item.id === lineId);
        if (!line) return;

        if (line.quantity <= 1) {
          set({ items: removeLineFromCart(get().items, lineId) });
          return;
        }
        set({ items: updateLineQuantity(get().items, lineId, line.quantity - 1) });
      },

      removeItem: (lineId) => {
        const line = get().items.find((item) => item.id === lineId);
        set({ items: removeLineFromCart(get().items, lineId) });
        if (line) {
          toast({
            tone: 'info',
            title: 'কার্ট থেকে সরানো হয়েছে',
            description: line.titleBn ?? line.title,
          });
        }
      },

      removeProduct: (productId) =>
        set({ items: get().items.filter((item) => item.productId !== productId) }),

      clear: () =>
        set({
          items: [],
          couponCode: undefined,
          note: undefined,
          lastAddedLineId: undefined,
          deliveryMethod: 'standard',
          paymentMethod: 'cod',
        }),

      applyCoupon: (code) => set({ couponCode: code?.trim().toUpperCase() || undefined }),
      setDeliveryMethod: (deliveryMethod) => set({ deliveryMethod }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setNote: (note) => set({ note }),

      replaceItems: (items) => set({ items }),
      clearLastAdded: () => set({ lastAddedLineId: undefined }),
    }),
    {
      name: STORAGE_KEYS.cart,
      version: 1,
      storage: asyncJsonStorage(),
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        deliveryMethod: state.deliveryMethod,
        paymentMethod: state.paymentMethod,
        note: state.note,
      }),
    },
  ),
);

/** Units across every line — powers the tab badge and the header counter. */
export function totalUnits(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}
