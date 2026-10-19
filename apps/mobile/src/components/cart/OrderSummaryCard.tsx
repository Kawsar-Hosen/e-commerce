import { View } from 'react-native';
import type { CartTotals } from '@shobdox/shared-types';
import { formatTaka } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { Card, ProgressBar, Text } from '../ui';

/**
 * Order maths block.
 *
 * Every number comes from `computeCartTotals()`; this component only lays them
 * out. VAT is shown as included (never added on top), which matches the website
 * and the shared pricing rules.
 */

export interface OrderSummaryCardProps {
  totals: CartTotals;
  couponCode?: string;
  /** Free-delivery progress, 0–100, from `freeDeliveryProgress()`. */
  freeDeliveryPercent?: number;
  freeDeliveryMessage?: string;
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'default' | 'success' | 'error' }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      <Text variant="bodyStrong" tone={tone ?? 'default'}>
        {value}
      </Text>
    </View>
  );
}

export function OrderSummaryCard({
  totals,
  couponCode,
  freeDeliveryPercent,
  freeDeliveryMessage,
}: OrderSummaryCardProps) {
  const theme = useTheme();

  return (
    <Card style={{ gap: theme.space[3] }}>
      <Text variant="subtitle">হিসাব</Text>

      <Row label={`উপমোট (${formatTaka(totals.subtotal)})`} value={formatTaka(totals.subtotal)} />

      {totals.productDiscount > 0 ? (
        <Row
          label="পণ্যে ছাড়"
          value={`- ${formatTaka(totals.productDiscount)}`}
          tone="success"
        />
      ) : null}

      {totals.couponDiscount > 0 ? (
        <Row
          label={couponCode ? `কুপন ছাড় (${couponCode})` : 'কুপন ছাড়'}
          value={`- ${formatTaka(totals.couponDiscount)}`}
          tone="success"
        />
      ) : null}

      <Row
        label="ডেলিভারি চার্জ"
        value={totals.deliveryFee === 0 ? 'ফ্রি' : formatTaka(totals.deliveryFee)}
        tone={totals.deliveryFee === 0 ? 'success' : 'default'}
      />

      <Row label="ভ্যাট (অন্তর্ভুক্ত)" value={formatTaka(totals.vat)} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingTop: theme.space[3],
        }}
      >
        <Text variant="subtitle">সর্বমোট</Text>
        <Text variant="priceLarge" accessibilityLabel={`সর্বমোট ${formatTaka(totals.total)}`}>
          {formatTaka(totals.total)}
        </Text>
      </View>

      {totals.savings > 0 ? (
        <Text variant="caption" tone="success" weight="semibold">
          {`মোট সাশ্রয় ${formatTaka(totals.savings)}`}
        </Text>
      ) : null}

      {freeDeliveryPercent !== undefined && freeDeliveryMessage ? (
        <View style={{ gap: theme.space[1] }}>
          <ProgressBar
            value={freeDeliveryPercent}
            tone={freeDeliveryPercent >= 100 ? 'success' : 'primary'}
            accessibilityLabel={freeDeliveryMessage}
          />
          <Text variant="caption" tone="secondary">
            {freeDeliveryMessage}
          </Text>
        </View>
      ) : null}

      <Text variant="caption" tone="muted">
        দাম ও চার্জ শব্দক্সের শেয়ার্ড হিসাব থেকে আসে — ওয়েবসাইট ও অ্যাপে একই ফল।
      </Text>
    </Card>
  );
}
