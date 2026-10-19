import type { UseFormReturn } from 'react-hook-form';
import { Input, Select, Textarea } from '@/components/ui';
import type { ShippingAddress } from '@shobdox/shared-types';
import type { CheckoutFormValues, CheckoutParsed } from '@shobdox/shared-validation';
import { BD_DIVISIONS, areasOf, formatBdPhone } from '@shobdox/shared-utils';
import { cn } from '@/lib/cn';

type CheckoutForm = UseFormReturn<CheckoutFormValues, unknown, CheckoutParsed>;

/** Name, phone and email — the "contact" section of the checkout. */
export function ContactFields({ form }: { form: CheckoutForm }) {
  const { register, formState } = form;
  const errors = formState.errors;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input label="পুরো নাম" required autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
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
        label="বিকল্প মোবাইল (ঐচ্ছিক)"
        type="tel"
        inputMode="tel"
        error={errors.altPhone?.message}
        {...register('altPhone')}
      />
      <Input label="ইমেইল (ঐচ্ছিক)" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
    </div>
  );
}

/**
 * Shipping-address fields for the one-page checkout.
 *
 * The form instance is owned by the page (it also carries contact, delivery,
 * payment and the demo acknowledgement), so this component only renders and
 * wires the shared `checkoutSchema` fields. Name/phone/email live in the
 * contact section of the page instead.
 */
export function AddressForm({ form }: { form: CheckoutForm }) {
  const { register, watch, setValue, formState } = form;
  const errors = formState.errors;

  const division = watch('division') ?? '';
  const district = watch('district') ?? '';
  const area = watch('area') ?? '';

  // Geo dropdowns derive from shared BD data so the fee rules and the address
  // book always speak the same division/district names.
  const divisionOptions = BD_DIVISIONS.map((item) => ({ value: item.name, label: item.nameBn }));
  const districtOptions = (BD_DIVISIONS.find((item) => item.name === division)?.districts ?? []).map(
    (item) => ({ value: item.name, label: item.nameBn }),
  );
  const areaOptions = areasOf(division, district).map((item) => ({ value: item.name, label: item.nameBn }));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Select
        label="বিভাগ"
        required
        placeholder="বিভাগ বেছে নিন"
        options={divisionOptions}
        value={division}
        error={errors.division?.message}
        onChange={(event) => {
          setValue('division', event.target.value, { shouldValidate: true });
          setValue('district', '');
          setValue('area', '');
        }}
      />
      <Select
        label="জেলা"
        required
        placeholder="জেলা বেছে নিন"
        options={districtOptions}
        value={district}
        disabled={!division}
        error={errors.district?.message}
        onChange={(event) => {
          setValue('district', event.target.value, { shouldValidate: true });
          setValue('area', '');
          setValue('postcode', '');
        }}
      />
      <Select
        label="এলাকা / থানা"
        required
        placeholder="এলাকা বেছে নিন"
        options={areaOptions}
        value={area}
        disabled={!district}
        error={errors.area?.message}
        onChange={(event) => {
          setValue('area', event.target.value, { shouldValidate: true });
          const picked = areasOf(division, district).find((item) => item.name === event.target.value);
          if (picked?.postcode) setValue('postcode', picked.postcode);
        }}
      />
      <Input
        label="পোস্ট কোড (ঐচ্ছিক)"
        inputMode="numeric"
        maxLength={4}
        error={errors.postcode?.message}
        {...register('postcode')}
      />

      <div className="sm:col-span-2">
        <Textarea
          label="বিস্তারিত ঠিকানা"
          required
          rows={3}
          placeholder="বাসা/রোড/ব্লক, সংলগ্ন পরিচিত স্থান"
          error={errors.addressLine?.message}
          {...register('addressLine')}
        />
      </div>

      <Input
        label="ল্যান্ডমার্ক (ঐচ্ছিক)"
        wrapperClassName="sm:col-span-2"
        error={errors.landmark?.message}
        {...register('landmark')}
      />
    </div>
  );
}

/** Saved-address cards shown above the form for signed-in demo customers. */
export function SavedAddressPicker({
  addresses,
  activeId,
  onPick,
}: {
  addresses: ShippingAddress[];
  activeId?: string;
  onPick: (address: ShippingAddress) => void;
}) {
  if (addresses.length === 0) return null;

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-text-primary">সংরক্ষিত ঠিকানা থেকে বেছে নিন</legend>

      <ul className="grid gap-2 sm:grid-cols-2">
        {addresses.map((address) => {
          const selected = address.id === activeId;
          return (
            <li key={address.id}>
              <button
                type="button"
                onClick={() => onPick(address)}
                aria-pressed={selected}
                className={cn(
                  'w-full rounded-card border p-3 text-left transition-colors',
                  selected ? 'border-primary bg-primary-soft/60' : 'border-border bg-surface hover:border-border-strong',
                )}
              >
                <span className="block text-sm font-semibold text-text-primary">
                  {address.label ?? 'সংরক্ষিত ঠিকানা'}
                </span>
                <span className="mt-0.5 block break-words text-xs text-text-secondary">
                  {address.fullName} · {formatBdPhone(address.phone)}
                </span>
                <span className="mt-0.5 block break-words text-xs text-text-secondary">
                  {address.area}, {address.district}, {address.division}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
