import { z } from 'zod';
import {
  bdPhoneField,
  confirmPasswordGuard,
  optionalEmailField,
  passwordField,
  personNameField,
  requiredEmailField,
} from './primitives';

/**
 * Auth schemas. The demo uses a mock authentication adapter: these rules shape
 * the UI only and are never checked against a real identity provider.
 */

export const signInSchema = z.object({
  phone: bdPhoneField,
  password: z.string().min(1, 'পাসওয়ার্ড দিন'),
  rememberMe: z.boolean().default(false),
});

export const signInWithEmailSchema = z.object({
  email: requiredEmailField,
  password: z.string().min(1, 'পাসওয়ার্ড দিন'),
  rememberMe: z.boolean().default(false),
});

const signUpBase = z.object({
  name: personNameField,
  phone: bdPhoneField,
  email: optionalEmailField,
  password: passwordField,
  confirmPassword: z.string().min(1, 'পাসওয়ার্ড আবার লিখুন'),
  acceptTerms: z.literal(true, { error: 'শর্তাবলিতে সম্মতি দিন' }),
});

export const signUpSchema = confirmPasswordGuard(signUpBase);

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'মোবাইল নম্বর বা ইমেইল দিন')
    .refine(
      (value) => /^01[3-9]\d{8}$/.test(value) || z.email().safeParse(value).success,
      'সঠিক মোবাইল নম্বর বা ইমেইল দিন',
    ),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, '৬ ডিজিটের কোড দিন'),
});

export const resetPasswordSchema = confirmPasswordGuard(
  z.object({
    password: passwordField,
    confirmPassword: z.string().min(1, 'পাসওয়ার্ড আবার লিখুন'),
  }),
);

export type SignInValues = z.input<typeof signInSchema>;
export type SignInParsed = z.output<typeof signInSchema>;
export type SignUpValues = z.input<typeof signUpSchema>;
export type SignUpParsed = z.output<typeof signUpSchema>;
export type ForgotPasswordValues = z.input<typeof forgotPasswordSchema>;
export type OtpValues = z.input<typeof otpSchema>;
export type ResetPasswordValues = z.input<typeof resetPasswordSchema>;
