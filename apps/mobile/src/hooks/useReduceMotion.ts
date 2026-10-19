import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Honours the OS "remove animations" setting.
 *
 * Screens must not animate when this is `true`: shimmer skeletons become static
 * blocks, sheets and toasts appear instantly and the countdown stops pulsing.
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (mounted) setReduceMotion(enabled);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

/** Small helper for one-off checks inside handlers. */
export function useMotionDuration(milliseconds: number): number {
  const reduceMotion = useReduceMotion();
  const resolve = useCallback(() => (reduceMotion ? 0 : milliseconds), [reduceMotion, milliseconds]);
  return resolve();
}
