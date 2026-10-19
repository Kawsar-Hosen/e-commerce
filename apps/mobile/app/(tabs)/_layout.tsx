import { Tabs } from 'expo-router/js-tabs';
import { Heart, House, LayoutGrid, ShoppingBag, User } from 'lucide-react-native';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { useTheme } from '../../src/hooks/useTheme';
import { useCartCount } from '../../src/hooks/useCart';
import { useWishlistStore } from '../../src/store/wishlist.store';

/**
 * Bottom tab bar.
 *
 * Five destinations, Bangla labels and live badges: the cart shows the number of
 * units in it and the wishlist shows how many products are saved. Icons come
 * from Lucide, colours from the design tokens.
 */

export default function TabsLayout() {
  const theme = useTheme();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistStore((state) => state.productIds.length);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 58 + theme.space[1],
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: theme.font.size.xs,
          fontWeight: theme.font.weight.semibold as never,
        },
        tabBarBadgeStyle: {
          backgroundColor: theme.colors.accent,
          color: theme.colors.onAccent,
          fontSize: theme.font.size.xs,
          fontWeight: theme.font.weight.bold as never,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'হোম',
          tabBarAccessibilityLabel: 'হোম',
          tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'ক্যাটাগরি',
          tabBarAccessibilityLabel: 'ক্যাটাগরি',
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'উইশলিস্ট',
          tabBarAccessibilityLabel: 'উইশলিস্ট',
          tabBarBadge: wishlistCount > 0 ? toBanglaDigits(wishlistCount) : undefined,
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'কার্ট',
          tabBarAccessibilityLabel:
            cartCount > 0 ? `কার্ট, ${toBanglaDigits(cartCount)} টি পণ্য` : 'কার্ট, খালি',
          tabBarBadge: cartCount > 0 ? toBanglaDigits(cartCount) : undefined,
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'অ্যাকাউন্ট',
          tabBarAccessibilityLabel: 'অ্যাকাউন্ট',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
