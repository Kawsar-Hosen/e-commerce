import type { ReactNode } from 'react';
import { Card, KeyValue } from '@/components/ui';
import { VAT_RATE } from '@shobdox/shared-business-logic';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';

/** The totals shape needed by the breakdown; `OrderTotals` satisfies it too. */
export interface OrderTotalsLike {
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  deliveryFee: number;
  vat: number;
  total: number;
  savings?: number;
}

export function TotalsBreakdown({
  totals,
  couponCode,
  className,
}: {
  totals: OrderTotalsLike;
  couponCode?: string;
  className?: string;
}) {
  const vatPercent = toBanglaDigits(Math.round(VAT_RATE * 100));

  return (
    <dl className={className}>
      <KeyValue label="সাবটোটাল">{formatTaka(totals.subtotal)}</KeyValue>

      {totals.productDiscount > 0 ? (
        <KeyValue label="পণ্য ছাড়">− {formatTaka(totals.productDiscount)}</KeyValue>
      ) : null}

      {totals.couponDiscount > 0 ? (
        <KeyValue label={couponCode ? `কুপন ছাড় (${couponCode})` : 'কুপন ছাড়'}>
          − {formatTaka(totals.couponDiscount)}
        </KeyValue>
      ) : null}

      <KeyValue label="ডেলিভারি চার্জ">
        {totals.deliveryFee === 0 ? <span className="text-success">ফ্রি</span> : formatTaka(totals.deliveryFee)}
      </KeyValue>

      <KeyValue label={`ভ্যাট ${vatPercent}% (দামের অন্তর্ভুক্ত)`}>{formatTaka(totals.vat)}</KeyValue>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-divider pt-2">
        <span className="text-base font-semibold text-text-primary">সর্বমোট</span>
        <span className="font-num text-xl font-bold text-primary-dark">{formatTaka(totals.total)}</span>
      </div>

      {(totals.savings ?? 0) > 0 ? (
        <p className="mt-1 text-right text-xs font-medium text-success">সাশ্রয় {formatTaka(totals.savings ?? 0)}</p>
      ) : null}
    </dl>
  );
}

/** Summary card used by the cart, the checkout sidebar and the confirmation. */
export function OrderSummary({
  totals,
  couponCode,
  title = 'অর্ডার সারসংক্ষেপ',
  children,
  className,
}: {
  totals: OrderTotalsLike;
  couponCode?: string;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <TotalsBreakdown totals={totals} couponCode={couponCode} className="mt-2" />
      {children ? <div className="mt-4 space-y-3">{children}</div> : null}
    </Card>
  );
}
