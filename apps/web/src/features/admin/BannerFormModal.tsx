import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Button, Checkbox, Input, Modal, Select, Textarea } from '@/components/ui';
import { bannerFormSchema, type BannerFormValues } from '@shobdox/shared-validation';
import type { Banner } from '@shobdox/shared-types';
import { bannerFromFormValues, bannerToFormValues } from '@/services/admin.service';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { BannerPreview } from './BannerPreview';

type BannerParsed = z.output<typeof bannerFormSchema>;

const THEME_OPTIONS = [
  { value: 'primary', label: 'প্রাইমারি (সবুজ)' },
  { value: 'accent', label: 'অ্যাকসেন্ট (অ্যাম্বার)' },
  { value: 'dark', label: 'ডার্ক' },
  { value: 'soft', label: 'সফট' },
];

const PLACEMENT_OPTIONS = [
  { value: 'hero', label: 'হিরো' },
  { value: 'strip', label: 'স্ট্রিপ' },
  { value: 'category', label: 'ক্যাটাগরি' },
  { value: 'footer', label: 'ফুটার' },
];

function newBannerValues(): BannerFormValues {
  const today = new Date().toISOString().slice(0, 10);
  const inAMonth = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

  return {
    title: '',
    subtitle: '',
    ctaLabel: 'এখনই কিনুন',
    href: '/shop',
    theme: 'primary',
    placement: 'hero',
    displayOrder: 1,
    isActive: true,
    startsAt: today,
    endsAt: inAMonth,
  };
}

/** Create/edit banner dialog with a live token-coloured preview. */
export function BannerFormModal({
  open,
  onClose,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  existing?: Banner;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerFormValues, unknown, BannerParsed>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: existing ? bannerToFormValues(existing) : newBannerValues(),
  });

  useEffect(() => {
    if (!open) return;
    reset(existing ? bannerToFormValues(existing) : newBannerValues());
    // Re-seed only when a different banner is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existing?.id, reset]);

  const theme = watch('theme');
  const title = watch('title');
  const subtitle = watch('subtitle');
  const ctaLabel = watch('ctaLabel');

  const onSubmit = handleSubmit((values) => {
    const banner = bannerFromFormValues(values, existing);
    useDataStore.getState().upsertBanner(banner);
    toast({
      tone: 'success',
      title: existing ? 'ব্যানার আপডেট হয়েছে' : 'নতুন ব্যানার যোগ হয়েছে',
      description: banner.title,
    });
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? 'ব্যানার সম্পাদনা' : 'নতুন ব্যানার'}
      description="ব্যানারের টেক্সট ও রঙ ডিজাইন টোকেন থেকে আসে — ছবি ছাড়াও স্টোরফ্রন্টে সুন্দর দেখায়।"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            বাতিল
          </Button>
          <Button type="submit" form="banner-form">
            {existing ? 'পরিবর্তন সংরক্ষণ করুন' : 'ব্যানার যোগ করুন'}
          </Button>
        </>
      }
    >
      <form id="banner-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input label="শিরোনাম" required {...register('title')} error={errors.title?.message} />
        <Textarea label="উপশিরোনাম" required rows={2} {...register('subtitle')} error={errors.subtitle?.message} />

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="বাটনের লেখা" required {...register('ctaLabel')} error={errors.ctaLabel?.message} />
          <Input
            label="লিংক"
            required
            hint="/shop অথবা https:// দিয়ে শুরু করুন"
            {...register('href')}
            error={errors.href?.message}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Select label="থিম" required options={THEME_OPTIONS} {...register('theme')} error={errors.theme?.message} />
          <Select
            label="প্লেসমেন্ট"
            required
            options={PLACEMENT_OPTIONS}
            {...register('placement')}
            error={errors.placement?.message}
          />
          <Input
            label="ক্রম"
            type="number"
            min={0}
            {...register('displayOrder', { valueAsNumber: true })}
            error={errors.displayOrder?.message}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="শুরুর তারিখ" type="date" required {...register('startsAt')} error={errors.startsAt?.message} />
          <Input label="শেষের তারিখ" type="date" required {...register('endsAt')} error={errors.endsAt?.message} />
        </div>

        <Checkbox
          checked={Boolean(watch('isActive'))}
          onChange={(checked) => setValue('isActive', checked)}
          label="ব্যানারটি এখনই চালু করুন"
        />

        <BannerPreview title={title} subtitle={subtitle} ctaLabel={ctaLabel} theme={theme} />
      </form>
    </Modal>
  );
}
