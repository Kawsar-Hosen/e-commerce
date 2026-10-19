import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ShoppingBag, TriangleAlert } from 'lucide-react-native';
import { MOCK_PRIMARY_CUSTOMER } from '@shobdox/shared-mock-data';
import {
  checkoutSchema,
  type CheckoutFormValues,
  type CheckoutParsed,
} from '@shobdox/shared-validation';
import { computeCartTotals } from '@shobdox/shared-business-logic';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { defaultShippingAddress, GUEST_ADDRESS, useCart } from '../src/hooks/useCart';
import { useTheme } from '../src/hooks/useTheme';
import { useAuthStore } from '../src/store/auth.store';
import { useCartStore } from '../src/store/cart.store';
import { toast } from '../src/store/ui.store';
import { submitDemoCheckout } from '../src/services/checkout.service';
import { saveCustomerAddress } from '../src/services/customer.service';
import { DeliveryPicker } from '../src/components/cart/DeliveryPicker';
import { OrderSummaryCard } from '../src/components/cart/OrderSummaryCard';
import { PaymentPicker } from '../src/components/checkout/PaymentPicker';
import { AddressFields } from '../src/components/checkout/AddressFields';
import { SavedAddressPicker } from '../src/components/checkout/SavedAddressPicker';
import { applyAddressToForm, buildCheckoutDefaults } from '../src/components/checkout/checkoutForm';
import { OrderItemsList } from '../src/components/orders/OrderItemsList';
import {
  Button,
  Card,
  Checkbox,
  DemoPaymentNotice,
  EmptyState,
  FieldRow,
  Input,
  Screen,
  Text,
} from '../src/components/ui';

/**
 * One-page demo checkout.
 *
 * Nothing here contacts a gateway: the order is assembled by the checkout
 * service and written to local state only. The form is guarded against an empty
 * cart, stock-outs and double submission, and the demo acknowledgement is
 * required before the button unlocks.
 */

export default function CheckoutScreen() {
  const theme = useTheme();
  const router = useRouter();
  const cart = useCart();

  const user = useAuthStore((state) => state.session?.user);
  const account = user ?? MOCK_PRIMARY_CUSTOMER;
  const seedAddress =
    defaultShippingAddress(user) ?? defaultShippingAddress(MOCK_PRIMARY_CUSTOMER) ?? GUEST_ADDRESS;

  const clearCart = useCartStore((state) => state.clear);
  const setDeliveryMethod = useCartStore((state) => state.setDeliveryMethod);
  const setPaymentMethod = useCartStore((state) => state.setPaymentMethod);
  const setNote = useCartStore((state) => state.setNote);

  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [pickedAddressId, setPickedAddressId] = useState(seedAddress.id);

  const form = useForm<CheckoutFormValues, unknown, CheckoutParsed>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: buildCheckoutDefaults({
      account,
      address: seedAddress,
      deliveryMethodId: cart.deliveryMethodId,
      paymentMethodId: cart.paymentMethodId,
      note: cart.note,
    }),
  });

  const { errors, submitCount } = form.formState;
  const division = form.watch('division') || seedAddress.division;
  const district = form.watch('district') || seedAddress.district;
  const deliveryMethod = form.watch('deliveryMethod');
  const paymentMethod = form.watch('paymentMethod');
  const note = form.watch('note');
  const saveAddress = form.watch('saveAddress') ?? true;
  const acknowledged = form.watch('acknowledgeDemo') === true;

  // Keep the persisted cart note in step so returning to the cart keeps it.
  useEffect(() => {
    setNote(note ?? '');
  }, [note, setNote]);

  const blocking = useMemo(
    () => cart.issues.filter((issue) => issue.severity === 'error'),
    [cart.issues],
  );

  const previewTotals = useMemo(
    () =>
      computeCartTotals({
        items: cart.items,
        coupon: cart.coupon,
        address: { division, district },
        deliveryMethodId: deliveryMethod,
      }),
    [cart.items, cart.coupon, division, district, deliveryMethod],
  );

  const onSubmit = form.handleSubmit(
    async (values) => {
      if (submitting) return;

      if (blocking.length > 0) {
        toast({
          tone: 'error',
          title: 'স্টকে না থাকা পণ্য আছে',
          description: 'কার্ট থেকে সমস্যাগুলো ঠিক করে আবার চেষ্টা করুন।',
        });
        return;
      }

      setSubmitting(true);
      try {
        const { order, address } = await submitDemoCheckout({
          values,
          customerId: account.id,
          addressId: pickedAddressId,
          items: cart.items,
          coupon: cart.coupon,
        });

        if (user && values.saveAddress) {
          const updated = saveCustomerAddress(user, { ...address, label: address.label ?? 'ঠিকানা' });
          useAuthStore.getState().updateProfile({ addresses: updated.addresses });
        }

        setPlaced(true);
        clearCart();
        toast({
          tone: 'success',
          title: 'ডেমো অর্ডার রেকর্ড হয়েছে',
          description: `${order.orderNumber} — কোনো প্রকৃত পেমেন্ট হয়নি।`,
        });
        router.replace(`/order/${order.id}`);
      } finally {
        setSubmitting(false);
      }
    },
    (invalid) => {
      toast({
        tone: 'error',
        title: 'ফর্মটি সম্পূর্ণ করুন',
        description: `${toBanglaDigits(Object.keys(invalid).length)} টি তথ্য ঠিক করা প্রয়োজন।`,
      });
    },
  );

  const goToCart = useCallback(() => router.replace('/(tabs)/cart'), [router]);

  if (cart.isEmpty && !placed) {
    return (
      <Screen background="surface">
        <EmptyState
          icon={<ShoppingBag size={28} color={theme.colors.primary} />}
          title="কার্ট খালি"
          description="চেকআউট করার আগে অন্তত একটি পণ্য কার্টে যোগ করুন।"
          actionLabel="কার্টে ফিরে যান"
          onAction={goToCart}
        />
      </Screen>
    );
  }

  return (
    <Screen background="default">
      <ScrollView
        contentContainerStyle={{ padding: theme.space[4], gap: theme.space[4], paddingBottom: theme.space[6] }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={{ gap: theme.space[3] }}>
          <Text variant="subtitle">যোগাযোগের তথ্য</Text>
          <FieldRow>
            <Input
              label="পুরো নাম"
              value={form.watch('fullName')}
              onChangeText={(value) => form.setValue('fullName', value)}
              onBlur={() => void form.trigger('fullName')}
              autoCapitalize="words"
              error={errors.fullName?.message}
            />
            <Input
              label="মোবাইল নম্বর"
              value={form.watch('phone')}
              onChangeText={(value) => form.setValue('phone', value)}
              onBlur={() => void form.trigger('phone')}
              keyboardType="phone-pad"
              maxLength={14}
              placeholder="01XXXXXXXXX"
              error={errors.phone?.message}
            />
          </FieldRow>
          <FieldRow>
            <Input
              label="বিকল্প মোবাইল (ঐচ্ছিক)"
              value={form.watch('altPhone')}
              onChangeText={(value) => form.setValue('altPhone', value)}
              keyboardType="phone-pad"
              maxLength={14}
              error={errors.altPhone?.message}
            />
            <Input
              label="ইমেইল (ঐচ্ছিক)"
              value={form.watch('email')}
              onChangeText={(value) => form.setValue('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />
          </FieldRow>
        </Card>

        <SavedAddressPicker
          addresses={account.addresses}
          activeId={pickedAddressId}
          onPick={(address) => {
            setPickedAddressId(address.id);
            applyAddressToForm(form, address);
          }}
        />

        <Card style={{ gap: theme.space[3] }}>
          <Text variant="subtitle">ডেলিভারি ঠিকানা</Text>
          <AddressFields form={form} />
          {user ? (
            <Checkbox
              checked={saveAddress}
              onChange={(checked) => form.setValue('saveAddress', checked)}
              label="এই ঠিকানাটি সেভ করুন"
              description="আপনার ডেমো অ্যাকাউন্টের ঠিকানা বইতে সংরক্ষিত হবে — শুধু এই ডিভাইসে।"
            />
          ) : (
            <Text variant="caption" tone="muted">
              সাইন ইন করলে ঠিকানাটি পরের বার নিজে থেকে বসে যাবে।
            </Text>
          )}
        </Card>

        <DeliveryPicker
          value={deliveryMethod}
          onChange={(method) => {
            setDeliveryMethod(method);
            form.setValue('deliveryMethod', method);
          }}
          address={{ ...seedAddress, division, district }}
          subtotal={previewTotals.subtotal}
          hasFreeDeliveryCoupon={cart.coupon?.type === 'free-delivery'}
        />

        <PaymentPicker
          value={paymentMethod}
          onChange={(method) => {
            setPaymentMethod(method);
            form.setValue('paymentMethod', method);
          }}
        />

        <Card style={{ gap: theme.space[3] }}>
          <Text variant="subtitle">অর্ডার নোট (ঐচ্ছিক)</Text>
          <Input
            label="ডেলিভারি নির্দেশনা"
            value={note ?? ''}
            onChangeText={(value) => form.setValue('note', value)}
            placeholder="যেমন: দুপুরের পরে কল করুন"
            multiline
            maxLength={300}
            error={errors.note?.message}
          />
        </Card>

        <Card style={{ gap: theme.space[3] }}>
          <Text variant="subtitle">অর্ডারের পণ্য</Text>
          <OrderItemsList items={cart.items} />
          <Text variant="caption" tone="muted">
            মোট {toBanglaDigits(previewTotals.itemCount)} টি পণ্য — কার্টের হিসাবের সাথে মিলিয়ে দেখানো হয়েছে।
          </Text>
        </Card>

        <OrderSummaryCard
          totals={previewTotals}
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
        {blocking.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: theme.space[2], alignItems: 'flex-start' }}>
            <TriangleAlert size={16} color={theme.colors.error} />
            <Text variant="caption" tone="error" accessibilityLiveRegion="polite">
              {blocking[0]?.message} — কার্ট ঠিক না করা পর্যন্ত অর্ডার নিশ্চিত করা যাবে না।
            </Text>
          </View>
        ) : null}

        {submitCount > 0 && Object.keys(errors).length > 0 ? (
          <Text variant="caption" tone="error" accessibilityLiveRegion="polite">
            লাল চিহ্নিত ঘরগুলো ঠিক করুন — তারপর আবার চেষ্টা করুন।
          </Text>
        ) : null}

        <Checkbox
          checked={acknowledged}
          onChange={(checked) => form.setValue('acknowledgeDemo', checked as true, { shouldValidate: true })}
          label="আমি বুঝেছি এটি ডেমো চেকআউট — কোনো প্রকৃত পেমেন্ট বা ডেলিভারি হবে না"
          error={errors.acknowledgeDemo?.message}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="caption" tone="secondary">
            সর্বমোট (ডেলিভারিসহ)
          </Text>
          <Text variant="price" accessibilityLabel={`সর্বমোট ${formatTaka(previewTotals.total)}`}>
            {formatTaka(previewTotals.total)}
          </Text>
        </View>

        <Button
          fullWidth
          size="lg"
          label="ডেমো অর্ডার নিশ্চিত করুন"
          loading={submitting}
          disabled={blocking.length > 0 || submitting}
          icon={<Lock size={18} color={theme.colors.onPrimary} />}
          accessibilityLabel="ডেমো অর্ডার নিশ্চিত করুন"
          accessibilityHint="কোনো প্রকৃত পেমেন্ট হবে না; অর্ডারটি শুধু এই ডিভাইসে সংরক্ষিত হয়"
          onPress={onSubmit}
        />
      </View>
    </Screen>
  );
}
