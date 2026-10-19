import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Button, Checkbox, Input, Modal, Select, Textarea } from '@/components/ui';
import { categoryFormSchema, type CategoryFormValues } from '@shobdox/shared-validation';
import type { Category } from '@shobdox/shared-types';
import { categoryFromFormValues, categoryToFormValues } from '@/services/admin.service';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';
import { slugify } from '@shobdox/shared-utils';

type CategoryParsed = z.output<typeof categoryFormSchema>;

const ICON_OPTIONS = [
  'Tv',
  'Smartphone',
  'Shirt',
  'Sparkles',
  'Home',
  'ShoppingBasket',
  'BookOpen',
  'Baby',
  'Trophy',
  'Watch',
  'Footprints',
  'HeartPulse',
];

function newCategoryValues(displayOrder: number, parentId?: string): CategoryFormValues {
  return {
    name: '',
    nameBn: '',
    slug: '',
    description: '',
    icon: 'Sparkles',
    accent: 'green',
    parentId,
    isFeatured: false,
    displayOrder,
  };
}

/** Create/edit category dialog. Writes through `upsertCategory()`. */
export function CategoryFormModal({
  open,
  onClose,
  existing,
  categories,
  defaultParentId,
}: {
  open: boolean;
  onClose: () => void;
  existing?: Category;
  categories: Category[];
  /** Pre-selects the parent when adding a sub-category from the tree. */
  defaultParentId?: string;
}) {
  const [slugTouched, setSlugTouched] = useState(Boolean(existing));

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues, unknown, CategoryParsed>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: existing
      ? categoryToFormValues(existing)
      : newCategoryValues(categories.length + 1, defaultParentId),
  });

  // Re-seed the form whenever the dialog opens for a different row.
  useEffect(() => {
    if (!open) return;
    reset(
      existing ? categoryToFormValues(existing) : newCategoryValues(categories.length + 1, defaultParentId),
    );
    setSlugTouched(Boolean(existing));
    // Only the opened row matters — `categories` changes on every product edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existing?.id, defaultParentId, reset]);

  // Keep an auto-generated slug in step with the English name.
  const nameValue = watch('name');
  useEffect(() => {
    if (slugTouched) return;
    const trimmed = (nameValue ?? '').trim();
    if (trimmed.length >= 2) setValue('slug', slugify(trimmed));
  }, [nameValue, slugTouched, setValue]);

  const parentOptions = categories
    .filter((category) => !category.parentId && category.id !== existing?.id)
    .map((category) => ({ value: category.id, label: `${category.nameBn} (${category.name})` }));

  const onSubmit = handleSubmit((values) => {
    const category = categoryFromFormValues(values, existing);
    useDataStore.getState().upsertCategory(category);
    toast({
      tone: 'success',
      title: existing ? 'ক্যাটাগরি আপডেট হয়েছে' : 'নতুন ক্যাটাগরি যোগ হয়েছে',
      description: category.nameBn,
    });
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি'}
      description="ক্যাটাগরি স্টোরফ্রন্টের মেনু, ফিল্টার ও হোম রেলে ব্যবহৃত হয়।"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            বাতিল
          </Button>
          <Button type="submit" form="category-form">
            {existing ? 'পরিবর্তন সংরক্ষণ করুন' : 'ক্যাটাগরি যোগ করুন'}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="নাম (ইংরেজি)" required {...register('name')} error={errors.name?.message} />
          <Input label="বাংলা নাম" required {...register('nameBn')} error={errors.nameBn?.message} />
        </div>

        <Input
          label="স্লাগ"
          required
          hint="URL-এ ব্যবহৃত হয়, যেমন electronics"
          {...register('slug', { onChange: () => setSlugTouched(true) })}
          error={errors.slug?.message}
        />

        <Textarea label="বিবরণ" required rows={2} {...register('description')} error={errors.description?.message} />

        <div className="grid gap-4 md:grid-cols-3">
          <Select
            label="আইকন"
            required
            options={ICON_OPTIONS.map((icon) => ({ value: icon, label: icon }))}
            {...register('icon')}
            error={errors.icon?.message}
          />
          <Select
            label="রঙের টোন"
            required
            options={[
              { value: 'green', label: 'সবুজ' },
              { value: 'amber', label: 'অ্যাম্বার' },
              { value: 'blue', label: 'নীল' },
              { value: 'purple', label: 'বেগুনি' },
              { value: 'cyan', label: 'সায়ান' },
              { value: 'slate', label: 'স্লেট' },
            ]}
            {...register('accent')}
            error={errors.accent?.message}
          />
          <Input
            label="ক্রম"
            type="number"
            min={0}
            {...register('displayOrder', { valueAsNumber: true })}
            error={errors.displayOrder?.message}
          />
        </div>

        <Select
          label="প্যারেন্ট ক্যাটাগরি"
          placeholder="মূল ক্যাটাগরি (প্যারেন্ট নেই)"
          options={parentOptions}
          hint="শুধু মূল ক্যাটাগরিগুলোকে প্যারেন্ট করা যায় — দুই স্তরের বেশি নেস্টিং নেই।"
          {...register('parentId')}
        />

        <Checkbox
          checked={Boolean(watch('isFeatured'))}
          onChange={(checked) => setValue('isFeatured', checked)}
          label="হোমপেজে ফিচার করুন"
          description="ফিচার্ড ক্যাটাগরি হোমপেজের রেলে অগ্রাধিকার পায়।"
        />
      </form>
    </Modal>
  );
}
