import type { ReactNode } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

/**
 * Typography primitive.
 *
 * Bangla text needs more leading than Latin: conjuncts and matras sit above and
 * below the baseline. Every variant therefore pairs a token font size with one of
 * the `banglaLineHeight` multipliers from the design tokens.
 */

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subtitle'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'price'
  | 'priceLarge'
  | 'mono';

export type TextTone =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'primary'
  | 'accent'
  | 'error'
  | 'warning'
  | 'success'
  | 'info';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  /** Overrides the variant weight, e.g. a bold caption. */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right';
  children?: ReactNode;
}

interface VariantConfig {
  sizeKey: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '4xl';
  weight: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  leading: 'tight' | 'snug' | 'normal';
  mono?: boolean;
}

const VARIANTS: Record<TextVariant, VariantConfig> = {
  display: { sizeKey: '4xl', weight: 'extrabold', leading: 'tight' },
  title: { sizeKey: '2xl', weight: 'bold', leading: 'snug' },
  heading: { sizeKey: 'xl', weight: 'bold', leading: 'snug' },
  subtitle: { sizeKey: 'lg', weight: 'semibold', leading: 'snug' },
  body: { sizeKey: 'base', weight: 'regular', leading: 'normal' },
  bodyStrong: { sizeKey: 'base', weight: 'semibold', leading: 'normal' },
  label: { sizeKey: 'sm', weight: 'semibold', leading: 'snug' },
  caption: { sizeKey: 'xs', weight: 'medium', leading: 'snug' },
  price: { sizeKey: 'xl', weight: 'bold', leading: 'tight' },
  priceLarge: { sizeKey: '2xl', weight: 'extrabold', leading: 'tight' },
  mono: { sizeKey: 'base', weight: 'medium', leading: 'snug', mono: true },
};

export function Text({
  variant = 'body',
  tone = 'default',
  weight,
  align,
  style,
  children,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const config = VARIANTS[variant];

  const toneColor: Record<TextTone, string> = {
    default: theme.colors.text,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    inverse: theme.colors.textInverse,
    primary: theme.colors.primary,
    accent: theme.colors.accent,
    error: theme.colors.error,
    warning: theme.colors.warning,
    success: theme.colors.success,
    info: theme.colors.info,
  };

  const fontSize = theme.font.size[config.sizeKey];
  const resolvedWeight = theme.font.weight[weight ?? config.weight];

  return (
    <RNText
      {...rest}
      style={[
        {
          color: toneColor[tone],
          fontSize,
          // Rounded: Android ignores fractional line heights on some devices.
          lineHeight: Math.round(fontSize * theme.font.banglaLineHeight[config.leading]),
          fontWeight: resolvedWeight,
          fontFamily: config.mono ? theme.font.mono : theme.font.family,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
