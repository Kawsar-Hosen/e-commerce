import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, Input, Modal, Select, Textarea } from '@/components/ui';
import { couponFormSchema, type CouponFormParsed, type CouponFormValues } from '@shobdox/shared-validation';
import type { Category, Coupon } from '@shobdox/shared-types';
import { couponFromFormValues, couponToFormValues } from '@/services/admin.service';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';

const COUPON_TYPES = [
  { value: 'percentage', label: 'শতকরা ছাড় (%)' },
  { value: 'fixed', label: 'নির্দিষ্ট টাকা ছাড় (৳)' },
  { value: 'free-delivery', label: 'ফ্রি ডেলিভারি' },
];

function newCouponValues(): CouponFormValues {
  const today = new Date().toISOString().slice(0, 10);
  const inAMonth = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

  return {
    code: '',
    title: '',
    description: '',
    type: 'percentage',
    value: 10,
    maxDiscount: undefined,
    minOrderValue: 0,
    usageLimit: 500,
    usageLimitPerCustomer: 1,
    startsAt: today,
    expiresAt: inAMonth,
    isActive: true,
    categoryIds: [],
  };
}

/** Create/edit coupon dialog. Validated by the shared coupon schema. */
export function CouponFormModal({
  open,
  onClose,
  existing,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  existing?: Coupon;
  categories: Category[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CouponFormValues, unknown, CouponFormParsed>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: existing ? couponToFormValues(existing) : newCouponValues(),
  });

  useEffect(() => {
    if (!open) return;
    reset(existing ? couponToFormValues(existing) : newCouponValues());
    // Re-seed only when a different coupon is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existing?.id, reset]);

  const selectedCategoryIds = watch('categoryIds') ?? [];
  const type = watch('type');

  const onSubmit = handleSubmit((values) => {
    const coupon = couponFromFormValues(values, existing);
    useDataStore.getState().upsertCoupon(coupon);
    toast({
      tone: 'success',
      title: existing ? 'কুপন আপডেট হয়েছে' : 'নতুন কুপন তৈরি হয়েছে',
      description: coupon.code,
    });
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? 'কুপন সম্পাদনা' : 'নতুন কুপন'}
      description="কুপন ডেমো ডেটাতেই সংরক্ষিত হয় — চেকআউটে তাৎক্ষণিক যাচাই হয়।"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            বাতিল
          </Button>
          <Button type="submit" form="coupon-form">
            {existing ? 'পরিবর্তন সংরক্ষণ করুন' : 'কুপন তৈরি করুন'}
          </Button>
        </>
      }
    >
      <form id="coupon-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="কোড"
            required
            placeholder="SHOBDOX10"
            hint="শুধু অক্ষর, সংখ্যা ও হাইফেন — স্বয়ংক্রিয়ভাবে বড় হাতের হবে"
            {...register('code')}
            error={errors.code?.message}
          />
          <Input label="শিরোনাম" required {...register('title')} error={errors.title?.message} />
        </div>

        <Textarea label="বিবরণ" required rows={2} {...register('description')} error={errors.description?.message} />

        <div className="grid gap-4 md:grid-cols-3">
          <Select label="ধরন" required options={COUPON_TYPES} {...register('type')} error={errors.type?.message} />
          <Input
            label={type === 'percentage' ? 'ছাড় (%)' : 'ছাড় (৳)'}
            type="number"
            min={0}
            disabled={type === 'free-delivery'}
            {...register('value', { valueAsNumber: true })}
            error={errors.value?.message}
          />
          <Input
            label="সর্বোচ্চ ছাড় (৳)"
            type="number"
            min={0}
            hint="শতকরা কুপনের সীমা; খালি রাখলে সীমা নেই"
            {...register('maxDiscount', {
              setValueAs: (value: string) => (value === '' ? undefined : Number(value)),
            })}
            error={errors.maxDiscount?.message}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="সর্বনিম্ন অর্ডার (৳)"
            type="number"
            min={0}
            {...register('minOrderValue', { valueAsNumber: true })}
            error={errors.minOrderValue?.message}
          />
          <Input
            label="মোট ব্যবহারের সীমা"
            type="number"
            min={1}
            {...register('usageLimit', { valueAsNumber: true })}
            error={errors.usageLimit?.message}
          />
          <Input
            label="প্রতি গ্রাহকের সীমা"
            type="number"
            min={1}
            {...register('usageLimitPerCustomer', { valueAsNumber: true })}
            error={errors.usageLimitPerCustomer?.message}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="শুরুর তারিখ"
            type="date"
            required
            {...register('startsAt')}
            error={errors.startsAt?.message}
          />
          <Input
            label="শেষের তারিখ"
            type="date"
            required
            {...register('expiresAt')}
            error={errors.expiresAt?.message}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-text-primary">প্রযোজ্য ক্যাটাগরি</legend>
          <p className="text-xs text-text-secondary">কিছু নির্বাচন না করলে সব ক্যাটাগরিতে প্রযোজ্য হবে।</p>
          <div className="grid gap-2 md:grid-cols-2">
            {categories.map((category) => (
              <Checkbox
                key={category.id}
                checked={selectedCategoryIds.includes(category.id)}
                onChange={(checked) =>
                  setValue(
                    'categoryIds',
                    checked
                      ? [...selectedCategoryIds, category.id]
                      : selectedCategoryIds.filter((id) => id !== category.id),
                  )
                }
                label={category.nameBn}
              />
            ))}
          </div>
        </fieldset>

        <Checkbox
          checked={Boolean(watch('isActive'))}
          onChange={(checked) => setValue('isActive', checked)}
          label="কুপনটি এখনই সক্রিয় করুন"
        />
      </form>
    </Modal>
  );
}
