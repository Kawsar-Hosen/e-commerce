/**
 * SHOBDOX design tokens — the single source of truth for both the website
 * (Tailwind CSS v4 + CSS custom properties) and the Android app (React Native
 * style objects).
 *
 * Rules:
 *  - This file must stay free of DOM / React Native imports so it can be used
 *    in any runtime.
 *  - Numeric sizes are expressed in raw pixels. The CSS generator converts them
 *    to rem (px / 16) so Tailwind utilities and the RN styles stay identical.
 */

/* ------------------------------------------------------------------ colours */

/** Brand green. Anchors: 800 = #166534 (primary), 900 = #14532D (primary dark). */
export const green = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
  950: '#052E16',
} as const;

/** Accent amber. Anchor: 500 = #F59E0B. */
export const amber = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
} as const;

/** Neutral slate. Anchors: 50 = #F8FAFC (background), 900 = #0F172A (text). */
export const slate = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  950: '#020617',
} as const;

export const red = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
} as const;

export const blue = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
} as const;

export const cyan = {
  50: '#ECFEFF',
  100: '#CFFAFE',
  600: '#0891B2',
  700: '#0E7490',
} as const;

export const purple = {
  50: '#FAF5FF',
  100: '#F3E8FF',
  600: '#9333EA',
  700: '#7E22CE',
} as const;

/**
 * Indicative colours for the demo payment-method chips. These are not official
 * brand assets and no real payment integration exists in this phase.
 */
export const paymentBrands = {
  bkash: '#E2136E',
  nagad: '#F6821F',
  rocket: '#8C3494',
  cod: slate[600],
} as const;

/**
 * Semantic colours. Components must consume these (or the Tailwind utilities
 * generated from them) instead of reaching for raw palette values.
 */
export const semanticColors = {
  primary: green[800],
  primaryDark: green[900],
  primaryLight: green[600],
  primarySoft: green[50],
  onPrimary: '#FFFFFF',

  accent: amber[500],
  accentDark: amber[600],
  accentSoft: amber[50],
  onAccent: slate[900],

  background: slate[50],
  surface: '#FFFFFF',
  surfaceMuted: slate[100],
  surfaceInverse: slate[900],

  textPrimary: slate[900],
  textSecondary: slate[500],
  textMuted: slate[400],
  textInverse: '#FFFFFF',

  border: slate[200],
  borderStrong: slate[300],
  divider: slate[100],

  success: green[600],
  successSoft: green[50],
  warning: amber[500],
  warningSoft: amber[50],
  error: red[600],
  errorSoft: red[50],
  info: blue[600],
  infoSoft: blue[50],

  overlay: 'rgba(15, 23, 42, 0.55)',
  skeleton: slate[200],
  skeletonHighlight: slate[100],
} as const;

/* ------------------------------------------------------------------ spacing */

/**
 * 4px base scale, matching Tailwind's default spacing scale so `p-4` on the web
 * and `space[4]` in React Native produce the same result.
 */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

/** Named semantic spacing aliases for readable React Native styles. */
export const spacingAliases = {
  xs: space[1],
  sm: space[2],
  md: space[3],
  lg: space[4],
  xl: space[5],
  '2xl': space[6],
  '3xl': space[8],
  '4xl': space[12],
  '5xl': space[16],
} as const;

/** Horizontal page padding, tuned per breakpoint. */
export const layout = {
  /** Minimum tap target — Android HIG is 48dp, iOS is 44pt. */
  minTouchTarget: 44,
  containerSm: 640,
  containerMd: 768,
  containerLg: 1024,
  containerXl: 1280,
  container2xl: 1536,
  /** Horizontal gutter used by page shells. */
  gutter: { mobile: 16, tablet: 24, desktop: 32 },
  headerHeight: { mobile: 56, desktop: 68 },
  bottomNavHeight: 60,
} as const;

/* ------------------------------------------------------------------- radius */

export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

/** Component-level radius decisions so cards/buttons stay consistent. */
export const componentRadius = {
  button: radius.md,
  buttonPill: radius.full,
  card: radius.lg,
  panel: radius.xl,
  input: radius.md,
  chip: radius.full,
  sheet: radius['2xl'],
  image: radius.md,
} as const;

/* --------------------------------------------------------------- typography */

export const fontFamily = {
  /** Latin UI text. */
  sans: [
    'Inter',
    'system-ui',
    '-apple-system',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  /** Bangla UI text — Hind Siliguri is the primary Bangla face we ship. */
  bangla: [
    'Hind Siliguri',
    'Noto Sans Bengali',
    'Noto Serif Bengali',
    'system-ui',
    'Roboto',
    'sans-serif',
  ],
  /** Prices, order numbers, analytics figures. */
  mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
} as const;

/** Font sizes in px. */
export const fontSize = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 40,
} as const;

export const lineHeight = {
  none: 1,
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
} as const;

/**
 * Bangla needs extra leading: conjuncts and matras sit above and below the
 * baseline, so the same font size needs more vertical room than Latin.
 */
export const banglaLineHeight = {
  tight: 1.45,
  snug: 1.6,
  normal: 1.75,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

/** Tailwind-style text scale: size + paired line height. */
export const textStyles = {
  caption: { fontSize: fontSize.xs, lineHeight: lineHeight.snug, fontWeight: fontWeight.medium },
  body: { fontSize: fontSize.base, lineHeight: lineHeight.normal, fontWeight: fontWeight.regular },
  bodyStrong: { fontSize: fontSize.base, lineHeight: lineHeight.normal, fontWeight: fontWeight.semibold },
  title: { fontSize: fontSize.xl, lineHeight: lineHeight.snug, fontWeight: fontWeight.bold },
  display: { fontSize: fontSize['4xl'], lineHeight: lineHeight.tight, fontWeight: fontWeight.extrabold },
} as const;

/* ------------------------------------------------------------------ shadows */

/**
 * Web shadows are CSS strings; native shadows are React Native style props.
 * Keep both in sync so elevation reads the same on every platform.
 */
export const shadow = {
  none: { web: 'none', native: { elevation: 0 } },
  xs: {
    web: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
    native: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  },
  sm: {
    web: '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
    native: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  },
  md: {
    web: '0 4px 12px -2px rgba(15, 23, 42, 0.10), 0 2px 6px -2px rgba(15, 23, 42, 0.06)',
    native: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  },
  lg: {
    web: '0 10px 24px -6px rgba(15, 23, 42, 0.14), 0 4px 10px -4px rgba(15, 23, 42, 0.08)',
    native: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 8 },
  },
  xl: {
    web: '0 20px 40px -12px rgba(15, 23, 42, 0.18)',
    native: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 12 },
  },
} as const;

/* -------------------------------------------------------------- breakpoints */

/**
 * Mobile-first breakpoints. `xs` exists only for narrow-phone refinements
 * (320–360px Android devices); every other value follows Tailwind's defaults.
 */
export const breakpoints = {
  xs: 360,
  sm: 480,
  md: 640,
  lg: 768,
  xl: 1024,
  '2xl': 1280,
  '3xl': 1440,
} as const;

/* -------------------------------------------------------------------- motion */

export const duration = {
  instant: 90,
  fast: 140,
  base: 200,
  slow: 320,
  slower: 480,
} as const;

export const easing = {
  standard: [0.4, 0, 0.2, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
  emphasized: [0.2, 0, 0, 1] as const,
} as const;

export const spring = {
  gentle: { damping: 18, stiffness: 180, mass: 1 },
  snappy: { damping: 26, stiffness: 320, mass: 0.9 },
} as const;

/* ------------------------------------------------------------------- zIndex */

export const zIndex = {
  base: 0,
  sticky: 30,
  header: 40,
  bottomNav: 45,
  drawer: 60,
  modal: 70,
  popover: 80,
  toast: 90,
} as const;

/* ------------------------------------------------------------------- exports */

export const tokens = {
  colors: { green, amber, slate, red, blue, cyan, purple, paymentBrands, ...semanticColors },
  space,
  spacingAliases,
  layout,
  radius,
  componentRadius,
  fontFamily,
  fontSize,
  lineHeight,
  banglaLineHeight,
  fontWeight,
  textStyles,
  shadow,
  breakpoints,
  duration,
  easing,
  spring,
  zIndex,
} as const;

export type Tokens = typeof tokens;
export type SemanticColorName = keyof typeof semanticColors;
export type SpaceKey = keyof typeof space;
export type RadiusKey = keyof typeof radius;
export type FontSizeKey = keyof typeof fontSize;
export type ShadowKey = keyof typeof shadow;
export type BreakpointKey = keyof typeof breakpoints;
