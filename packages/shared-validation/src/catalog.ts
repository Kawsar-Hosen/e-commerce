import { z } from 'zod';
import {
  imageUrlField,
  optionalText,
  positiveIntField,
  requiredText,
  slugField,
  takaField,
} from './primitives';

/**
 * Product authoring rules shared by the admin "Add product" screen and the
 * seller "Add product" form, so both write the same shape into demo state.
 */

export const productOptionValueDraftSchema = z.object({
  id: z.string(),
  label: requiredText('ভ্যালুর নাম', 1, 40),
  labelBn: optionalText(40),
  hex: z
    .string()
    .trim()
    .refine((value) => value === '' || /^#[0-9a-fA-F]{6}$/.test(value), 'হেক্স কালার #RRGGBB ফরম্যাটে দিন')
    .optional(),
  priceDelta: z.number().optional(),
  stock: positiveIntField('স্টক', 0, 100_000),
});

export const productOptionDraftSchema = z.object({
  id: z.string(),
  name: requiredText('অপশনের নাম', 1, 30),
  display: z.enum(['swatch', 'chip', 'select']),
  values: z.array(productOptionValueDraftSchema).min(1, 'কমপক্ষে একটি ভ্যালু যোগ করুন'),
});

export const productVariantDraftSchema = z.object({
  id: z.string(),
  sku: z
    .string()
    .trim()
    .min(3, 'SKU কমপক্ষে ৩ অক্ষরের হতে হবে')
    .max(40, 'SKU ৪০ অক্ষরের বেশি হতে পারে না'),
  optionValues: z.record(z.string(), z.string()),
  price: takaField('দাম', 1),
  compareAtPrice: z.number().optional(),
  stock: positiveIntField('স্টক', 0, 100_000),
});

export const productFormSchema = z
  .object({
    title: requiredText('পণ্যের নাম', 3, 140),
    titleBn: optionalText(140),
    slug: slugField,
    shortDescription: requiredText('সংক্ষিপ্ত বিবরণ', 10, 200),
    description: requiredText('বিবরণ', 20, 4000),
    descriptionBn: optionalText(4000),

    categoryId: z.string().min(1, 'ক্যাটাগরি নির্বাচন করুন'),
    brandId: z.string().optional(),
    sellerId: z.string().min(1, 'সেলার নির্বাচন করুন'),

    thumbnail: imageUrlField,
    gallery: z.array(imageUrlField).default([]),

    price: takaField('দাম', 1),
    compareAtPrice: z.number().optional(),
    stock: positiveIntField('স্টক', 0, 100_000),
    sku: z.string().trim().min(3, 'SKU কমপক্ষে ৩ অক্ষরের হতে হবে').max(40),

    warranty: optionalText(80),
    returnPolicyDays: positiveIntField('রিটার্ন সময়', 0, 60),
    tags: z.array(z.string().trim().min(1)).default([]),
    badges: z.array(z.string()).default([]),

    status: z.enum(['active', 'draft', 'archived']),
    isFeatured: z.boolean().default(false),
    isTrending: z.boolean().default(false),
    isBestSeller: z.boolean().default(false),
    isNewArrival: z.boolean().default(true),
    isFlashSale: z.boolean().default(false),

    deliveryFeeInsideDhaka: takaField('ঢাকার ভেতরে ডেলিভারি ফি', 0, 2000),
    deliveryFeeOutsideDhaka: takaField('ঢাকার বাইরে ডেলিভারি ফি', 0, 2000),

    options: z.array(productOptionDraftSchema).default([]),
    variants: z.array(productVariantDraftSchema).min(1, 'কমপক্ষে একটি ভ্যারিয়েন্ট থাকতে হবে'),

    specifications: z
      .array(
        z.object({
          label: requiredText('স্পেসিফিকেশনের নাম', 1, 40),
          value: requiredText('স্পেসিফিকেশনের মান', 1, 120),
        }),
      )
      .default([]),
  })
  .refine(
    (values) => values.compareAtPrice === undefined || values.compareAtPrice > values.price,
    { error: 'আগের দাম বর্তমান দামের চেয়ে বেশি হতে হবে', path: ['compareAtPrice'] },
  )
  .refine((values) => new Set(values.variants.map((variant) => variant.sku)).size === values.variants.length, {
    error: 'একই SKU দুবার ব্যবহার করা যাবে না',
    path: ['variants'],
  });

export const categoryFormSchema = z.object({
  name: requiredText('ক্যাটাগরির নাম', 2, 60),
  nameBn: requiredText('বাংলা নাম', 2, 60),
  slug: slugField,
  description: requiredText('বিবরণ', 10, 300),
  icon: z.string().trim().min(1, 'আইকন নির্বাচন করুন'),
  accent: z.enum(['green', 'amber', 'blue', 'purple', 'cyan', 'slate']),
  parentId: z.string().optional(),
  isFeatured: z.boolean().default(false),
  displayOrder: positiveIntField('ক্রম', 0, 999),
});

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, 'কোড কমপক্ষে ৩ অক্ষরের হতে হবে')
      .max(20, 'কোড ২০ অক্ষরের বেশি হতে পারে না')
      .regex(/^[A-Z0-9-]+$/i, 'কোডে শুধু অক্ষর, সংখ্যা ও হাইফেন চলবে')
      .transform((value) => value.toUpperCase()),
    title: requiredText('শিরোনাম', 3, 80),
    description: requiredText('বিবরণ', 5, 200),
    type: z.enum(['percentage', 'fixed', 'free-delivery']),
    value: takaField('মান', 0, 1_000_000),
    maxDiscount: z.number().optional(),
    minOrderValue: takaField('সর্বনিম্ন অর্ডার', 0, 1_000_000),
    usageLimit: positiveIntField('ব্যবহারের সীমা', 1, 1_000_000),
    usageLimitPerCustomer: positiveIntField('প্রতি গ্রাহকের সীমা', 1, 100),
    startsAt: z.string().trim().min(1, 'শুরুর তারিখ দিন'),
    expiresAt: z.string().trim().min(1, 'শেষের তারিখ দিন'),
    isActive: z.boolean().default(true),
    categoryIds: z.array(z.string()).default([]),
  })
  .refine((values) => values.type !== 'percentage' || values.value <= 100, {
    error: 'শতকরা ছাড় ১০০ এর বেশি হতে পারে না',
    path: ['value'],
  })
  .refine((values) => new Date(values.expiresAt) > new Date(values.startsAt), {
    error: 'শেষের তারিখ শুরুর তারিখের পরে হতে হবে',
    path: ['expiresAt'],
  });

export const bannerFormSchema = z.object({
  title: requiredText('শিরোনাম', 3, 100),
  subtitle: requiredText('উপশিরোনাম', 3, 200),
  ctaLabel: requiredText('বাটনের লেখা', 2, 30),
  href: z.string().trim().min(1, 'লিংক দিন').regex(/^\/|^https?:\/\//, 'লিংক / অথবা http(s):// দিয়ে শুরু করুন'),
  theme: z.enum(['primary', 'accent', 'dark', 'soft']),
  placement: z.enum(['hero', 'strip', 'category', 'footer']),
  displayOrder: positiveIntField('ক্রম', 0, 99),
  isActive: z.boolean().default(true),
  startsAt: z.string().trim().min(1, 'শুরুর তারিখ দিন'),
  endsAt: z.string().trim().min(1, 'শেষের তারিখ দিন'),
});

export const sellerStoreProfileSchema = z.object({
  storeName: requiredText('দোকানের নাম', 3, 80),
  storeNameBn: optionalText(80),
  tagline: requiredText('ট্যাগলাইন', 5, 120),
  description: requiredText('বিবরণ', 20, 1000),
  tradeLicense: optionalText(40),
  tin: optionalText(20),
  pickupAddress: requiredText('পিকআপ ঠিকানা', 10, 300),
  supportPhone: z.string().trim().min(1, 'সাপোর্ট নম্বর দিন'),
  supportEmail: z.union([z.literal(''), z.email('সঠিক ইমেইল দিন')]).optional(),
  returnPolicyDays: positiveIntField('রিটার্ন সময়', 0, 60),
  shipsWithinDays: positiveIntField('শিপিং সময়', 1, 30),
});

export const sellerSettingsSchema = z.object({
  autoAcceptOrders: z.boolean(),
  notifyNewOrders: z.boolean(),
  notifyLowStock: z.boolean(),
  lowStockThreshold: positiveIntField('স্টক সতর্কতা', 1, 1000),
  holidayMode: z.boolean(),
  holidayMessage: optionalText(200),
  payoutMethod: z.enum(['bank-transfer', 'bkash', 'nagad']),
});

export const inventoryUpdateSchema = z.object({
  variantId: z.string().min(1),
  stock: positiveIntField('স্টক', 0, 100_000),
  price: takaField('দাম', 1),
  compareAtPrice: z.number().optional(),
});

export type ProductFormValues = z.input<typeof productFormSchema>;
export type ProductFormParsed = z.output<typeof productFormSchema>;
export type CategoryFormValues = z.input<typeof categoryFormSchema>;
export type CouponFormValues = z.input<typeof couponFormSchema>;
export type CouponFormParsed = z.output<typeof couponFormSchema>;
export type BannerFormValues = z.input<typeof bannerFormSchema>;
export type SellerStoreProfileValues = z.input<typeof sellerStoreProfileSchema>;
export type SellerSettingsValues = z.infer<typeof sellerSettingsSchema>;
export type InventoryUpdateValues = z.input<typeof inventoryUpdateSchema>;
