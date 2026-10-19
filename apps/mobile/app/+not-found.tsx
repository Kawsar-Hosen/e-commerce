import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Compass, House, Search } from 'lucide-react-native';
import { Button, Screen, Text } from '../src/components/ui';
import { useTheme } from '../src/hooks/useTheme';

/**
 * Fallback route.
 *
 * Reached when a deep link points at a page this demo does not have. It offers
 * two real ways back into the app instead of a dead end.
 */
export default function NotFoundScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.space[4],
          padding: theme.space[6],
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Compass size={32} color={theme.colors.primary} />
        </View>

        <Text variant="title" align="center">
          পাতাটি পাওয়া যায়নি
        </Text>
        <Text variant="body" tone="secondary" align="center">
          লিংকটি হয়তো পুরনো, অথবা এই ডেমোতে পাতাটি এখনো যোগ করা হয়নি। নিচের যেকোনো
          একটি পথে ফিরে যান।
        </Text>

        <View style={{ gap: theme.space[3], width: '100%', maxWidth: 340 }}>
          <Button
            fullWidth
            size="lg"
            label="হোমে ফিরুন"
            icon={<House size={18} color={theme.colors.onPrimary} />}
            accessibilityLabel="হোম স্ক্রিনে ফিরে যান"
            onPress={() => router.replace('/(tabs)')}
          />
          <Button
            fullWidth
            variant="outline"
            label="পণ্য খুঁজুন"
            icon={<Search size={18} color={theme.colors.primary} />}
            accessibilityLabel="অনুসন্ধান স্ক্রিন খুলুন"
            onPress={() => router.replace('/search')}
          />
        </View>
      </View>
    </Screen>
  );
}
