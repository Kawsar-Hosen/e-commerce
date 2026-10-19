import { useEffect, useState } from 'react';
import { Ban, Save } from 'lucide-react';
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@shobdox/shared-types';
import { isCancellable, isTerminalStatus, nextStatuses, statusNote } from '@shobdox/shared-business-logic';
import { Button, Card, ConfirmDialog, RadioGroup, Textarea } from '@/components/ui';
import { useDataStore } from '@/store/data.store';
import { toast } from '@/store/ui.store';

/**
 * Status updater for the admin order detail screen.
 *
 * Only legal next steps are offered (`nextStatuses()` from the shared state
 * machine), and cancelling — the one destructive move — always goes through a
 * confirm dialog. Every change is written with `setOrderStatus()`, which also
 * appends a timeline event.
 */

export function OrderStatusForm({ order }: { order: Order }) {
  const [next, setNext] = useState<OrderStatus | ''>('');
  const [note, setNote] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);

  // A stale selection must not survive a status change made elsewhere.
  useEffect(() => {
    setNext('');
    setNote('');
  }, [order.id, order.status]);

  const forward = nextStatuses(order.status).filter((status) => status !== 'cancelled');
  const cancellable = isCancellable(order.status);

  const apply = () => {
    if (!next) return;
    useDataStore.getState().setOrderStatus(order.id, next, note.trim() || undefined);
    toast({
      tone: 'success',
      title: 'স্ট্যাটাস আপডেট হয়েছে',
      description: `${order.orderNumber} → ${ORDER_STATUS_LABELS[next].bn}`,
    });
    setNext('');
    setNote('');
  };

  const cancel = () => {
    useDataStore.getState().setOrderStatus(order.id, 'cancelled', note.trim() || undefined);
    toast({
      tone: 'warning',
      title: 'অর্ডার বাতিল হয়েছে',
      description: `${order.orderNumber} · গ্রাহককে নোটিফিকেশন পাঠানো হয়েছে (ডেমো)`,
    });
    setCancelOpen(false);
  };

  return (
    <Card as="section">
      <h2 className="text-lg font-semibold text-text-primary">স্ট্যাটাস আপডেট</h2>
      <p className="mt-0.5 text-sm text-text-secondary">
        শুধু পরবর্তী বৈধ ধাপগুলো দেখানো হচ্ছে — টাইমলাইনে নোটসহ যুক্ত হবে।
      </p>

      {isTerminalStatus(order.status) ? (
        <p className="mt-3 rounded-card bg-surface-muted px-3 py-2 text-sm text-text-secondary">
          অর্ডারটি শেষ ধাপে ({ORDER_STATUS_LABELS[order.status].bn}) পৌঁছেছে — আর কোনো পরিবর্তন সম্ভব নয়।
        </p>
      ) : (
        <>
          {forward.length > 0 ? (
            <RadioGroup
              className="mt-3"
              name="order-next-status"
              label="পরবর্তী ধাপ"
              value={next}
              onChange={(value) => setNext(value as OrderStatus)}
              options={forward.map((status) => ({
                value: status,
                label: ORDER_STATUS_LABELS[status].bn,
                description: statusNote(status),
              }))}
            />
          ) : (
            <p className="mt-3 text-sm text-text-secondary">কোনো স্বাভাবিক পরবর্তী ধাপ নেই — অর্ডারটি বাতিল করা যাবে।</p>
          )}

          <div className="mt-3">
            <Textarea
              label="নোট (ঐচ্ছিক)"
              rows={2}
              value={note}
              placeholder="যেমন: কুরিয়ারকে হস্তান্তর করা হয়েছে, ট্র্যাকিং ID …"
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              onClick={apply}
              disabled={!next}
              leftIcon={<Save aria-hidden className="size-4" />}
            >
              স্ট্যাটাস আপডেট করুন
            </Button>
            {cancellable ? (
              <Button variant="outline" onClick={() => setCancelOpen(true)} leftIcon={<Ban aria-hidden className="size-4" />}>
                অর্ডার বাতিল করুন
              </Button>
            ) : null}
          </div>
        </>
      )}

      <ConfirmDialog
        open={cancelOpen}
        title="অর্ডার বাতিল করবেন?"
        message={`${order.orderNumber} বাতিল হলে গ্রাহক স্টোরফ্রন্টে বাতিল অবস্থা দেখবেন। এই ডেমো অ্যাকশনটি পরবর্তীতে রিসেট করা যাবে।`}
        confirmLabel="হ্যাঁ, বাতিল করুন"
        onConfirm={cancel}
        onClose={() => setCancelOpen(false)}
      />
    </Card>
  );
}
