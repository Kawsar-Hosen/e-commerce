/**
 * Re-exported theme hook.
 *
 * The provider lives in `components/providers` so it can own JSX; screens import
 * it from here either way.
 */

export { ThemeProvider, useTheme, useThemeContext } from '../components/providers/ThemeProvider';
export {
  darkTheme,
  lightTheme,
  GRID_BREAKPOINTS,
  THEME_PREFERENCES,
  THEME_PREFERENCE_LABELS,
  type Theme,
  type ThemeColors,
  type ThemePreference,
} from '../lib/theme';
