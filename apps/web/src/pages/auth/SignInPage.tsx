import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Phone } from 'lucide-react';
import { signInSchema, type SignInParsed, type SignInValues } from '@shobdox/shared-validation';
import { Alert, Button, Card, Input } from '@/components/ui';
import { DemoSignInCard } from '@/features/auth/DemoSignInCard';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/ui.store';

/**
 * Demo sign-in.
 *
 * The form validates the shared sign-in schema and then asks the mock auth
 * store to match one of the three fixture accounts. No request leaves the
 * browser; the page says so in three places so nobody mistakes it for a real
 * login.
 */

/** Only same-site paths are accepted after login (no open redirects). */
function safeRedirect(value: unknown): string | undefined {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : undefined;
}

export default function SignInPage() {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const stateFrom = safeRedirect((location.state as { from?: unknown } | null)?.from);
  const redirect = stateFrom ?? safeRedirect(searchParams.get('redirect'));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues, unknown, SignInParsed>({
    resolver: zodResolver(signInSchema),
    defaultValues: { phone: '', password: '', rememberMe: false },
  });

  const onSubmit = async (values: SignInParsed) => {
    setFormError(null);
    // A short pause makes the pending button state perceivable; nothing is sent.
    await new Promise((resolve) => window.setTimeout(resolve, 320));

    const result = signIn({ phone: values.phone, password: values.password, remember: values.rememberMe });
    if (!result.ok) {
      setFormError(result.error ?? 'ডেমো তথ্য মেলেনি।');
      return;
    }

    const role = useAuthStore.getState().session?.user?.role;
    const target = role === 'admin' ? '/admin' : role === 'seller' ? '/seller' : redirect ?? '/account';

    toast({
      tone: 'success',
      title: 'ডেমো সেশন চালু হয়েছে',
      description: 'এই সেশন শুধু আপনার ব্রাউজারে আছে — কোনো সার্ভারে যাচাই করা হয়নি।',
    });
    navigate(target, { replace: true });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-2">
      <Card as="section" className="mx-auto w-full max-w-md p-5">
        <h1 className="text-3xl font-bold text-text-primary">লগ ইন</h1>
        <p className="mt-1 text-sm text-text-secondary">
          ডেমো অ্যাকাউন্টের ফোন নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন।
        </p>

        <Alert tone="info" className="mt-4">
          এটি একটি ডেমো — কোনো প্রকৃত অ্যাকাউন্ট, পাসওয়ার্ড বা ইমেইল ব্যবস্থাপনা নেই।
        </Alert>

        {formError ? (
          <Alert tone="error" className="mt-4" title="লগ ইন করা যায়নি">
            {formError}
          </Alert>
        ) : null}

        <form noValidate className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="মোবাইল নম্বর"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            leftIcon={<Phone aria-hidden className="size-4" />}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="পাসওয়ার্ড"
            required
            type="password"
            autoComplete="current-password"
            placeholder="আপনার ডেমো পাসওয়ার্ড"
            leftIcon={<Lock aria-hidden className="size-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
            <Link to="/signup" className="text-sm font-medium text-primary hover:underline">
              নতুন অ্যাকাউন্ট খুলুন
            </Link>
          </div>

          <Button type="submit" fullWidth loading={isSubmitting}>
            লগ ইন
          </Button>
        </form>

        <p className="mt-4 text-xs leading-relaxed text-text-muted">
          লগ ইন করলে শুধু এই ব্রাউজারে একটি ভার্চুয়াল সেশন তৈরি হয়। কোনো পাসওয়ার্ড যাচাই, সার্ভার বা প্রকৃত অ্যাকাউন্ট
          জড়িত নয়।
        </p>
      </Card>

      <DemoSignInCard redirectTo={redirect} />
    </div>
  );
}
