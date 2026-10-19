import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from '@shobdox/shared-types';
import { addressSchema, type AddressFormValues, type AddressParsed } from '@shobdox/shared-validation';
import { BD_DIVISIONS, areasOf, districtNamesOf, findDistrict } from '@shobdox/shared-utils';
import { Button, Checkbox, Input, Select, Textarea } from '@/components/ui';

/**
 * Address book form.
 *
 * Division -> district -> area cascades come from the shared geo helpers, so the
 * website and the Android app offer the same administrative data. The area step
 * degrades to free text for districts without a thana list.
 */

export interface AddressFormProps {
  initial?: Address;
  submitLabel?: string;
  onSubmit: (values: AddressParsed) => void;
  onCancel?: () => void;
}

export function AddressForm({ initial, submitLabel = 'সংরক্ষণ করুন', onSubmit, onCancel }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues, unknown, AddressParsed>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initial?.label ?? '',
      fullName: initial?.fullName ?? '',
      phone: initial?.phone ?? '',
      // Not stored on `Address`, but the shared schema expects the key to exist.
      email: '',
      division: initial?.division ?? '',
      district: initial?.district ?? '',
      area: initial?.area ?? '',
      addressLine: initial?.addressLine ?? '',
      landmark: initial?.landmark ?? '',
      postcode: initial?.postcode ?? '',
      isDefault: initial?.isDefault ?? false,
    },
  });

  const division = watch('division');
  const district = watch('district');
  const isDefault = watch('isDefault');

  const divisionOptions = useMemo(
    () => BD_DIVISIONS.map((entry) => ({ value: entry.name, label: `${entry.nameBn} (${entry.name})` })),
    [],
  );

  const districtOptions = useMemo(
    () =>
      division
        ? districtNamesOf(division).map((name) => ({
            value: name,
            label: findDistrict(division, name)?.nameBn ?? name,
          }))
        : [],
    [division],
  );

  const areaList = useMemo(
    () => (division && district ? areasOf(division, district) : []),
    [division, district],
  );

  return (
    <form noValidate className="space-y-4" onSubmit={handleSubmit((values) => onSubmit(values))}>
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="লেবেল (ঐচ্ছিক)"
          placeholder="বাসা / অফিস"
          error={errors.label?.message}
          {...register('label')}
        />
        <Input
          label="প্রাপকের নাম"
          required
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="মোবাইল নম্বর"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="নিকটবর্তী চিহ্ন (ঐচ্ছিক)"
          placeholder="যেমন: স্কুলের পাশে, মসজিদের বিপরীতে"
          error={errors.landmark?.message}
          {...register('landmark')}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Select
          label="বিভাগ"
          required
          placeholder="বিভাগ নির্বাচন করুন"
          options={divisionOptions}
          error={errors.division?.message}
          {...register('division', {
            onChange: () => {
              // Keep the cascade coherent when the parent selection changes.
              setValue('district', '');
              setValue('area', '');
            },
          })}
        />

        <Select
          label="জেলা"
          required
          placeholder={division ? 'জেলা নির্বাচন করুন' : 'আগে বিভাগ নির্বাচন করুন'}
          options={districtOptions}
          disabled={!division}
          error={errors.district?.message}
          {...register('district', { onChange: () => setValue('area', '') })}
        />

        {areaList.length > 0 ? (
          <Select
            label="এলাকা / থানা"
            required
            placeholder="এলাকা নির্বাচন করুন"
            options={areaList.map((entry) => ({
              value: entry.name,
              label: entry.postcode ? `${entry.nameBn} (${entry.postcode})` : entry.nameBn,
            }))}
            error={errors.area?.message}
            {...register('area', {
              onChange: (event) => {
                const match = areaList.find((entry) => entry.name === event.target.value);
                if (match?.postcode) setValue('postcode', match.postcode);
              },
            })}
          />
        ) : (
          <Input
            label="এলাকা / থানা"
            required
            disabled={!district}
            hint={district ? 'এই জেলার তালিকা সীমিত — নাম লিখুন' : 'আগে জেলা নির্বাচন করুন'}
            error={errors.area?.message}
            {...register('area')}
          />
        )}
      </div>

      <Textarea
        label="সম্পূর্ণ ঠিকানা"
        required
        rows={3}
        placeholder="রোড, ব্লক, বাড়ি নম্বর ও নিকটবর্তী চিহ্ন"
        error={errors.addressLine?.message}
        {...register('addressLine')}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="পোস্ট কোড (ঐচ্ছিক)"
          inputMode="numeric"
          placeholder="৪ ডিজিট"
          error={errors.postcode?.message}
          {...register('postcode')}
        />
        <Checkbox
          className="md:mt-7"
          checked={Boolean(isDefault)}
          onChange={(checked) => setValue('isDefault', checked, { shouldValidate: true })}
          label="এই ঠিকানাটি ডিফল্ট করুন"
          description="চেকআউটে আগে এই ঠিকানাটি দেখানো হবে"
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-1">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            বাতিল
          </Button>
        ) : null}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
