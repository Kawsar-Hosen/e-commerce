import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { signUpSchema, type SignUpParsed } from '@shobdox/shared-validation';
import { Alert, Button, Card, Checkbox, Input } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/ui.store';

/**
 * Demo sign-up.
 *
 * The fields are validated exactly like a real form, but `signUp()` only builds
 * a local demo user: no server, no password storage, no verification email.
 * The copy says that before, during and after the submit.
 */

/** `confirmPasswordGuard()` erases the schema's input type; restore it here. */
interface SignUpFormInput {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const signUpFormSchema = signUpSchema as unknown as z.ZodType<SignUpParsed, SignUpFormInput>;

export default function SignUpPage() {
  const signUp = useAuthStore((state) => state.signUp);
  const navigate = useNavigate();
  const [notice, setNotice] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormInput, unknown, SignUpParsed>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { name: '', phone: '', email: '', password: '', confirmPassword: '', acceptTerms: false },
  });

  const onSubmit = async (values: SignUpParsed) => {
    setNotice(false);
    // Short pause so the submit button shows its loading state.
    await new Promise((resolve) => window.setTimeout(resolve, 320));

    try {
      signUp({ name: values.name, phone: values.phone, email: values.email });
    } catch {
      // The demo store cannot really fail; this keeps the form honest if it ever does.
      setNotice(true);
      return;
    }

    toast({
      tone: 'success',
      title: 'ডেমো অ্যাকাউন্ট প্রস্তুত',
      description: 'কোনো সার্ভারে অ্যাকাউন্ট তৈরি হয়নি এবং পাসওয়ার্ড কোথাও সংরক্ষণ করা হয়নি — শুধু এই ব্রাউজারে একটি সেশন।',
    });
    navigate('/account', { replace: true });
  };

  return (
    <Card as="section" className="mx-auto w-full max-w-md p-5">
      <h1 className="text-3xl font-bold text-text-primary">নতুন অ্যাকাউন্ট</h1>
      <p className="mt-1 text-sm text-text-secondary">
        ডেমো প্রোফাইল তৈরি করে অর্ডার, ঠিকানা ও উইশলিস্ট ব্যবহার করুন।
      </p>

      <Alert tone="info" className="mt-4">
        এটি একটি ডেমো — কোনো প্রকৃত অ্যাকাউন্ট, পাসওয়ার্ড বা ইমেইল ব্যবস্থাপনা নেই।
      </Alert>

      {notice ? (
        <Alert tone="error" className="mt-4" title="অ্যাকাউন্ট তৈরি করা যায়নি">
          ডেমো স্টোরে সমস্যা হয়েছে। আবার চেষ্টা করুন অথবা নিচের ডেমো অ্যাকাউন্ট দিয়ে প্রবেশ করুন।
        </Alert>
      ) : null}

      <form noValidate className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="পূর্ণ নাম"
          required
          autoComplete="name"
          placeholder="যেমন: আরিফুল হক"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="মোবাইল নম্বর"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="ইমেইল (ঐচ্ছিক)"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          hint="ডেমোতে কোনো ইমেইল পাঠানো হয় না — শুধু প্রোফাইলে দেখানোর জন্য।"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="পাসওয়ার্ড"
          required
          type="password"
          autoComplete="new-password"
          hint="কমপক্ষে ৬ অক্ষর"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="পাসওয়ার্ড আবার লিখুন"
          required
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Controller
          name="acceptTerms"
          control={control}
          render={({ field, fieldState }) => (
            <Checkbox
              checked={Boolean(field.value)}
              onChange={field.onChange}
              error={fieldState.error?.message}
              label="আমি শর্তাবলীতে সম্মত"
              description="শর্তাবলীতে সম্মতি ছাড়া ডেমো অ্যাকাউন্ট খোলা যাবে না।"
            />
          )}
        />

        <p className="text-xs leading-relaxed text-text-secondary">
          সাইন আপ করলে আপনি আমাদের{' '}
          <Link to="/help/terms" className="font-medium text-primary hover:underline">
            শর্তাবলী
          </Link>{' '}
          ও{' '}
          <Link to="/help/privacy" className="font-medium text-primary hover:underline">
            গোপনীয়তা নীতি
          </Link>{' '}
          মেনে নিচ্ছেন। এগুলোও ডেমো কনটেন্ট।
        </p>

        <Button type="submit" fullWidth loading={isSubmitting} leftIcon={<UserPlus aria-hidden className="size-4" />}>
          অ্যাকাউন্ট তৈরি করুন
        </Button>
      </form>

      <p className="mt-4 text-xs text-text-muted">
        পাসওয়ার্ড শুধু ফর্মের ভ্যালিডেশন দেখানোর জন্য — কোথাও সংরক্ষণ বা পাঠানো হয় না।
      </p>

      <p className="mt-3 text-sm text-text-secondary">
        আগে থেকেই অ্যাকাউন্ট আছে?{' '}
        <Link to="/signin" className="font-medium text-primary hover:underline">
          লগ ইন করুন
        </Link>
      </p>
    </Card>
  );
}
