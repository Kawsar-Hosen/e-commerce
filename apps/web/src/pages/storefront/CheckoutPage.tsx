import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Breadcrumbs,
  Button,
  ButtonLink,
  Checkbox,
  DemoNotice,
  PageHeader,
  Textarea,
} from '@/components/ui';
import type { ShippingAddress } from '@shobdox/shared-types';
import {
  checkoutSchema,
  type CheckoutFormValues,
  type CheckoutParsed,
} from '@shobdox/shared-validation';
import { computeCartTotals } from '@shobdox/shared-business-logic';
import { MOCK_PRIMARY_CUSTOMER } from '@shobdox/shared-mock-data';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { defaultShippingAddress, GUEST_ADDRESS, useCart } from '@/hooks/useCart';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/ui.store';
import { DEMO_PAYMENT_NOTICE } from '@/lib/constants';
import { AddressForm, ContactFields, SavedAddressPicker } from '@/features/checkout/AddressForm';
import { applyAddressToForm, buildCheckoutDefaults } from '@/features/checkout/checkoutFormValues';
import { CheckoutSection } from '@/features/checkout/CheckoutSection';
import { DeliveryMethodPicker } from '@/features/checkout/DeliveryMethodPicker';
import { OrderItemsPreview } from '@/features/checkout/OrderItemsPreview';
import { OrderSummary } from '@/features/checkout/OrderSummary';
import { PaymentMethodPicker } from '@/features/checkout/PaymentMethodPicker';
import { StockIssuesAlert } from '@/features/checkout/StockIssuesAlert';
import { submitDemoOrder } from '@/features/checkout/submitDemoOrder';
import { useBlockingCartLines } from '@/features/checkout/useBlockingCartLines';

/**
 * One-page demo checkout.
 *
 * Nothing here contacts a gateway: the order is assembled through the order
 * service and written to local state only. The form is guarded against an
 * empty cart, stale stock and double submission.
 */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.session?.user);
  const account = user ?? MOCK_PRIMARY_CUSTOMER;
  const fallbackAddress =
    defaultShippingAddress(user) ?? defaultShippingAddress(MOCK_PRIMARY_CUSTOMER) ?? GUEST_ADDRESS;

  const { items, totals, coupon, appliedCoupon, deliveryMethodId, paymentMethodId, note, issues, isEmpty } =
    useCart();
  const clearCart = useCartStore((state) => state.clear);
  const setDeliveryMethod = useCartStore((state) => state.setDeliveryMethod);
  const setPaymentMethod = useCartStore((state) => state.setPaymentMethod);
  const setNote = useCartStore((state) => state.setNote);

  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [pickedAddressId, setPickedAddressId] = useState<string | undefined>(fallbackAddress.id);

  const form = useForm<CheckoutFormValues, unknown, CheckoutParsed>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: buildCheckoutDefaults({
      account,
      address: fallbackAddress,
      deliveryMethodId,
      paymentMethodId,
      note,
    }),
  });

  const { register, formState } = form;
  const errors = formState.errors;
  const previewDivision = form.watch('division') || fallbackAddress.division;
  const previewDistrict = form.watch('district') || fallbackAddress.district;
  const previewDelivery = form.watch('deliveryMethod');
  const watchedNote = form.watch('note');

  // Keep the persisted cart note in step with the textarea so a reload keeps it.
  useEffect(() => {
    setNote(watchedNote ?? '');
  }, [watchedNote, setNote]);

  // Empty-cart guard: explain, then send the shopper back to the cart.
  useEffect(() => {
    if (!isEmpty || placed) return;
    toast({ tone: 'warning', title: 'কার্ট খালি', description: 'চেকআউট করার আগে কার্টে পণ্য যোগ করুন।' });
    navigate('/cart', { replace: true });
  }, [isEmpty, placed, navigate]);

  const blocking = useBlockingCartLines(issues, items);

  const previewTotals = useMemo(
    () =>
      computeCartTotals({
        items,
        coupon,
        address: { division: previewDivision, district: previewDistrict },
        deliveryMethodId: previewDelivery,
      }),
    [items, coupon, previewDivision, previewDistrict, previewDelivery],
  );

  const applyAddress = (next: ShippingAddress) => {
    setPickedAddressId(next.id);
    applyAddressToForm(form, next);
  };

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
        const order = await submitDemoOrder({
          values,
          customerId: account.id,
          addressId: pickedAddressId,
          items,
          coupon,
          appliedCoupon,
        });

        setPlaced(true);
        clearCart();
        toast({
          tone: 'success',
          title: 'ডেমো অর্ডার রেকর্ড হয়েছে',
          description: `${order.orderNumber} — কোনো প্রকৃত পেমেন্ট হয়নি।`,
        });
        navigate(`/order-confirmation/${order.id}`);
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

  const breadcrumbs = (
    <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'কার্ট', href: '/cart' }, { label: 'চেকআউট' }]} />
  );

  if (isEmpty) {
    return (
      <>
        <PageHeader title="চেকআউট" breadcrumbs={breadcrumbs} />
        <Alert tone="warning" title="কার্ট খালি">
          চেকআউট করার আগে অন্তত একটি পণ্য কার্টে যোগ করুন। আপনাকে কার্টে ফিরিয়ে নেওয়া হচ্ছে।
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="চেকআউট"
        description="এক পেজে ঠিকানা, ডেলিভারি ও পেমেন্ট বেছে নিন। কোনো প্রকৃত পেমেন্ট হবে না।"
        breadcrumbs={breadcrumbs}
      />

      <form onSubmit={onSubmit} noValidate className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="min-w-0 space-y-4">
          <StockIssuesAlert lines={blocking} />

          {formState.submitCount > 0 && Object.keys(errors).length > 0 ? (
            <Alert tone="error" title="কিছু তথ্য অসম্পূর্ণ">
              লাল চিহ্নিত ফিল্ডগুলো ঠিক করুন — তারপর আবার সাবমিট করুন।
            </Alert>
          ) : null}

          <CheckoutSection
            step={1}
            title="যোগাযোগের তথ্য"
            description="ডেমো অ্যাকাউন্টের নমুনা নাম ও নম্বর — ইচ্ছেমতো সম্পাদনা করুন।"
          >
            <ContactFields form={form} />
          </CheckoutSection>

          <CheckoutSection step={2} title="ডেলিভারি ঠিকানা" description="শেয়ার করা অ্যাড্রেস স্কিমা দিয়ে যাচাই করা হয়।">
            <SavedAddressPicker addresses={account.addresses} activeId={pickedAddressId} onPick={applyAddress} />
            <AddressForm form={form} />
            <Checkbox
              checked={form.watch('saveAddress') ?? true}
              onChange={(checked) => form.setValue('saveAddress', checked)}
              label="এই ঠিকানাটি সেভ করুন"
              description="ডেমোতে ঠিকানা শুধু এই ব্রাউজারের ঠিকানা বইতে থাকবে।"
            />
          </CheckoutSection>

          <CheckoutSection step={3} title="ডেলিভারি পদ্ধতি" description="ফি ও সম্ভাব্য তারিখ ঢাকার ভেতরে/বাইরের নিয়মে হিসাব করা।">
            <DeliveryMethodPicker
              value={previewDelivery}
              onChange={(method) => {
                setDeliveryMethod(method);
                form.setValue('deliveryMethod', method);
              }}
              address={{ division: previewDivision, district: previewDistrict }}
            />
          </CheckoutSection>

          <CheckoutSection step={4} title="পেমেন্ট পদ্ধতি" description="শুধু ডেমো ইন্টারফেস — কোনো নম্বর, পিন বা OTP চাওয়া হয় না।">
            <PaymentMethodPicker
              value={form.watch('paymentMethod')}
              onChange={(method) => {
                setPaymentMethod(method);
                form.setValue('paymentMethod', method);
              }}
            />
          </CheckoutSection>

          <CheckoutSection step={5} title="অর্ডার নোট (ঐচ্ছিক)">
            <Textarea
              label="ডেলিভারি নির্দেশনা বা নোট"
              rows={3}
              maxLength={300}
              placeholder="যেমন: দুপুরের পরে কল করুন"
              error={errors.note?.message}
              {...register('note')}
            />
          </CheckoutSection>
        </div>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-20">
          <OrderSummary totals={previewTotals} couponCode={appliedCoupon?.code ?? coupon?.code}>
            <OrderItemsPreview items={items} max={3} />
            <p className="font-num text-sm text-text-secondary">
              মোট {toBanglaDigits(totals.itemCount)} টি পণ্য (কার্টের হিসাবের সাথে মিলিয়ে)
            </p>

            <Checkbox
              checked={form.watch('acknowledgeDemo') === true}
              onChange={(checked) => form.setValue('acknowledgeDemo', checked as true, { shouldValidate: true })}
              label="আমি বুঝেছি এটি ডেমো চেকআউট — কোনো প্রকৃত পেমেন্ট বা ডেলিভারি হবে না"
              error={errors.acknowledgeDemo?.message}
            />

            <Button type="submit" size="lg" fullWidth loading={submitting} disabled={blocking.length > 0 || submitting}>
              ডেমো অর্ডার নিশ্চিত করুন
            </Button>

            {blocking.length > 0 ? (
              <p role="alert" className="text-xs font-medium text-error">
                স্টকে না থাকা পণ্য থাকায় সাবমিট বন্ধ আছে।
              </p>
            ) : null}

            <DemoNotice title="ডেমো অর্ডার — পেমেন্ট হয় না">{DEMO_PAYMENT_NOTICE}</DemoNotice>

            <ButtonLink to="/cart" variant="ghost" size="sm" fullWidth>
              কার্টে ফিরে যান
            </ButtonLink>
          </OrderSummary>
        </aside>
      </form>
    </>
  );
}
