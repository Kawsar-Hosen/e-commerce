import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Headphones,
  RotateCcw,
  Sparkles,
  Truck,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import { CUSTOMER_BENEFITS } from '@shobdox/shared-mock-data';
import { useTheme } from '../../hooks/useTheme';
import { Card, Text } from '../ui';

/**
 * Service promises strip.
 *
 * Copy and icon keys come from the shared mock content, so the phone and the
 * website advertise the same four promises.
 */

const BENEFIT_ICONS: Record<string, LucideIcon> = {
  Truck,
  Wallet,
  RotateCcw,
  Headphones,
};

export function BenefitStrip() {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.space[3] }}>
      <Text variant="heading" style={{ paddingHorizontal: theme.space[4] }}>
        শব্দক্স কেন?
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.space[4], gap: theme.space[3] }}
      >
        {CUSTOMER_BENEFITS.map((benefit) => {
          const Icon = BENEFIT_ICONS[benefit.icon] ?? Sparkles;

          return (
            <Card
              key={benefit.id}
              elevation="flat"
              style={[styles.card, { width: 216 }]}
              accessibilityLabel={`${benefit.title}. ${benefit.description}`}
            >
              <View
                style={[
                  styles.iconWell,
                  { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.full },
                ]}
              >
                <Icon size={20} color={theme.colors.primary} />
              </View>
              <Text variant="label" numberOfLines={1}>
                {benefit.title}
              </Text>
              <Text variant="caption" tone="secondary" numberOfLines={3}>
                {benefit.description}
              </Text>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  iconWell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
