import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Button, Card, IconButton, Input, SectionHeader, Select } from '@/components/ui';
import { regenerateVariants } from '@/services/admin.service';
import { toast } from '@/store/ui.store';
import { toBanglaDigits } from '@/lib/format';
import type {
  ProductForm,
  ProductOptionDraft,
  ProductOptionValueDraft,
  ProductVariantDraft,
  SpecificationDraft,
} from './productForm';

/**
 * Option + variant editor.
 *
 * Any structural change (adding/removing an option or value) regenerates the
 * variant matrix through `regenerateVariants()`; the "রিফ্রেশ" button re-runs it
 * after the base price or SKU prefix changes. Manual SKU/price/stock edits are
 * preserved as long as the option combination still exists.
 */
export function OptionsVariantsEditor({ form, productId }: { form: ProductForm; productId: string }) {
  const options = form.watch('options') ?? [];
  const variants = form.watch('variants') ?? [];

  const applyOptions = (next: ProductOptionDraft[]) => {
    form.setValue('options', next, { shouldDirty: true });
    const regenerated = regenerateVariants(next, {
      id: productId,
      price: form.getValues('price'),
      compareAtPrice: form.getValues('compareAtPrice'),
      skuPrefix: form.getValues('sku'),
      previous: form.getValues('variants'),
    });
    form.setValue('variants', regenerated, { shouldDirty: true });
  };

  const updateOption = (index: number, patch: Partial<ProductOptionDraft>) => {
    applyOptions(options.map((option, position) => (position === index ? { ...option, ...patch } : option)));
  };

  const updateValue = (optionIndex: number, valueIndex: number, patch: Partial<ProductOptionValueDraft>) => {
    applyOptions(
      options.map((option, position) =>
        position === optionIndex
          ? {
              ...option,
              values: option.values.map((value, inner) => (inner === valueIndex ? { ...value, ...patch } : value)),
            }
          : option,
      ),
    );
  };

  const addOption = () => {
    const suffix = Math.random().toString(36).slice(2, 6);
    applyOptions([
      ...options,
      {
        id: `option-${options.length + 1}-${suffix}`,
        name: '',
        display: 'chip',
        values: [{ id: `value-${suffix}`, label: '', labelBn: '', hex: '', priceDelta: undefined, stock: 0 }],
      },
    ]);
  };

  const addValue = (optionIndex: number) => {
    const option = options[optionIndex];
    if (!option) return;
    const suffix = Math.random().toString(36).slice(2, 6);
    updateOption(optionIndex, {
      values: [...option.values, { id: `value-${suffix}`, label: '', labelBn: '', hex: '', priceDelta: undefined, stock: 0 }],
    });
  };

  const variantLabelOf = (variant: ProductVariantDraft): string =>
    Object.entries(variant.optionValues)
      .map(([optionId, valueId]) => {
        const option = options.find((candidate) => candidate.id === optionId);
        const value = option?.values.find((candidate) => candidate.id === valueId);
        return value?.labelBn || value?.label || valueId;
      })
      .filter(Boolean)
      .join(' / ') || 'ডিফল্ট';

  const updateVariant = (index: number, patch: Partial<ProductVariantDraft>) => {
    form.setValue(
      'variants',
      variants.map((variant, position) => (position === index ? { ...variant, ...patch } : variant)),
      { shouldDirty: true },
    );
  };

  return (
    <Card>
      <SectionHeader
        title="অপশন ও ভ্যারিয়েন্ট"
        subtitle="রঙ/সাইজের মতো অপশন যোগ করলে প্রতিটি কম্বিনেশনের জন্য আলাদা SKU তৈরি হবে।"
        action={
          <Button variant="outline" size="sm" leftIcon={<RefreshCw aria-hidden className="size-4" />} onClick={() => applyOptions(options)}>
            ম্যাট্রিক্স রিফ্রেশ
          </Button>
        }
      />

      {options.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-strong bg-surface-muted/60 px-3 py-2 text-sm text-text-secondary">
          কোনো অপশন নেই — পণ্যটির একটি ডিফল্ট ভ্যারিয়েন্ট থাকবে। রঙ বা সাইজ থাকলে অপশন যোগ করুন।
        </p>
      ) : (
        <div className="space-y-4">
          {options.map((option, optionIndex) => (
            <div key={option.id} className="rounded-card border border-border p-3">
              <div className="flex flex-wrap items-end gap-3">
                <Input
                  label="অপশনের নাম"
                  wrapperClassName="min-w-40 flex-1"
                  value={option.name}
                  placeholder="যেমন: রঙ"
                  onChange={(event) => updateOption(optionIndex, { name: event.target.value })}
                />
                <Select
                  label="ডিসপ্লে"
                  wrapperClassName="w-32"
                  value={option.display}
                  options={[
                    { value: 'swatch', label: 'স্যাচ' },
                    { value: 'chip', label: 'চিপ' },
                    { value: 'select', label: 'ড্রপডাউন' },
                  ]}
                  onChange={(event) => updateOption(optionIndex, { display: event.target.value as ProductOptionDraft['display'] })}
                />
                <IconButton label="অপশন মুছুন" variant="ghost" className="text-error" onClick={() => applyOptions(options.filter((_, position) => position !== optionIndex))}>
                  <Trash2 aria-hidden className="size-4" />
                </IconButton>
              </div>

              <ul className="mt-3 space-y-2">
                {option.values.map((value, valueIndex) => (
                  <li key={`${option.id}-${valueIndex}`} className="flex flex-wrap items-end gap-2">
                    <Input label="ভ্যালু" wrapperClassName="min-w-32 flex-1" value={value.label} placeholder="যেমন: লাল" onChange={(event) => updateValue(optionIndex, valueIndex, { label: event.target.value })} />
                    <Input label="বাংলা ভ্যালু" wrapperClassName="min-w-32 flex-1" value={value.labelBn ?? ''} onChange={(event) => updateValue(optionIndex, valueIndex, { labelBn: event.target.value })} />
                    {option.display === 'swatch' ? (
                      <Input label="হেক্স" wrapperClassName="w-28" value={value.hex ?? ''} placeholder="#RRGGBB" onChange={(event) => updateValue(optionIndex, valueIndex, { hex: event.target.value })} />
                    ) : null}
                    <Input
                      label="দাম যোগ/বিয়োগ"
                      wrapperClassName="w-28"
                      type="number"
                      value={value.priceDelta ?? ''}
                      onChange={(event) => updateValue(optionIndex, valueIndex, { priceDelta: event.target.value === '' ? undefined : Number(event.target.value) })}
                    />
                    <Input
                      label="স্টক"
                      wrapperClassName="w-24"
                      type="number"
                      min={0}
                      value={value.stock}
                      onChange={(event) => updateValue(optionIndex, valueIndex, { stock: Number(event.target.value) })}
                    />
                    {option.values.length > 1 ? (
                      <IconButton label="ভ্যালু মুছুন" variant="ghost" className="text-error" onClick={() => updateOption(optionIndex, { values: option.values.filter((_, inner) => inner !== valueIndex) })}>
                        <Trash2 aria-hidden className="size-4" />
                      </IconButton>
                    ) : null}
                  </li>
                ))}
              </ul>

              <Button variant="ghost" size="sm" className="mt-2" leftIcon={<Plus aria-hidden className="size-4" />} onClick={() => addValue(optionIndex)}>
                ভ্যালু যোগ করুন
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" size="sm" className="mt-3" leftIcon={<Plus aria-hidden className="size-4" />} onClick={addOption}>
        অপশন যোগ করুন
      </Button>

      <div className="mt-5">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">
          ভ্যারিয়েন্ট তালিকা ({toBanglaDigits(variants.length)})
        </h3>
        <ul className="space-y-2">
          {variants.map((variant, index) => (
            <li key={variant.id} className="grid gap-2 rounded-card border border-border p-3 md:grid-cols-[1.2fr_1fr_1fr_0.7fr]">
              <div className="min-w-0">
                <p className="text-xs text-text-secondary">{variantLabelOf(variant)}</p>
                <Input label="SKU" value={variant.sku} onChange={(event) => updateVariant(index, { sku: event.target.value })} />
              </div>
              <Input label="দাম (৳)" type="number" min={1} value={variant.price} onChange={(event) => updateVariant(index, { price: Number(event.target.value) })} />
              <Input label="আগের দাম (৳)" type="number" value={variant.compareAtPrice ?? ''} onChange={(event) => updateVariant(index, { compareAtPrice: event.target.value === '' ? undefined : Number(event.target.value) })} />
              <Input label="স্টক" type="number" min={0} value={variant.stock} onChange={(event) => updateVariant(index, { stock: Number(event.target.value) })} />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-text-secondary">
          দাম বা SKU প্রিফিক্স বদলালে উপরের “ম্যাট্রিক্স রিফ্রেশ” চাপুন — তাহলে ভ্যারিয়েন্টের দাম আবার হিসাব হবে।
        </p>
      </div>
    </Card>
  );
}

export function SpecificationsEditor({ form }: { form: ProductForm }) {
  const specifications = form.watch('specifications') ?? [];

  const update = (index: number, patch: Partial<SpecificationDraft>) => {
    form.setValue(
      'specifications',
      specifications.map((spec, position) => (position === index ? { ...spec, ...patch } : spec)),
      { shouldDirty: true },
    );
  };

  return (
    <Card>
      <SectionHeader title="স্পেসিফিকেশন" subtitle="যেমন: ব্র্যান্ড — ওয়ালটন, ওয়ারেন্টি — ১ বছর।" />
      {specifications.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-strong bg-surface-muted/60 px-3 py-2 text-sm text-text-secondary">
          এখনো কোনো স্পেসিফিকেশন যোগ করা হয়নি।
        </p>
      ) : (
        <ul className="space-y-2">
          {specifications.map((spec, index) => (
            <li key={index} className="flex items-end gap-2">
              <Input label="নাম" wrapperClassName="min-w-32 flex-1" value={spec.label} onChange={(event) => update(index, { label: event.target.value })} />
              <Input label="মান" wrapperClassName="min-w-40 flex-[2]" value={spec.value} onChange={(event) => update(index, { value: event.target.value })} />
              <IconButton label="স্পেসিফিকেশন মুছুন" variant="ghost" className="text-error" onClick={() => form.setValue('specifications', specifications.filter((_, position) => position !== index), { shouldDirty: true })}>
                <Trash2 aria-hidden className="size-4" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        leftIcon={<Plus aria-hidden className="size-4" />}
        onClick={() => {
          form.setValue('specifications', [...specifications, { label: '', value: '' }], { shouldDirty: true });
          toast({ tone: 'info', title: 'নতুন স্পেসিফিকেশন সারি যোগ হয়েছে' });
        }}
      >
        স্পেসিফিকেশন যোগ করুন
      </Button>
    </Card>
  );
}
