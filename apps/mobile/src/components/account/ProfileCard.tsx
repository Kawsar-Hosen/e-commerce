import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Package, Receipt, Settings2 } from 'lucide-react-native';
import type { User } from '@shobdox/shared-types';
import { toBanglaDigits } from '@shobdox/shared-utils';import { DEMO_ROLE_LABELS, type DemoRole } from '../../store/auth.store';
import { useTheme } from '../../hooks/useTheme';
import { Avatar, Badge, Button, Card, Text } from '../ui';

/** Signed-in summary: who you are, where your orders live, saved addresses. */

export interface ProfileCardProps {
  user: User;
  addressCount: number;
}

export function ProfileCard({ user, addressCount }: ProfileCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const roleLabel = DEMO_ROLE_LABELS[user.role as DemoRole] ?? user.role;

  return (
    <Card style={{ gap: theme.space[3] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
        <Avatar name={user.name} uri={user.avatar} size={56} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="subtitle" numberOfLines={1}>
            {user.name}
          </Text>
          <Text variant="caption" tone="secondary">
            {user.phone}
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.space[2], flexWrap: 'wrap' }}>
            <Badge label={roleLabel} tone="primary" />
            <Badge label={`${toBanglaDigits(user.loyaltyPoints)} পয়েন্ট`} tone="accent" />
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
        <Button
          size="sm"
          variant="outline"
          label="আমার অর্ডার"
          icon={<Package size={14} color={theme.colors.primary} />}
          accessibilityLabel="আমার অর্ডার দেখুন"
          onPress={() => router.push('/orders')}
        />
        <Button
          size="sm"
          variant="outline"
          label="রিসিট"
          icon={<Receipt size={14} color={theme.colors.primary} />}
          accessibilityLabel="সর্বশেষ অর্ডারের রিসিট দেখুন"
          onPress={() => router.push('/orders')}
        />
      </View>

      {user.addresses.length > 0 ? (
        <View style={{ gap: theme.space[2] }}>
          <Text variant="label" tone="secondary">
            {`সংরক্ষিত ঠিকানা (${toBanglaDigits(addressCount)})`}
          </Text>

          {user.addresses.slice(0, 2).map((address) => (
            <View
              key={address.id}
              style={{
                flexDirection: 'row',
                gap: theme.space[2],
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.componentRadius.card,
                padding: theme.space[3],
              }}
            >
              <MapPin size={16} color={theme.colors.primary} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label" numberOfLines={1}>
                  {address.fullName}
                  {address.isDefault ? ' · ডিফল্ট' : ''}
                </Text>
                <Text variant="caption" tone="secondary" numberOfLines={2}>
                  {`${address.addressLine}, ${address.area}, ${address.district}, ${address.division}`}
                </Text>
              </View>
            </View>
          ))}

          <Text variant="caption" tone="muted">
            চেকআউটের সময় ঠিকানা সম্পাদনা বা নতুন ঠিকানা যোগ করা যায় — ডেমো ডেটা হিসেবে
            সংরক্ষিত হয়।
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
        <Settings2 size={16} color={theme.colors.textSecondary} />
        <Text variant="caption" tone="muted" style={{ flex: 1 }}>
          লয়্যালটি পয়েন্ট, ঠিকানা ও অর্ডার — সবই এই ডিভাইসে সংরক্ষিত ডেমো ডেটা।
        </Text>
      </View>
    </Card>
  );
}
