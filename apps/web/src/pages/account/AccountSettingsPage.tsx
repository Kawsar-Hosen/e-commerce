import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Info, KeyRound, LogOut, RotateCcw, ShieldCheck, Smartphone } from 'lucide-react';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from '@shobdox/shared-types';
import { formatDateTime } from '@shobdox/shared-utils';
import { DEMO_CREDENTIALS } from '@shobdox/shared-mock-data';
import { Alert, Button, Card, ConfirmDialog, KeyValue, Modal, PageHeader, Switch } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { resetEverything } from '@/store/data.store';
import { toast, useUiStore } from '@/store/ui.store';

/** Account settings: appearance, notification preferences, security, danger zone. */

const PREF_ROWS: Array<{ key: keyof NotificationPreferences; label: string; description: string }> = [
  { key: 'orderUpdates', label: 'অর্ডার আপডেট', description: 'অর্ডারের অবস্থা বদলালে জানানো হবে' },
  { key: 'promotions', label: 'অফার ও ডিসকাউন্ট', description: 'ফ্ল্যাশ সেল, কুপন ও ছাড়ের খবর' },
  { key: 'priceDrops', label: 'দাম কমার খবর', description: 'উইশলিস্টের পণ্যের দাম কমলে জানানো হবে' },
  { key: 'newsletter', label: 'নিউজলেটার', description: 'সাপ্তাহিক নির্বাচিত পণ্যের তালিকা' },
  { key: 'channelEmail', label: 'ইমেইল চ্যানেল', description: 'ইমেইলে পাঠানোর অনুমতি (ডেমোতে নিষ্ক্রিয়)' },
  { key: 'channelSms', label: 'SMS চ্যানেল', description: 'SMS-এ পাঠানোর অনুমতি (ডেমোতে নিষ্ক্রিয়)' },
  { key: 'channelPush', label: 'পুশ নোটিফিকেশন', description: 'অ্যাপে পুশ করার অনুমতি (ডেমোতে নিষ্ক্রিয়)' },
];

export default function AccountSettingsPage() {
  const user = useAuthStore((state) => state.session?.user);
  const session = useAuthStore((state) => state.session);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const signOut = useAuthStore((state) => state.signOut);
  const signInAs = useAuthStore((state) => state.signInAs);
  const compactMode = useUiStore((state) => state.compactMode);
  const setCompactMode = useUiStore((state) => state.setCompactMode);
  const navigate = useNavigate();

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  if (!user) return null;

  const prefs: NotificationPreferences = user.notificationPreferences ?? DEFAULT_NOTIFICATION_PREFERENCES;

  const setPref = (key: keyof NotificationPreferences) => (value: boolean) => {
    const next: NotificationPreferences = { ...prefs };
    next[key] = value;
    updateProfile({ notificationPreferences: next });
  };

  const onSignOut = () => {
    signOut();
    toast({ tone: 'info', title: 'লগ আউট হয়েছে', description: 'ডেমো সেশনটি এই ব্রাউজার থেকে মুছে ফেলা হয়েছে।' });
    navigate('/signin');
  };

  const onResetDemo = async () => {
    setResetOpen(false);
    await resetEverything();
    toast({
      tone: 'success',
      title: 'ডেমো ডেটা রিসেট হয়েছে',
      description: 'সব ফিক্সচার আগের অবস্থায় ফিরে গেছে — সেশন অপরিবর্তিত।',
    });
  };

  const enterCustomerDemo = () => {
    signInAs('customer');
    setPasswordOpen(false);
    toast({
      tone: 'success',
      title: 'গ্রাহক ডেমো সেশনে ফিরে এসেছেন',
      description: 'পাসওয়ার্ড ছাড়াই ডেমো রোল বদলানো হয়েছে — এটি ভার্চুয়াল সেশন।',
    });
    navigate('/account');
  };

  return (
    <div className="space-y-5">
      <PageHeader title="সেটিংস" description="পছন্দ, নোটিফিকেশন এবং ডেমো অ্যাকাউন্ট নিয়ন্ত্রণ।" />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card as="section">
          <h2 className="text-xl font-bold text-text-primary">চেহারা ও পছন্দ</h2>
          <p className="mt-1 text-sm text-text-secondary">যা বদলালে সাথে সাথে প্রভাব পড়ে ও লোকালি সংরক্ষিত থাকে।</p>

          <div className="mt-4 space-y-4">
            <Switch
              checked={compactMode}
              onChange={setCompactMode}
              label="কমপ্যাক্ট মোড"
              description="তালিকা ও কার্ডে কম ফাঁকা জায়গা — ছোট স্ক্রিনে বেশি তথ্য।"
            />

            <div className="space-y-2 border-t border-divider pt-3 text-sm leading-relaxed text-text-secondary">
              <p className="flex items-start gap-2">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-text-muted" />
                থিম: এই ডেমোতে স্থির হালকা থিম — আলাদা থিম পছন্দ সংরক্ষণ করা হয় না।
              </p>
              <p className="flex items-start gap-2">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-text-muted" />
                অ্যানিমেশন: ব্রাউজার/ডিভাইসের ‘কম গতি’ (reduced motion) সেটিং স্বয়ংক্রিয়ভাবে মানা হয়, তাই আলাদা টগল
                নেই।
              </p>
            </div>
          </div>
        </Card>

        <Card as="section">
          <h2 className="text-xl font-bold text-text-primary">নোটিফিকেশন পছন্দ</h2>
          <p className="mt-1 text-sm text-text-secondary">
            পছন্দগুলো আপনার ডেমো প্রোফাইলে সংরক্ষিত হয়, কিন্তু কিছুই বাস্তবে পাঠানো হয় না।
          </p>

          <Alert tone="warning" className="mt-3">
            ডেমো — কোনো ইমেইল/SMS/পুশ নোটিফিকেশন পাঠানো হয় না। টগলগুলো শুধু পছন্দ সংরক্ষণ করে।
          </Alert>

          <div className="mt-4 divide-y divide-divider">
            {PREF_ROWS.map((row) => (
              <div key={row.key} className="py-3 first:pt-0 last:pb-0">
                <Switch
                  checked={prefs[row.key]}
                  onChange={setPref(row.key)}
                  label={row.label}
                  description={row.description}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card as="section">
          <h2 className="text-xl font-bold text-text-primary">নিরাপত্তা</h2>
          <p className="mt-1 text-sm text-text-secondary">
            এই ডেমোতে পাসওয়ার্ড কোথাও সংরক্ষণ করা হয় না, তাই পরিবর্তন করার মতো পাসওয়ার্ডও নেই।
          </p>

          <dl className="mt-3 border-t border-divider pt-2">
            <KeyValue label="সেশন ধরন">ডেমো (mock) — শুধু এই ব্রাউজারে</KeyValue>
            {session ? (
              <>
                <KeyValue label="শুরু হয়েছে">{formatDateTime(session.issuedAt)}</KeyValue>
                <KeyValue label="স্বয়ংক্রিয় সমাপ্তি">{formatDateTime(session.expiresAt)}</KeyValue>
              </>
            ) : null}
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              leftIcon={<KeyRound aria-hidden className="size-4" />}
              onClick={() => setPasswordOpen(true)}
            >
              পাসওয়ার্ড পরিবর্তন
            </Button>
            <Button
              variant="ghost"
              leftIcon={<Smartphone aria-hidden className="size-4" />}
              onClick={() => setPasswordOpen(true)}
            >
              সেশন কীভাবে কাজ করে
            </Button>
          </div>
        </Card>

        <Card as="section" className="border-error/30 bg-error-soft/30">
          <h2 className="text-xl font-bold text-text-primary">ডেঞ্জার জোন</h2>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            ডেমো সেশন বা পুরো ডেটাসেট শুরুর অবস্থায় ফিরিয়ে দিন।
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="danger"
              leftIcon={<LogOut aria-hidden className="size-4" />}
              onClick={onSignOut}
            >
              সব ডিভাইস থেকে লগ আউট
            </Button>
            <Button
              variant="outline"
              leftIcon={<RotateCcw aria-hidden className="size-4" />}
              onClick={() => setResetOpen(true)}
            >
              ডেমো ডেটা রিসেট
            </Button>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-text-muted">
            ‘সব ডিভাইস থেকে লগ আউট’ শুধু এই ব্রাউজারের ডেমো সেশন মুছে দেয়; প্রকৃত কোনো ডিভাইসের সাথে সম্পর্ক নেই।
          </p>
        </Card>
      </div>

      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="পাসওয়ার্ড পরিবর্তন (ডেমো)"
        size="md"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setPasswordOpen(false)}>
              বন্ধ করুন
            </Button>
            <Button leftIcon={<ShieldCheck aria-hidden className="size-4" />} onClick={enterCustomerDemo}>
              গ্রাহক ডেমো অ্যাকাউন্টে যান
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
          <p>
            SHOBDOX ডেমোতে কোনো পাসওয়ার্ড সংরক্ষণ করা হয় না — লগ ইন শুধু নিচের ফিক্সচার তথ্যের সাথে মিলিয়ে দেখা হয়।
            তাই পরিবর্তন করার কোনো পাসওয়ার্ডও নেই।
          </p>
          <p>
            একটি প্রকৃত সিস্টেমে এখানে বর্তমান পাসওয়ার্ড যাচাই করে নতুন পাসওয়ার্ড সেট করা হতো এবং পাসওয়ার্ড কখনো
            ব্রাউজারে রাখা হতো না।
          </p>
          <p className="font-num text-text-primary">
            গ্রাহক: {DEMO_CREDENTIALS.customer.phone} · {DEMO_CREDENTIALS.customer.password}
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={resetOpen}
        title="ডেমো ডেটা রিসেট করবেন?"
        message="সব পণ্য, অর্ডার, কার্ট, উইশলিস্ট ও নোটিফিকেশন আসল ডেমো ফিক্সচারে ফিরে যাবে। এটি ফিরিয়ে আনা যাবে না।"
        confirmLabel="হ্যাঁ, রিসেট করুন"
        onConfirm={() => void onResetDemo()}
        onClose={() => setResetOpen(false)}
      />
    </div>
  );
}
