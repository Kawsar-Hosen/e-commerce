import type { Announcement, Banner } from '@shobdox/shared-types';

/** Homepage banners, announcement bar copy and the static marketing content. */

const DAY = 86_400_000;
const now = Date.now();
const iso = (offsetDays: number) => new Date(now + offsetDays * DAY).toISOString();

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    message: 'Free delivery on orders over ৳5,000 — nationwide',
    messageBn: '৫,০০০ টাকার উপরে অর্ডারে সারা দেশে ফ্রি ডেলিভারি',
    href: '/shop?sort=discount',
    tone: 'primary',
    isActive: true,
  },
  {
    id: 'ann-2',
    message: 'Flash sale is live — up to 45% off today',
    messageBn: 'ফ্ল্যাশ সেল চলছে — আজ ৪৫% পর্যন্ত ছাড়',
    href: '/shop?flash=1',
    tone: 'accent',
    isActive: true,
  },
  {
    id: 'ann-3',
    message: 'Cash on delivery available in all 64 districts',
    messageBn: '৬৪ জেলায় ক্যাশ অন ডেলিভারি সুবিধা',
    tone: 'dark',
    isActive: true,
  },
];

export const MOCK_BANNERS: Banner[] = [
  {
    id: 'bn-hero-1',
    title: 'ঈদ উপলক্ষে বিশাল ছাড়',
    subtitle: 'ফ্যাশন, ইলেকট্রনিক্স ও হোম অ্যাপ্লায়েন্সে ৪৫% পর্যন্ত ছাড়। সারা দেশে দ্রুত ডেলিভারি।',
    ctaLabel: 'এখনই কিনুন',
    href: '/shop?sort=discount',
    theme: 'primary',
    placement: 'hero',
    displayOrder: 1,
    isActive: true,
    startsAt: iso(-30),
    endsAt: iso(30),
  },
  {
    id: 'bn-hero-2',
    title: 'স্মার্টফোন মেলা ২০২৬',
    subtitle: 'স্যামসাং, শাওমি ও রিয়েলমির সর্বশেষ মডেল — অফিসিয়াল ওয়ারেন্টি ও ইএমআই সুবিধাসহ।',
    ctaLabel: 'ফোন দেখুন',
    href: '/category/smartphones',
    theme: 'dark',
    placement: 'hero',
    displayOrder: 2,
    isActive: true,
    startsAt: iso(-20),
    endsAt: iso(40),
  },
  {
    id: 'bn-strip-1',
    title: 'তাঁতিদের সেরা শাড়ি',
    subtitle: 'টাঙ্গাইলের হাতে বোনা জামদানি, ন্যায্য দামে।',
    ctaLabel: 'শাড়ি দেখুন',
    href: '/category/womens-fashion',
    theme: 'soft',
    placement: 'strip',
    displayOrder: 1,
    isActive: true,
    startsAt: iso(-60),
    endsAt: iso(60),
  },
  {
    id: 'bn-strip-2',
    title: 'গ্রোসারি সেভিং সপ্তাহ',
    subtitle: 'চাল, তেল, মসলা — নিত্যপ্রয়োজনীয় পণ্যে ছাড়।',
    ctaLabel: 'অর্ডার করুন',
    href: '/category/grocery',
    theme: 'accent',
    placement: 'strip',
    displayOrder: 2,
    isActive: true,
    startsAt: iso(-10),
    endsAt: iso(50),
  },
];

/* --------------------------------------------------------- marketing content */

export interface CustomerBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const CUSTOMER_BENEFITS: CustomerBenefit[] = [
  {
    id: 'delivery',
    icon: 'Truck',
    title: 'সারা দেশে ডেলিভারি',
    description: '৬৪ জেলায় হোম ডেলিভারি, ঢাকার ভেতরে ১–২ দিনে।',
  },
  {
    id: 'cod',
    icon: 'Wallet',
    title: 'ক্যাশ অন ডেলিভারি',
    description: 'পণ্য হাতে পেয়ে টাকা পরিশোধ করার সুবিধা।',
  },
  {
    id: 'return',
    icon: 'RotateCcw',
    title: 'সহজ রিটার্ন',
    description: '৭ দিনের মধ্যে অমিল পণ্য ফেরত দেওয়ার সুযোগ।',
  },
  {
    id: 'support',
    icon: 'Headphones',
    title: 'বাংলায় সাপোর্ট',
    description: 'সকাল ৯টা থেকে রাত ৯টা পর্যন্ত বাংলায় সহায়তা।',
  },
];

export interface FooterColumn {
  id: string;
  title: string;
  links: Array<{ label: string; href: string }>;
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: 'shop',
    title: 'কেনাকাটা',
    links: [
      { label: 'সব পণ্য', href: '/shop' },
      { label: 'ফ্ল্যাশ সেল', href: '/shop?flash=1' },
      { label: 'ব্র্যান্ড', href: '/brands' },
      { label: 'সবচেয়ে বেশি ছাড়', href: '/shop?sort=discount' },
    ],
  },
  {
    id: 'account',
    title: 'আমার অ্যাকাউন্ট',
    links: [
      { label: 'প্রোফাইল', href: '/account' },
      { label: 'অর্ডার হিস্ট্রি', href: '/account/orders' },
      { label: 'উইশলিস্ট', href: '/wishlist' },
      { label: 'ঠিকানা বই', href: '/account/addresses' },
    ],
  },
  {
    id: 'help',
    title: 'সহায়তা',
    links: [
      { label: 'ডেলিভারি তথ্য', href: '/help/delivery' },
      { label: 'রিটার্ন নীতি', href: '/help/returns' },
      { label: 'কীভাবে পেমেন্ট করবেন', href: '/help/payment' },
      { label: 'অর্ডার ট্র্যাকিং', href: '/track' },
      { label: 'যোগাযোগ', href: '/help/contact' },
    ],
  },
  {
    id: 'company',
    title: 'শব্দক্স',
    links: [
      { label: 'আমাদের সম্পর্কে', href: '/help/about' },
      { label: 'সেলার হোন', href: '/seller' },
      { label: 'সাধারণ জিজ্ঞাসা', href: '/help/faq' },
      { label: 'গোপনীয়তা নীতি', href: '/help/privacy' },
      { label: 'শর্তাবলি', href: '/help/terms' },
    ],
  },
];

/** Payment methods advertised in the footer. All are demo interfaces only. */
export const FOOTER_PAYMENT_METHODS = ['bKash', 'Nagad', 'Rocket', 'Cash on Delivery'];

export const DELIVERY_PARTNERS = ['SHOBDOX Express', 'Pathao Courier', 'RedX', 'Sundarban Courier'];
