import type {
  AppNotification,
  CustomerRow,
  InventoryAlert,
  Order,
  Product,
  ReportSummary,
  Seller,
  User,
} from '@shobdox/shared-types';
import { buildPayoutHistory, computeInventoryAlerts, LOW_STOCK_THRESHOLD } from '@shobdox/shared-business-logic';

/** Notifications, admin customer rows, payouts and report definitions. */

const DAY = 86_400_000;
const now = Date.now();
const iso = (offsetDays: number) => new Date(now + offsetDays * DAY).toISOString();

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'ntf-1',
    kind: 'order',
    title: 'অর্ডার ডেলিভারির পথে',
    body: 'আপনার অর্ডার SDX-2026-001008 ডেলিভারির জন্য বের হয়েছে।',
    createdAt: new Date(now - 2 * 3_600_000).toISOString(),
    read: false,
    href: '/account/orders',
  },
  {
    id: 'ntf-2',
    kind: 'price-drop',
    title: 'দাম কমেছে',
    body: 'আপনার উইশলিস্টে থাকা পণ্যটির দাম ১২% কমেছে।',
    createdAt: new Date(now - 9 * 3_600_000).toISOString(),
    read: false,
    href: '/wishlist',
  },
  {
    id: 'ntf-3',
    kind: 'promotion',
    title: 'ফ্ল্যাশ সেল শুরু',
    body: 'আজ রাত ১২টা পর্যন্ত নির্বাচিত পণ্যে ৪৫% পর্যন্ত ছাড়।',
    createdAt: new Date(now - 26 * 3_600_000).toISOString(),
    read: false,
    href: '/shop?flash=1',
  },
  {
    id: 'ntf-4',
    kind: 'order',
    title: 'অর্ডার নিশ্চিত হয়েছে',
    body: 'অর্ডার SDX-2026-001009 নিশ্চিত করা হয়েছে।',
    createdAt: iso(-2),
    read: true,
    href: '/account/orders',
  },
  {
    id: 'ntf-5',
    kind: 'account',
    title: 'নতুন লগইন শনাক্ত',
    body: 'ঢাকা থেকে একটি নতুন ডিভাইসে সাইন-ইন হয়েছে। এটি ডেমো সেশন।',
    createdAt: iso(-4),
    read: true,
    href: '/account',
  },
  {
    id: 'ntf-6',
    kind: 'system',
    title: 'ডেমো ডেটা রিসেট',
    body: 'এই অ্যাপ্লিকেশনটি সম্পূর্ণ ডেমো। কোনো প্রকৃত পেমেন্ট বা অর্ডার প্রক্রিয়া হচ্ছে না।',
    createdAt: iso(-6),
    read: true,
  },
];

/** Aggregates demo customers into the rows the admin customer table renders. */
export function buildCustomerRows(customers: User[], orders: Order[]): CustomerRow[] {
  return customers.map((customer) => {
    const customerOrders = orders.filter((order) => order.customerId === customer.id);
    const totalSpent = customerOrders.reduce((total, order) => total + order.totals.total, 0);
    const lastOrder = customerOrders
      .map((order) => order.placedAt)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

    const segment: CustomerRow['segment'] =
      totalSpent >= 50_000
        ? 'vip'
        : customerOrders.length >= 3
          ? 'returning'
          : customerOrders.length === 0
            ? 'new'
            : lastOrder && Date.now() - new Date(lastOrder).getTime() > 60 * DAY
              ? 'at-risk'
              : 'returning';

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      district: customer.addresses[0]?.district ?? '—',
      orders: customerOrders.length,
      totalSpent,
      averageOrderValue: customerOrders.length > 0 ? Math.round(totalSpent / customerOrders.length) : 0,
      lastOrderAt: lastOrder,
      joinedAt: customer.createdAt,
      segment,
      status: 'active',
    };
  });
}

/** Extra demo customers so the admin table has enough rows to paginate. */
export const EXTRA_CUSTOMER_ROWS: CustomerRow[] = [
  ['রাশেদুল করিম', '01312345678', 'Dhaka', 8, 96_400, 'vip'],
  ['ফাহমিদা বেগম', '01412345678', 'Chattogram', 5, 38_900, 'returning'],
  ['শাকিল আহমেদ', '01712345679', 'Dhaka', 3, 12_450, 'returning'],
  ['জান্নাতুল ফেরদৌস', '01812345679', 'Sylhet', 1, 2_390, 'new'],
  ['আব্দুল্লাহ আল মামুন', '01912345679', 'Khulna', 6, 54_200, 'vip'],
  ['রুবিনা আক্তার', '01612345679', 'Rajshahi', 2, 5_180, 'at-risk'],
  ['সাইফুল ইসলাম', '01512345679', 'Barishal', 4, 21_600, 'returning'],
  ['মিতু রানী দাস', '01312345680', 'Rangpur', 1, 1_890, 'new'],
  ['হাসান মাহমুদ', '01412345680', 'Mymensingh', 7, 68_300, 'vip'],
  ['নাফিসা তাবাসসুম', '01912345680', 'Dhaka', 3, 16_800, 'returning'],
  ['কামরুল হাসান', '01712345681', 'Cumilla', 2, 7_640, 'at-risk'],
  ['সাবরিনা চৌধুরী', '01812345681', 'Chattogram', 5, 42_100, 'returning'],
].map(([name, phone, district, orders, spent, segment], index) => ({
  id: `user-extra-${index + 1}`,
  name: String(name),
  phone: String(phone),
  district: String(district),
  orders: Number(orders),
  totalSpent: Number(spent),
  averageOrderValue: Math.round(Number(spent) / Math.max(1, Number(orders))),
  lastOrderAt: iso(-(index + 1) * 3),
  joinedAt: iso(-(60 + index * 14)),
  segment: segment as CustomerRow['segment'],
  status: 'active',
}));

export function buildPayoutsForSeller(seller: Seller, sellerRevenue: number) {
  return buildPayoutHistory({
    sellerId: seller.id,
    weeklyNetEarnings: Math.max(4_200, Math.round((sellerRevenue * (1 - seller.commissionRate / 100)) / 26)),
    count: 8,
    seed: seller.id.length * 977,
  });
}

/** Inventory alerts for the admin dashboard, derived from the live catalogue. */
export function buildAdminInventoryAlerts(products: Product[]): InventoryAlert[] {
  return computeInventoryAlerts(products, 10);
}

export const MOCK_REPORTS: ReportSummary[] = [
  { id: 'rep-sales', name: 'দৈনিক বিক্রয় রিপোর্ট', description: 'প্রতিদিনের আয়, অর্ডার ও গড় অর্ডার মূল্য।', format: 'CSV', updatedAt: iso(0) },
  { id: 'rep-products', name: 'পণ্য পারফরম্যান্স', description: 'সবচেয়ে বেশি বিক্রি হওয়া পণ্য ও ক্যাটাগরি।', format: 'CSV', updatedAt: iso(-1) },
  { id: 'rep-inventory', name: 'স্টক রিপোর্ট', description: 'স্টক কম এমন ভ্যারিয়েন্ট ও SKU তালিকা।', format: 'CSV', updatedAt: iso(-1) },
  { id: 'rep-customers', name: 'গ্রাহক সেগমেন্ট', description: 'নতুন, রিটার্নিং ও ভিআইপি গ্রাহকের বিশ্লেষণ।', format: 'PDF', updatedAt: iso(-3) },
  { id: 'rep-commission', name: 'সেলার কমিশন', description: 'প্রতি সেলারের গ্রস সেলস ও কমিশন হিসাব।', format: 'PDF', updatedAt: iso(-5) },
  { id: 'rep-coupons', name: 'কুপন ব্যবহার', description: 'কোন কুপন কতবার ব্যবহৃত হয়েছে।', format: 'CSV', updatedAt: iso(-2) },
];

/** Threshold used by the seller store settings screen. */
export const DEFAULT_LOW_STOCK_THRESHOLD = LOW_STOCK_THRESHOLD;
