import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { LogIn, ShieldCheck, UserRound } from 'lucide-react-native';
import { DEMO_CREDENTIALS } from '@shobdox/shared-mock-data';
import { DEMO_ROLE_LABELS, useAuthStore, type DemoRole } from '../../store/auth.store';
import { toast } from '../../store/ui.store';
import { useTheme } from '../../hooks/useTheme';
import { Badge, Button, Card, Text } from '../ui';

/**
 * One-tap demo sign-in.
 *
 * The three accounts exist in the shared fixtures; their passwords are printed
 * on screen on purpose — this is a demo, and no real credential is involved.
 */

const ROLES: DemoRole[] = ['customer', 'admin', 'seller'];

export function DemoAccountCard() {
  const theme = useTheme();
  const router = useRouter();
  const signInAs = useAuthStore((state) => state.signInAs);

  return (
    <Card style={{ gap: theme.space[3] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
        <ShieldCheck size={18} color={theme.colors.primary} />
        <Text variant="subtitle">ডেমো অ্যাকাউন্ট</Text>
      </View>

      <Text variant="caption" tone="secondary">
        কোনো প্রকৃত লগইন নেই। নিচের যেকোনো অ্যাকাউন্টে এক ট্যাপে ঢুকে অর্ডার, স্টক ও
        অ্যাডমিন ভিউ পরখ করুন।
      </Text>

      <View style={{ gap: theme.space[2] }}>
        {ROLES.map((role) => (
          <View
            key={role}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.space[3],
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.componentRadius.card,
              padding: theme.space[3],
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="label">{DEMO_ROLE_LABELS[role]}</Text>
              <Text variant="caption" tone="muted">
                {`ফোন ${DEMO_CREDENTIALS[role].phone} · পাসওয়ার্ড ${DEMO_CREDENTIALS[role].password}`}
              </Text>
            </View>

            <Button
              size="sm"
              label="ঢুকুন"
              icon={<UserRound size={14} color={theme.colors.onPrimary} />}
              accessibilityLabel={`${DEMO_ROLE_LABELS[role]} হিসেবে ঢুকুন`}
              onPress={() => {
                signInAs(role);
                toast({
                  tone: 'success',
                  title: `${DEMO_ROLE_LABELS[role]} হিসেবে সেশন শুরু`,
                  description: 'সেশন শুধু এই ডিভাইসে সংরক্ষিত।',
                });
              }}
            />
          </View>
        ))}
      </View>

      <Button
        variant="outline"
        fullWidth
        label="ফোন ও পাসওয়ার্ড দিয়ে সাইন ইন"
        icon={<LogIn size={16} color={theme.colors.primary} />}
        accessibilityLabel="সাইন ইন স্ক্রিন খুলুন"
        onPress={() => router.push('/sign-in')}
      />

      <View style={{ flexDirection: 'row', gap: theme.space[2], flexWrap: 'wrap' }}>
        <Badge label="প্রোভাইডার: mock" tone="neutral" />
        <Badge label="নেটওয়ার্ক কল নেই" tone="info" />
      </View>
    </Card>
  );
}
