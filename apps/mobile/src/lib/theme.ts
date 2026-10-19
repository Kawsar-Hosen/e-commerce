/**
 * Native theme objects built exclusively from `@shobdox/design-tokens`.
 *
 * The web app expresses the same decisions as CSS custom properties; here they
 * are plain React Native objects so a screen never hardcodes a hex value, a
 * radius or a font size.
 */

import { Platform } from 'react-native';
import {
  breakpoints,
  componentRadius,
  duration,
  fontSize,
  fontWeight,
  green,
  layout,
  lineHeight,
  banglaLineHeight,
  paymentBrands,
  radius,
  semanticColors,
  shadow,
  slate,
  space,
  zIndex,
} from '@shobdox/design-tokens';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceRaised: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  border: string;
  borderStrong: string;
  divider: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  error: string;
  errorSoft: string;
  info: string;
  infoSoft: string;
  overlay: string;
  skeleton: string;
  skeletonHighlight: string;
  paymentBkash: string;
  paymentNagad: string;
  paymentRocket: string;
  paymentCod: string;
}

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  radius: typeof radius;
  componentRadius: typeof componentRadius;
  space: typeof space;
  layout: typeof layout;
  breakpoints: typeof breakpoints;
  duration: typeof duration;
  zIndex: typeof zIndex;
  font: {
    /** Android resolves Bangla through the system font stack (`sans-serif`). */
    family: string;
    mono: string;
    size: typeof fontSize;
    weight: typeof fontWeight;
    lineHeight: typeof lineHeight;
    banglaLineHeight: typeof banglaLineHeight;
  };
  shadow: {
    xs: object;
    sm: object;
    md: object;
    lg: object;
    xl: object;
  };
}

const fontFamily = Platform.select({ android: 'sans-serif', ios: 'System', default: 'system-ui' }) as string;
const monoFamily = Platform.select({ android: 'monospace', ios: 'Menlo', default: 'monospace' }) as string;

const shared = {
  radius,
  componentRadius,
  space,
  layout,
  breakpoints,
  duration,
  zIndex,
  font: {
    family: fontFamily,
    mono: monoFamily,
    size: fontSize,
    weight: fontWeight,
    lineHeight,
    banglaLineHeight,
  },
  shadow: {
    xs: { ...shadow.xs.native },
    sm: { ...shadow.sm.native },
    md: { ...shadow.md.native },
    lg: { ...shadow.lg.native },
    xl: { ...shadow.xl.native },
  },
} as const;

export const lightTheme: Theme = {
  ...shared,
  isDark: false,
  colors: {
    background: semanticColors.background,
    surface: semanticColors.surface,
    surfaceMuted: semanticColors.surfaceMuted,
    surfaceRaised: semanticColors.surface,
    text: semanticColors.textPrimary,
    textSecondary: semanticColors.textSecondary,
    textMuted: semanticColors.textMuted,
    textInverse: semanticColors.textInverse,
    primary: semanticColors.primary,
    primaryDark: semanticColors.primaryDark,
    primaryLight: semanticColors.primaryLight,
    primarySoft: semanticColors.primarySoft,
    onPrimary: semanticColors.onPrimary,
    accent: semanticColors.accent,
    accentSoft: semanticColors.accentSoft,
    onAccent: semanticColors.onAccent,
    border: semanticColors.border,
    borderStrong: semanticColors.borderStrong,
    divider: semanticColors.divider,
    success: semanticColors.success,
    successSoft: semanticColors.successSoft,
    warning: semanticColors.warning,
    warningSoft: semanticColors.warningSoft,
    error: semanticColors.error,
    errorSoft: semanticColors.errorSoft,
    info: semanticColors.info,
    infoSoft: semanticColors.infoSoft,
    overlay: semanticColors.overlay,
    skeleton: semanticColors.skeleton,
    skeletonHighlight: semanticColors.skeletonHighlight,
    paymentBkash: paymentBrands.bkash,
    paymentNagad: paymentBrands.nagad,
    paymentRocket: paymentBrands.rocket,
    paymentCod: paymentBrands.cod,
  },
};

/**
 * Dark palette. Values come from the same slate/green ramps as the light theme,
 * so the two stay in step whenever the tokens change.
 */
export const darkTheme: Theme = {
  ...shared,
  isDark: true,
  colors: {
    background: slate[950],
    surface: slate[900],
    surfaceMuted: slate[800],
    surfaceRaised: slate[800],
    text: slate[50],
    textSecondary: slate[300],
    textMuted: slate[400],
    textInverse: slate[950],
    primary: green[400],
    primaryDark: green[600],
    primaryLight: green[300],
    primarySoft: slate[800],
    onPrimary: slate[950],
    accent: semanticColors.accent,
    accentSoft: slate[800],
    onAccent: slate[950],
    border: slate[700],
    borderStrong: slate[600],
    divider: slate[800],
    success: semanticColors.primaryLight,
    successSoft: slate[800],
    warning: semanticColors.accent,
    warningSoft: slate[800],
    error: semanticColors.error,
    errorSoft: slate[800],
    info: semanticColors.info,
    infoSoft: slate[800],
    overlay: semanticColors.overlay,
    skeleton: slate[800],
    skeletonHighlight: slate[700],
    paymentBkash: paymentBrands.bkash,
    paymentNagad: paymentBrands.nagad,
    paymentRocket: paymentBrands.rocket,
    paymentCod: slate[400],
  },
};

export type ThemePreference = 'light' | 'dark' | 'system';

export const THEME_PREFERENCES: ThemePreference[] = ['system', 'light', 'dark'];

export const THEME_PREFERENCE_LABELS: Record<ThemePreference, string> = {
  system: 'সিস্টেম অনুযায়ী',
  light: 'লাইট',
  dark: 'ডার্ক',
};

/** Tablet / phone breakpoints used by grids and the responsive shells. */
export const GRID_BREAKPOINTS = {
  /** From this width the grids add a second column. */
  small: breakpoints.md,
  medium: breakpoints.lg,
  large: breakpoints.xl,
} as const;

export type { ThemeColors as Colors };
