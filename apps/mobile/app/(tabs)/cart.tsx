import { useCallback, useMemo } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { RefreshCw, ShoppingBag, Trash } from 'lucide-react-native';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { useCart } from '../../src/hooks/useCart';
import { useTheme } from '../../src/hooks/useTheme';
import { toast } from '../../src/store/ui.store';
import { useCartStore } from '../../src/store/cart.store';
import { CartLineRow } from '../../src/components/cart/CartLineRow';
import { CouponField } from '../../src/components/cart/CouponField';
import { DeliveryPicker } from '../../src/components/cart/DeliveryPicker';
import { OrderSummaryCard } from '../../src/components/cart/OrderSummaryCard';
import {
  Button,
  DemoPaymentNotice,
  EmptyState,
  Screen,
  ScreenHeader,
  Text,
} from '../../src/components/ui';

/**
 * Cart.
 *
 * The mobile twin of the web cart page: lines, coupon, delivery method and the
 * shared totals breakdown. Prices are recomputed from the live catalogue on every
 * render, and a persisted cart whose price or stock moved on says so and offers
 * a one-tap reprice.
 */

export default function CartScreen() {
  const theme = useTheme();
  const router = useRouter();
  const cart = useCart();
  const setDeliveryMethod = useCartStore((state) => state.setDeliveryMethod);

  const issueByLine = useMemo(
    () => new Map(cart.issues.map((issue) => [issue.lineId, issue])),
    [cart.issues],
  );

  const clearCart = useCallback(() => {
    Alert.alert('কার্ট খালি করবেন?', 'কার্টের সব পণ্য সরানো হবে। কুপনও বাদ যাবে।', [
      { text: 'বাতিল', style: 'cancel' },
      {
        text: 'খালি করুন',
        style: 'destructive',
        onPress: () => {
          useCartStore.getState().clear();
          toast({ tone: 'info', title: 'কার্ট খালি করা হয়েছে' });
        },
      },
    ]);
  }, []);

  if (cart.isEmpty) {
    return (
      <Screen background="surface">
        <ScreenHeader title="কার্ট" subtitle="এখনো কিছু যোগ করা হয়নি" />
        <EmptyState
          icon={<ShoppingBag size={28} color={theme.colors.primary} />}
          title="কার্ট খালি"
          description="পছন্দের পণ্য কার্টে যোগ করলে এখানে হিসাবসহ দেখা যাবে।"
          actionLabel="কেনাকাটা শুরু করুন"
          onAction={() => router.push('/(tabs)')}
        />
      </Screen>
    );
  }

  return (
    <Screen background="surface">
      <ScreenHeader
        title="কার্ট"
        subtitle={`${toBanglaDigits(cart.totals.itemCount)}টি পণ্য · ${formatTaka(cart.totals.total)}`}
        right={
          <Pressable
            onPress={clearCart}
            accessibilityRole="button"
            accessibilityLabel="কার্ট খালি করুন"
            hitSlop={8}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Trash size={20} color={theme.colors.error} />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={{ padding: theme.space[4], gap: theme.space[4], paddingBottom: theme.space[6] }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {cart.hasStalePrices ? (
          <Button
            variant="outline"
            fullWidth
            label="দাম হালনাগাদ করুন"
            icon={<RefreshCw size={16} color={theme.colors.primary} />}
            accessibilityLabel="কার্টের দাম হালনাগাদ করুন"
            onPress={() => {
              useCartStore.getState().replaceItems(cart.reprice);
              toast({ tone: 'success', title: 'কার্ট হালনাগাদ করা হয়েছে' });
            }}
          />
        ) : null}

        <View style={{ gap: theme.space[3] }}>
          {cart.items.map((item) => (
            <CartLineRow key={item.id} item={item} issue={issueByLine.get(item.id)} />
          ))}
        </View>

        <CouponField
          items={cart.items}
          subtotal={cart.totals.subtotal}
          couponCode={cart.coupon?.code}
        />

        <DeliveryPicker
          value={cart.deliveryMethodId}
          onChange={setDeliveryMethod}
          address={cart.address}
          subtotal={cart.totals.subtotal}
          hasFreeDeliveryCoupon={cart.coupon?.type === 'free-delivery'}
        />

        <OrderSummaryCard
          totals={cart.totals}
          couponCode={cart.coupon?.code}
          freeDeliveryPercent={cart.freeDeliveryPercent}
          freeDeliveryMessage={cart.freeDeliveryMessage}
        />

        <DemoPaymentNotice />
      </ScrollView>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: theme.space[4],
          gap: theme.space[2],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="caption" tone="secondary">
            সর্বমোট (ডেলিভারিসহ)
          </Text>
          <Text variant="price" accessibilityLabel={`সর্বমোট ${formatTaka(cart.totals.total)}`}>
            {formatTaka(cart.totals.total)}
          </Text>
        </View>

        <Button
          fullWidth
          size="lg"
          label="চেকআউট করুন"
          icon={<ShoppingBag size={18} color={theme.colors.onPrimary} />}
          accessibilityLabel="ডেমো চেকআউট শুরু করুন"
          accessibilityHint="ঠিকানা ও ডেমো পেমেন্ট পদ্ধতি নির্বাচনের পাতায় যাবে"
          onPress={() => router.push('/checkout')}
        />

        {cart.savingsLabel ? (
          <Text variant="caption" tone="success" align="center">
            {cart.savingsLabel}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
