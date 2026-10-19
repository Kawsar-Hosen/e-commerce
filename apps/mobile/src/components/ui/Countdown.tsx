import { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { getCountdownParts, toBanglaDigits } from '@shobdox/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

/**
 * Flash-sale clock.
 *
 * Counts down with a one-second tick that pauses while the app is in the
 * background (no point burning battery for an invisible timer). Parts come from
 * `getCountdownParts()` in the shared utils, so the digits match the website.
 */

export interface CountdownProps {
  target: string;
  prefix?: string;
  /** Larger typography for the flash-sale header. */
  size?: 'sm' | 'md';
}

function formatParts(target: string, now: Date): string {
  const { days, hours, minutes, seconds } = getCountdownParts(target, now);
  const pad = (value: number) => String(value).padStart(2, '0');
  const core = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return toBanglaDigits(days > 0 ? `${days}দিন ${core}` : core);
}

export function Countdown({ target, prefix, size = 'md' }: CountdownProps) {
  const theme = useTheme();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      if (timer) return;
      timer = setInterval(() => setNow(new Date()), 1_000);
    };
    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = undefined;
    };

    start();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setNow(new Date());
        start();
      } else {
        stop();
      }
    });

    return () => {
      stop();
      subscription.remove();
    };
  }, []);

  const { isComplete } = getCountdownParts(target, now);

  return (
    <View
      accessible
      accessibilityLabel={`${prefix ?? 'শেষ হবে'} ${isComplete ? 'সময় শেষ' : formatParts(target, now)}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.errorSoft,
        borderRadius: theme.radius.sm,
        paddingHorizontal: theme.space[2],
        paddingVertical: 2,
      }}
    >
      {prefix ? (
        <Text variant="caption" tone="error" weight="semibold">
          {prefix}
        </Text>
      ) : null}
      <Text
        variant={size === 'md' ? 'label' : 'caption'}
        tone="error"
        weight="bold"
        style={{ fontFamily: theme.font.mono }}
      >
        {isComplete ? 'সময় শেষ' : formatParts(target, now)}
      </Text>
    </View>
  );
}

/** Earliest flash-sale end in a set of products — the rail's clock target. */
export function earliestFlashSaleEnd(ends: Array<string | undefined>, fallbackHours = 18): string {
  const timestamps = ends
    .map((value) => (value ? new Date(value).getTime() : Number.NaN))
    .filter((value) => Number.isFinite(value)) as number[];

  if (timestamps.length === 0) {
    return new Date(Date.now() + fallbackHours * 3_600_000).toISOString();
  }
  return new Date(Math.min(...timestamps)).toISOString();
}
