import { Plus, Trash2, Wand2 } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import { Button, Card, IconButton, Input, Select } from '@/components/ui';
import { regenerateVariants } from '@/services/admin.service';
import { toast } from '@/store/ui.store';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { OPTIONAL_NUMBER, type ProductFormReturn } from './productFormModel';

/**
 * Option editor + variant-matrix generator.
 *
 * Options (রং, সাইজ…) are edited with a nested `useFieldArray`; pressing
 * “ভ্যারিয়েন্ট তৈরি করুন” hands the current draft to `regenerateVariants()`,
 * the same helper the demo catalogue uses, so SKUs and combinations always
 * match the shopper-facing choice list.
 */

const DISPLAY_OPTIONS = [
  { value: 'swatch', label: 'রঙের সোয়াচ' },
  { value: 'chip', label: 'চিপ' },
  { value: 'select', label: 'ড্রপডাউন' },
];

const randomId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;

function blankValue() {
  return { id: randomId('val'), label: '', labelBn: '', hex: '', priceDelta: undefined, stock: 0 };
}

function blankOption() {
  return { id: randomId('opt'), name: '', display: 'chip' as const, values: [blankValue()] };
}

export function ProductOptionsEditor({ form, productId = 'p-admin-new' }: { form: ProductFormReturn; productId?: string }) {
  const { control, getValues, setValue, watch } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'options' });

  const options = watch('options') ?? [];
  const combinationCount = options.reduce((count, option) => count * Math.max(1, option.values.length), 1);

  const generate = () => {
    const values = getValues();
    const variants = regenerateVariants(values.options ?? [], {
      id: productId,
      price: values.price,
      compareAtPrice: values.compareAtPrice,
      skuPrefix: (values.sku || 'SDX-NEW').toUpperCase(),
      previous: values.variants,
    });

    setValue('variants', variants, { shouldDirty: true, shouldValidate: true });
    toast({
      tone: 'success',
      title: `${toBanglaDigits(variants.length)}টি ভ্যারিয়েন্ট তৈরি হয়েছে`,
      description: 'নিচের ম্যাট্রিক্সে দাম ও স্টক ঠিক করে নিন।',
    });
  };

  return (
    <Card as="section">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">অপশন</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            রং, সাইজ বা ধারণক্ষমতার মতো বৈশিষ্ট্য; প্রতিটি মান একটি ভ্যারিয়েন্ট তৈরি করে।
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" leftIcon={<Plus aria-hidden className="size-4" />} onClick={() => append(blankOption())}>
            অপশন যোগ
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Wand2 aria-hidden className="size-4" />}
            disabled={options.length === 0}
            onClick={generate}
          >
            ভ্যারিয়েন্ট তৈরি করুন
          </Button>
        </div>
      </div>

      {fields.length === 0 ? (
        <p className="mt-3 text-sm text-text-secondary">
          অপশন না থাকলে পণ্যটির একটি ডিফল্ট ভ্যারিয়েন্ট থাকবে — চাইলে পরে অপশন যোগ করে{" "}
          “ভ্যারিয়েন্ট তৈরি করুন” চাপুন।
        </p>
      ) : (
        <>
          <p className="mt-3 rounded-card bg-surface-muted px-3 py-2 text-sm text-text-secondary">
            বর্তমান অপশনে {toBanglaDigits(combinationCount)}টি ভ্যারিয়েন্ট হবে। “ভ্যারিয়েন্ট তৈরি করুন” চাপলে
            ম্যাট্রিক্স নতুন করে সাজানো হবে — হাতে লেখা SKU ও স্টক মিলে গেলে সংরক্ষিত থাকবে।
          </p>

          <div className="mt-3 space-y-4">
            {fields.map((field, index) => (
              <OptionRow key={field.id} form={form} index={index} onRemove={() => remove(index)} />
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function OptionRow({ form, index, onRemove }: { form: ProductFormReturn; index: number; onRemove: () => void }) {
  const {
    control,
    register,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: `options.${index}.values` });
  const optionErrors = errors.options?.[index];

  return (
    <fieldset className="rounded-card border border-border p-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
        <Input
          label={index === 0 ? 'অপশনের নাম (ইংরেজি)' : undefined}
          aria-label="অপশনের নাম (ইংরেজি)"
          placeholder="যেমন: Color"
          required
          {...register(`options.${index}.name`)}
          error={optionErrors?.name?.message}
        />
        <Select
          label={index === 0 ? 'প্রদর্শন ধরন' : undefined}
          aria-label="প্রদর্শন ধরন"
          options={DISPLAY_OPTIONS}
          {...register(`options.${index}.display`)}
        />
        <IconButton label="অপশন মুছুন" variant="ghost" onClick={onRemove}>
          <Trash2 aria-hidden className="size-4" />
        </IconButton>
      </div>

      <ul className="mt-3 space-y-3">
        {fields.map((valueField, valueIndex) => (
          <li key={valueField.id} className="grid gap-3 rounded-card bg-surface-muted/60 p-3 md:grid-cols-6 md:items-start">
            <Input
              label={valueIndex === 0 ? 'মান (ইংরেজি)' : undefined}
              aria-label="মান (ইংরেজি)"
              placeholder="যেমন: Midnight Black"
              required
              {...register(`options.${index}.values.${valueIndex}.label`)}
              error={optionErrors?.values?.[valueIndex]?.label?.message}
            />
            <Input
              label={valueIndex === 0 ? 'মান (বাংলা)' : undefined}
              aria-label="মান (বাংলা)"
              placeholder="যেমন: মিডনাইট ব্ল্যাক"
              {...register(`options.${index}.values.${valueIndex}.labelBn`)}
            />
            <Input
              label={valueIndex === 0 ? 'হেক্স' : undefined}
              aria-label="হেক্স কালার"
              placeholder="#1A1A1A"
              {...register(`options.${index}.values.${valueIndex}.hex`)}
              error={optionErrors?.values?.[valueIndex]?.hex?.message}
            />
            <Input
              label={valueIndex === 0 ? 'অতিরিক্ত দাম (৳)' : undefined}
              aria-label="অতিরিক্ত দাম"
              type="number"
              step="1"
              inputMode="numeric"
              {...register(`options.${index}.values.${valueIndex}.priceDelta`, OPTIONAL_NUMBER)}
            />
            <Input
              label={valueIndex === 0 ? 'স্টক' : undefined}
              aria-label="স্টক"
              type="number"
              min={0}
              inputMode="numeric"
              {...register(`options.${index}.values.${valueIndex}.stock`, { valueAsNumber: true })}
              error={optionErrors?.values?.[valueIndex]?.stock?.message}
            />
            <IconButton
              label="মান মুছুন"
              variant="ghost"
              disabled={fields.length === 1}
              onClick={() => remove(valueIndex)}
            >
              <Trash2 aria-hidden className="size-4" />
            </IconButton>
          </li>
        ))}
      </ul>

      <Button
        variant="ghost"
        size="sm"
        className="mt-2"
        leftIcon={<Plus aria-hidden className="size-4" />}
        onClick={() => append(blankValue())}
      >
        মান যোগ
      </Button>
    </fieldset>
  );
}
