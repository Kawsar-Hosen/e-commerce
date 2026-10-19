import type { Brand } from '@shobdox/shared-types';

/**
 * A mix of global and Bangladeshi brands. Logos are intentionally text
 * wordmarks: no unlicensed brand artwork is shipped with this demo.
 */
export const MOCK_BRANDS: Brand[] = [
  { id: 'brand-samsung', slug: 'samsung', name: 'Samsung', nameBn: 'স্যামসাং', wordmark: 'SAMSUNG', description: 'গ্লোবাল ইলেকট্রনিক্স ও মোবাইল ব্র্যান্ড', origin: 'South Korea', productCount: 0, isFeatured: true },
  { id: 'brand-xiaomi', slug: 'xiaomi', name: 'Xiaomi', nameBn: 'শাওমি', wordmark: 'XIAOMI', description: 'স্মার্টফোন ও স্মার্ট হোম ডিভাইস', origin: 'China', productCount: 0, isFeatured: true },
  { id: 'brand-walton', slug: 'walton', name: 'Walton', nameBn: 'ওয়ালটন', wordmark: 'WALTON', description: 'বাংলাদেশের শীর্ষস্থানীয় ইলেকট্রনিক্স ব্র্যান্ড', origin: 'Bangladesh', productCount: 0, isFeatured: true },
  { id: 'brand-realme', slug: 'realme', name: 'realme', nameBn: 'রিয়েলমি', wordmark: 'realme', description: 'তরুণদের পছন্দের স্মার্টফোন', origin: 'China', productCount: 0, isFeatured: false },
  { id: 'brand-apple', slug: 'apple', name: 'Apple', nameBn: 'অ্যাপল', wordmark: 'APPLE', description: 'প্রিমিয়াম কনজিউমার টেকনোলজি', origin: 'USA', productCount: 0, isFeatured: true },
  { id: 'brand-anker', slug: 'anker', name: 'Anker', nameBn: 'অ্যাঙ্কার', wordmark: 'ANKER', description: 'চার্জিং ও পাওয়ার ব্যাংক', origin: 'USA', productCount: 0, isFeatured: false },
  { id: 'brand-boat', slug: 'boat', name: 'boAt', nameBn: 'বোট', wordmark: 'boAt', description: 'অডিও ও অ্যাকসেসরিজ', origin: 'India', productCount: 0, isFeatured: false },
  { id: 'brand-aarong', slug: 'aarong', name: 'Aarong', nameBn: 'আড়ং', wordmark: 'Aarong', description: 'বাঙালি ঐতিহ্যের হস্তশিল্প ও পোশাক', origin: 'Bangladesh', productCount: 0, isFeatured: true },
  { id: 'brand-easy', slug: 'easy', name: 'Easy', nameBn: 'ইজি', wordmark: 'easy', description: 'বাংলাদেশের জনপ্রিয় ক্যাজুয়াল পোশাক ব্র্যান্ড', origin: 'Bangladesh', productCount: 0, isFeatured: true },
  { id: 'brand-bata', slug: 'bata', name: 'Bata', nameBn: 'বাটা', wordmark: 'BATA', description: 'জুতা ও ফ্যাশন অ্যাকসেসরিজ', origin: 'Switzerland', productCount: 0, isFeatured: false },
  { id: 'brand-lotto', slug: 'lotto', name: 'Lotto', nameBn: 'লটো', wordmark: 'Lotto', description: 'স্পোর্টস ফ্যাশন ও জুতা', origin: 'Italy', productCount: 0, isFeatured: false },
  { id: 'brand-maybelline', slug: 'maybelline', name: 'Maybelline', nameBn: 'মেবেলিন', wordmark: 'MAYBELLINE', description: 'মেকআপ ও বিউটি প্রোডাক্ট', origin: 'USA', productCount: 0, isFeatured: true },
  { id: 'brand-nivea', slug: 'nivea', name: 'Nivea', nameBn: 'নিভিয়া', wordmark: 'NIVEA', description: 'স্কিন কেয়ার বিশেষজ্ঞ', origin: 'Germany', productCount: 0, isFeatured: false },
  { id: 'brand-aci', slug: 'aci', name: 'ACI Pure', nameBn: 'এসিআই পিওর', wordmark: 'ACI PURE', description: 'নিরাপদ খাদ্যপণ্য ও মসলা', origin: 'Bangladesh', productCount: 0, isFeatured: true },
  { id: 'brand-ispahani', slug: 'ispahani', name: 'Ispahani', nameBn: 'ইস্পাহানী', wordmark: 'ISPAHANI', description: 'চা ও খাদ্যপণ্য', origin: 'Bangladesh', productCount: 0, isFeatured: false },
  { id: 'brand-pran', slug: 'pran', name: 'PRAN', nameBn: 'প্রাণ', wordmark: 'PRAN', description: 'খাদ্য ও পানীয়', origin: 'Bangladesh', productCount: 0, isFeatured: true },
  { id: 'brand-rfl', slug: 'rfl', name: 'RFL', nameBn: 'আরএফএল', wordmark: 'RFL', description: 'প্লাস্টিক, ফার্নিচার ও হোম প্রোডাক্ট', origin: 'Bangladesh', productCount: 0, isFeatured: false },
  { id: 'brand-prestige', slug: 'prestige', name: 'Prestige', nameBn: 'প্রেস্টিজ', wordmark: 'Prestige', description: 'কুকওয়্যার ও কিচেন ইউটেনসিল', origin: 'India', productCount: 0, isFeatured: false },
  { id: 'brand-cosco', slug: 'cosco', name: 'Cosco', nameBn: 'কসকো', wordmark: 'COSCO', description: 'স্পোর্টস সামগ্রী', origin: 'India', productCount: 0, isFeatured: false },
  { id: 'brand-casio', slug: 'casio', name: 'Casio', nameBn: 'ক্যাসিও', wordmark: 'CASIO', description: 'ঘড়ি ও ক্যালকুলেটর', origin: 'Japan', productCount: 0, isFeatured: true },
];

export const FEATURED_BRAND_SLUGS = MOCK_BRANDS.filter((brand) => brand.isFeatured).map((brand) => brand.slug);
