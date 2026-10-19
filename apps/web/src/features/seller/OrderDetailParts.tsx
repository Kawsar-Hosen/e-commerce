import { useState, type FormEvent } from 'react';
import { Printer, Truck } from 'lucide-react';
import type { Order, OrderLineItem, OrderStatus, OrderStatusEvent, Seller } from '@shobdox/shared-types';
import { ORDER_STATUS_LABELS } from '@shobdox/shared-types';
import { nextStatuses } from '@shobdox/shared-business-logic';
import { Alert, Button, Card, Input, SectionHeader, Select, Textarea } from '@/components/ui';
import { updateOrderStatus } from '@/services/order.service';
import { toast } from '@/store/ui.store';
import { formatDateTime, toBanglaDigits } from '@/lib/format';

/**
 * Pieces of the seller order detail screen.
 *
 * The status form writes courier/tracking into the status note because the
 * demo `Order` type has no dedicated fulfilment fields.
 */

const COURIERS = ['পাঠাও', 'স্টেডফাস্ট', 'রেডএক্স', 'সুন্দরবন', 'নিজস্ব ডেলিভারি'];

export function StatusUpdateCard({ order, seller }: { order: Order; seller: Seller }) {
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [courier, setCourier] = useState('');
  const [tracking, setTracking] = useState('');

  const allowed = nextStatuses(order.status);
  const actor = `${seller.ownerName} (সেলার ড্যাশবোর্ড)`;

  const submitStatus = (event: FormEvent) => {
    event.preventDefault();
    if (!nextStatus) {
      toast({ tone: 'error', title: 'পরবর্তী স্ট্যাটাস বেছে নিন' });
      return;
    }
    const target = nextStatus as OrderStatus;
    if (!allowed.includes(target)) {
      toast({ tone: 'error', title: 'এই স্ট্যাটাসে যাওয়া যাবে না' });
      return;
    }

    const composed = [
      courier ? `কুরিয়ার: ${courier}` : undefined,
      tracking.trim() ? `ট্র্যাকিং নম্বর: ${tracking.trim()}` : undefined,
      note.trim() || undefined,
    ]
      .filter(Boolean)
      .join(' · ');

    updateOrderStatus(order.id, target, composed || undefined, actor);
    toast({
      tone: 'success',
      title: 'অর্ডার আপডেট হয়েছে',
      description: `${order.orderNumber} → ${ORDER_STATUS_LABELS[target].bn}`,
    });
    setNextStatus('');
    setNote('');
    setCourier('');
    setTracking('');
  };

  return (
    <Card>
      <SectionHeader title="স্ট্যাটাস আপডেট" subtitle="শুধু অনুমোদিত পরবর্তী ধাপগুলো দেখানো হয়েছে।" />
      {allowed.length === 0 ? (
        <Alert tone="info" title="এই অর্ডারে আর পরিবর্তন সম্ভব নয়">
          অর্ডারটি ইতিমধ্যে একটি চূড়ান্ত অবস্থায় (ডেলিভার / বাতিল / ফেরত) পৌঁছেছে।
        </Alert>
      ) : (
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={submitStatus}>
          <Select
            label="পরবর্তী স্ট্যাটাস"
            required
            placeholder="স্ট্যাটাস বেছে নিন"
            options={allowed.map((status) => ({ value: status, label: ORDER_STATUS_LABELS[status].bn }))}
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value)}
          />
          <Select
            label="কুরিয়ার (ঐচ্ছিক)"
            placeholder="কুরিয়ার বেছে নিন"
            options={COURIERS.map((name) => ({ value: name, label: name }))}
            value={courier}
            onChange={(event) => setCourier(event.target.value)}
          />
          <Input
            label="ট্র্যাকিং নম্বর (ঐচ্ছিক)"
            placeholder="যেমন: PT-0001234"
            value={tracking}
            onChange={(event) => setTracking(event.target.value)}
          />
          <Textarea
            label="নোট (ঐচ্ছিক)"
            rows={2}
            value={note}
            placeholder="যেমন: দুপুরের আগে ডেলিভারি দিলে ভালো হয়।"
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="lg:col-span-2">
            <Button type="submit" leftIcon={<Truck aria-hidden className="size-4" />}>
              স্ট্যাটাস সংরক্ষণ করুন
            </Button>
            <p className="mt-2 text-xs text-text-secondary">
              ডেমো অর্ডার টাইপে আলাদা ট্র্যাকিং ফিল্ড নেই — তাই কুরিয়ার ও ট্র্যাকিং নম্বর স্ট্যাটাসের নোট হিসেবে
              সংরক্ষিত হবে এবং কাস্টমার টাইমলাইনে দেখা যাবে।
            </p>
          </div>
        </form>
      )}
    </Card>
  );
}

export function OrderTimeline({ events }: { events: OrderStatusEvent[] }) {
  return (
    <Card>
      <SectionHeader title="স্ট্যাটাস টাইমলাইন" subtitle="সব সময় বাংলাদেশ সময় (স্থানীয়) অনুযায়ী।" />
      <ol className="relative space-y-4 border-l border-border pl-5">
        {events.map((event) => (
          <li key={event.id} className="relative">
            <span aria-hidden className="absolute -left-[27px] top-1.5 size-3 rounded-full border-2 border-surface bg-primary" />
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-text-primary">{ORDER_STATUS_LABELS[event.status].bn}</p>
              <span className="text-xs text-text-secondary">{formatDateTime(event.at)}</span>
            </div>
            <p className="mt-0.5 text-sm text-text-secondary">{event.note}</p>
            {event.actor ? <p className="mt-0.5 text-xs text-text-muted">দ্বারা: {event.actor}</p> : null}
            {event.location ? <p className="text-xs text-text-muted">{event.location}</p> : null}
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function PackingSlip({
  order,
  seller,
  items,
}: {
  order: Order;
  seller: Seller;
  items: OrderLineItem[];
}) {
  return (
    <Card className="print:border-0 print:shadow-none">
      <SectionHeader title="প্যাকিং স্লিপ" subtitle="প্রিন্ট করে প্যাকেজের সাথে দিন।" />
      <div className="space-y-2 rounded-card border border-dashed border-border-strong p-3 text-sm">
        <p className="font-num font-bold text-text-primary">{order.orderNumber}</p>
        <p className="text-text-secondary">
          {order.customerName} · <span className="font-num">{order.customerPhone}</span>
        </p>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="min-w-0 truncate">
                {item.title} × {toBanglaDigits(item.quantity)}
              </span>
              <span className="font-num">{item.variantId}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-text-secondary">
          {seller.profile.storeNameBn ?? seller.profile.storeName} · পিকআপ: {seller.profile.pickupAddress}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 print:hidden"
        leftIcon={<Printer aria-hidden className="size-4" />}
        onClick={() => window.print()}
      >
        স্লিপ প্রিন্ট করুন
      </Button>
    </Card>
  );
}
