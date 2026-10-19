import { z } from 'zod';
import {
  bdPhoneField,
  divisionField,
  optionalBdPhoneField,
  optionalEmailField,
  optionalText,
  personNameField,
  requiredText,
} from './primitives';

const AREA_FREE_TEXT = 'এলাকা বা থানার নাম লিখুন';

export const addressSchema = z.object({
  label: optionalText(30),
  fullName: personNameField,
  phone: bdPhoneField,
  email: optionalEmailField,
  division: divisionField,
  district: requiredText('জেলা', 2, 60),
  area: requiredText('এলাকা', 2, 80).or(z.literal('')).refine((value) => value.length >= 2, {
    error: AREA_FREE_TEXT,
  }),
  addressLine: requiredText('সম্পূর্ণ ঠিকানা', 10, 300),
  landmark: optionalText(120),
  postcode: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{4}$/.test(value), '৪ ডিজিটের পোস্ট কোড দিন')
    .transform((value) => (value === '' ? undefined : value)),
  isDefault: z.boolean().default(false),
});

/**
 * Checkout. Only the fields the demo actually needs; the payment step is
 * intentionally absent because no gateway is contacted in this phase.
 */
export const checkoutSchema = z.object({
  fullName: personNameField,
  phone: bdPhoneField,
  altPhone: optionalBdPhoneField,
  email: optionalEmailField,
  division: divisionField,
  district: requiredText('জেলা', 2, 60),
  area: requiredText('এলাকা বা থানা', 2, 80),
  addressLine: requiredText('বিস্তারিত ঠিকানা', 10, 300),
  landmark: optionalText(120),
  postcode: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{4}$/.test(value), '৪ ডিজিটের পোস্ট কোড দিন'),
  deliveryMethod: z.enum(['standard', 'express', 'same-day', 'pickup']),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'rocket']),
  saveAddress: z.boolean().default(true),
  note: optionalText(300),
  /** Confirms the shopper understands this is a simulated checkout. */
  acknowledgeDemo: z.literal(true, { error: 'ডেমো চেকআউটের শর্ত নিশ্চিত করুন' }),
});

export const profileSchema = z.object({
  name: personNameField,
  phone: bdPhoneField,
  email: optionalEmailField,
  dateOfBirth: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), 'তারিখ YYYY-MM-DD ফরম্যাটে দিন'),
  gender: z.enum(['male', 'female', 'other', 'unspecified']),
});

export const notificationPreferencesSchema = z.object({
  orderUpdates: z.boolean(),
  promotions: z.boolean(),
  priceDrops: z.boolean(),
  newsletter: z.boolean(),
  smsAlerts: z.boolean(),
  channelEmail: z.boolean(),
  channelSms: z.boolean(),
  channelPush: z.boolean(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'রেটিং দিন').max(5, 'রেটিং দিন'),
  title: optionalText(80),
  body: requiredText('রিভিউ', 10, 800),
  authorName: personNameField,
});

export type AddressFormValues = z.input<typeof addressSchema>;
export type AddressParsed = z.output<typeof addressSchema>;
export type CheckoutFormValues = z.input<typeof checkoutSchema>;
export type CheckoutParsed = z.output<typeof checkoutSchema>;
export type ProfileFormValues = z.input<typeof profileSchema>;
export type NotificationPreferencesValues = z.infer<typeof notificationPreferencesSchema>;
export type ReviewFormValues = z.input<typeof reviewSchema>;
