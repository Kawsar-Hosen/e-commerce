import { Link } from 'react-router';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { formatTaka } from '@shobdox/shared-utils';
import { Drawer, Button, ButtonLink, EmptyState, Progress, Thumb } from '@/components/ui';
import { Price, QuantityStepper } from '@/components/ui/Display';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/store/cart.store';
import { useUiStore } from '@/store/ui.store';
import { DEMO_PAYMENT_NOTICE } from '@/lib/constants';

/** Slide-over cart used from the header; the full page lives at /cart. */

export function CartDrawer() {
  const drawer = useUiStore((state) => state.drawer);
  const closeDrawer = useUiStore((state) => state.closeDrawer);
  const open = drawer === 'cart';

  const { items, totals, freeDeliveryPercent, freeDeliveryMessage, isEmpty, issues } = useCart();
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <Drawer
      open={open}
      onClose={closeDrawer}
      title={`কার্ট${items.length > 0 ? ` (${items.length})` : ''}`}
      footer={
        isEmpty ? null : (
          <div className="space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">সাবটোটাল</span>
                <span className="font-num font-semibold text-text-primary">{formatTaka(totals.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">ডেলিভারি চার্জ</span>
                <span className="font-num font-semibold text-text-primary">
                  {totals.deliveryFee === 0 ? 'ফ্রি' : formatTaka(totals.deliveryFee)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-divider pt-1.5">
                <span className="font-semibold text-text-primary">সর্বমোট</span>
                <span className="font-num text-lg font-bold text-primary-dark">{formatTaka(totals.total)}</span>
              </div>
            </div>

            <ButtonLink to="/checkout" onClick={closeDrawer} fullWidth size="lg">
              চেকআউট করুন
            </ButtonLink>
            <Button variant="ghost" fullWidth onClick={closeDrawer}>
              আরও কিনুন
            </Button>
          </div>
        )
      }
    >
      {isEmpty ? (
        <EmptyState
          title="কার্ট খালি"
          description="পছন্দের পণ্য কার্টে যোগ করে এখানে দেখতে পাবেন।"
          icon={<ShoppingBag aria-hidden className="size-6" />}
          action={
            <ButtonLink to="/shop" onClick={closeDrawer}>
              কেনাকাটা শুরু করুন
            </ButtonLink>
          }
        />
      ) : (
        <div className="space-y-4">
          {issues.length > 0 ? (
            <p className="rounded-card border border-warning/40 bg-warning-soft/60 px-3 py-2 text-xs text-amber-800">
              কিছু পণ্যের দাম বা স্টক বদলেছে — চেকআউটে সর্বশেষ তথ্য দেখানো হবে।
            </p>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>{freeDeliveryMessage}</span>
              <span className="font-num">{Math.round(freeDeliveryPercent)}%</span>
            </div>
            <Progress value={freeDeliveryPercent} size="sm" label="ফ্রি ডেলিভারির অগ্রগতি" />
          </div>

          <ul className="divide-y divide-divider">
            {items.map((line) => (
              <li key={line.id} className="flex gap-3 py-3">
                <Link to={`/product/${line.slug}`} onClick={closeDrawer}>
                  <Thumb src={line.image} alt={line.titleBn ?? line.title} label={line.title} className="size-16" />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/product/${line.slug}`}
                    onClick={closeDrawer}
                    className="line-clamp-2 text-sm font-medium text-text-primary hover:text-primary"
                  >
                    {line.titleBn ?? line.title}
                  </Link>

                  {Object.keys(line.selectedOptions).length > 0 ? (
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {Object.values(line.selectedOptions).join(' · ')}
                    </p>
                  ) : null}

                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <Price value={line.unitPrice * line.quantity} size="sm" />

                    <div className="flex items-center gap-1">
                      <QuantityStepper
                        value={line.quantity}
                        min={1}
                        max={Math.max(1, line.availableStock)}
                        size="sm"
                        onDecrease={() => decrementItem(line.id)}
                        onIncrease={() => incrementItem(line.id)}
                        label={`${line.title} পরিমাণ`}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(line.id)}
                        aria-label={`${line.title} কার্ট থেকে সরান`}
                        className="flex size-7 items-center justify-center rounded-button text-text-secondary hover:bg-error-soft hover:text-error"
                      >
                        <Trash2 aria-hidden className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <p className="rounded-card bg-surface-muted px-3 py-2 text-xs text-text-secondary">{DEMO_PAYMENT_NOTICE}</p>
        </div>
      )}
    </Drawer>
  );
}
