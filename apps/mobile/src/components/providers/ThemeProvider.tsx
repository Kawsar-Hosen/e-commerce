import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type Theme, type ThemePreference } from '../../lib/theme';
import { useUiStore } from '../../store/ui.store';

/**
 * Theme provider.
 *
 * The preference lives in the UI store (persisted), the actual palette is
 * derived from `@shobdox/design-tokens`. `system` follows the Android setting.
 */

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useUiStore((state) => state.themePreference);
  const setPreference = useUiStore((state) => state.setThemePreference);

  const theme = useMemo(() => {
    const resolved = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [preference, systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, preference, setPreference }),
    [theme, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Falls back to the light palette so a hook never throws outside the provider. */
export function useThemeContext(): ThemeContextValue {
  return (
    useContext(ThemeContext) ?? {
      theme: lightTheme,
      preference: 'system',
      setPreference: () => undefined,
    }
  );
}

export function useTheme(): Theme {
  return useThemeContext().theme;
}
