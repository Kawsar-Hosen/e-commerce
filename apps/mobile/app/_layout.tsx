import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ToastHost } from '../src/components/ui';
import { ThemeProvider, useTheme, type Theme } from '../src/hooks/useTheme';
import { useAuthStore } from '../src/store/auth.store';
import { useDataStore } from '../src/store/data.store';

/**
 * Root layout.
 *
 * Three jobs, in order:
 *  1. Hold the providers the whole app shares (gestures, safe area, tokens).
 *  2. Keep the native splash up until the persisted stores have rehydrated, so
 *     the first frame already shows the shopper's own cart and session.
 *  3. Describe the stack: tab screens draw their own headers, every other screen
 *     gets a token-styled native header with a Bangla title.
 */

// Hide the splash only once we say so; the call is a no-op on a warm start.
void SplashScreen.preventAutoHideAsync().catch(() => undefined);

/** Safety net: never let a storage failure trap the app behind the splash. */
const SPLASH_TIMEOUT_MS = 3_000;

function stackScreenOptions(theme: Theme) {
  return {
    headerStyle: { backgroundColor: theme.colors.surface },
    headerTintColor: theme.colors.primary,
    headerTitleStyle: {
      color: theme.colors.text,
      fontSize: theme.font.size.lg,
      fontWeight: theme.font.weight.semibold as never,
    },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.colors.background },
    animation: 'slide_from_right' as const,
  };
}

function RootNavigator() {
  const theme = useTheme();

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={stackScreenOptions(theme)}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[slug]" options={{ title: 'পণ্যের বিস্তারিত' }} />
        <Stack.Screen name="search" options={{ title: 'পণ্য খুঁজুন' }} />
        <Stack.Screen name="categories/[slug]" options={{ title: 'ক্যাটাগরি' }} />
        <Stack.Screen name="brands" options={{ title: 'ব্র্যান্ড' }} />
        <Stack.Screen name="checkout" options={{ title: 'ডেমো চেকআউট' }} />
        <Stack.Screen name="orders" options={{ title: 'আমার অর্ডার' }} />
        <Stack.Screen name="order/[id]" options={{ title: 'অর্ডার ট্র্যাকিং' }} />
        <Stack.Screen name="notifications" options={{ title: 'নোটিফিকেশন' }} />
        <Stack.Screen name="sign-in" options={{ title: 'ডেমো সাইন ইন' }} />
        <Stack.Screen name="+not-found" options={{ title: 'পাতা পাওয়া যায়নি' }} />
      </Stack>
      <ToastHost />
    </>
  );
}

export default function RootLayout() {
  const dataHydrated = useDataStore((state) => state.hydrated);
  const authHydrated = useAuthStore((state) => state.hydrated);
  const [timedOut, setTimedOut] = useState(false);

  const ready = (dataHydrated && authHydrated) || timedOut;

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), SPLASH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          {ready ? <RootNavigator /> : <View style={styles.root} />}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
