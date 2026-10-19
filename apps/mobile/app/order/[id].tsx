import { useCallback, useMemo } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleCheckBig, ShoppingBag, Truck, Undo2 } from 'lucide-react-native';
import { ORDER_STATUS_LABELS } from '@shobdox/shared-types';
import {
  canCustomerCancel,
  nextStatuses,
  recommendedProducts,
} from '@shobdox/shared-business-logic';
import { formatBdPhone, formatDate, formatDateTime, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { useOrders, useProducts } from '../../src/hooks/useProducts';
import { useTheme } from '../../src/hooks/useTheme';
import { toast } from '../../src/store/ui.store';
import { useWishlistStore } from '../../src/store/wishlist.store';
import { useUiStore } from '../../src/store/ui.store';
import { advanceOrder, cancelOrder, summarizeForConfirmation } from '../../src/services/order.service';
import { OrderItemsList } from '../../src/components/orders/OrderItemsList';
import { OrderStatusChip } from '../../src/components/orders/OrderStatusChip';
import { OrderTimeline } from '../../src/components/orders/OrderTimeline';
import { ProductRail } from '../../src/components/home/ProductRail';
import {
  Button,
  Card,
  DemoNotice,
  ErrorState,
  Screen,
  Text,
} from '../../src/components/ui';

/**
 * Order detail / tracking.
 *
 * Confirmation and tracking in one screen: the record itself (number, lines,
 * totals, address), the shared timeline and the two demo controls that move the
 * order along its state machine. Nothing here implies a real payment.
 */

export default function OrderDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const orders = useOrders();
  const products = useProducts();
  const wishlistIds = useWishlistStore((state) => state.productIds);
  const recentlyViewedIds = useUiStore((state) => state.recentlyViewedIds);

  const order = useMemo(
    () => orders.find((candidate) => candidate.id === id || candidate.orderNumber === id),
    [orders, id],
  );

  const recommendations = useMemo(
    () =>
      recommendedProducts({
        products,
        cartProductIds: [],
        wishlistProductIds: wishlistIds,
        recentProductIds: recentlyViewedIds,
        limit: 6,
      }),
    [products, wishlistIds, recentlyViewedIds],
  );

  const handleAdvance = useCallback(() => {
    if (!order) return;
    const advanced = advanceOrder(order.id, 'ডেমো (গ্রাহক নিজে চালিয়েছেন)');
    if (advanced) {
      toast({
        tone: 'info',
        title: 'ডেমো অবস্থা হালনাগাদ',
        description: `নতুন অবস্থা: ${ORDER_STATUS_LABELS[advanced].bn} — কোনো প্রকৃত ডেলিভারি হয় না।`,
      });
    }
  }, [order]);

  const handleCancel = useCallback(() => {
    if (!order) return;
    Alert.alert('ডেমো অর্ডার বাতিল করবেন?', 'অর্ডারটি বাতিল হিসেবে চিহ্নিত হবে। এটি ডেমো — কোনো টাকা ফেরতের প্রক্রিয়া নেই।', [
      { text: 'থাক', style: 'cancel' },
      {
        text: 'বাতিল করুন',
        style: 'destructive',
        onPress: () => {
          cancelOrder(order.id);
          toast({ tone: 'warning', title: 'ডেমো অর্ডার বাতিল করা হয়েছে' });
        },
      },
    ]);
  }, [order]);

  if (!order) {
    return (
      <Screen background="surface">
        <ErrorState
          title="অর্ডারটি খুঁজে পাওয়া যায়নি"
          description="লিংকটি ভুল হতে পারে, অথবা ডেমো ডেটা রিসেটের কারণে অর্ডারটি মুছে গেছে।"
          actionLabel="আমার অর্ডারসমূহ"
          onRetry={() => router.replace('/orders')}
        />
      </Screen>
    );
  }

  const summary = summarizeForConfirmation(order);
  const forward = nextStatuses(order.status).find((status) => status !== 'cancelled');
  const cancellable = canCustomerCancel(order);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: theme.space[4], gap: theme.space[4], paddingBottom: theme.space[8] }}
        showsVerticalScrollIndicator={false}
      >
        <Card style={{ gap: theme.space[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.space[3] }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.successSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircleCheckBig size={22} color={theme.colors.success} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="subtitle">
                {order.isDemo ? 'ডেমো অর্ডার রেকর্ড করা হয়েছে' : 'ডেমো নমুনা অর্ডার'}
              </Text>
              <Text variant="mono" numberOfLines={1}>
                {order.orderNumber}
              </Text>
              <Text variant="caption" tone="secondary">
                {formatDateTime(order.placedAt)} · {toBanglaDigits(order.items.length)} ধরনের পণ্য
              </Text>
            </View>
            <OrderStatusChip status={order.status} size="md" />
          </View>

          <DemoNotice
            tone="payment"
            title="এটি একটি ডেমো অর্ডার — কোনো প্রকৃত পেমেন্ট বা ডেলিভারি হবে না"
            message={`${order.orderNumber} নম্বরটি ডেমো সিস্টেমের তৈরি। কোনো গেটওয়েতে টাকা যায়নি, কোনো কার্ড/ওয়ালেট তথ্য নেওয়া হয়নি এবং অর্ডারটি শুধু এই ডিভাইসে সংরক্ষিত।`}
          />
        </Card>

        <Card style={{ gap: theme.space[3] }}>
          <Text variant="subtitle">অর্ডারের অবস্থা</Text>
          <OrderTimeline order={order} />
        </Card>

        <Card style={{ gap: theme.space[3] }}>
          <Text variant="subtitle">পণ্যসমূহ</Text>
          <OrderItemsList items={order.items} />
        </Card>

        <Card style={{ gap: theme.space[2] }}>
          <Text variant="subtitle">ডেলিভারি ও পেমেন্ট</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
            <Truck size={16} color={theme.colors.primary} />
            <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
              {summary.deliveryWindow}
            </Text>
          </View>

          <Text variant="caption" tone="secondary">
            {summary.paymentLabel}
          </Text>
          <Text variant="caption" tone="secondary">
            সম্ভাব্য ডেলিভারি: {formatDate(order.estimatedDelivery)}
          </Text>

          <View
            style={{
              backgroundColor: theme.colors.surfaceMuted,
              borderRadius: theme.componentRadius.card,
              padding: theme.space[3],
              gap: 2,
            }}
          >
            <Text variant="label">ডেলিভারি ঠিকানা</Text>
            <Text variant="caption" tone="secondary">
              {order.shippingAddress.fullName} · {formatBdPhone(order.shippingAddress.phone)}
            </Text>
            <Text variant="caption" tone="secondary">
              {order.shippingAddress.addressLine}, {order.shippingAddress.area}, {order.shippingAddress.district},{' '}
              {order.shippingAddress.division}
            </Text>
            {order.shippingAddress.postcode ? (
              <Text variant="caption" tone="muted">
                পোস্ট কোড: {toBanglaDigits(order.shippingAddress.postcode)}
              </Text>
            ) : null}
          </View>

          {order.note ? (
            <Text variant="caption" tone="secondary">
              আপনার নোট: {order.note}
            </Text>
          ) : null}

          <Text variant="caption" tone="muted">
            অর্ডার আইডি: {order.id} · সর্বমোট {formatTaka(order.totals.total)}
          </Text>
        </Card>

        <Card style={{ gap: theme.space[3] }}>
          <Text variant="subtitle">ডেমো কন্ট্রোল</Text>
          <Text variant="caption" tone="secondary">
            শেয়ার্ড স্টেট মেশিন দিয়ে অর্ডারটি পরের ধাপে নিন বা বাতিল করুন — বাস্তব অ্যাপে এটি
            অপারেশন টিমের কাজ, এখানে ডেমো দেখানোর জন্য খোলা।
          </Text>

          {forward ? (
            <Button
              variant="secondary"
              fullWidth
              label={`পরবর্তী ধাপ: ${ORDER_STATUS_LABELS[forward].bn}`}
              icon={<ShoppingBag size={16} color={theme.colors.primary} />}
              accessibilityLabel={`ডেমো অর্ডার ${ORDER_STATUS_LABELS[forward].bn} অবস্থায় নিন`}
              onPress={handleAdvance}
            />
          ) : (
            <Text variant="caption" tone="muted">
              এই অর্ডারটি শেষ অবস্থায় আছে — আর এগোনো যাবে না।
            </Text>
          )}

          {cancellable ? (
            <Button
              variant="outline"
              fullWidth
              label="ডেমো অর্ডার বাতিল করুন"
              icon={<Undo2 size={16} color={theme.colors.error} />}
              accessibilityLabel="ডেমো অর্ডার বাতিল করুন"
              onPress={handleCancel}
            />
          ) : null}
        </Card>

        <ProductRail title="আরও যা ভালো লাগতে পারে" products={recommendations} href="/shop" />
      </ScrollView>
    </Screen>
  );
}
