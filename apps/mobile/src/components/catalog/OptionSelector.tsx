import { Pressable, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import type { Product, ProductOption } from '@shobdox/shared-types';
import { availableValuesFor } from '@shobdox/shared-business-logic';
import { formatTaka } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { Select, Text } from '../ui';

/**
 * Option selector.
 *
 * Three displays come straight from the dataset: colour swatches, size chips and
 * a dropdown. Values that no longer exist in stock for the rest of the selection
 * are shown disabled and say why, and the whole group is one accessibility node
 * per option with live value feedback.
 */

export interface OptionSelectorProps {
  product: Product;
  selection: Record<string, string>;
  onChange: (optionId: string, valueId: string) => void;
}

export function OptionSelector({ product, selection, onChange }: OptionSelectorProps) {
  const theme = useTheme();

  if (product.options.length === 0) return null;

  return (
    <View style={{ gap: theme.space[3] }}>
      {product.options.map((option) => (
        <OptionRow
          key={option.id}
          option={option}
          product={product}
          selection={selection}
          onChange={onChange}
        />
      ))}
    </View>
  );
}

interface OptionRowProps {
  option: ProductOption;
  product: Product;
  selection: Record<string, string>;
  onChange: (optionId: string, valueId: string) => void;
}

function OptionRow({ option, product, selection, onChange }: OptionRowProps) {
  const theme = useTheme();
  const available = availableValuesFor(product, option, selection);
  const selectedId = selection[option.id];
  const selectedValue = option.values.find((value) => value.id === selectedId);

  if (option.display === 'select') {
    return (
      <Select
        label={option.nameBn ?? option.name}
        value={selectedId}
        options={option.values.map((value) => ({
          value: value.id,
          label: `${value.labelBn ?? value.label}${available.has(value.id) ? '' : ' — স্টক নেই'}`,
        }))}
        onChange={(valueId) => onChange(option.id, valueId)}
        helperText={selectedValue ? `নির্বাচিত: ${selectedValue.labelBn ?? selectedValue.label}` : undefined}
        accessibilityLabel={option.nameBn ?? option.name}
      />
    );
  }

  return (
    <View style={{ gap: theme.space[2] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
        <Text variant="label">{option.nameBn ?? option.name}</Text>
        {selectedValue ? (
          <Text variant="caption" tone="secondary" accessibilityLiveRegion="polite">
            {`নির্বাচিত: ${selectedValue.labelBn ?? selectedValue.label}`}
          </Text>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
        {option.values.map((value) => {
          const isSelected = value.id === selectedId;
          const isAvailable = available.has(value.id);
          const label = value.labelBn ?? value.label;

          if (option.display === 'swatch') {
            return (
              <Pressable
                key={value.id}
                disabled={!isAvailable}
                onPress={() => onChange(option.id, value.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
                accessibilityLabel={`${label}${isAvailable ? '' : ', স্টক নেই'}`}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: theme.radius.full,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isAvailable ? 1 : 0.4,
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: theme.radius.full,
                    // Variant swatches come from the dataset; the border keeps
                    // a white swatch visible on a white card.
                    backgroundColor: value.hex ?? theme.colors.surfaceMuted,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected ? <Check size={14} color={theme.colors.primary} /> : null}
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={value.id}
              disabled={!isAvailable}
              onPress={() => onChange(option.id, value.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
              accessibilityLabel={`${label}${isAvailable ? '' : ', স্টক নেই'}`}
              android_ripple={{ color: theme.colors.overlay }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderWidth: 1,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                backgroundColor: isSelected ? theme.colors.primarySoft : theme.colors.surface,
                borderRadius: theme.componentRadius.chip,
                paddingHorizontal: theme.space[3],
                minHeight: theme.layout.minTouchTarget - 8,
                opacity: isAvailable ? 1 : 0.45,
              }}
            >
              <Text variant="label" tone={isSelected ? 'primary' : 'default'}>
                {label}
              </Text>
              {value.priceDelta ? (
                <Text variant="caption" tone="muted">
                  {`+ ${formatTaka(value.priceDelta)}`}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {option.display === 'chip' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ChevronDown size={12} color={theme.colors.textMuted} />
          <Text variant="caption" tone="muted">
            স্টক না থাকা মান নির্বাচন করা যাবে না
          </Text>
        </View>
      ) : null}
    </View>
  );
}
