import { ORDER_STATUS_LABELS, type Order } from '@shobdox/shared-types';
import { formatDate, formatDateTime, formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { OrderTotalsList } from './OrderItemsTable';

/**
 * Printable receipt.
 *
 * Rendered inside a `hidden print:block` wrapper by the order screens, so
 * `window.print()` produces a clean sheet while the dashboard chrome stays out
 * of the way (the layout marks its own navigation `no-print`).
 */
export function OrderReceipt({ order }: { order: Order }) {
  return (
    <div className="mx-auto max-w-3xl bg-surface p-4 text-text-primary">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <p className="font-num text-2xl font-extrabold">SHOBDOX</p>
          <p className="text-sm text-text-secondary">বাংলার ডিজিটাল বাজার · ডেমো রিসিট</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-num font-semibold">{order.orderNumber}</p>
          <p className="text-text-secondary">{formatDateTime(order.placedAt)}</p>
          <p className="text-text-secondary">{ORDER_STATUS_LABELS[order.status].bn}</p>
        </div>
      </header>

      <section className="grid gap-4 py-4 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">গ্রাহক</h2>
          <p className="text-sm text-text-secondary">{order.customerName}</p>
          <p className="font-num text-sm text-text-secondary">{order.customerPhone}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">ডেলিভারি ঠিকানা</h2>
          <p className="text-sm text-text-secondary">
            {order.shippingAddress.addressLine}, {order.shippingAddress.area}, {order.shippingAddress.district},{' '}
            {order.shippingAddress.division}
          </p>
          <p className="text-sm text-text-secondary">
            সম্ভাব্য ডেলিভারি: {formatDate(order.estimatedDelivery)}
          </p>
        </div>
      </section>

      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">অর্ডারকৃত পণ্য</caption>
        <thead>
          <tr className="border-y border-border text-xs uppercase tracking-wide text-text-secondary">
            <th scope="col" className="py-2">
              পণ্য
            </th>
            <th scope="col" className="py-2 text-right">
              দাম
            </th>
            <th scope="col" className="py-2 text-right">
              পরিমাণ
            </th>
            <th scope="col" className="py-2 text-right">
              মোট
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-divider">
          {order.items.map((item) => (
            <tr key={item.id}>
              <td className="py-2">
                {item.titleBn ?? item.title}
                <span className="block text-xs text-text-muted">
                  {Object.values(item.selectedOptions).join(' / ') || 'ডিফল্ট'}
                </span>
              </td>
              <td className="py-2 text-right font-num">{formatTaka(item.unitPrice)}</td>
              <td className="py-2 text-right font-num">{toBanglaDigits(item.quantity)}</td>
              <td className="py-2 text-right font-num">{formatTaka(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <OrderTotalsList order={order} className="mt-4 border-t border-border pt-2" />

      <footer className="mt-4 border-t border-border pt-3 text-xs text-text-secondary">
        এটি একটি ডেমো অর্ডার — কোনো প্রকৃত পেমেন্ট, চালান বা ডেলিভারি হয়নি। পেমেন্ট পদ্ধতি:{' '}
        {order.paymentMethod.toUpperCase()} · অর্ডার আইডি: <span className="font-num">{order.id}</span>।
      </footer>
    </div>
  );
}
