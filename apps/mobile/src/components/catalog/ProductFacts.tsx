import { View } from 'react-native';
import { RotateCcw, ShieldCheck, Store, Truck } from 'lucide-react-native';
import type { Product, Seller } from '@shobdox/shared-types';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { formatDayRange } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { Badge, Card, Text } from '../ui';

/**
 * Seller, warranty, returns and delivery facts for one product.
 *
 * Delivery windows and fees are read from the product row the shared catalogue
 * computes, so the promise on this card matches the cart and the checkout.
 */

export interface ProductFactsProps {
  product: Product;
  seller?: Seller;
  /** True when the shopper's saved address is inside Dhaka city. */
  insideDhaka: boolean;
}

export function ProductFacts({ product, seller, insideDhaka }: ProductFactsProps) {
  const theme = useTheme();

  const window = insideDhaka ? product.delivery.insideDhaka : product.delivery.outsideDhaka;
  const fee = insideDhaka
    ? product.delivery.deliveryFeeInsideDhaka
    : product.delivery.deliveryFeeOutsideDhaka;

  const rows = [
    {
      id: 'seller',
      icon: <Store size={18} color={theme.colors.primary} />,
      label: seller ? seller.profile.storeNameBn ?? seller.profile.storeName : 'শব্দক্স সেলার',
      value: seller
        ? `রেটিং ${toBanglaDigits(seller.rating.toFixed(1))} · ${toBanglaDigits(seller.totalSales)} টাকার বিক্রি`
        : 'অফিসিয়াল স্টোর',
    },
    {
      id: 'delivery',
      icon: <Truck size={18} color={theme.colors.primary} />,
      label: `${formatDayRange(window.min, window.max)} ডেলিভারি`,
      value: fee === 0 ? 'ডেলিভারি ফ্রি' : `${toBanglaDigits(fee)} টাকা ডেলিভারি চার্জ`,
    },
    {
      id: 'return',
      icon: <RotateCcw size={18} color={theme.colors.primary} />,
      label: `${toBanglaDigits(product.returnPolicyDays)} দিনের রিটার্ন সুবিধা`,
      value: 'শর্ত সাপেক্ষে — ডেমো নীতি',
    },
    {
      id: 'cod',
      icon: <ShieldCheck size={18} color={theme.colors.primary} />,
      label: product.delivery.cashOnDeliveryAvailable ? 'ক্যাশ অন ডেলিভারি আছে' : 'শুধু অগ্রিম',
      value: product.warranty ?? 'ওয়ারেন্টি তথ্য নেই',
    },
  ];

  return (
    <Card style={{ gap: theme.space[3] }}>
      {rows.map((row) => (
        <View key={row.id} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.space[3] }}>
          <View style={{ paddingTop: 2 }}>{row.icon}</View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="label" numberOfLines={2}>
              {row.label}
            </Text>
            <Text variant="caption" tone="secondary" numberOfLines={2}>
              {row.value}
            </Text>
          </View>
        </View>
      ))}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
        {product.tags.slice(0, 4).map((tag) => (
          <Badge key={tag} label={tag} tone="neutral" />
        ))}
      </View>
    </Card>
  );
}
