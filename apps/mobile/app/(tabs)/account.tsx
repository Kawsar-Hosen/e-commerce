import { useCallback } from 'react';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  Heart,
  LogOut,
  Package,
  PhoneCall,
  RefreshCw,
} from 'lucide-react-native';
import { SUPPORT_PHONE, DEMO_DATA_NOTICE } from '../../src/lib/constants';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { useTheme } from '../../src/hooks/useTheme';
import { useCustomerOrders, useUnreadNotificationCount } from '../../src/hooks/useProducts';
import { useAuthStore } from '../../src/store/auth.store';
import { useCartStore } from '../../src/store/cart.store';
import { useWishlistStore } from '../../src/store/wishlist.store';
import { resetEverything, signOutAndClear } from '../../src/store/reset';
import { toast } from '../../src/store/ui.store';
import { DemoAccountCard } from '../../src/components/account/DemoAccountCard';
import { ProfileCard } from '../../src/components/account/ProfileCard';
import { ThemePreferencePicker } from '../../src/components/account/ThemePreferencePicker';
import {
  Badge,
  Button,
  Card,
  DemoNotice,
  Screen,
  ScreenHeader,
  Text,
} from '../../src/components/ui';

/**
 * Account.
 *
 * Demo session, order shortcuts, theme preference and the two destructive demo
 * actions — reset the dataset and sign out. Both ask for confirmation first.
 */

export default function AccountScreen() {
  const theme = useTheme();
  const router = useRouter();

  const session = useAuthStore((state) => state.session);
  const orders = useCustomerOrders();
  const unread = useUnreadNotificationCount();
  const cartUnits = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const wishlistCount = useWishlistStore((state) => state.productIds.length);

  const confirmReset = useCallback(() => {
    Alert.alert(
      'ডেমো ডেটা রিসেট করবেন?',
      'পণ্য, অর্ডার, কার্ট, উইশলিস্ট ও সেশন আগের অবস্থায় ফিরে যাবে। এই কাজটি ফেরানো যাবে না।',
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'রিসেট করুন',
          style: 'destructive',
          onPress: () => {
            const summary = resetEverything();
            toast({
              tone: 'success',
              title: 'ডেমো ডেটা রিসেট হয়েছে',
              description: `${toBanglaDigits(summary.products)}টি পণ্য ও ${toBanglaDigits(summary.orders)}টি অর্ডার পুনঃস্থাপিত।`,
            });
          },
        },
      ],
    );
  }, []);

  const signOut = useCallback(() => {
    void signOutAndClear().then(() => {
      toast({ tone: 'info', title: 'সেশন শেষ হয়েছে', description: 'ডেমো ক্যাটালগ আগের মতোই আছে।' });
    });
  }, []);

  const rows = [
    {
      id: 'orders',
      icon: <Package size={18} color={theme.colors.primary} />,
      label: 'আমার অর্ডার',
      description: `${toBanglaDigits(orders.length)}টি অর্ডার এই ডিভাইসে`,
      onPress: () => router.push('/orders'),
    },
    {
      id: 'notifications',
      icon: <Bell size={18} color={theme.colors.primary} />,
      label: 'নোটিফিকেশন',
      description: unread > 0 ? `${toBanglaDigits(unread)}টি অপঠিত` : 'সব পড়া হয়েছে',
      onPress: () => router.push('/notifications'),
    },
    {
      id: 'wishlist',
      icon: <Heart size={18} color={theme.colors.primary} />,
      label: 'উইশলিস্ট',
      description: `${toBanglaDigits(wishlistCount)}টি পণ্য সংরক্ষিত`,
      onPress: () => router.push('/(tabs)/wishlist'),
    },
    {
      id: 'cart',
      icon: <Package size={18} color={theme.colors.primary} />,
      label: 'কার্ট',
      description: cartUnits > 0 ? `${toBanglaDigits(cartUnits)}টি পণ্য কার্টে` : 'কার্ট খালি',
      onPress: () => router.push('/(tabs)/cart'),
    },
  ];

  return (
    <Screen background="surface">
      <ScreenHeader
        title="অ্যাকাউন্ট"
        subtitle={session ? session.user.name : 'ডেমো ব্যবহারকারী'}
        right={<Badge label="ডেমো" tone="info" />}
      />

      <ScrollView
        contentContainerStyle={{ padding: theme.space[4], gap: theme.space[4], paddingBottom: theme.space[8] }}
        showsVerticalScrollIndicator={false}
      >
        {session ? <ProfileCard user={session.user} addressCount={session.user.addresses.length} /> : <DemoAccountCard />}

        <Card padded={false}>
          {rows.map((row, index) => (
            <Pressable
              key={row.id}
              onPress={row.onPress}
              accessibilityRole="button"
              accessibilityLabel={`${row.label}. ${row.description}`}
              android_ripple={{ color: theme.colors.overlay }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space[3],
                paddingHorizontal: theme.space[4],
                minHeight: theme.layout.minTouchTarget + 12,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: theme.colors.divider,
              }}
            >
              {row.icon}
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label">{row.label}</Text>
                <Text variant="caption" tone="secondary">
                  {row.description}
                </Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </Pressable>
          ))}
        </Card>

        <ThemePreferencePicker />

        <Card style={{ gap: theme.space[3] }}>
          <Text variant="subtitle">সাপোর্ট ও ডেমো টুল</Text>

          <Button
            variant="outline"
            fullWidth
            label={`সাপোর্টে কল (${SUPPORT_PHONE})`}
            icon={<PhoneCall size={16} color={theme.colors.primary} />}
            accessibilityLabel="শব্দক্স সাপোর্টে কল করুন"
            accessibilityHint="ফোন ডায়ালার খুলবে"
            onPress={() => {
              void Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() =>
                toast({ tone: 'warning', title: 'ডায়ালার খোলা যায়নি' }),
              );
            }}
          />

          <Button
            variant="outline"
            fullWidth
            label="ডেমো ডেটা রিসেট"
            icon={<RefreshCw size={16} color={theme.colors.primary} />}
            accessibilityLabel="ডেমো ডেটা রিসেট করুন"
            onPress={confirmReset}
          />

          {session ? (
            <Button
              variant="danger"
              fullWidth
              label="সাইন আউট"
              icon={<LogOut size={16} color={theme.colors.textInverse} />}
              accessibilityLabel="সেশন শেষ করুন"
              onPress={signOut}
            />
          ) : null}

          <DemoNotice message={DEMO_DATA_NOTICE} />
        </Card>
      </ScrollView>
    </Screen>
  );
}
