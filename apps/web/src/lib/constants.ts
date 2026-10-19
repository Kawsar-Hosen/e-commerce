/** Cross-cutting web-app constants. */

export const APP_NAME = 'SHOBDOX';
export const APP_TAGLINE = 'বাংলার ডিজিটাল বাজার';
export const SUPPORT_PHONE = '09612345678';

/** `localStorage` keys. Versioned so a schema change can be migrated cleanly. */
export const STORAGE_KEYS = {
  data: 'shobdox.data.v1',
  cart: 'shobdox.cart.v1',
  wishlist: 'shobdox.wishlist.v1',
  auth: 'shobdox.auth.v1',
  ui: 'shobdox.ui.v1',
} as const;

/** Banner copy that must appear wherever a payment step is shown. */
export const DEMO_PAYMENT_NOTICE =
  'এটি একটি ডেমো চেকআউট। কোনো প্রকৃত পেমেন্ট হবে না, কোনো পেমেন্ট তথ্য সংগ্রহ করা হয় না এবং অর্ডারটি শুধু এই ব্রাউজারে সংরক্ষিত হয়।';

export const DEMO_ORDER_PREFIX = 'SDX-DEMO';

export const DEFAULT_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 10;

/** Rows per page in the admin/seller tables at each breakpoint ceiling. */
export const TABLE_PAGE_SIZES = [10, 25, 50] as const;
