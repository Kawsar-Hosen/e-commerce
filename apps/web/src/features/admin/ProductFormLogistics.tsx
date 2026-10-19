import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import { Button, Card, IconButton, Input } from '@/components/ui';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { OPTIONAL_NUMBER, type ProductFormReturn } from './productFormModel';

/**
 * Pricing, delivery and specifications.
 *
 * The base price/SKU/stock here are what `regenerateVariants()` starts from;
 * the variant matrix (its own editor) is the source of truth for the record
 * that gets saved, and `recalculateProduct()` re-derives the listing price and
 * total stock from it.
 */

export function ProductPricingSection({ form }: { form: ProductFormReturn }) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const price = watch('price');
  const compareAt = watch('compareAtPrice');
  const discount =
    typeof compareAt === 'number' && compareAt > (price ?? 0)
      ? Math.round(((compareAt - (price ?? 0)) / compareAt) * 100)
      : 0;

  return (
    <Card as="section">
      <h2 className="text-lg font-semibold text-text-primary">দাম, SKU ও স্টক</h2>
      <p className="mt-0.5 text-sm text-text-secondary">
        ভিত্তি (বেস) মান — ভ্যারিয়েন্ট ম্যাট্রিক্স তৈরি বা পুনরায় তৈরি করলে এখান থেকেই শুরু হয়।
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Input
          label="বর্তমান দাম (৳)"
          required
          type="number"
          min={1}
          step="1"
          inputMode="numeric"
          {...register('price', { valueAsNumber: true })}
          error={errors.price?.message}
        />
        <Input
          label="আগের দাম (৳)"
          type="number"
          min={1}
          step="1"
          inputMode="numeric"
          hint={discount > 0 ? `কার্ডে −${toBanglaDigits(discount)}% ছাড় দেখাবে` : 'ছাড় দেখাতে চাইলে পূরণ করুন'}
          {...register('compareAtPrice', OPTIONAL_NUMBER)}
          error={errors.compareAtPrice?.message}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Input
          label="ডিফল্ট SKU"
          required
          hint="নতুন ভ্যারিয়েন্টের SKU এই প্রিফিক্স থেকে বানানো হয়"
          {...register('sku')}
          error={errors.sku?.message}
        />
        <Input
          label="ভিত্তি স্টক"
          required
          type="number"
          min={0}
          inputMode="numeric"
          hint="ভ্যারিয়েন্ট স্টকের হিসাব এই মানের সাথে মিলিয়ে নেওয়া হয়"
          {...register('stock', { valueAsNumber: true })}
          error={errors.stock?.message}
        />
      </div>

      {discount > 0 && typeof compareAt === 'number' ? (
        <p className="mt-3 rounded-card bg-primary-soft px-3 py-2 text-sm text-primary-dark">
          গ্রাহক {formatTaka(compareAt)} দামে দেখবেন {formatTaka(price ?? 0)} — সাশ্রয়{' '}
          {formatTaka(compareAt - (price ?? 0))}।
        </p>
      ) : null}
    </Card>
  );
}

export function ProductDeliverySection({ form }: { form: ProductFormReturn }) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const inside = watch('deliveryFeeInsideDhaka');
  const outside = watch('deliveryFeeOutsideDhaka');

  return (
    <Card as="section">
      <h2 className="text-lg font-semibold text-text-primary">ডেলিভারি ফি</h2>
      <p className="mt-0.5 text-sm text-text-secondary">
        ঢাকার ভেতরে ও বাইরে আলাদা ফি; ০ দিলে কার্ডে “ফ্রি ডেলিভারি” দেখানো হবে।
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Input
          label="ঢাকার ভেতরে (৳)"
          required
          type="number"
          min={0}
          max={2000}
          inputMode="numeric"
          hint={inside === 0 ? 'ফ্রি ডেলিভারি ব্যাজ দেখানো হবে' : undefined}
          {...register('deliveryFeeInsideDhaka', { valueAsNumber: true })}
          error={errors.deliveryFeeInsideDhaka?.message}
        />
        <Input
          label="ঢাকার বাইরে (৳)"
          required
          type="number"
          min={0}
          max={2000}
          inputMode="numeric"
          hint={outside === 0 ? 'পুরো দেশে ফ্রি ডেলিভারি' : undefined}
          {...register('deliveryFeeOutsideDhaka', { valueAsNumber: true })}
          error={errors.deliveryFeeOutsideDhaka?.message}
        />
      </div>
    </Card>
  );
}

export function ProductSpecificationsSection({ form }: { form: ProductFormReturn }) {
  const {
    control,
    register,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'specifications' });

  return (
    <Card as="section">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">স্পেসিফিকেশন</h2>
          <p className="mt-0.5 text-sm text-text-secondary">ডিটেইল পেজের টেবিলে পাশাপাশি দেখানো হয়।</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Plus aria-hidden className="size-4" />}
          onClick={() => append({ label: '', value: '' })}
        >
          সারি যোগ
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="mt-3 text-sm text-text-secondary">এখনো কোনো স্পেসিফিকেশন নেই — যেমন “ব্যাটারি” → “৫০০০ mAh”।</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {fields.map((field, index) => (
            <li key={field.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
              <Input
                label={index === 0 ? 'নাম' : undefined}
                aria-label="স্পেসিফিকেশনের নাম"
                placeholder="যেমন: ব্যাটারি"
                {...register(`specifications.${index}.label`)}
                error={errors.specifications?.[index]?.label?.message}
              />
              <Input
                label={index === 0 ? 'মান' : undefined}
                aria-label="স্পেসিফিকেশনের মান"
                placeholder="যেমন: ৫০০০ mAh"
                {...register(`specifications.${index}.value`)}
                error={errors.specifications?.[index]?.value?.message}
              />
              <IconButton
                label="স্পেসিফিকেশন সারি মুছুন"
                variant="ghost"
                className="sm:mt-0"
                onClick={() => remove(index)}
              >
                <Trash2 aria-hidden className="size-4" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
