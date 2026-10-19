/**
 * Ultra-light analytics shim.
 *
 * The demo sends nothing over the network. Events are only logged in
 * development and kept in a small in-memory buffer, which is enough to prove the
 * wiring a real SDK would need later.
 */

export type AnalyticsEvent =
  | 'app_open'
  | 'screen_view'
  | 'product_view'
  | 'add_to_cart'
  | 'buy_now'
  | 'checkout_start'
  | 'order_placed'
  | 'search'
  | 'wishlist_toggle'
  | 'coupon_apply'
  | 'demo_reset';

interface AnalyticsEntry {
  event: AnalyticsEvent;
  at: string;
  properties?: Record<string, string | number | boolean | undefined>;
}

const BUFFER_LIMIT = 50;
const buffer: AnalyticsEntry[] = [];

export function track(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean | undefined>,
): void {
  const entry: AnalyticsEntry = { event, at: new Date().toISOString(), properties };
  buffer.push(entry);
  if (buffer.length > BUFFER_LIMIT) buffer.shift();

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event}`, properties ?? '');
  }
}

export function trackScreenView(screen: string, properties?: Record<string, string | number>): void {
  track('screen_view', { screen, ...properties });
}

/** Recent events, newest first — surfaced in the account screen's demo panel. */
export function recentEvents(limit = 10): AnalyticsEntry[] {
  return [...buffer].reverse().slice(0, limit);
}

export function clearEvents(): void {
  buffer.length = 0;
}
