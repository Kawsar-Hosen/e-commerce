import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { ProductSortKey } from '@shobdox/shared-types';
import { PRODUCT_SORT_LABELS } from '@shobdox/shared-types';
import { useTheme } from '../../hooks/useTheme';
import { BottomSheet, Button, Text } from '../ui';

/** Sort options sheet. Labels come from the shared `PRODUCT_SORT_LABELS`. */

export interface SortSheetProps {
  visible: boolean;
  onClose: () => void;
  value: ProductSortKey;
  onChange: (sort: ProductSortKey) => void;
}

const SORTS: ProductSortKey[] = [
  'relevance',
  'popularity',
  'price-asc',
  'price-desc',
  'discount',
  'rating',
  'newest',
];

export function SortSheet({ visible, onClose, value, onChange }: SortSheetProps) {
  const theme = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} title="সাজান" subtitle="কোন ক্রমে দেখতে চান?">
      {SORTS.map((sort) => {
        const selected = sort === value;

        return (
          <Button
            key={sort}
            fullWidth
            variant={selected ? 'secondary' : 'ghost'}
            label={PRODUCT_SORT_LABELS[sort]}
            rightIcon={selected ? <Check size={16} color={theme.colors.primary} /> : undefined}
            accessibilityLabel={`${PRODUCT_SORT_LABELS[sort]}${selected ? ' — নির্বাচিত' : ''}`}
            onPress={() => {
              onChange(sort);
              onClose();
            }}
          />
        );
      })}

      <View style={{ paddingTop: theme.space[2] }}>
        <Text variant="caption" tone="muted">
          সাজানোর নিয়ম শব্দক্সের শেয়ার্ড কোড থেকে আসে — ওয়েবসাইট ও অ্যাপে একই ক্রম।
        </Text>
      </View>
    </BottomSheet>
  );
}
