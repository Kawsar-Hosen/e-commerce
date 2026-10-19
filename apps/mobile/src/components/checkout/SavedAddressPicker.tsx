import { Pressable, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import type { ShippingAddress } from '@shobdox/shared-types';
import { formatBdPhone } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { Card, Text } from '../ui';

/**
 * Saved-address shortcuts.
 *
 * Tapping a card copies that address into the checkout form; the fields below
 * stay editable, so a one-off delivery can still differ from the address book.
 */

export interface SavedAddressPickerProps {
  addresses: ShippingAddress[];
  activeId?: string;
  onPick: (address: ShippingAddress) => void;
}

export function SavedAddressPicker({ addresses, activeId, onPick }: SavedAddressPickerProps) {
  const theme = useTheme();

  if (addresses.length === 0) return null;

  return (
    <Card style={{ gap: theme.space[2] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
        <MapPin size={18} color={theme.colors.primary} />
        <Text variant="subtitle">সংরক্ষিত ঠিকানা</Text>
      </View>

      <View style={{ gap: theme.space[2] }}>
        {addresses.map((address) => {
          const selected = address.id === activeId;

          return (
            <Pressable
              key={address.id}
              onPress={() => onPick(address)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${address.label ?? 'ঠিকানা'}, ${address.fullName}, ${address.area}, ${address.district}`}
              android_ripple={{ color: theme.colors.overlay }}
              style={{
                borderWidth: 1,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
                borderRadius: theme.componentRadius.card,
                padding: theme.space[3],
                gap: 2,
                minHeight: theme.layout.minTouchTarget,
              }}
            >
              <Text variant="label">{address.label ?? 'সংরক্ষিত ঠিকানা'}</Text>
              <Text variant="caption" tone="secondary">
                {address.fullName} · {formatBdPhone(address.phone)}
              </Text>
              <Text variant="caption" tone="secondary">
                {address.area}, {address.district}, {address.division}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
