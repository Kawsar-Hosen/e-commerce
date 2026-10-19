import { View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button, Chip, Input, Text } from '../ui';

/**
 * Search field + recent searches.
 *
 * Typing does not run the matcher on every keystroke — the screen debounces the
 * value first. Recent terms are stored in the UI store and can be removed
 * individually or all at once.
 */

export interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  recentSearches: string[];
  onPickRecent: (term: string) => void;
  onForgetRecent: (term: string) => void;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  recentSearches,
  onPickRecent,
  onForgetRecent,
}: SearchBarProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.space[3] }}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder="কী খুঁজছেন? যেমন: শার্ট, স্মার্টফোন"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        accessibilityLabel="অনুসন্ধান"
        accessibilityHint="পণ্য, ব্র্যান্ড বা ক্যাটাগরির নাম লিখুন"
        leftIcon={<Search size={18} color={theme.colors.textMuted} />}
        rightSlot={
          value.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              icon={<X size={16} color={theme.colors.textSecondary} />}
              accessibilityLabel="অনুসন্ধান মুছুন"
              onPress={() => onChangeText('')}
            />
          ) : null
        }
      />

      {recentSearches.length > 0 ? (
        <View style={{ gap: theme.space[2] }}>
          <Text variant="caption" tone="secondary">
            সাম্প্রতিক খোঁজ
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
            {recentSearches.map((term) => (
              <Chip
                key={term}
                size="sm"
                label={term}
                onPress={() => onPickRecent(term)}
                accessibilityLabel={`${term} আবার খুঁজুন`}
                style={{ paddingRight: theme.space[1] }}
              />
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
            {recentSearches.slice(0, 3).map((term) => (
              <Button
                key={`remove-${term}`}
                variant="ghost"
                size="sm"
                label={`"${term}" সরান`}
                accessibilityLabel={`${term} সাম্প্রতিক খোঁজ থেকে সরান`}
                onPress={() => onForgetRecent(term)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
