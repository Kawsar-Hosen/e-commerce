import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save } from 'lucide-react';
import type { z } from 'zod';
import type { Seller } from '@shobdox/shared-types';
import { sellerStoreProfileSchema, type SellerStoreProfileValues } from '@shobdox/shared-validation';
import { useCurrentSeller } from '@/components/layout/SellerLayout';
import { Alert, Button, ButtonLink, Card, Input, PageHeader, SectionHeader, Textarea } from '@/components/ui';
import { StorePreview } from '@/features/seller/StorePreview';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';

/**
 * Store profile editor.
 *
 * The form writes straight back into the seller record in the demo store, so
 * the live preview, the storefront and the seller shell all pick up the change
 * after saving. Trade licence and TIN are display-only demo strings.
 */

type StoreProfileParsed = z.output<typeof sellerStoreProfileSchema>;

function toFormValues(seller: Seller): SellerStoreProfileValues {
  return {
    storeName: seller.profile.storeName,
    storeNameBn: seller.profile.storeNameBn ?? '',
    tagline: seller.profile.tagline,
    description: seller.profile.description,
    tradeLicense: seller.profile.tradeLicense ?? '',
    tin: seller.profile.tin ?? '',
    pickupAddress: seller.profile.pickupAddress,
    supportPhone: seller.profile.supportPhone,
    supportEmail: seller.profile.supportEmail ?? '',
    returnPolicyDays: seller.profile.returnPolicyDays,
    shipsWithinDays: seller.profile.shipsWithinDays,
  };
}

export default function SellerStorePage() {
  const seller = useCurrentSeller();

  const form = useForm<SellerStoreProfileValues, unknown, StoreProfileParsed>({
    resolver: zodResolver(sellerStoreProfileSchema),
    defaultValues: toFormValues(seller),
  });

  const { errors } = form.formState;
  const watched = form.watch();

  const onSubmit = (values: StoreProfileParsed) => {
    useDataStore.setState((state) => ({
      sellers: state.sellers.map((candidate) =>
        candidate.id === seller.id
          ? {
              ...candidate,
              profile: {
                ...candidate.profile,
                storeName: values.storeName,
                storeNameBn: values.storeNameBn,
                tagline: values.tagline,
                description: values.description,
                pickupAddress: values.pickupAddress,
                supportPhone: values.supportPhone,
                supportEmail: values.supportEmail,
                returnPolicyDays: values.returnPolicyDays,
                shipsWithinDays: values.shipsWithinDays,
              },
            }
          : candidate,
      ),
    }));

    form.reset(values);
    toast({
      tone: 'success',
      title: 'স্টোর প্রোফাইল সংরক্ষিত',
      description: `${values.storeNameBn ?? values.storeName} — পরিবর্তন স্টোরফ্রন্ট প্রিভিউতে দেখা যাচ্ছে।`,
    });
  };

  const resetToSaved = () => {
    form.reset(toFormValues(seller));
    toast({
      tone: 'info',
      title: 'ফর্ম রিসেট হয়েছে',
      description: 'সংরক্ষিত স্টোর তথ্য ফিরিয়ে আনা হয়েছে।',
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="স্টোর প্রোফাইল"
        description="স্টোরের নাম, বিবরণ, নীতি ও যোগাযোগের তথ্য — স্টোরফ্রন্টে এই তথ্যই দেখানো হবে।"
        actions={
          <>
            <ButtonLink to="/seller/settings" variant="ghost">
              প্রেফারেন্স
            </ButtonLink>
            <Button type="submit" form="seller-store-form" leftIcon={<Save aria-hidden className="size-4" />}>
              সংরক্ষণ করুন
            </Button>
          </>
        }
      />

      <form id="seller-store-form" className="grid gap-5 xl:grid-cols-[1fr_380px]" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <Card className="space-y-4">
            <SectionHeader
              title="মৌলিক তথ্য"
              subtitle="নাম ও ট্যাগলাইন স্টোর হেডারে দেখানো হয়।"
              className="mb-0"
            />
            <Input
              label="স্টোরের নাম (ইংরেজি)"
              required
              error={errors.storeName?.message}
              autoComplete="organization"
              {...form.register('storeName')}
            />
            <Input
              label="স্টোরের নাম (বাংলা)"
              hint="খালি রাখলে ইংরেজি নাম দেখানো হবে।"
              error={errors.storeNameBn?.message}
              {...form.register('storeNameBn')}
            />
            <Input
              label="ট্যাগলাইন"
              required
              error={errors.tagline?.message}
              placeholder="যেমন: ঢাকার বিশ্বস্ত ইলেকট্রনিকস স্টোর"
              {...form.register('tagline')}
            />
            <Textarea
              label="স্টোরের বিবরণ"
              required
              rows={4}
              hint="সংক্ষেপে কী বিক্রি করেন ও কেন গ্রাহক আপনাকে বেছে নেবে।"
              error={errors.description?.message}
              {...form.register('description')}
            />
          </Card>

          <Card className="space-y-4">
            <SectionHeader
              title="যোগাযোগ ও পিকআপ"
              subtitle="ডেলিভারি পার্টনার এই ঠিকানা থেকে পণ্য সংগ্রহ করবে।"
              className="mb-0"
            />
            <Textarea
              label="পিকআপ ঠিকানা"
              required
              rows={2}
              error={errors.pickupAddress?.message}
              {...form.register('pickupAddress')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="সাপোর্ট ফোন"
                required
                inputMode="tel"
                placeholder="01XXXXXXXXX"
                error={errors.supportPhone?.message}
                {...form.register('supportPhone')}
              />
              <Input
                label="সাপোর্ট ইমেইল"
                type="email"
                hint="ঐচ্ছিক — গ্রাহককে দেখানো হয়।"
                error={errors.supportEmail?.message}
                {...form.register('supportEmail')}
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <SectionHeader title="রিটার্ন ও শিপিং নীতি" subtitle="সংখ্যাগুলো পণ্য কার্ডে ব্যাজ হিসেবে দেখা যায়।" className="mb-0" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="রিটার্ন সময় (দিন)"
                type="number"
                min={0}
                max={60}
                required
                error={errors.returnPolicyDays?.message}
                {...form.register('returnPolicyDays', { valueAsNumber: true })}
              />
              <Input
                label="শিপিং সময় (দিন)"
                type="number"
                min={1}
                max={30}
                required
                error={errors.shipsWithinDays?.message}
                {...form.register('shipsWithinDays', { valueAsNumber: true })}
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <SectionHeader
              title="যাচাই তথ্য (পাঠ-শুধু)"
              subtitle="ডেমো ভ্যালু — কোনো প্রতিষ্ঠান বা সরকারি রেকর্ডের সাথে যাচাই করা হয় না।"
              className="mb-0"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="ট্রেড লাইসেন্স (ডেমো)" defaultValue={seller.profile.tradeLicense ?? '—'} disabled />
              <Input label="TIN (ডেমো)" defaultValue={seller.profile.tin ?? '—'} disabled />
            </div>
            <Alert tone="info">
              ট্রেড লাইসেন্স ও TIN ডেমো ভ্যালু হিসেবে স্থির রাখা হয়েছে — প্রকৃত প্ল্যাটফর্মে প্রশাসক এগুলো যাচাই করে
              নিশ্চিত করেন। এই ফর্ম থেকে এগুলো বদলানো যায় না।
            </Alert>
          </Card>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              leftIcon={<RotateCcw aria-hidden className="size-4" />}
              onClick={resetToSaved}
            >
              সংরক্ষিত মানে ফিরুন
            </Button>
            <Button type="submit" leftIcon={<Save aria-hidden className="size-4" />} loading={form.formState.isSubmitting}>
              স্টোর প্রোফাইল সংরক্ষণ করুন
            </Button>
          </div>
        </div>

        <div className="xl:sticky xl:top-4 xl:self-start">
          <StorePreview values={watched} seller={seller} />
          <p className="mt-3 text-xs text-text-secondary">
            স্টোরফ্রন্টের সামগ্রিক চেহারার সাথে মিলিয়ে দেখতে প্রিভিউটি সঙ্গে সঙ্গে বদলায় — সংরক্ষণের আগেই।
          </p>
        </div>
      </form>
    </div>
  );
}
