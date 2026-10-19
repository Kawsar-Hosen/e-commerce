import { Pressable, View } from 'react-native';
import { Banknote, CircleCheckBig, Lock, Smartphone } from 'lucide-react-native';
import type { PaymentMethodId } from '@shobdox/shared-types';
import { PAYMENT_METHODS } from '@shobdox/shared-business-logic';
import { useTheme } from '../../hooks/useTheme';
import { Badge, Card, Text } from '../ui';

/**
 * Demo payment-method picker.
 *
 * INTERFACE ONLY. Selecting a method records the shopper's *preference* on the
 * demo order; no gateway is contacted, no number is collected and the brand
 * colours below are indicative, not official assets.
 */

export interface PaymentPickerProps {
  value: PaymentMethodId;
  onChange: (method: PaymentMethodId) => void;
}

export function PaymentPicker({ value, onChange }: PaymentPickerProps) {
  const theme = useTheme();

  return (
    <Card style={{ gap: theme.space[3] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
        <Lock size={18} color={theme.colors.primary} />
        <Text variant="subtitle">পেমেন্ট পদ্ধতি (ডেমো)</Text>
      </View>

      <View style={{ gap: theme.space[2] }}>
        {PAYMENT_METHODS.map((method) => {
          const selected = method.id === value;
          const isWallet = method.id !== 'cod';

          return (
            <Pressable
              key={method.id}
              onPress={() => onChange(method.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${method.nameBn}. ${method.demoNotice}`}
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
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: theme.radius.full,
                  backgroundColor: theme.colors.surfaceMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isWallet ? (
                  <Smartphone size={18} color={theme.colors.paymentBkash} />
                ) : (
                  <Banknote size={18} color={theme.colors.paymentCod} />
                )}
              </View>

              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label">{method.nameBn}</Text>
                <Text variant="caption" tone="secondary" numberOfLines={2}>
                  {method.demoNotice}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Badge label="ডেমো" tone={selected ? 'primary' : 'neutral'} />
                {selected ? <CircleCheckBig size={18} color={theme.colors.primary} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text variant="caption" tone="warning" weight="semibold">
        কোনো কার্ড নম্বর, সিভিভি, ওটিপি বা ওয়ালেট পিন কখনো চাওয়া হয় না — এই ডেমোতে পেমেন্ট
        সম্পন্ন হওয়ার দাবি করা হয় না।
      </Text>
    </Card>
  );
}
