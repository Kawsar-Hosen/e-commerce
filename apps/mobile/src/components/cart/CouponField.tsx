import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { BadgePercent, Ticket } from 'lucide-react-native';
import type { CartItem } from '@shobdox/shared-types';
import { findCouponByCode, suggestCoupons, validateCoupon } from '@shobdox/shared-business-logic';
import { formatTaka } from '@shobdox/shared-utils';
import { useCartStore } from '../../store/cart.store';
import { toast } from '../../store/ui.store';
import { useCoupons, useProducts } from '../../hooks/useProducts';
import { useTheme } from '../../hooks/useTheme';
import { Button, Card, Chip, Input, Text } from '../ui';

/**
 * Coupon entry.
 *
 * A code is never trusted from state: it is re-validated against the live cart
 * through `validateCoupon()` every time it is applied, and the same helper backs
 * the "আপনার জন্য প্রযোজ্য" suggestions under the field.
 */

export interface CouponFieldProps {
  items: CartItem[];
  subtotal: number;
  couponCode?: string;
}

export function CouponField({ items, subtotal, couponCode }: CouponFieldProps) {
  const theme = useTheme();
  const coupons = useCoupons();
  const products = useProducts();
  const applyCoupon = useCartStore((state) => state.applyCoupon);

  const [draft, setDraft] = useState(couponCode ?? '');

  const categoryIdByProduct = useMemo(() => {
    const map: Record<string, string> = {};
    for (const product of products) map[product.id] = product.categoryId;
    return map;
  }, [products]);

  const suggestions = useMemo(
    () => suggestCoupons(coupons, { items, subtotal, categoryIdByProduct }, 3),
    [categoryIdByProduct, coupons, items, subtotal],
  );

  const apply = (code: string) => {
    const coupon = findCouponByCode(coupons, code);
    const result = validateCoupon(coupon, { items, subtotal, categoryIdByProduct });

    if (!result.valid) {
      toast({ tone: 'error', title: 'কুপন প্রয়োগ হয়নি', description: result.message });
      return;
    }

    applyCoupon(coupon?.code ?? code);
    setDraft(coupon?.code ?? code);
    toast({ tone: 'success', title: 'কুপন প্রয়োগ হয়েছে', description: result.message });
  };

  return (
    <Card style={{ gap: theme.space[3] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
        <Ticket size={18} color={theme.colors.primary} />
        <Text variant="subtitle">কুপন কোড</Text>
      </View>

      {couponCode ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.space[2],
            backgroundColor: theme.colors.primarySoft,
            borderRadius: theme.componentRadius.input,
            padding: theme.space[3],
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="bodyStrong" tone="primary">
              {couponCode}
            </Text>
            <Text variant="caption" tone="secondary">
              প্রয়োগ করা হয়েছে — মোট হিসাবে যোগ হয়েছে
            </Text>
          </View>
          <Button
            variant="ghost"
            label="সরান"
            accessibilityLabel={`${couponCode} কুপন সরান`}
            onPress={() => {
              applyCoupon(undefined);
              setDraft('');
              toast({ tone: 'info', title: 'কুপন সরানো হয়েছে' });
            }}
          />
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: theme.space[2], alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <Input
              label="কোড লিখুন"
              value={draft}
              onChangeText={setDraft}
              placeholder="যেমন SHOBDOX10"
              autoCapitalize="characters"
              autoCorrect={false}
              accessibilityLabel="কুপন কোড"
              maxLength={20}
            />
          </View>
          <Button
            label="প্রয়োগ"
            disabled={draft.trim().length < 3}
            accessibilityLabel="কুপন কোড প্রয়োগ করুন"
            onPress={() => apply(draft)}
          />
        </View>
      )}

      {suggestions.length > 0 ? (
        <View style={{ gap: theme.space[2] }}>
          <Text variant="caption" tone="secondary">
            আপনার কার্টের জন্য প্রযোজ্য
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
            {suggestions.map((suggestion) => (
              <Chip
                key={suggestion.coupon?.id ?? suggestion.message}
                size="sm"
                icon={<BadgePercent size={14} color={theme.colors.primary} />}
                label={`${suggestion.coupon?.code ?? ''} · সাশ্রয় ${formatTaka(suggestion.discountAmount)}`}
                onPress={() => apply(suggestion.coupon?.code ?? '')}
                accessibilityLabel={`${suggestion.coupon?.code ?? ''} কুপন প্রয়োগ করুন, সাশ্রয় ${formatTaka(suggestion.discountAmount)}`}
              />
            ))}
          </View>
        </View>
      ) : null}
    </Card>
  );
}
