import type { Order, OrderLineItem } from '@shobdox/shared-types';
import { VAT_RATE } from '@shobdox/shared-business-logic';
import { Thumb } from '@/components/ui';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';

/**
 * Order line items.
 *
 * A real `<table>` on `lg`+ and a card list on phones, matching the admin list
 * pages so an order never forces horizontal scrolling.
 */

export function OrderItemsTable({ items }: { items: OrderLineItem[] }) {
  const units = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div>
      <div className="hidden lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            অর্ডারের পণ্য তালিকা, মোট {toBanglaDigits(units)} টি ইউনিট
          </caption>
          <thead>
            <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-text-secondary">
              <th scope="col" className="px-3 py-2">
                পণ্য
              </th>
              <th scope="col" className="px-3 py-2">
                অপশন
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                একক দাম
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                পরিমাণ
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                মোট
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {items.map((item) => (
              <tr key={item.id} className="align-middle">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <Thumb src={item.image} alt={item.titleBn ?? item.title} className="size-11" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-text-primary">{item.titleBn ?? item.title}</p>
                      <p className="text-xs text-text-secondary">
                        সেলার: {item.sellerId} · {item.fulfilledBy === 'shobdox' ? 'শব্দক্স' : 'সেলার'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-text-secondary">
                  {Object.values(item.selectedOptions).join(' / ') || 'ডিফল্ট'}
                </td>
                <td className="px-3 py-2.5 text-right font-num">{formatTaka(item.unitPrice)}</td>
                <td className="px-3 py-2.5 text-right font-num">{toBanglaDigits(item.quantity)}</td>
                <td className="px-3 py-2.5 text-right font-num font-semibold">{formatTaka(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {items.map((item) => (
          <li key={item.id} className="rounded-card border border-border bg-surface p-3">
            <div className="flex items-start gap-3">
              <Thumb src={item.image} alt={item.titleBn ?? item.title} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{item.titleBn ?? item.title}</p>
                <p className="text-xs text-text-secondary">{Object.values(item.selectedOptions).join(' / ') || 'ডিফল্ট'}</p>
                <p className="mt-1 font-num text-sm font-semibold text-text-primary">
                  {formatTaka(item.unitPrice)} × {toBanglaDigits(item.quantity)} = {formatTaka(item.lineTotal)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Subtotal / discount / delivery / VAT / total, shared by detail + print views. */
export function OrderTotalsList({ order, className }: { order: Order; className?: string }) {
  const { totals } = order;

  return (
    <dl className={className}>
      <div className="flex items-center justify-between gap-4 py-1.5">
        <dt className="text-sm text-text-secondary">সাবটোটাল</dt>
        <dd className="font-num text-sm text-text-primary">{formatTaka(totals.subtotal)}</dd>
      </div>
      {totals.productDiscount > 0 ? (
        <div className="flex items-center justify-between gap-4 py-1.5">
          <dt className="text-sm text-text-secondary">পণ্য ছাড়</dt>
          <dd className="font-num text-sm text-success">− {formatTaka(totals.productDiscount)}</dd>
        </div>
      ) : null}
      {totals.couponDiscount > 0 ? (
        <div className="flex items-center justify-between gap-4 py-1.5">
          <dt className="text-sm text-text-secondary">কুপন {order.couponCode ? `(${order.couponCode})` : ''}</dt>
          <dd className="font-num text-sm text-success">− {formatTaka(totals.couponDiscount)}</dd>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-4 py-1.5">
        <dt className="text-sm text-text-secondary">ডেলিভারি ফি</dt>
        <dd className="font-num text-sm text-text-primary">{formatTaka(totals.deliveryFee)}</dd>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-divider py-1.5">
        <dt className="text-sm text-text-secondary">
          ভ্যাট ({toBanglaDigits(Math.round(VAT_RATE * 100))}%) — দামের মধ্যে অন্তর্ভুক্ত
        </dt>
        <dd className="font-num text-sm text-text-primary">{formatTaka(totals.vat)}</dd>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
        <dt className="text-base font-semibold text-text-primary">সর্বমোট</dt>
        <dd className="font-num text-lg font-bold text-text-primary">{formatTaka(totals.total)}</dd>
      </div>
    </dl>
  );
}
