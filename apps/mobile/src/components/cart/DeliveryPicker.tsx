import { Pressable, View } from 'react-native';
import { CircleCheckBig, Truck } from 'lucide-react-native';
import type { DeliveryMethodId, ShippingAddress } from '@shobdox/shared-types';
import {
  DELIVERY_METHODS,
  computeDeliveryFee,
  isDeliveryMethodAvailable,
} from '@shobdox/shared-business-logic';
import { formatTaka } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { Card, Text } from '../ui';

/**
 * Delivery method picker.
 *
 * Fees come from `computeDeliveryFee()` for the *current* cart and address, so
 * the price shown on the card is the price used at checkout. Same-day is offered
 * only inside Dhaka city and says so when it is not.
 */

export interface DeliveryPickerProps {
  value: DeliveryMethodId;
  onChange: (method: DeliveryMethodId) => void;
  address: ShippingAddress;
  subtotal: number;
  hasFreeDeliveryCoupon?: boolean;
}

export function DeliveryPicker({
  value,
  onChange,
  address,
  subtotal,
  hasFreeDeliveryCoupon = false,
}: DeliveryPickerProps) {
  const theme = useTheme();

  return (
    <Card style={{ gap: theme.space[3] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
        <Truck size={18} color={theme.colors.primary} />
        <Text variant="subtitle">ডেলিভারি পদ্ধতি</Text>
      </View>

      <View style={{ gap: theme.space[2] }}>
        {DELIVERY_METHODS.map((method) => {
          const available = isDeliveryMethodAvailable(method.id, address);
          const fee = computeDeliveryFee({
            methodId: method.id,
            address,
            subtotal,
            hasFreeDeliveryCoupon,
          });
          const selected = method.id === value;

          return (
            <Pressable
              key={method.id}
              disabled={!available}
              onPress={() => onChange(method.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: !available }}
              accessibilityLabel={`${method.nameBn}, ${fee === 0 ? 'ফ্রি' : formatTaka(fee)}, ${method.estimatedDays}`}
              android_ripple={{ color: theme.colors.overlay }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space[3],
                borderWidth: 1,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
                borderRadius: theme.componentRadius.card,
                padding: theme.space[3],
                minHeight: theme.layout.minTouchTarget,
                opacity: available ? 1 : 0.55,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label">{method.nameBn}</Text>
                <Text variant="caption" tone="secondary" numberOfLines={2}>
                  {method.description}
                </Text>
                <Text variant="caption" tone="muted">
                  {available ? method.estimatedDays : 'ঢাকার বাইরে প্রযোজ্য নয়'}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Text variant="bodyStrong" tone={fee === 0 ? 'success' : 'default'}>
                  {fee === 0 ? 'ফ্রি' : formatTaka(fee)}
                </Text>
                {selected ? <CircleCheckBig size={18} color={theme.colors.primary} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text variant="caption" tone="muted">
        ডেলিভারি চার্জ নির্ধারিত হয় ঠিকানা (ঢাকার ভেতরে/বাইরে) ও অর্ডার মূল্যের ভিত্তিতে।
      </Text>
    </Card>
  );
}
