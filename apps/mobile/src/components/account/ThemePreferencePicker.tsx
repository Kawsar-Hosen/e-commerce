import { View } from 'react-native';
import { Sun } from 'lucide-react-native';
import {
  THEME_PREFERENCES,
  THEME_PREFERENCE_LABELS,
  useTheme,
  useThemeContext,
} from '../../hooks/useTheme';
import { Card, Chip, Text } from '../ui';

/** Theme picker: system / light / dark, persisted in the UI store. */

export function ThemePreferencePicker() {
  const theme = useTheme();
  const { preference, setPreference } = useThemeContext();

  return (
    <Card style={{ gap: theme.space[3] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
        <Sun size={18} color={theme.colors.primary} />
        <Text variant="subtitle">থিম</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
        {THEME_PREFERENCES.map((option) => (
          <Chip
            key={option}
            label={THEME_PREFERENCE_LABELS[option]}
            selected={preference === option}
            onPress={() => setPreference(option)}
            accessibilityLabel={`থিম ${THEME_PREFERENCE_LABELS[option]}`}
          />
        ))}
      </View>

      <Text variant="caption" tone="muted">
        সব রং, আকার ও ছায়া ডিজাইন টোকেন থেকে আসে — তাই হালকা ও গাঢ় থিমে পুরো অ্যাপ
        একসাথে বদলায়।
      </Text>
    </Card>
  );
}
