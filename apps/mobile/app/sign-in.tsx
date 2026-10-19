import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyRound, LogIn, Phone, ShieldCheck, UserRound } from 'lucide-react-native';
import { signInSchema, type SignInParsed, type SignInValues } from '@shobdox/shared-validation';
import { DEMO_CREDENTIALS } from '@shobdox/shared-mock-data';
import { DEMO_ROLE_LABELS, useAuthStore, type DemoRole } from '../src/store/auth.store';
import { toast } from '../src/store/ui.store';
import { useTheme } from '../src/hooks/useTheme';
import {
  Badge,
  Button,
  Card,
  Chip,
  DemoNotice,
  Input,
  Screen,
  SwitchRow,
  Text,
} from '../src/components/ui';

/**
 * Demo sign-in.
 *
 * The form validates against the shared `signInSchema` and then hands the
 * values to the mock auth store — there is no network call and no real
 * identity provider. The three fixture accounts are listed on the screen and
 * can be filled with one tap, which is exactly how a reviewer will use it.
 */

const ROLES: DemoRole[] = ['customer', 'admin', 'seller'];

export default function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const session = useAuthStore((state) => state.session);

  const [formError, setFormError] = useState<string>();

  const form = useForm<SignInValues, unknown, SignInParsed>({
    resolver: zodResolver(signInSchema),
    defaultValues: { phone: '', password: '', rememberMe: true },
  });

  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    const result = signIn({
      phone: values.phone,
      password: values.password,
      remember: values.rememberMe,
    });

    if (!result.ok) {
      setFormError(result.error ?? 'সাইন ইন করা যায়নি।');
      return;
    }

    setFormError(undefined);
    toast({
      tone: 'success',
      title: 'সাইন ইন সফল',
      description: 'ডেমো সেশন — প্রকৃত লগইন নয়।',
    });
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/account');
  });

  const fill = useCallback(
    (role: DemoRole) => {
      form.setValue('phone', DEMO_CREDENTIALS[role].phone);
      form.setValue('password', DEMO_CREDENTIALS[role].password);
      setFormError(undefined);
    },
    [form],
  );

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: theme.space[4],
          gap: theme.space[4],
          paddingBottom: theme.space[8],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {session ? (
          <Card style={{ gap: theme.space[3] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
              <UserRound size={18} color={theme.colors.primary} />
              <Text variant="subtitle">আপনি এখন সাইন ইন করা আছেন</Text>
            </View>
            <Text variant="body">{session.user.name}</Text>
            <Text variant="caption" tone="secondary">
              {session.user.role === 'admin'
                ? 'অ্যাডমিন ভিউ দেখতে ডেস্কটপ সাইট ব্যবহার করুন।'
                : 'অর্ডার, কার্ট আর উইশলিস্ট এই সেশনেই যুক্ত হয়।'}
            </Text>
            <Button
              variant="outline"
              fullWidth
              label="অ্যাকাউন্টে ফিরুন"
              icon={<ShieldCheck size={16} color={theme.colors.primary} />}
              accessibilityLabel="অ্যাকাউন্ট স্ক্রিনে ফিরুন"
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/(tabs)/account');
              }}
            />
          </Card>
        ) : null}

        <Card style={{ gap: theme.space[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="subtitle">ফোন ও পাসওয়ার্ড</Text>
            <Badge label="ডেমো" tone="info" />
          </View>

          <Controller
            control={form.control}
            name="phone"
            render={({ field }) => (
              <Input
                label="মোবাইল নম্বর"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="01XXXXXXXXX"
                keyboardType="phone-pad"
                maxLength={11}
                autoCapitalize="none"
                returnKeyType="next"
                autoFocus={!session}
                leftIcon={<Phone size={16} color={theme.colors.textMuted} />}
                error={errors.phone?.message}
                accessibilityLabel="মোবাইল নম্বর"
              />
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field }) => (
              <Input
                label="পাসওয়ার্ড"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="ডেমো পাসওয়ার্ড"
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={() => void onSubmit()}
                leftIcon={<KeyRound size={16} color={theme.colors.textMuted} />}
                error={errors.password?.message}
                accessibilityLabel="পাসওয়ার্ড"
              />
            )}
          />

          <Controller
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <SwitchRow
                label="এই ডিভাইসে সেশন রাখুন"
                description="ডেমো সেশন শুধু এই ডিভাইসেই সংরক্ষিত থাকে।"
                value={field.value ?? false}
                onValueChange={field.onChange}
              />
            )}
          />

          {formError ? <Badge label={formError} tone="error" /> : null}

          <Button
            fullWidth
            label="সাইন ইন করুন"
            icon={<LogIn size={16} color={theme.colors.onPrimary} />}
            accessibilityLabel="ডেমো সাইন ইন করুন"
            onPress={() => void onSubmit()}
          />
        </Card>

        <Card style={{ gap: theme.space[3] }}>
          <Text variant="subtitle">ডেমো অ্যাকাউন্ট</Text>
          <Text variant="caption" tone="secondary">
            ফিক্সচার থেকে নেওয়া — যেকোনো অ্যাকাউন্ট বেছে নিলে ফর্মটি নিজেই পূরণ হবে।
          </Text>

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
                minHeight: theme.layout.minTouchTarget,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label">{DEMO_ROLE_LABELS[role]}</Text>
                <Text variant="caption" tone="muted">
                  {`ফোন ${DEMO_CREDENTIALS[role].phone} · পাসওয়ার্ড ${DEMO_CREDENTIALS[role].password}`}
                </Text>
              </View>
              <Chip
                size="sm"
                label="বসান"
                onPress={() => fill(role)}
                accessibilityLabel={`${DEMO_ROLE_LABELS[role]} এর তথ্য ফর্মে বসান`}
              />
            </View>
          ))}
        </Card>

        <DemoNotice message="এই স্ক্রিনটি শুধু ডেমো — পাসওয়ার্ড ফিক্সচারে প্রকাশ্য, কোনো প্রকৃত অ্যাকাউন্ট বা পেমেন্ট নেই।" />
      </ScrollView>
    </Screen>
  );
}
