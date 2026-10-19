import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

/**
 * Surface container. Elevation comes from the token shadow scale so cards read
 * the same as they do on the website.
 */

export interface CardProps {
  children: ReactNode;
  /** `flat` keeps the border, `raised` adds the md elevation token. */
  elevation?: 'none' | 'flat' | 'raised' | 'floating';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Card({ children, elevation = 'flat', padded = true, style, accessibilityLabel }: CardProps) {
  const theme = useTheme();

  const shadowStyle =
    elevation === 'raised'
      ? theme.shadow.md
      : elevation === 'floating'
        ? theme.shadow.lg
        : {};

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: elevation === 'flat' ? 1 : 0,
          borderRadius: theme.componentRadius.card,
          padding: padded ? theme.space[4] : 0,
        },
        shadowStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
