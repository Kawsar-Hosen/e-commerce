/**
 * Cross-cutting constants for the Android app.
 *
 * Colours and sizes never live here — those come from
 * `@shobdox/design-tokens`. This file only holds copy and storage keys.
 */

export const APP_NAME = 'SHOBDOX';
export const APP_TAGLINE = 'বাংলার ডিজিটাল বাজার';
export const SUPPORT_PHONE = '09612345678';

/**
 * `AsyncStorage` keys, versioned so a schema change can be migrated (or
 * dropped) without reading a stale shape.
 */
export const STORAGE_KEYS = {
  data: 'shobdox.mobile.data.v1',
  cart: 'shobdox.mobile.cart.v1',
  wishlist: 'shobdox.mobile.wishlist.v1',
  auth: 'shobdox.mobile.auth.v1',
  ui: 'shobdox.mobile.ui.v1',
} as const;

/**
 * Mandatory demo framing. Shown on the cart, the checkout and every order
 * surface: no gateway is contacted, no payment data is collected and the order
 * is stored on this device only.
 */
export const DEMO_PAYMENT_NOTICE =
  'এটি একটি ডেমো চেকআউট। কোনো প্রকৃত পেমেন্ট হবে না, কার্ড/ওয়ালেট নম্বর সংগ্রহ করা হয় না এবং অর্ডারটি শুধু এই ডিভাইসে সংরক্ষিত হয়।';

export const DEMO_DATA_NOTICE =
  'এই অ্যাপটি একটি ইন্টারঅ্যাকটিভ ডেমো। পণ্য, দাম, অর্ডার ও গ্রাহক — সবই নমুনা ডেটা।';

/** Confirmed demo orders are always numbered `SDX-DEMO-000000`. */
export const DEMO_ORDER_PREFIX = 'SDX-DEMO';

/** Products per page in the grid screens. */
export const DEFAULT_PAGE_SIZE = 12;

/** How long the toast stays on screen when it has no action. */
export const TOAST_DURATION_MS = 4_000;

/** Products kept in the "recently viewed" list used by the home rail. */
export const MAX_RECENTLY_VIEWED = 12;
export const MAX_RECENT_SEARCHES = 8;
