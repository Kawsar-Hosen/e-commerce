import { useState } from 'react';
import { Link } from 'react-router';
import { KeyRound, ShieldCheck, Store, User } from 'lucide-react';
import { DEMO_CREDENTIALS } from '@shobdox/shared-mock-data';
import { Alert, Card } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/ui.store';

/**
 * One-tap demo sign-in.
 *
 * There is no authentication backend: the three accounts below are fixtures, the
 * "password" is only there to make the sign-in form demonstrable, and the whole
 * thing is labelled as a demo wherever it appears.
 */

const ACCOUNTS = [
  {
    role: 'customer' as const,
    label: 'গ্রাহক',
    description: 'অর্ডার, ঠিকানা, উইশলিস্ট ও ট্র্যাকিং দেখুন',
    icon: User,
  },
  {
    role: 'admin' as const,
    label: 'অ্যাডমিন',
    description: 'পুরো মার্কেটপ্লেস, পণ্য, অর্ডার ও সেলার ব্যবস্থাপনা',
    icon: ShieldCheck,
  },
  {
    role: 'seller' as const,
    label: 'সেলার',
    description: 'নিজের স্টোর, স্টক, অর্ডার ও কমিশন',
    icon: Store,
  },
];

export function DemoSignInCard({
  redirectTo,
  compact = false,
  title = 'ডেমো অ্যাকাউন্ট দিয়ে প্রবেশ করুন',
}: {
  redirectTo?: string;
  compact?: boolean;
  title?: string;
}) {
  const signInAs = useAuthStore((state) => state.signInAs);
  const [pending, setPending] = useState<string | null>(null);

  const enter = (role: 'customer' | 'admin' | 'seller') => {
    setPending(role);
    signInAs(role);
    setPending(null);
    toast({
      tone: 'success',
      title: 'ডেমো সেশন চালু হয়েছে',
      description: `${role === 'admin' ? 'অ্যাডমিন' : role === 'seller' ? 'সেলার' : 'গ্রাহক'} হিসেবে লগ ইন করেছেন (virtual session)।`,
      actionLabel: redirectTo ? 'চালিয়ে যান' : undefined,
      actionHref: redirectTo,
    });
  };

  return (
    <Card className={compact ? 'p-4' : 'mx-auto max-w-2xl p-5'}>
      <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
      <p className="mt-1 text-sm text-text-secondary">
        প্রকৃত লগইন সিস্টেম এই ফেজে নেই। নিচের যেকোনো বাটনে চাপ দিলে সেই রোলের ডেমো সেশন চালু হবে — সব ডেটা শুধু এই
        ব্রাউজারে থাকে।
      </p>

      <ul className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {ACCOUNTS.map((account) => {
          const Icon = account.icon;
          const credentials = DEMO_CREDENTIALS[account.role];

          return (
            <li key={account.role}>
              <button
                type="button"
                onClick={() => enter(account.role)}
                disabled={pending !== null}
                className="flex h-full w-full flex-col items-start gap-2 rounded-card border border-border bg-surface p-3 text-left transition-colors hover:border-primary hover:bg-primary-soft/40 disabled:opacity-60"
              >
                <span className="flex size-9 items-center justify-center rounded-card bg-primary-soft text-primary-dark">
                  <Icon aria-hidden className="size-4" />
                </span>
                <span className="text-base font-semibold text-text-primary">{account.label}</span>
                <span className="text-xs text-text-secondary">{account.description}</span>
                <span className="mt-auto flex items-center gap-1 pt-1 font-num text-[11px] text-text-muted">
                  <KeyRound aria-hidden className="size-3" />
                  {credentials.phone} · {credentials.password}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Alert tone="info" className="mt-4">
        পাসওয়ার্ড শুধু ডেমো ফর্ম দেখানোর জন্য। কোনো তথ্য কোথাও পাঠানো হয় না।
      </Alert>

      <p className="mt-3 text-sm text-text-secondary">
        ফর্ম দিয়ে লগ ইন করতে চাইলে{' '}
        <Link to="/signin" className="font-medium text-primary hover:underline">
          লগ ইন পেজে যান
        </Link>
        ।
      </p>
    </Card>
  );
}
