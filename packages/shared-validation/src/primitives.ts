import { z } from 'zod';
import { BD_DIVISIONS, isValidBdPhone, normalizeBdPhone } from '@shobdox/shared-utils';

/** Reusable field validators. Bangla messages, Bangladeshi rules. */

export const bdPhoneField = z
  .string()
  .trim()
  .min(1, 'মোবাইল নম্বর দিন')
  .transform((value) => normalizeBdPhone(value))
  .refine((value) => isValidBdPhone(value), 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)');

export const optionalBdPhoneField = z
  .string()
  .trim()
  .transform((value) => (value ? normalizeBdPhone(value) : ''))
  .refine((value) => value === '' || isValidBdPhone(value), 'সঠিক মোবাইল নম্বর দিন');

export const passwordField = z
  .string()
  .min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
  .max(64, 'পাসওয়ার্ড ৬৪ অক্ষরের বেশি হতে পারে না');

export const personNameField = z
  .string()
  .trim()
  .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে')
  .max(80, 'নাম ৮০ অক্ষরের বেশি হতে পারে না')
  .regex(/^[\p{L}\p{M}\s.'-]+$/u, 'নামে শুধু অক্ষর, স্পেস ও . \' - ব্যবহার করুন');

export const optionalEmailField = z
  .union([z.literal(''), z.email('সঠিক ইমেইল ঠিকানা দিন')])
  .transform((value) => value || undefined);

export const requiredEmailField = z.email('সঠিক ইমেইল ঠিকানা দিন');

/** Text inputs where an empty string must become `undefined` for the API shape. */
export const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max, `সর্বোচ্চ ${max} অক্ষর লেখা যাবে`)
    .transform((value) => (value === '' ? undefined : value));

export const requiredText = (label: string, min = 2, max = 300) =>
  z
    .string()
    .trim()
    .min(min, `${label} কমপক্ষে ${min} অক্ষরের হতে হবে`)
    .max(max, `${label} ${max} অক্ষরের বেশি হতে পারে না`);

export const takaField = (label: string, min = 0, max = 10_000_000) =>
  z
    .number({ error: `${label} একটি সংখ্যা হতে হবে` })
    .min(min, `${label} ${min} টাকার কম হতে পারে না`)
    .max(max, `${label} ${max} টাকার বেশি হতে পারে না`);

export const positiveIntField = (label: string, min = 0, max = 100_000) =>
  z
    .number({ error: `${label} একটি সংখ্যা হতে হবে` })
    .int(`${label} পূর্ণসংখ্যা হতে হবে`)
    .min(min, `${label} ${min} এর কম হতে পারে না`)
    .max(max, `${label} ${max} এর বেশি হতে পারে না`);

export const divisionField = z
  .string()
  .trim()
  .min(1, 'বিভাগ নির্বাচন করুন')
  .refine((value) => BD_DIVISIONS.some((division) => division.name === value), 'তালিকা থেকে বিভাগ নির্বাচন করুন');

export const slugField = z
  .string()
  .trim()
  .min(2, 'স্লাগ কমপক্ষে ২ অক্ষরের হতে হবে')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'স্লাগে শুধু ছোট হাতের ইংরেজি অক্ষর, সংখ্যা ও হাইফেন চলবে');

/** Image URLs must be absolute so the demo never renders a broken <img>. */
export const imageUrlField = z
  .string()
  .trim()
  .min(1, 'ছবির ঠিকানা দিন')
  .refine(
    (value) => value.startsWith('data:image/') || /^https?:\/\//.test(value),
    'ছবির ঠিকানা http(s):// দিয়ে শুরু হতে হবে',
  );

export const confirmPasswordGuard = <T extends { password: string; confirmPassword: string }>(schema: z.ZodType<T>) =>
  schema.refine((values) => values.password === values.confirmPassword, {
    error: 'পাসওয়ার্ড দুটি মিলছে না',
    path: ['confirmPassword'],
  });
