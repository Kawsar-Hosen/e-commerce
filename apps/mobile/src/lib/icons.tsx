import type { LucideIcon } from 'lucide-react-native';
import {
  BookOpen,
  Dumbbell,
  Gem,
  House,
  LayoutGrid,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Tv,
  Watch,
} from 'lucide-react-native';
import {
  amber,
  blue,
  cyan,
  green,
  purple,
  slate,
} from '@shobdox/design-tokens';
import type { Category } from '@shobdox/shared-types';
import type { Theme } from './theme';

/**
 * Fixture icon keys -> Lucide components, plus the accent tints used by the
 * category tiles.
 *
 * The dataset stores icon *names* as strings (they come from the web app's icon
 * registry), so the native app maps them here instead of guessing inside a
 * screen. Unknown keys fall back to a generic grid icon — a demo category can
 * therefore always be added without touching the UI.
 */

const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Dumbbell,
  // The fixture uses the web app's `Home`; Lucide's native name is `House`.
  Home: House,
  House,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Tv,
  Watch,
  Gem,
};

export function categoryIcon(icon: string | undefined): LucideIcon {
  if (!icon) return LayoutGrid;
  return ICONS[icon] ?? LayoutGrid;
}

export interface AccentTint {
  background: string;
  foreground: string;
}

/** Category accent -> tinted chip colours, derived from the token ramps. */
export function accentTint(accent: Category['accent'], theme: Theme): AccentTint {
  if (theme.isDark) {
    const darkForeground: Record<Category['accent'], string> = {
      green: green[400],
      amber: amber[400],
      blue: blue[500],
      purple: purple[600],
      cyan: cyan[600],
      slate: slate[400],
    };
    return { background: theme.colors.surfaceMuted, foreground: darkForeground[accent] };
  }

  const lightTint: Record<Category['accent'], AccentTint> = {
    green: { background: green[100], foreground: green[700] },
    amber: { background: amber[100], foreground: amber[700] },
    blue: { background: blue[100], foreground: blue[700] },
    purple: { background: purple[100], foreground: purple[700] },
    cyan: { background: cyan[100], foreground: cyan[700] },
    slate: { background: slate[100], foreground: slate[600] },
  };

  return lightTint[accent];
}
