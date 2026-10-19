import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Brand, Category, Seller } from '@shobdox/shared-types';
import { PRODUCT_BADGE_LABELS } from '@shobdox/shared-types';
import { slugify } from '@shobdox/shared-utils';
import { Button, Card, Checkbox, Input, Select, Textarea } from '@/components/ui';
import { PRODUCT_BADGE_OPTIONS, PRODUCT_STATUS_OPTIONS, type ProductFormReturn } from './productFormModel';

/**
 * The "flat" sections of the admin product form.
 *
 * They all receive the same `form` handle so `ProductForm.tsx` stays a short
 * orchestrator. Array fields that are *not* objects (gallery, tags, badges) are
 * edited with `watch` + `setValue`; react-hook-form's `useFieldArray` only
 * pays off for `options`/`specifications`, which have their own editors.
 */

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card as="section">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <p className="mt-0.5 text-sm text-text-secondary">{description}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </Card>
  );
}

export function ProductBasicSection({ form }: { form: ProductFormReturn }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const [slugTouched, setSlugTouched] = useState(false);
  const titleValue = watch('title');

  // A hand-edited slug wins; otherwise keep it in step with the English title.
  useEffect(() => {
    if (slugTouched) return;
    const trimmed = (titleValue ?? '').trim();
    if (trimmed.length >= 3) setValue('slug', slugify(trimmed));
  }, [titleValue, slugTouched, setValue]);

  return (
    <SectionCard title="মূল তথ্য" description="পণ্যের নাম, স্লাগ ও বিবরণ — স্টোরফ্রন্টের কার্ড ও ডিটেইল পেজে যাবে।">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="পণ্যের নাম (ইংরেজি)" required {...register('title')} error={errors.title?.message} />
        <Input
          label="পণ্যের নাম (বাংলা)"
          hint="খালি রাখলে ইংরেজি নাম দেখানো হবে"
          {...register('titleBn')}
          error={errors.titleBn?.message}
        />
      </div>

      <Input
        label="স্লাগ"
        required
        hint="URL-এ ব্যবহৃত হয়, যেমন wireless-earbuds — খালি রাখলে নাম থেকে তৈরি হবে"
        {...register('slug', { onChange: () => setSlugTouched(true) })}
        error={errors.slug?.message}
      />

      <Textarea
        label="সংক্ষিপ্ত বিবরণ"
        required
        rows={2}
        hint="কার্ড ও সার্চ ফলাফলে দেখানো হয় (১০–২০০ অক্ষর)।"
        {...register('shortDescription')}
        error={errors.shortDescription?.message}
      />

      <Textarea
        label="বিবরণ (ইংরেজি)"
        required
        rows={5}
        {...register('description')}
        error={errors.description?.message}
      />

      <Textarea
        label="বিবরণ (বাংলা)"
        rows={5}
        hint="ডেমো স্টোরফ্রন্ট বাংলা লেখা অগ্রাধিকার দেয়।"
        {...register('descriptionBn')}
        error={errors.descriptionBn?.message}
      />
    </SectionCard>
  );
}

export function ProductOrganisationSection({
  form,
  categories,
  brands,
  sellers,
}: {
  form: ProductFormReturn;
  categories: Category[];
  brands: Brand[];
  sellers: Seller[];
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const [tagDraft, setTagDraft] = useState('');

  const tags = watch('tags') ?? [];
  const badges = watch('badges') ?? [];

  const addTag = () => {
    const tag = tagDraft.trim();
    if (!tag || tags.includes(tag)) return;
    setValue('tags', [...tags, tag], { shouldDirty: true });
    setTagDraft('');
  };

  const toggleBadge = (badge: string, checked: boolean) => {
    setValue('badges', checked ? [...badges, badge] : badges.filter((value) => value !== badge), {
      shouldDirty: true,
    });
  };

  return (
    <SectionCard
      title="শ্রেণিবিন্যাস ও প্রকাশ"
      description="ক্যাটাগরি, ব্র্যান্ড, সেলার এবং স্টোরফ্রন্টে পণ্যটি কীভাবে দেখাবে তা ঠিক করুন।"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Select
          label="ক্যাটাগরি"
          required
          placeholder="ক্যাটাগরি বাছুন"
          options={categories.map((category) => ({ value: category.id, label: category.nameBn }))}
          {...register('categoryId')}
          error={errors.categoryId?.message}
        />
        <Select
          label="ব্র্যান্ড"
          placeholder="ব্র্যান্ড ছাড়া"
          options={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
          {...register('brandId')}
        />
        <Select
          label="সেলার"
          required
          placeholder="সেলার বাছুন"
          options={sellers.map((seller) => ({
            value: seller.id,
            label: seller.profile.storeNameBn ?? seller.profile.storeName,
          }))}
          {...register('sellerId')}
          error={errors.sellerId?.message}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select label="স্ট্যাটাস" required options={PRODUCT_STATUS_OPTIONS} {...register('status')} />
        <Input label="ওয়ারেন্টি" hint="যেমন: ১ বছরের অফিসিয়াল ওয়ারেন্টি" {...register('warranty')} />
        <Input
          label="রিটার্ন সময় (দিন)"
          type="number"
          min={0}
          max={60}
          {...register('returnPolicyDays', { valueAsNumber: true })}
          error={errors.returnPolicyDays?.message}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-text-primary">ট্যাগ</p>
        <p className="text-xs text-text-secondary">সার্চ ও ফিল্টারে ব্যবহৃত হয় — Enter চেপে যোগ করুন।</p>
        <div className="mt-2 flex gap-2">
          <Input
            aria-label="নতুন ট্যাগ"
            value={tagDraft}
            placeholder="যেমন: noise-cancelling"
            onChange={(event) => setTagDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addTag();
              }
            }}
          />
          <Button variant="outline" onClick={addTag} leftIcon={<Plus aria-hidden className="size-4" />}>
            যোগ
          </Button>
        </div>
        {tags.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li
                key={tag}
                className="flex items-center gap-1 rounded-chip bg-surface-muted px-2 py-1 text-sm text-text-secondary"
              >
                {tag}
                <button
                  type="button"
                  aria-label={`${tag} ট্যাগ মুছুন`}
                  className="rounded-full p-0.5 hover:text-error focus-visible:outline-2 focus-visible:outline-primary"
                  onClick={() => setValue('tags', tags.filter((value) => value !== tag))}
                >
                  <X aria-hidden className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-text-primary">ব্যাজ</legend>
        <p className="text-xs text-text-secondary">কার্ডে দেখানো ছোট লেবেল; একই সাথে একাধিক দেওয়া যায়।</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {PRODUCT_BADGE_OPTIONS.map((badge) => (
            <Checkbox
              key={badge}
              checked={badges.includes(badge)}
              onChange={(checked) => toggleBadge(badge, checked)}
              label={PRODUCT_BADGE_LABELS[badge]}
            />
          ))}
        </div>
      </fieldset>
    </SectionCard>
  );
}

