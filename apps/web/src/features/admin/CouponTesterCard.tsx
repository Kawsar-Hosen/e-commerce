import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import type { Coupon } from '@shobdox/shared-types';
import { findCouponByCode, validateCoupon } from '@shobdox/shared-business-logic';
import { Alert, Button, Card, Input, SectionHeader } from '@/components/ui';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';

/**
 * "Test a coupon" panel.
 *
 * Builds a one-line synthetic cart for the entered amount and runs the same
 * `validateCoupon()` the checkout uses, so the admin sees the exact Bangla
 * message (and discount) a shopper would get — including expiry, usage limits
 * and minimum-order rules.
 */

interface TestResult {
  valid: boolean;
  message: string;
  discountAmount: number;
  code: string;
}

export function CouponTesterCard({ coupons }: { coupons: Coupon[] }) {
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState(3000);
  const [result, setResult] = useState<TestResult | null>(null);

  const test = () => {
    const coupon = findCouponByCode(coupons, code);
    const subtotal = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;

    // Category-restricted coupons are tested against their own first category
    // so the synthetic cart is eligible — the point is to exercise the rules.
    const productId = coupon?.productIds[0] ?? 'tester-product';
    const categoryId = coupon?.categoryIds[0];

    const outcome = validateCoupon(coupon, {
      subtotal,
      items: [
        {
          id: 'tester-product:default',
          productId,
          variantId: 'default',
          slug: 'tester-product',
          title: 'ডেমো টেস্ট পণ্য',
          image: '',
          selectedOptions: {},
          unitPrice: subtotal,
          quantity: 1,
          availableStock: 99,
          sellerId: 'demo-seller',
          fulfilledBy: 'shobdox',
        },
      ],
      categoryIdByProduct: categoryId ? { [productId]: categoryId } : undefined,
    });

    setResult({
      valid: outcome.valid,
      message: outcome.message,
      discountAmount: outcome.discountAmount,
      code: coupon?.code ?? code.trim().toUpperCase(),
    });
  };

  return (
    <Card>
      <SectionHeader
        title="কুপন টেস্ট করুন"
        subtitle="চেকআউটের নিয়মেই যাচাই হয় — কার্যকর, মেয়াদ, সীমা ও সর্বনিম্ন অর্ডার সহ।"
      />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <Input
          label="কুপন কোড"
          placeholder="যেমন: SHOBDOX10"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              test();
            }
          }}
        />
        <Input
          label="অর্ডারের পরিমাণ (৳)"
          type="number"
          min={0}
          inputMode="numeric"
          value={Number.isFinite(amount) ? amount : ''}
          onChange={(event) => setAmount(Number(event.target.value))}
        />
        <Button onClick={test} leftIcon={<FlaskConical aria-hidden className="size-4" />} className="sm:mb-px">
          টেস্ট করুন
        </Button>
      </div>

      {result ? (
        <Alert
          className="mt-3"
          tone={result.valid ? 'success' : 'error'}
          title={result.valid ? `“${result.code}” প্রযোজ্য` : `“${result.code}” প্রযোজ্য নয়`}
        >
          {result.message}
          {result.valid && result.discountAmount > 0
            ? ` ছাড়ের পরিমাণ ${formatTaka(result.discountAmount)} — নতুন মোট ${formatTaka(
                Math.max(0, (Number.isFinite(amount) ? amount : 0) - result.discountAmount),
              )}।`
            : ''}
          {result.valid && result.discountAmount === 0 ? ` সাশ্রয় শূন্য (ফ্রি ডেলিভারি টাইপ কুপন)।` : null}
          {` টেস্ট পরিমাণ: ${toBanglaDigits(Number.isFinite(amount) ? amount : 0)}৳।`}
        </Alert>
      ) : null}
    </Card>
  );
}
