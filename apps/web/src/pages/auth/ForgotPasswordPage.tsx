import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@shobdox/shared-validation';
import { DEMO_CREDENTIALS } from '@shobdox/shared-mock-data';
import { Alert, Button, ButtonLink, Card, Input } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/ui.store';

/**
 * Forgot-password screen.
 *
 * A real product would post the identifier and email a reset link. This demo
 * does neither: the second panel exists to show the flow, and it states plainly
 * that no message is sent and no password is stored anywhere.
 */
export default function ForgotPasswordPage() {
  const signInAs = useAuthStore((state) => state.signInAs);
  const navigate = useNavigate();
  const [submittedFor, setSubmittedFor] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues, unknown, ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 320));
    // Nothing is transmitted: the panel below is the whole "result".
    setSubmittedFor(values.identifier);
  };

  const enterDemoAccount = () => {
    signInAs('customer');
    toast({
      tone: 'success',
      title: 'ডেমো সেশন চালু হয়েছে',
      description: 'গ্রাহক ডেমো অ্যাকাউন্ট দিয়ে প্রবেশ করেছেন (ভার্চুয়াল সেশন)।',
    });
    navigate('/account', { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-5 py-2">
      <Card as="section" className="p-5">
        <h1 className="text-3xl font-bold text-text-primary">পাসওয়ার্ড রিসেট</h1>

        <Alert tone="info" className="mt-4">
          এটি একটি ডেমো — কোনো প্রকৃত অ্যাকাউন্ট, পাসওয়ার্ড বা ইমেইল ব্যবস্থাপনা নেই।
        </Alert>

        {submittedFor ? (
          <div className="mt-4 space-y-4">
            <Alert tone="warning" title="এই ডেমোতে কিছুই পাঠানো হয়নি">
              প্রকৃত সেবায় <span className="font-num break-all">{submittedFor}</span> ঠিকানায় একটি পাসওয়ার্ড রিসেট
              লিংক পাঠানো হতো। SHOBDOX ডেমোতে কোনো ইমেইল বা SMS পাঠানো হয় না, কোনো পাসওয়ার্ড সংরক্ষণ করা হয় না, তাই
              কোনো রিসেট লিংকও আসবে না।
            </Alert>

            <div className="flex flex-wrap gap-2">
              <Button onClick={enterDemoAccount} leftIcon={<ShieldCheck aria-hidden className="size-4" />}>
                ডেমো অ্যাকাউন্টে ফিরে যান
              </Button>
              <Button
                variant="outline"
                onClick={() => setSubmittedFor(null)}
                leftIcon={<ArrowLeft aria-hidden className="size-4" />}
              >
                অন্য নম্বর দিয়ে চেষ্টা করুন
              </Button>
            </div>
          </div>
        ) : (
          <form noValidate className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="মোবাইল নম্বর বা ইমেইল"
              required
              autoComplete="username"
              placeholder="01XXXXXXXXX / you@example.com"
              leftIcon={<KeyRound aria-hidden className="size-4" />}
              hint="ডেমোতে কোনো রিসেট লিংক বা কোড পাঠানো হয় না।"
              error={errors.identifier?.message}
              {...register('identifier')}
            />

            <Button type="submit" fullWidth loading={isSubmitting}>
              রিসেট লিংক চান
            </Button>
          </form>
        )}

        <p className="mt-4 text-sm text-text-secondary">
          <Link to="/signin" className="font-medium text-primary hover:underline">
            লগ ইন পেজে ফিরুন
          </Link>
          {' '}অথবা{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            নতুন ডেমো অ্যাকাউন্ট খুলুন
          </Link>
          ।
        </p>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold text-text-primary">পাসওয়ার্ড ভুলে গেছেন?</h2>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          ডেমোতে পাসওয়ার্ড সংরক্ষণ করা হয় না, তাই রিসেট করার মতো কিছু নেই। নিচের তথ্য দিয়ে প্রবেশ করুন:
        </p>
        <p className="mt-2 font-num text-sm text-text-primary">
          গ্রাহক: {DEMO_CREDENTIALS.customer.phone} · {DEMO_CREDENTIALS.customer.password}
        </p>
        <ButtonLink to="/signin" variant="secondary" size="sm" className="mt-3">
          ডেমো ক্রেডেনশিয়ালসহ লগ ইন
        </ButtonLink>
      </Card>
    </div>
  );
}
