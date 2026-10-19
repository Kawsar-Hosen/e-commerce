import { useMemo, useState } from 'react';
import { TicketPercent } from 'lucide-react';
import { Alert, Button, Card, Input } from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import { useCoupons, useProducts } from '@/hooks/useCatalog';
import { useCartStore } from '@/store/cart.store';
import { toast } from '@/store/ui.store';
import { findCouponByCode, validateCoupon } from '@shobdox/shared-business-logic';

/**
 * Coupon entry for the cart.
 *
 * The entered code is validated with the shared rule engine against the *live*
 * cart, and the persisted cart only stores the code — totals never trust a
 * stale discount snapshot.
 */
export function CouponField() {
  const { items, totals, coupon, couponResult, appliedCoupon } = useCart();
  const coupons = useCoupons();
  const products = useProducts();
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const [code, setCode] = useState('');

  const categoryIdByProduct = useMemo(() => {
    const map: Record<string, string> = {};
    for (const product of products) map[product.id] = product.categoryId;
    return map;
  }, [products]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      toast({ tone: 'warning', title: 'কুপন কোড লিখুন', description: 'যেমন: SHOBDOX10' });
      return;
    }

    const found = findCouponByCode(coupons, trimmed);
    const result = validateCoupon(found, { items, subtotal: totals.subtotal, categoryIdByProduct });

    if (!result.valid) {
      toast({ tone: 'error', title: 'কুপন প্রয়োগ হয়নি', description: result.message });
      return;
    }

    applyCoupon(found?.code ?? trimmed);
    setCode('');
    toast({ tone: 'success', title: 'কুপন প্রয়োগ হয়েছে', description: result.message });
  };

  const removeCoupon = () => {
    applyCoupon(undefined);
    toast({ tone: 'info', title: 'কুপন সরানো হয়েছে' });
  };

  return (
    <Card>
      <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">
        <TicketPercent aria-hidden className="size-4 text-primary" />
        কুপন কোড
      </h2>

      <div className="mt-3 space-y-3">
        {appliedCoupon ? (
          <Alert
            tone="success"
            title={`${appliedCoupon.code} প্রয়োগ করা হয়েছে`}
            action={
              <Button size="sm" variant="ghost" onClick={removeCoupon}>
                সরান
              </Button>
            }
          >
            {couponResult?.valid ? couponResult.message : appliedCoupon.description}
          </Alert>
        ) : null}

        {coupon && couponResult && !couponResult.valid ? (
          <Alert
            tone="warning"
            title="সংরক্ষিত কুপনটি এখন প্রযোজ্য নয়"
            action={
              <Button size="sm" variant="ghost" onClick={removeCoupon}>
                সরান
              </Button>
            }
          >
            {couponResult.message}
          </Alert>
        ) : null}

        {!appliedCoupon ? (
          <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <Input
              label="কুপন কোড"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="যেমন: SHOBDOX10"
              leftIcon={<TicketPercent aria-hidden className="size-4" />}
              autoComplete="off"
              wrapperClassName="sm:flex-1"
              className="uppercase"
            />
            <Button type="submit" variant="secondary" className="sm:mt-6">
              প্রয়োগ করুন
            </Button>
          </form>
        ) : null}

        <p className="text-xs text-text-secondary">
          ডেমো কুপন: SHOBDOX10, WELCOME200, HOME300, FREESHIP — প্রতিটি কুপনের শর্ত কার্টে যাচাই করা হয়।
        </p>
      </div>
    </Card>
  );
}
