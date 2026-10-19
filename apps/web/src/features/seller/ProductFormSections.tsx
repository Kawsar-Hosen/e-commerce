import { useState, type ReactNode } from 'react';
import type { Brand, Category, ProductBadge } from '@shobdox/shared-types';
import { PRODUCT_BADGE_LABELS } from '@shobdox/shared-types';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  SectionHeader,
  Select,
  Switch,
  Textarea,
} from '@/components/ui';
import { toast } from '@/store/ui.store';
import { toBanglaDigits } from '@/lib/format';
import type { ProductForm } from './productForm';

/**
 * Presentational sections of the seller product form.
 *
 * Everything is controlled through the shared `ProductForm` instance, so the
 * page only owns the schema, the submit handler and the section order.
 */

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <SectionHeader title={title} subtitle={description} />
      {children}
    </Card>
  );
}

export function BasicInfoSection({ form }: { form: ProductForm }) {
  const { errors } = form.formState;

  return (
    <Section title="মূল তথ্য" description="ক্রেতা প্রথমে এই লেখাটিই দেখবে — বাংলা নাম দিলে সার্চে সুবিধা হয়।">
      <div className="grid gap-4 lg:grid-cols-2">
        <Input label="পণ্যের নাম (ইংরেজি)" required error={errors.title?.message} {...form.register('title')} />
        <Input label="পণ্যের নাম (বাংলা)" error={errors.titleBn?.message} {...form.register('titleBn')} />
        <Input
          label="স্লাগ"
          required
          hint="URL-এ ব্যবহৃত হবে, যেমন: dhaka-premium-tee"
          error={errors.slug?.message}
          {...form.register('slug')}
        />
        <Input label="সংক্ষিপ্ত বিবরণ" required error={errors.shortDescription?.message} {...form.register('shortDescription')} />
      </div>

      <div className="mt-4 grid gap-4">
        <Textarea label="বিবরণ (ইংরেজি)" required rows={4} error={errors.description?.message} {...form.register('description')} />
        <Textarea label="বিবরণ (বাংলা)" rows={4} error={errors.descriptionBn?.message} {...form.register('descriptionBn')} />
      </div>
    </Section>
  );
}

export function TaxonomySection({
  form,
  categories,
  brands,
}: {
  form: ProductForm;
  categories: Category[];
  brands: Brand[];
}) {
  const { errors } = form.formState;

  return (
    <Section title="ক্যাটাগরি ও ব্র্যান্ড">
      <div className="grid gap-4 lg:grid-cols-2">
        <Select
          label="ক্যাটাগরি"
          required
          placeholder="ক্যাটাগরি বেছে নিন"
          options={categories.map((category) => ({ value: category.id, label: category.nameBn }))}
          error={errors.categoryId?.message}
          {...form.register('categoryId')}
        />
        <Select
          label="ব্র্যান্ড"
          placeholder="ব্র্যান্ড নেই / বেছে নিন"
          options={brands.map((brand) => ({ value: brand.id, label: brand.nameBn ?? brand.name }))}
          error={errors.brandId?.message}
          {...form.register('brandId')}
        />
      </div>
    </Section>
  );
}

export function MediaSection({ form }: { form: ProductForm }) {
  const { errors } = form.formState;
  const gallery = form.watch('gallery') ?? [];

  return (
    <Section
      title="ছবি"
      description="ডেমোতে ছবি আপলোড করা যায় না — শুধু ছবির URL দিন (http/https)। আপলোড পরবর্তী ধাপের কাজ।"
    >
      <div className="grid gap-4">
        <Input
          label="প্রধান ছবির URL"
          required
          placeholder="https://…"
          error={errors.thumbnail?.message}
          {...form.register('thumbnail')}
        />
        <Textarea
          label="গ্যালারির ছবির URL"
          hint="এক লাইনে একটি URL। প্রথম লাইনটি প্রধান ছবির পরে দেখানো হবে।"
          rows={3}
          value={gallery.join('\n')}
          onChange={(event) =>
            form.setValue(
              'gallery',
              event.target.value
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
              { shouldDirty: true },
            )
          }
        />
      </div>
    </Section>
  );
}

export function PricingSection({ form }: { form: ProductForm }) {
  const { errors } = form.formState;
  const variants = form.watch('variants') ?? [];
  const [bulkStock, setBulkStock] = useState('');
  const totalStock = variants.reduce((total, variant) => total + (variant.stock || 0), 0);

  const applyStockToAll = () => {
    const value = Number(bulkStock);
    if (bulkStock === '' || Number.isNaN(value) || value < 0) {
      toast({ tone: 'error', title: 'সঠিক স্টক সংখ্যা দিন' });
      return;
    }
    const stock = Math.floor(value);
    form.setValue('variants', variants.map((variant) => ({ ...variant, stock })), { shouldDirty: true });
    form.setValue('stock', stock);
    setBulkStock('');
    toast({ tone: 'success', title: 'সব ভ্যারিয়েন্টে স্টক বসানো হয়েছে', description: `${toBanglaDigits(stock)} ইউনিট` });
  };

  return (
    <Section title="দাম ও স্টক" description="পণ্যের প্রদর্শিত দাম সবচেয়ে কম দামের ভ্যারিয়েন্ট থেকে হিসাব হয়।">
      <div className="grid gap-4 lg:grid-cols-3">
        <Input
          label="বিক্রয় মূল্য (৳)"
          required
          type="number"
          min={1}
          error={errors.price?.message}
          {...form.register('price', { valueAsNumber: true })}
        />
        <Input
          label="আগের মূল্য (৳)"
          type="number"
          min={0}
          hint="ছাড় দেখাতে চাইলে বিক্রয় মূল্যের চেয়ে বেশি লিখুন"
          error={errors.compareAtPrice?.message}
          {...form.register('compareAtPrice', {
            setValueAs: (value: string) => (value === '' ? undefined : Number(value)),
          })}
        />
        <Input
          label="SKU প্রিফিক্স"
          required
          hint="ভ্যারিয়েন্ট ম্যাট্রিক্সে ব্যবহৃত হবে"
          error={errors.sku?.message}
          {...form.register('sku')}
        />
        <Input label="ওয়ারেন্টি" error={errors.warranty?.message} {...form.register('warranty')} />
        <Input
          label="রিটার্ন সময় (দিন)"
          type="number"
          min={0}
          error={errors.returnPolicyDays?.message}
          {...form.register('returnPolicyDays', { valueAsNumber: true })}
        />
        <Field label="মোট স্টক" hint={`ভ্যারিয়েন্ট থেকে হিসাব: ${toBanglaDigits(totalStock)} ইউনিট`}>
          <div className="flex gap-2">
            <Input
              aria-label="সব ভ্যারিয়েন্টে স্টক"
              type="number"
              min={0}
              placeholder="সব ভ্যারিয়েন্টে"
              value={bulkStock}
              onChange={(event) => setBulkStock(event.target.value)}
            />
            <Button variant="outline" onClick={applyStockToAll}>
              প্রয়োগ
            </Button>
          </div>
        </Field>
      </div>
    </Section>
  );
}

export function DeliverySection({ form }: { form: ProductForm }) {
  const { errors } = form.formState;

  return (
    <Section title="ডেলিভারি ফি" description="ঢাকার ভেতরে ও বাইরের ফি পণ্যভিত্তিক। সময়সীমা প্ল্যাটফর্ম ডিফল্ট থেকে আসে।">
      <div className="grid gap-4 lg:grid-cols-2">
        <Input
          label="ঢাকার ভেতরে (৳)"
          type="number"
          min={0}
          error={errors.deliveryFeeInsideDhaka?.message}
          {...form.register('deliveryFeeInsideDhaka', { valueAsNumber: true })}
        />
        <Input
          label="ঢাকার বাইরে (৳)"
          type="number"
          min={0}
          error={errors.deliveryFeeOutsideDhaka?.message}
          {...form.register('deliveryFeeOutsideDhaka', { valueAsNumber: true })}
        />
      </div>
    </Section>
  );
}

const BADGES = Object.keys(PRODUCT_BADGE_LABELS) as ProductBadge[];

export function BadgesAndFlagsSection({ form }: { form: ProductForm }) {
  const { errors } = form.formState;
  const badges = form.watch('badges') ?? [];
  const flashSale = form.watch('isFlashSale') ?? false;

  const toggleBadge = (badge: ProductBadge, checked: boolean) => {
    const next = checked ? [...badges, badge] : badges.filter((candidate) => candidate !== badge);
    form.setValue('badges', next, { shouldDirty: true });
  };

  return (
    <Section title="ব্যাজ ও ফিচার" description="স্টোরফ্রন্টের লিস্টিংয়ে কোন ব্যাজগুলো দেখানো হবে ঠিক করুন।">
      <fieldset className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <legend className="mb-2 text-sm font-medium text-text-primary">ব্যাজ</legend>
        {BADGES.map((badge) => (
          <Checkbox
            key={badge}
            checked={badges.includes(badge)}
            onChange={(checked) => toggleBadge(badge, checked)}
            label={PRODUCT_BADGE_LABELS[badge]}
          />
        ))}
      </fieldset>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Switch label="ফিচার্ড" checked={form.watch('isFeatured') ?? false} onChange={(checked) => form.setValue('isFeatured', checked, { shouldDirty: true })} />
        <Switch label="ট্রেন্ডিং" checked={form.watch('isTrending') ?? false} onChange={(checked) => form.setValue('isTrending', checked, { shouldDirty: true })} />
        <Switch label="বেস্ট সেলার" checked={form.watch('isBestSeller') ?? false} onChange={(checked) => form.setValue('isBestSeller', checked, { shouldDirty: true })} />
        <Switch label="নতুন আগমন" checked={form.watch('isNewArrival') ?? false} onChange={(checked) => form.setValue('isNewArrival', checked, { shouldDirty: true })} />
        <Switch
          label="ফ্ল্যাশ সেল"
          description="২৪ ঘণ্টার ডেমো ফ্ল্যাশ সেল উইন্ডো"
          checked={flashSale}
          onChange={(checked) => form.setValue('isFlashSale', checked, { shouldDirty: true })}
        />
        <Select
          label="অবস্থা"
          options={[
            { value: 'active', label: 'সক্রিয় (স্টোরে দেখা যাবে)' },
            { value: 'draft', label: 'খসড়া' },
            { value: 'archived', label: 'আর্কাইভ' },
          ]}
          error={errors.status?.message}
          {...form.register('status')}
        />
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-card bg-surface-muted px-3 py-2">
        <Badge tone="primary" size="sm">
          সেলার লক করা
        </Badge>
        <p className="text-xs text-text-secondary">
          ডেমোতে পণ্যটি শুধু আপনার স্টোরের অধীনে যোগ করা যায় — সেলার পরিবর্তন করা যায় না।
        </p>
      </div>
    </Section>
  );
}
