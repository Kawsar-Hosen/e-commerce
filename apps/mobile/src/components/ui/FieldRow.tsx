import { Children, type ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

/**
 * Responsive form row.
 *
 * Stacks its children on a phone and lays them out side by side from a window
 * width of `breakpoint`, which keeps long Bangla address fields readable on a
 * tablet without a second layout.
 */

export interface FieldRowProps {
  children: ReactNode;
  /** Window width from which the row becomes horizontal. */
  breakpoint?: number;
}

export function FieldRow({ children, breakpoint = 600 }: FieldRowProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const items = Children.toArray(children);

  if (width < breakpoint) {
    return <View style={{ gap: theme.space[3] }}>{items}</View>;
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.space[3] }}>
      {items.map((child, index) => (
        // Positional key: the row only groups sibling fields.
        <View key={index} style={{ flex: 1 }}>
          {child}
        </View>
      ))}
    </View>
  );
}
