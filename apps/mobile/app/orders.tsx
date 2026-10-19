import { useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Package, UserRound } from 'lucide-react-native';
import type { OrderStatus } from '@shobdox/shared-types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from '@shobdox/shared-types';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { useCustomerOrders } from '../src/hooks/useProducts';
import { useTheme } from '../src/hooks/useTheme';
import { useAuthStore } from '../src/store/auth.store';
import { OrderCard } from '../src/components/orders/OrderCard';
import { Button, Card, Chip, EmptyState, Screen, Text } from '../src/components/ui';

/**
 * Order history.
 *
 * Shows the orders stored on this device for the signed-in demo account (every
 * order, including the sample ones, while browsing as a guest). Filtering is
 * local and instant — the dataset is already in memory.
 */

type Filter = OrderStatus | 'all';

export default function OrdersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const orders = useCustomerOrders();
  const session = useAuthStore((state) => state.session);

  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['all', orders.length]]);
    for (const order of orders) {
      map.set(order.status, (map.get(order.status) ?? 0) + 1);
    }
    return map;
  }, [orders]);

  // Only offer filters that can actually return something.
  const filters = useMemo<Filter[]>(
    () => [
      'all',
      ...ORDER_STATUS_SEQUENCE.filter((status) => (counts.get(status) ?? 0) > 0),
      ...(['cancelled', 'returned'] as OrderStatus[]).filter((status) => (counts.get(status) ?? 0) > 0),
    ],
    [counts],
  );

  const visible = useMemo(
    () => (filter === 'all' ? orders : orders.filter((order) => order.status === filter)),
    [orders, filter],
  );

  const goShopping = useCallback(() => router.push('/(tabs)'), [router]);
  const goSignIn = useCallback(() => router.push('/sign-in'), [router]);

  return (
    <Screen>
      <FlatList
        data={visible}
        keyExtractor={(order) => order.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: theme.space[4], paddingBottom: theme.space[3] }}>
            <OrderCard order={item} />
          </View>
        )}
        ListHeaderComponent={
          <View style={{ gap: theme.space[3], paddingBottom: theme.space[3] }}>
            {!session ? (
              <View style={{ paddingHorizontal: theme.space[4], paddingTop: theme.space[3] }}>
                <Card style={{ gap: theme.space[2] }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
                    <UserRound size={18} color={theme.colors.primary} />
                    <Text variant="label">ডেমো সাইন ইন করুন</Text>
                  </View>
                  <Text variant="caption" tone="secondary">
                    সাইন ইন করলে শুধু আপনার অর্ডারগুলো দেখা যাবে। এখন সব ডেমো অর্ডার দেখানো হচ্ছে।
                  </Text>
                  <Button
                    variant="outline"
                    size="sm"
                    label="সাইন ইন"
                    accessibilityLabel="ডেমো সাইন ইন করুন"
                    onPress={goSignIn}
                  />
                </Card>
              </View>
            ) : null}

            {orders.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: theme.space[2],
                  paddingHorizontal: theme.space[4],
                }}
              >
                {filters.map((entry) => (
                  <Chip
                    key={entry}
                    label={entry === 'all' ? 'সব' : ORDER_STATUS_LABELS[entry].bn}
                    count={toBanglaDigits(counts.get(entry) ?? 0)}
                    selected={entry === filter}
                    accessibilityLabel={
                      entry === 'all'
                        ? `সব অর্ডার, ${toBanglaDigits(counts.get('all') ?? 0)} টি`
                        : `${ORDER_STATUS_LABELS[entry].bn}, ${toBanglaDigits(counts.get(entry) ?? 0)} টি`
                    }
                    onPress={() => setFilter(entry)}
                  />
                ))}
              </ScrollView>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Package size={28} color={theme.colors.primary} />}
            title={orders.length === 0 ? 'এখনো কোনো অর্ডার নেই' : 'এই অবস্থায় কোনো অর্ডার নেই'}
            description={
              orders.length === 0
                ? 'ডেমো চেকআউট সম্পন্ন করলে অর্ডারটি এখানে ট্র্যাকিংসহ দেখা যাবে। ডেমো ডেটা রিসেট করলে নমুনা অর্ডারগুলো ফিরে আসবে।'
                : 'অন্য অবস্থা বেছে নিয়ে দেখুন, অথবা সব অর্ডার দেখুন।'
            }
            actionLabel={orders.length === 0 ? 'কেনাকাটা শুরু করুন' : 'সব অর্ডার দেখুন'}
            onAction={orders.length === 0 ? goShopping : () => setFilter('all')}
          />
        }
        contentContainerStyle={{ paddingBottom: theme.space[6] }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
