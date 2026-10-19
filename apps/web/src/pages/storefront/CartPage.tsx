import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, RefreshCw, ShoppingBag } from 'lucide-react';
import {
  Alert,
  Breadcrumbs,
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  DemoNotice,
  EmptyState,
  PageHeader,
  Progress,
} from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useCatalog';
import { useCartStore } from '@/store/cart.store';
import { toast } from '@/store/ui.store';
import { cartUpsell } from '@shobdox/shared-business-logic';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { DEMO_PAYMENT_NOTICE } from '@/lib/constants';
import { CartLineRow } from '@/features/checkout/CartLineRow';
import { CouponField } from '@/features/checkout/CouponField';
import { DeliveryMethodPicker } from '@/features/checkout/DeliveryMethodPicker';
import { OrderSummary } from '@/features/checkout/OrderSummary';
import { ProductRail } from '@/features/checkout/ProductRail';

/** Full cart: lines, coupon, delivery choice, health warnings and totals. */
export default function CartPage() {
  const navigate = useNavigate();
  const products = useProducts();

  const {
    items,
    totals,
    coupon,
    appliedCoupon,
    deliveryMethodId,
    address,
    issues,
    reprice,
    hasStalePrices,
    freeDeliveryPercent,
    freeDeliveryMessage,
    isFreeDelivery,
    isEmpty,
  } = useCart();

  const clearCart = useCartStore((state) => state.clear);
  const setDeliveryMethod = useCartStore((state) => state.setDeliveryMethod);
  const replaceItems = useCartStore((state) => state.replaceItems);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const upsell = cartUpsell(products, items, 4);
  const blocking = issues.filter((issue) => issue.severity === 'error');
  const issueFor = (lineId: string) => issues.find((issue) => issue.lineId === lineId);

  const onReprice = () => {
    const removed = items.length - reprice.length;
    replaceItems(reprice);
    toast({
      tone: 'info',
      title: 'কার্ট হালনাগাদ হয়েছে',
      description:
        removed > 0
          ? `স্টকে না থাকা ${toBanglaDigits(removed)} টি পণ্য সরানো হয়েছে এবং দাম হালনাগাদ করা হয়েছে।`
          : 'সর্বশেষ দাম ও স্টক কার্টে বসানো হয়েছে।',
    });
  };

  const breadcrumbs = <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'কার্ট' }]} />;

  if (isEmpty) {
    return (
      <>
        <PageHeader title="আপনার কার্ট" breadcrumbs={breadcrumbs} />
        <EmptyState
          title="কার্ট এখন খালি"
          description="পছন্দের পণ্য কার্টে যোগ করে এখানে দেখতে পাবেন।"
          icon={<ShoppingBag aria-hidden className="size-6" />}
          action={
            <ButtonLink to="/shop" size="lg">
              কেনাকাটা শুরু করুন
            </ButtonLink>
          }
        />
        <ProductRail title="আপনার জন্য জনপ্রিয়" products={upsell} href="/shop" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="আপনার কার্ট"
        description={`${toBanglaDigits(totals.itemCount)} টি পণ্য — দাম ও স্টক সর্বশেষ ক্যাটালগ থেকে যাচাই করা হয়।`}
        breadcrumbs={breadcrumbs}
        actions={
          <ButtonLink to="/shop" variant="outline" size="sm">
            আরও কিনুন
          </ButtonLink>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="min-w-0 space-y-4">
          {issues.length > 0 ? (
            <Alert
              tone="warning"
              title={hasStalePrices ? 'দাম বা স্টক পরিবর্তন হয়েছে' : 'স্টক পরিবর্তন হয়েছে'}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<RefreshCw aria-hidden className="size-4" />}
                  onClick={onReprice}
                >
                  দাম হালনাগাদ করুন
                </Button>
              }
            >
              <ul className="list-disc space-y-0.5 pl-4">
                {issues.slice(0, 5).map((issue) => (
                  <li key={`${issue.lineId}-${issue.message}`}>{issue.message}</li>
                ))}
              </ul>
            </Alert>
          ) : null}

          <Card>
            <ul className="divide-y divide-divider">
              {items.map((line) => (
                <CartLineRow key={line.id} line={line} issue={issueFor(line.id)} />
              ))}
            </ul>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-divider pt-3">
              <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
                সব খালি করুন
              </Button>
              <p className="text-xs text-text-secondary">স্টকে থাকা পরিমাণের বেশি যোগ করা যাবে না।</p>
            </div>
          </Card>

          <CouponField />
          <DeliveryMethodPicker value={deliveryMethodId} onChange={setDeliveryMethod} address={address} />
        </div>

        <div className="min-w-0 space-y-4 xl:sticky xl:top-20">
          <Card>
            <div className="flex items-center justify-between gap-2 text-xs text-text-secondary">
              <span className="break-words">{freeDeliveryMessage}</span>
              <span className="font-num shrink-0">{toBanglaDigits(freeDeliveryPercent)}%</span>
            </div>
            <Progress
              value={freeDeliveryPercent}
              label="ফ্রি ডেলিভারির অগ্রগতি"
              tone={isFreeDelivery ? 'success' : 'primary'}
              className="mt-2"
            />
          </Card>

          <div aria-live="polite">
            <OrderSummary totals={totals} couponCode={appliedCoupon?.code ?? coupon?.code}>
              <Button
                size="lg"
                fullWidth
                disabled={blocking.length > 0}
                onClick={() => navigate('/checkout')}
                rightIcon={<ArrowRight aria-hidden className="size-4" />}
              >
                চেকআউট করুন
              </Button>

              {blocking.length > 0 ? (
                <p role="alert" className="text-xs font-medium text-error">
                  স্টকে না থাকা পণ্য আছে — আগে সরান বা “দাম হালনাগাদ করুন”, তারপর চেকআউট করা যাবে।
                </p>
              ) : null}

              <DemoNotice title="ডেমো চেকআউট">{DEMO_PAYMENT_NOTICE}</DemoNotice>
            </OrderSummary>
          </div>
        </div>
      </div>

      <ProductRail
        title="একসাথে কিনলে ভালো লাগতে পারে"
        subtitle="আপনার কার্টের বাজেট অনুযায়ী প্রস্তাব"
        products={upsell}
        href="/shop"
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="কার্ট খালি করবেন?"
        message="কার্টের সব পণ্য, প্রয়োগ করা কুপন ও নোট মুছে যাবে। এটি ফেরানো যাবে না।"
        confirmLabel="হ্যাঁ, খালি করুন"
        onConfirm={() => {
          clearCart();
          setConfirmOpen(false);
          toast({ tone: 'info', title: 'কার্ট খালি করা হয়েছে' });
        }}
      />
    </>
  );
}
