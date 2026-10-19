import { useState } from 'react';
import { RefreshCcw, Save, ShieldAlert } from 'lucide-react';
import {
  Button,
  Card,
  ConfirmDialog,
  DemoNotice,
  Input,
  KeyValue,
  PageHeader,
  SectionHeader,
  Switch,
} from '@/components/ui';
import {
  COMMISSION_RATES,
  FREE_DELIVERY_THRESHOLD,
  LOW_STOCK_THRESHOLD,
  TIER_LABELS,
  VAT_RATE,
} from '@shobdox/shared-business-logic';
import { DEFAULT_LOW_STOCK_THRESHOLD } from '@shobdox/shared-mock-data';
import { ADMIN_PAGE_SIZE, APP_NAME, SUPPORT_PHONE } from '@/lib/constants';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { resetEverything } from '@/store/data.store';
import { toast } from '@/store/ui.store';

/**
 * Admin settings.
 *
 * The marketplace-wide numbers (VAT, free-delivery threshold, commission
 * rates) come from the shared modules and are shown read-only — changing them
 * in code is the honest way in this demo. Ops toggles and the stock threshold
 * are local state with a clear notice, and the reset card really wipes the
 * demo state back to fixtures.
 */

interface OpsToggle {
  id: string;
  label: string;
  description: string;
  defaultValue: boolean;
}

const OPS_TOGGLES: OpsToggle[] = [
  {
    id: 'notify-orders',
    label: 'নতুন অর্ডারে অপারেশন টিমকে জানান',
    description: 'প্রতিটি নতুন অর্ডারে ইন-অ্যাপ নোটিফিকেশন তৈরি হয় (ডেমো)।',
    defaultValue: true,
  },
  {
    id: 'notify-low-stock',
    label: 'স্টক কম হলে সতর্কতা',
    description: 'থ্রেশহোল্ডের নিচে গেলে ড্যাশবোর্ডে সতর্কতা দেখানো হয়।',
    defaultValue: true,
  },
  {
    id: 'auto-cancel-unpaid',
    label: '২৪ ঘণ্টায় অপরিশোধিত অর্ডার বাতিল',
    description: 'ডেমোতে শুধু লেবেল হিসেবে দেখানো — কোনো অটোমেশন চলে না।',
    defaultValue: false,
  },
];

export default function AdminSettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(OPS_TOGGLES.map((toggle) => [toggle.id, toggle.defaultValue])),
  );
  const [threshold, setThreshold] = useState(String(DEFAULT_LOW_STOCK_THRESHOLD));
  const [resetOpen, setResetOpen] = useState(false);

  const thresholdValue = Number(threshold);
  const thresholdValid = Number.isInteger(thresholdValue) && thresholdValue >= 1 && thresholdValue <= 1000;

  const saveThreshold = () => {
    if (!thresholdValid) return;
    toast({
      tone: 'success',
      title: 'থ্রেশহোল্ড সংরক্ষিত হয়েছে',
      description: `স্টক সতর্কতা এখন ${toBanglaDigits(thresholdValue)} ইউনিট (শুধু এই সেশনে)।`,
    });
  };

  const confirmReset = () => {
    void resetEverything().then(() => {
      setToggles(Object.fromEntries(OPS_TOGGLES.map((toggle) => [toggle.id, toggle.defaultValue])));
      setThreshold(String(DEFAULT_LOW_STOCK_THRESHOLD));
      toast({ tone: 'success', title: 'ডেমো ডেটা রিসেট হয়েছে', description: 'পণ্য, অর্ডার, কুপন ও কার্ট আবার শুরুর অবস্থায়।' });
    });
    setResetOpen(false);
  };

  return (
    <>
      <PageHeader
        title="সেটিংস"
        description="মার্কেটপ্লেসের নিয়ম, অপারেশন টগল এবং ডেমো ডেটা ব্যবস্থাপনা।"
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card as="section">
          <SectionHeader title="অপারেশন টগল" subtitle="ডেমো প্রিভিউ — প্রকৃত ইমেইল বা SMS যায় না" />
          <div className="space-y-4">
            {OPS_TOGGLES.map((toggle) => (
              <Switch
                key={toggle.id}
                checked={Boolean(toggles[toggle.id])}
                onChange={(checked) => {
                  setToggles((current) => ({ ...current, [toggle.id]: checked }));
                  toast(
                    checked
                      ? { tone: 'success', title: 'চালু করা হয়েছে', description: toggle.label }
                      : { tone: 'info', title: 'বন্ধ করা হয়েছে', description: toggle.label },
                  );
                }}
                label={toggle.label}
                description={toggle.description}
              />
            ))}
          </div>
        </Card>

        <Card as="section">
          <SectionHeader
            title="স্টক সতর্কতার থ্রেশহোল্ড"
            subtitle="ভ্যারিয়েন্টের স্টক এর নিচে গেলে ড্যাশবোর্ডে সতর্কতা দেখায়"
          />
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <Input
              label="থ্রেশহোল্ড (ইউনিট)"
              type="number"
              min={1}
              max={1000}
              inputMode="numeric"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              error={thresholdValid ? undefined : '১ থেকে ১০০০ এর মধ্যে পূর্ণসংখ্যা দিন'}
              hint={`বিল্ট-ইন ডিফল্ট: ${toBanglaDigits(LOW_STOCK_THRESHOLD)} ইউনিট`}
            />
            <Button onClick={saveThreshold} disabled={!thresholdValid} leftIcon={<Save aria-hidden className="size-4" />}>
              সংরক্ষণ করুন
            </Button>
          </div>
          <DemoNotice className="mt-3" title="সেশনে সীমাবদ্ধ">
            শেয়ার্ড সেটিংস স্টোর না থাকায় থ্রেশহোল্ড শুধু এই স্ক্রিনে আপডেট হয়; পেজ রিফ্রেশ করলে বিল্ট-ইন মান ফিরে আসে।
          </DemoNotice>
        </Card>

        <Card as="section">
          <SectionHeader title="মার্কেটপ্লেসের নিয়ম" subtitle="শেয়ার্ড বিজনেস লজিক থেকে পড়া — কোড বদলালেই বদলাবে" />
          <dl className="divide-y divide-divider">
            <KeyValue label="ভ্যাট হার">
              {toBanglaDigits(Math.round(VAT_RATE * 100))}% — দামের মধ্যে অন্তর্ভুক্ত
            </KeyValue>
            <KeyValue label="ফ্রি ডেলিভারি সীমা">{formatTaka(FREE_DELIVERY_THRESHOLD)} বা তার বেশি অর্ডারে</KeyValue>
            <KeyValue label="ডিফল্ট স্টক থ্রেশহোল্ড">{toBanglaDigits(LOW_STOCK_THRESHOLD)} ইউনিট</KeyValue>
            <KeyValue label="প্রতি পেজে সারি">{toBanglaDigits(ADMIN_PAGE_SIZE)}</KeyValue>
            <KeyValue label="সাপোর্ট নম্বর">
              <span className="font-num">{SUPPORT_PHONE}</span>
            </KeyValue>
            <KeyValue label="ডেমো অ্যাপ">{APP_NAME} v1 (লোকাল-স্টোরেজ ভিত্তিক)</KeyValue>
          </dl>
        </Card>

        <Card as="section">
          <SectionHeader title="সেলার কমিশন হার" subtitle="টিয়ার অনুযায়ী — কমিশন মডিউলের সাথে সবসময় মিলবে" />
          <dl className="divide-y divide-divider">
            {(Object.keys(COMMISSION_RATES) as Array<keyof typeof COMMISSION_RATES>).map((tier) => (
              <KeyValue key={tier} label={TIER_LABELS[tier]}>
                <span className="font-num">{toBanglaDigits(COMMISSION_RATES[tier])}%</span>
              </KeyValue>
            ))}
          </dl>
          <p className="mt-2 text-xs text-text-muted">
            টিয়ার নির্ধারণ হয় সেলারের বিক্রয়ের ভিত্তিতে; বিস্তারিত প্রতিটি সেলারের ড্রয়ারে দেখা যায়।
          </p>
        </Card>
      </div>

      <Card as="section" className="mt-5 border-error/40">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
              <ShieldAlert aria-hidden className="size-5 text-error" />
              ডেমো ডেটা রিসেট
            </h2>
            <p className="mt-0.5 max-w-2xl text-sm text-text-secondary">
              সব পণ্য, অর্ডার, কুপন, ব্যানার, সেলার ও গ্রাহক আবার শুরুর ডেমো অবস্থায় ফিরে যাবে; কার্ট ও উইশলিস্টও
              খালি হয়ে যাবে।
            </p>
          </div>
          <Button variant="danger" leftIcon={<RefreshCcw aria-hidden className="size-4" />} onClick={() => setResetOpen(true)}>
            সব রিসেট করুন
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={resetOpen}
        title="সব ডেমো ডেটা রিসেট করবেন?"
        message="এই কাজটি ফেরানো যাবে না — আপনার তৈরি করা পণ্য, অর্ডার ও কোড মুছে যায় এবং কার্ট/উইশলিস্ট খালি হয়।"
        confirmLabel="হ্যাঁ, রিসেট করুন"
        onConfirm={confirmReset}
        onClose={() => setResetOpen(false)}
      />
    </>
  );
}
