import type { OrderTotals } from '@shobdox/shared-types';
import { VAT_RATE } from '@shobdox/shared-business-logic';
import { KeyValue } from '@/components/ui';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';

/**
 * Money breakdown shared by the order detail page.
 *
 * Prices are VAT-inclusive, so the VAT row is informational and never added on
 * top of the total — the note below the rows says exactly that.
 */
export function OrderTotalsBreakdown({
  totals,
  couponCode,
}: {
  totals: OrderTotals;
  couponCode?: string;
}) {
  const vatPercent = toBanglaDigits(Math.round(VAT_RATE * 100));

  return (
    <div>
      <dl className="divide-y divide-divider">
        <KeyValue label="উপমোট">{formatTaka(totals.subtotal)}</KeyValue>

        {totals.productDiscount > 0 ? (
          <KeyValue label="পণ্য ছাড়">
            <span className="text-success">−{formatTaka(totals.productDiscount)}</span>
          </KeyValue>
        ) : null}

        {totals.couponDiscount > 0 ? (
          <KeyValue label={couponCode ? `কুপন (${couponCode})` : 'কুপন ছাড়'}>
            <span className="text-success">−{formatTaka(totals.couponDiscount)}</span>
          </KeyValue>
        ) : null}

        <KeyValue label="ডেলিভারি চার্জ">
          {totals.deliveryFee > 0 ? (
            formatTaka(totals.deliveryFee)
          ) : (
            <span className="text-success">ফ্রি</span>
          )}
        </KeyValue>

        <div className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="text-base font-semibold text-text-primary">সর্বমোট</dt>
          <dd className="font-num text-2xl font-bold text-text-primary">{formatTaka(totals.total)}</dd>
        </div>
      </dl>

      <p className="mt-2 text-xs leading-relaxed text-text-muted">
        দামে {vatPercent}% ভ্যাট ({formatTaka(totals.vat)}) অন্তর্ভুক্ত — মোটের সঙ্গে আলাদা করে যোগ করা হয়নি।
      </p>

      {totals.savings > 0 ? (
        <p className="mt-1 text-xs font-medium text-success">
          এই অর্ডারে আপনি মোট {formatTaka(totals.savings)} সাশ্রয় করেছেন।
        </p>
      ) : null}
    </div>
  );
}
