import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Check, Copy, PackageSearch, Printer, RotateCcw, Truck, XCircle } from 'lucide-react';
import { addLineToCart, buildTimeline, createCartLine } from '@shobdox/shared-business-logic';
import { formatDateTime, toBanglaDigits } from '@shobdox/shared-utils';
import {
  Alert,
  Breadcrumbs,
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  EmptyState,
  IconButton,
} from '@/components/ui';
import { OrderDeliveryCard, OrderPaymentCard } from '@/features/account/OrderFulfilment';
import { OrderItemsList } from '@/features/account/OrderItemsList';
import { OrderStatusBadge } from '@/features/account/OrderStatusBadge';
import { OrderTimeline } from '@/features/account/OrderTimeline';
import { OrderTotalsBreakdown } from '@/features/account/OrderTotalsBreakdown';
import { useOrder, useProducts } from '@/hooks/useCatalog';
import { useCopyToClipboard } from '@/hooks/useCommon';
import { cancelOrder, canCustomerCancel } from '@/services/order.service';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { toast } from '@/store/ui.store';

/** Customer-facing order detail: items, tracking, money, fulfilment and actions. */
export default function AccountOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const user = useAuthStore((state) => state.session?.user);
  const order = useOrder(orderId);
  const products = useProducts();
  const cartItems = useCartStore((state) => state.items);
  const replaceItems = useCartStore((state) => state.replaceItems);
  const { copied, copy } = useCopyToClipboard();
  const [cancelOpen, setCancelOpen] = useState(false);

  // Real orders carry their own event log; fixtures without one fall back to the
  // deterministic timeline builder so the tracker is never empty.
  const timeline = useMemo(
    () =>
      order && order.timeline.length > 0
        ? order.timeline
        : order
          ? buildTimeline(order.status, order.placedAt, {
              actor: 'SHOBDOX ডেমো সিস্টেম',
              location: `${order.shippingAddress.district}, ${order.shippingAddress.division}`,
            })
          : [],
    [order],
  );

  if (!user) return null;

  if (!order || order.customerId !== user.id) {
    return (
      <EmptyState
        icon={<PackageSearch aria-hidden className="size-6" />}
        title="অর্ডারটি খুঁজে পাওয়া যায়নি"
        description="লিংকটি হয়তো ভুল, অথবা অর্ডারটি অন্য একটি ডেমো অ্যাকাউন্টের। নিজের অর্ডার তালিকা থেকে আবার চেষ্টা করুন।"
        action={<ButtonLink to="/account/orders">আমার অর্ডারে ফিরুন</ButtonLink>}
      />
    );
  }

  const cancellable = canCustomerCancel(order);

  const onCancel = () => {
    cancelOrder(order.id, 'গ্রাহক (ডেমো)');
    setCancelOpen(false);
    toast({
      tone: 'success',
      title: 'অর্ডার বাতিল হয়েছে',
      description: `${order.orderNumber} এখন ‘বাতিল’ অবস্থায়।`,
    });
  };

  /** Re-adds every line that is still sold, skipping the rest with a report. */
  const onBuyAgain = () => {
    let next = cartItems;
    const added: string[] = [];
    const skipped: string[] = [];

    for (const line of order.items) {
      const product = products.find((candidate) => candidate.id === line.productId);
      const variant = product?.variants.find((candidate) => candidate.id === line.variantId);

      if (!product || product.status !== 'active' || !variant || variant.stock <= 0) {
        skipped.push(line.titleBn ?? line.title);
        continue;
      }

      next = addLineToCart(next, createCartLine(product, variant, Math.min(line.quantity, variant.stock)));
      added.push(line.titleBn ?? line.title);
    }

    if (added.length === 0) {
      toast({
        tone: 'warning',
        title: 'এখন কোনো পণ্য কার্টে যোগ করা যায়নি',
        description: 'এই অর্ডারের সব পণ্যই এখন স্টকে নেই বা আর বিক্রি হচ্ছে না।',
      });
      return;
    }

    replaceItems(next);
    toast({
      tone: 'success',
      title: `${toBanglaDigits(added.length)}টি পণ্য কার্টে যোগ হয়েছে`,
      description:
        skipped.length > 0
          ? `${toBanglaDigits(skipped.length)}টি পণ্য স্টকে না থাকায় বাদ পড়েছে।`
          : 'কার্ট থেকে সরাসরি চেকআউটে যেতে পারেন।',
      actionLabel: 'কার্ট দেখুন',
      actionHref: '/cart',
    });
  };

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'অ্যাকাউন্ট', href: '/account' },
          { label: 'আমার অর্ডার', href: '/account/orders' },
          { label: order.orderNumber },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-num text-3xl font-bold text-text-primary">{order.orderNumber}</h1>
            <IconButton
              label={copied ? 'কপি হয়েছে' : 'অর্ডার নম্বর কপি করুন'}
              variant="ghost"
              onClick={() => copy(order.orderNumber)}
            >
              {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
            </IconButton>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            অর্ডার করা হয়েছে {formatDateTime(order.placedAt)}
          </p>
        </div>

        <div className="no-print flex flex-wrap gap-2">
          <ButtonLink
            to={`/track?order=${order.orderNumber}`}
            variant="outline"
            size="sm"
            leftIcon={<Truck aria-hidden className="size-4" />}
          >
            ট্র্যাক করুন
          </ButtonLink>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer aria-hidden className="size-4" />}
            onClick={() => window.print()}
          >
            রিসিপ্ট প্রিন্ট
          </Button>
          {cancellable ? (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<XCircle aria-hidden className="size-4" />}
              onClick={() => setCancelOpen(true)}
            >
              অর্ডার বাতিল
            </Button>
          ) : null}
        </div>
      </div>

      {order.isDemo ? (
        <Alert tone="warning" title="এটি একটি ডেমো অর্ডার">
          অর্ডারটি শুধু এই ব্রাউজারে তৈরি — কোনো সার্ভার, পেমেন্ট বা কুরিয়ার জড়িত নেই, তাই ডেলিভারিও হবে না।
        </Alert>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <Card as="section">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-text-primary">
                পণ্য ({toBanglaDigits(order.items.length)} ধরনের)
              </h2>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<RotateCcw aria-hidden className="size-4" />}
                onClick={onBuyAgain}
              >
                আবার কিনুন
              </Button>
            </div>
            <OrderItemsList items={order.items} />
          </Card>

          <Card as="section">
            <h2 className="mb-3 text-xl font-bold text-text-primary">অর্ডার ট্র্যাকিং</h2>
            <OrderTimeline events={timeline} />
          </Card>

          {order.note ? (
            <Card as="section">
              <h2 className="text-xl font-bold text-text-primary">আপনার নোট</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{order.note}</p>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card as="section">
            <h2 className="mb-2 text-xl font-bold text-text-primary">মূল্য বিবরণ</h2>
            <OrderTotalsBreakdown totals={order.totals} couponCode={order.couponCode} />
          </Card>

          <OrderDeliveryCard order={order} />
          <OrderPaymentCard order={order} />

          <p className="text-xs leading-relaxed text-text-muted no-print">
            প্রিন্ট করলে রিসিপ্টের একটি সাধারণ কপি তৈরি হয় — এটি কোনো প্রকৃত ভ্যাট/অ্যাকাউন্টিং ডকুমেন্ট নয়।{' '}
            <Link to="/account/orders" className="font-medium text-primary hover:underline">
              সব অর্ডার দেখুন
            </Link>
            ।
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        title="অর্ডার বাতিল করবেন?"
        message={`${order.orderNumber} বাতিল হলে অর্ডারটি ‘বাতিল’ অবস্থায় যাবে এবং ট্র্যাকিং বন্ধ হয়ে যাবে (ডেমো স্ট্যাটাস পরিবর্তন)।`}
        confirmLabel="হ্যাঁ, বাতিল করুন"
        onConfirm={onCancel}
        onClose={() => setCancelOpen(false)}
      >
        <p className="mt-2 text-xs text-text-secondary">
          ডেমোতে কোনো প্রকৃত অর্ডার, পেমেন্ট বা রিফান্ড নেই — শুধু অবস্থা বদলায়।
        </p>
      </ConfirmDialog>
    </div>
  );
}
