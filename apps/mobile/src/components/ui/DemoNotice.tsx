import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Info, Lock } from 'lucide-react-native';
import { DEMO_PAYMENT_NOTICE } from '../../lib/constants';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

/**
 * The mandatory demo framing.
 *
 * Rendered on every surface that mentions money or fulfilment: it states that no
 * payment happens, that no payment data is collected and that the record lives on
 * this device only.
 */

export interface DemoNoticeProps {
  title?: string;
  message: string;
  tone?: 'info' | 'payment';
  icon?: ReactNode;
}

export function DemoNotice({ title, message, tone = 'info', icon }: DemoNoticeProps) {
  const theme = useTheme();

  const background = tone === 'payment' ? theme.colors.warningSoft : theme.colors.infoSoft;
  const accent = tone === 'payment' ? theme.colors.warning : theme.colors.info;

  return (
    <View
      accessible
      accessibilityLabel={`${title ? `${title}. ` : ''}${message}`}
      style={{
        flexDirection: 'row',
        gap: theme.space[3],
        alignItems: 'flex-start',
        backgroundColor: background,
        borderRadius: theme.componentRadius.card,
        padding: theme.space[3],
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <View style={{ paddingTop: 2 }}>
        {icon ?? (tone === 'payment' ? <Lock size={18} color={accent} /> : <Info size={18} color={accent} />)}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        {title ? (
          <Text variant="label" style={{ color: accent }}>
            {title}
          </Text>
        ) : null}
        <Text variant="caption" tone="secondary">
          {message}
        </Text>
      </View>
    </View>
  );
}

/** Shorthand used by the cart, checkout and order screens. */
export function DemoPaymentNotice() {
  return <DemoNotice title="ডেমো পেমেন্ট" message={DEMO_PAYMENT_NOTICE} tone="payment" />;
}
