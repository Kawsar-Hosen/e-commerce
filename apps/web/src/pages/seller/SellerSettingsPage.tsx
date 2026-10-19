import { useEffect, useState } from 'react';
import { Mail, RefreshCw, Save, Store } from 'lucide-react';
import type { SellerStatus } from '@shobdox/shared-types';
import { useCurrentSeller } from '@/components/layout/SellerLayout';
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  DemoNotice,
  Input,
  KeyValue,
  PageHeader,
  SectionHeader,
  Switch,
} from '@/components/ui';
import { SELLER_STATUS_LABELS } from '@/features/seller/utils';
import {
  DEFAULT_SELLER_PREFERENCES,
  useSellerPreferences,
  type SellerPreferences,
} from '@/features/seller/useSellerPreferences';
import { resetEverything } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { formatDate, toBanglaDigits } from '@/lib/format';

/**
 * Seller preferences.
 *
 * There is no settings column in the demo dataset, so preferences live in
 * `localStorage` (see `useSellerPreferences`). The reset card is the one real
 * mutation here: it restores the fixtures and clears cart/wishlist, and says so
 * before it runs.
 */

const STATUS_TONES: Record<SellerStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  'pending-review': 'warning',
  suspended: 'danger',
};

export default function SellerSettingsPage() {
  const seller = useCurrentSeller();
  const { preferences, save } = useSellerPreferences(seller.id);
  const [draft, setDraft] = useState<SellerPreferences>(preferences);
  const [thresholdText, setThresholdText] = useState(String(preferences.lowStockThreshold));
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    setDraft(preferences);
    setThresholdText(String(preferences.lowStockThreshold));
  }, [preferences]);

  const parsedThreshold = Number(thresholdText);
  const thresholdValid =
    Number.isInteger(parsedThreshold) && parsedThreshold >= 1 && parsedThreshold <= 1000;
  const thresholdError = thresholdValid ? undefined : '১ থেকে ১০০০-এর মধ্যে পূর্ণসংখ্যা দিন।';

  const dirty =
    draft.notifyNewOrders !== preferences.notifyNewOrders ||
    draft.notifyLowStock !== preferences.notifyLowStock ||
    draft.weeklySummaryEmail !== preferences.weeklySummaryEmail ||
    parsedThreshold !== preferences.lowStockThreshold;

  const canSave = dirty && (!draft.notifyLowStock || thresholdValid);

  const handleSave = () => {
    if (!canSave) return;
    const next: SellerPreferences = {
      ...draft,
      lowStockThreshold: thresholdValid ? parsedThreshold : preferences.lowStockThreshold,
    };
    save(next);
    toast({
      tone: 'success',
      title: 'প্রেফারেন্স সংরক্ষিত',
      description: 'সেটিংস শুধু এই ব্রাউজারে রাখা হয়েছে — কোথাও পাঠানো হয়নি।',
    });
  };

  const handleDiscard = () => {
    setDraft(preferences);
    setThresholdText(String(preferences.lowStockThreshold));
    toast({
      tone: 'info',
      title: 'পরিবর্তন বাতিল হয়েছে',
      description: 'সংরক্ষিত প্রেফারেন্স ফিরিয়ে আনা হয়েছে।',
    });
  };

  const handleDefaults = () => {
    setDraft(DEFAULT_SELLER_PREFERENCES);
    setThresholdText(String(DEFAULT_SELLER_PREFERENCES.lowStockThreshold));
    toast({
      tone: 'info',
      title: 'ডিফল্ট মান বসানো হয়েছে',
      description: 'সংরক্ষণ করুন চাপলে ডিফল্ট প্রেফারেন্স কার্যকর হবে।',
    });
  };

  const handleReset = async () => {
    setResetOpen(false);
    await resetEverything();
    toast({
      tone: 'success',
      title: 'ডেমো ডেটা রিসেট হয়েছে',
      description: 'পণ্য, অর্ডার ও স্টোর তথ্য ফিক্সচারে ফিরে গেছে; কার্ট ও উইশলিস্ট খালি।',
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="প্রেফারেন্স"
        description="সতর্কতা, ইমেইল সারসংক্ষেপ ও ডেমো ডেটা নিয়ন্ত্রণ — সব শুধু এই ব্রাউজারে।"
        actions={
          <ButtonLink to="/seller/store" variant="outline" leftIcon={<Store aria-hidden className="size-4" />}>
            স্টোর প্রোফাইল
          </ButtonLink>
        }
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="space-y-5">
          <SectionHeader
            title="অর্ডার ও স্টক সতর্কতা"
            subtitle="ড্যাশবোর্ডে কোন ঘটনাগুলো গুরুত্ব দিয়ে দেখাতে হবে।"
            className="mb-0"
          />
          <Switch
            checked={draft.notifyNewOrders}
            onChange={(checked) => setDraft((current) => ({ ...current, notifyNewOrders: checked }))}
            label="নতুন অর্ডারের সতর্কতা"
            description="নতুন অর্ডার এলে সাইডবারে ব্যাজ দেখানো হয়।"
          />
          <Switch
            checked={draft.notifyLowStock}
            onChange={(checked) => setDraft((current) => ({ ...current, notifyLowStock: checked }))}
            label="কম স্টকের সতর্কতা"
            description="স্টক সীমার নিচে নামলে ওভারভিউতে অ্যালার্ট দেখানো হয়।"
          />
          <Input
            label="কম স্টকের সীমা (ইউনিট)"
            type="number"
            min={1}
            max={1000}
            value={thresholdText}
            disabled={!draft.notifyLowStock}
            error={draft.notifyLowStock ? thresholdError : undefined}
            hint="এই সংখ্যা বা তার কম স্টক থাকলে সতর্কতা তৈরি হয়।"
            onChange={(event) => setThresholdText(event.target.value)}
          />
        </Card>

        <div className="space-y-5">
          <Card className="space-y-4">
            <SectionHeader
              title="সাপ্তাহিক সারসংক্ষেপ ইমেইল"
              subtitle="প্রতি সপ্তাহে বিক্রয়ের সারসংক্ষেপ পাওয়ার সেটিং।"
              className="mb-0"
            />
            <Switch
              checked={draft.weeklySummaryEmail}
              onChange={(checked) => setDraft((current) => ({ ...current, weeklySummaryEmail: checked }))}
              label="সাপ্তাহিক ইমেইল চালু"
              description="বিক্রয়, অর্ডার ও কম স্টকের সারসংক্ষেপ।"
            />
            <Alert tone="warning" icon={<Mail aria-hidden className="size-4" />}>
              ডেমো — কোনো ইমেইল পাঠানো হয় না। টগল শুধু আপনার ব্রাউজারে সংরক্ষিত হয়, কোনো ডাকঘর বা সার্ভার নেই।
            </Alert>
          </Card>

          <Card className="space-y-4">
            <SectionHeader
              title="ডেমো ডেটা"
              subtitle="এক ক্লিকে এই ব্রাউজারের সব ডেমো পরিবর্তন মুছে ফিক্সচারে ফিরুন।"
              className="mb-0"
            />
            <p className="text-sm leading-relaxed text-text-secondary">
              রিসেট করলে আপনার যোগ করা পণ্য, বদলানো অর্ডার স্ট্যাটাস, স্টোর প্রোফাইল সম্পাদনা — সব ফিক্সচারে ফিরে যাবে।
              কার্ট ও উইশলিস্ট খালি হবে। এই পেজের প্রেফারেন্স মুছবে না।
            </p>
            <Button
              variant="danger"
              leftIcon={<RefreshCw aria-hidden className="size-4" />}
              onClick={() => setResetOpen(true)}
            >
              ডেমো ডেটা রিসেট
            </Button>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" onClick={handleDefaults}>
          ডিফল্টে ফিরান
        </Button>
        <Button variant="outline" onClick={handleDiscard} disabled={!dirty}>
          পরিবর্তন বাতিল
        </Button>
        <Button onClick={handleSave} disabled={!canSave} leftIcon={<Save aria-hidden className="size-4" />}>
          প্রেফারেন্স সংরক্ষণ
        </Button>
      </div>

      <Card>
        <SectionHeader
          title="অ্যাকাউন্ট ও ভূমিকা"
          subtitle="ডেমো সেশনে আপনার সেলার পরিচয় ও স্টোরের সংক্ষিপ্ত তথ্য।"
        />
        <dl className="divide-y divide-divider">
          <KeyValue label="মালিক">{seller.ownerName}</KeyValue>
          <KeyValue label="স্টোর">{seller.profile.storeNameBn ?? seller.profile.storeName}</KeyValue>
          <KeyValue label="ভূমিকা">সেলার (ডেমো)</KeyValue>
          <KeyValue label="স্ট্যাটাস">
            <Badge tone={STATUS_TONES[seller.status]} size="sm">
              {SELLER_STATUS_LABELS[seller.status]}
            </Badge>
          </KeyValue>
          <KeyValue label="টিয়ার ও কমিশন">
            {seller.tier.toUpperCase()} · <span className="font-num">{toBanglaDigits(seller.commissionRate)}%</span>
          </KeyValue>
          <KeyValue label="যোগদান">{formatDate(seller.joinedAt, { withYear: true })}</KeyValue>
        </dl>
        <div className="mt-4">
          <ButtonLink to="/seller/store" variant="outline">
            স্টোর প্রোফাইল সম্পাদনা
          </ButtonLink>
        </div>
      </Card>

      <DemoNotice title="ডেমো সেটিংস">
        প্রেফারেন্সগুলো শুধু এই ব্রাউজারে (localStorage) জমা থাকে — কোনো অ্যাকাউন্ট, ইমেইল বা ব্যাকএন্ড নেই।
      </DemoNotice>

      <ConfirmDialog
        open={resetOpen}
        title="ডেমো ডেটা রিসেট করবেন?"
        message="পণ্য, অর্ডার, ক্যাটাগরি, কুপন, স্টোর প্রোফাইল — সব ফিক্সচারে ফিরবে। কার্ট ও উইশলিস্ট খালি হবে। এটি ফিরিয়ে নেওয়া যাবে না।"
        confirmLabel="রিসেট করুন"
        onConfirm={handleReset}
        onClose={() => setResetOpen(false)}
      />
    </div>
  );
}
