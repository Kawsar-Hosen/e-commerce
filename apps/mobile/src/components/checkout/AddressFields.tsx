import { View } from 'react-native';
import { BD_DIVISIONS, areasOf } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { FieldRow, Input, Select } from '../ui';
import type { CheckoutForm } from './checkoutForm';

/**
 * Address part of the checkout.
 *
 * Division / district / area dropdowns are built from the shared Bangladesh geo
 * data, so the names stored on the order are exactly the ones the delivery-fee
 * rules and the address book use. Changing a parent clears its children, and
 * picking an area fills the postcode when the dataset knows it.
 */

export interface AddressFieldsProps {
  form: CheckoutForm;
}

export function AddressFields({ form }: AddressFieldsProps) {
  const theme = useTheme();
  const { errors } = form.formState;

  const division = form.watch('division') ?? '';
  const district = form.watch('district') ?? '';

  const divisionOptions = BD_DIVISIONS.map((item) => ({ value: item.name, label: item.nameBn }));
  const districtOptions = (BD_DIVISIONS.find((item) => item.name === division)?.districts ?? []).map(
    (item) => ({ value: item.name, label: item.nameBn }),
  );
  const areaOptions = areasOf(division, district).map((item) => ({
    value: item.name,
    label: item.nameBn,
    description: item.postcode ? `পোস্ট কোড ${item.postcode}` : undefined,
  }));

  return (
    <View style={{ gap: theme.space[3] }}>
      <FieldRow>
        <Select
          label="বিভাগ"
          placeholder="বিভাগ বেছে নিন"
          options={divisionOptions}
          value={division}
          error={errors.division?.message}
          onChange={(value) => {
            form.setValue('division', value, { shouldValidate: true });
            form.setValue('district', '');
            form.setValue('area', '');
          }}
        />
        <Select
          label="জেলা"
          placeholder="জেলা বেছে নিন"
          options={districtOptions}
          value={district}
          disabled={!division}
          error={errors.district?.message}
          onChange={(value) => {
            form.setValue('district', value, { shouldValidate: true });
            form.setValue('area', '');
            form.setValue('postcode', '');
          }}
        />
      </FieldRow>

      <FieldRow>
        <Select
          label="এলাকা / থানা"
          placeholder="এলাকা বেছে নিন"
          options={areaOptions}
          value={form.watch('area')}
          disabled={!district}
          error={errors.area?.message}
          onChange={(value) => {
            form.setValue('area', value, { shouldValidate: true });
            const picked = areasOf(division, district).find((item) => item.name === value);
            if (picked?.postcode) form.setValue('postcode', picked.postcode);
          }}
        />
        <Input
          label="পোস্ট কোড (ঐচ্ছিক)"
          value={form.watch('postcode')}
          onChangeText={(value) => form.setValue('postcode', value)}
          onBlur={() => void form.trigger('postcode')}
          keyboardType="number-pad"
          maxLength={4}
          error={errors.postcode?.message}
          placeholder="১২০৭"
        />
      </FieldRow>

      <Input
        label="বিস্তারিত ঠিকানা"
        value={form.watch('addressLine')}
        onChangeText={(value) => form.setValue('addressLine', value)}
        onBlur={() => void form.trigger('addressLine')}
        placeholder="বাসা/রোড/ব্লক, সংলগ্ন পরিচিত স্থান"
        error={errors.addressLine?.message}
        multiline
        maxLength={300}
        returnKeyType="next"
      />

      <Input
        label="ল্যান্ডমার্ক (ঐচ্ছিক)"
        value={form.watch('landmark')}
        onChangeText={(value) => form.setValue('landmark', value)}
        placeholder="যেমন: পশ্চিম রায়েরবাজার স্কুলের পাশে"
        error={errors.landmark?.message}
        maxLength={120}
        returnKeyType="done"
      />
    </View>
  );
}
