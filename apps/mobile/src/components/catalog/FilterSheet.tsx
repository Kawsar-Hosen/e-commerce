import { View } from 'react-native';
import type { ProductFilters } from '@shobdox/shared-types';
import type { ProductFacets } from '@shobdox/shared-business-logic';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { BottomSheet, Button, Chip, SwitchRow, Text } from '../ui';

/**
 * Filter sheet.
 *
 * Every count is a live facet from the current query, so a shopper can see how
 * many products a filter will leave behind before applying it. Price filtering
 * uses presets instead of a slider: they are easier to hit with a thumb and
 * announce themselves properly to a screen reader.
 */

export interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: ProductFilters;
  onChange: (patch: Partial<ProductFilters>) => void;
  onReset: () => void;
  facets: ProductFacets;
  bounds: { min: number; max: number };
}

interface PricePreset {
  id: string;
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

function pricePresets(bounds: { min: number; max: number }): PricePreset[] {
  return [
    { id: 'all', label: 'সব দাম' },
    { id: 'low', label: `${formatTaka(0)} – ${formatTaka(1_000)}`, maxPrice: 1_000 },
    { id: 'mid', label: `${formatTaka(1_000)} – ${formatTaka(5_000)}`, minPrice: 1_000, maxPrice: 5_000 },
    { id: 'high', label: `${formatTaka(5_000)} – ${formatTaka(20_000)}`, minPrice: 5_000, maxPrice: 20_000 },
    { id: 'premium', label: `${formatTaka(20_000)}+`, minPrice: 20_000 },
    { id: 'range', label: `পুরো সীমা: ${formatTaka(bounds.min)} – ${formatTaka(bounds.max)}` },
  ];
}

export function FilterSheet({
  visible,
  onClose,
  filters,
  onChange,
  onReset,
  facets,
  bounds,
}: FilterSheetProps) {
  const theme = useTheme();

  const toggleCategory = (id: string) => {
    onChange({
      categoryIds: filters.categoryIds.includes(id)
        ? filters.categoryIds.filter((value) => value !== id)
        : [...filters.categoryIds, id],
    });
  };

  const toggleBrand = (id: string) => {
    onChange({
      brandIds: filters.brandIds.includes(id)
        ? filters.brandIds.filter((value) => value !== id)
        : [...filters.brandIds, id],
    });
  };

  const presets = pricePresets(bounds);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="ফিল্টার"
      subtitle="নিচের যেকোনো শর্ত প্রয়োগ করুন"
    >
      {facets.categories.length > 0 ? (
        <View style={{ gap: theme.space[2] }}>
          <Text variant="label">ক্যাটাগরি</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
            {facets.categories.map((bucket) => (
              <Chip
                key={bucket.value}
                size="sm"
                label={bucket.label}
                count={toBanglaDigits(bucket.count)}
                selected={filters.categoryIds.includes(bucket.value)}
                onPress={() => toggleCategory(bucket.value)}
                accessibilityLabel={`${bucket.label}, ${toBanglaDigits(bucket.count)}টি পণ্য`}
              />
            ))}
          </View>
        </View>
      ) : null}

      {facets.brands.length > 0 ? (
        <View style={{ gap: theme.space[2] }}>
          <Text variant="label">ব্র্যান্ড</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
            {facets.brands.slice(0, 10).map((bucket) => (
              <Chip
                key={bucket.value}
                size="sm"
                label={bucket.label}
                count={toBanglaDigits(bucket.count)}
                selected={filters.brandIds.includes(bucket.value)}
                onPress={() => toggleBrand(bucket.value)}
                accessibilityLabel={`${bucket.label}, ${toBanglaDigits(bucket.count)}টি পণ্য`}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ gap: theme.space[2] }}>
        <Text variant="label">দাম</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
          {presets.map((preset) => {
            const selected =
              (preset.minPrice ?? undefined) === filters.minPrice &&
              (preset.maxPrice ?? undefined) === filters.maxPrice;

            return (
              <Chip
                key={preset.id}
                size="sm"
                label={preset.label}
                selected={selected && preset.id !== 'range'}
                disabled={preset.id === 'range'}
                onPress={() =>
                  onChange({ minPrice: preset.minPrice, maxPrice: preset.maxPrice })
                }
                accessibilityLabel={`দাম ${preset.label}`}
              />
            );
          })}
        </View>
      </View>

      <View style={{ gap: theme.space[2] }}>
        <Text variant="label">রেটিং</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
          {facets.ratings.map((bucket) => (
            <Chip
              key={bucket.value}
              size="sm"
              label={bucket.label}
              count={toBanglaDigits(bucket.count)}
              selected={filters.minRating === bucket.value}
              onPress={() =>
                onChange({ minRating: filters.minRating === bucket.value ? undefined : bucket.value })
              }
              accessibilityLabel={`${bucket.label}, ${toBanglaDigits(bucket.count)}টি পণ্য`}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: theme.space[2] }}>
        <Text variant="label">ছাড়</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
          {facets.discounts.map((bucket) => (
            <Chip
              key={bucket.value}
              size="sm"
              label={bucket.label}
              count={toBanglaDigits(bucket.count)}
              selected={filters.minDiscount === bucket.value}
              onPress={() =>
                onChange({
                  minDiscount: filters.minDiscount === bucket.value ? undefined : bucket.value,
                })
              }
              accessibilityLabel={`${bucket.label}, ${toBanglaDigits(bucket.count)}টি পণ্য`}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: theme.space[2] }}>
        <Text variant="label">স্টক</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
          {facets.stock.map((bucket) => (
            <Chip
              key={bucket.value}
              size="sm"
              label={bucket.label}
              count={toBanglaDigits(bucket.count)}
              selected={bucket.value === 'in-stock' && filters.inStockOnly}
              onPress={() => onChange({ inStockOnly: !filters.inStockOnly })}
              accessibilityLabel={`${bucket.label}, ${toBanglaDigits(bucket.count)}টি পণ্য`}
            />
          ))}
        </View>
      </View>

      <SwitchRow
        label="শুধু ফ্ল্যাশ সেল"
        description="সীমিত সময়ের ছাড়ে থাকা পণ্য"
        value={filters.flashSaleOnly}
        onValueChange={(value) => onChange({ flashSaleOnly: value })}
      />

      <SwitchRow
        label="শুধু স্টকে থাকা পণ্য"
        description="স্টক শেষ হওয়া পণ্য বাদ যাবে"
        value={filters.inStockOnly}
        onValueChange={(value) => onChange({ inStockOnly: value })}
      />

      {facets.stock.length > 0 ? (
        <Text variant="caption" tone="muted">
          {facets.stock
            .map((bucket) => `${bucket.label}: ${toBanglaDigits(bucket.count)}`)
            .join(' · ')}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', gap: theme.space[3] }}>
        <Button variant="outline" label="রিসেট" accessibilityLabel="ফিল্টার রিসেট করুন" onPress={onReset} />
        <View style={{ flex: 1 }}>
          <Button fullWidth label="দেখান" accessibilityLabel="ফিল্টার প্রয়োগ করুন" onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}
