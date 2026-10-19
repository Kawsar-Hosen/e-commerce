import type { Banner } from '@shobdox/shared-types';
import { cn } from '@/lib/cn';

/**
 * Token-coloured preview of a hero/strip banner.
 *
 * The storefront renders banners from the same four theme tokens, so this block
 * shows roughly what the customer will see — no artwork required.
 */

const THEME_STYLES: Record<Banner['theme'], { wrapper: string; eyebrow: string; button: string }> = {
  primary: {
    wrapper: 'bg-primary text-on-primary',
    eyebrow: 'text-on-primary/80',
    button: 'bg-surface text-primary',
  },
  accent: {
    wrapper: 'bg-accent text-on-accent',
    eyebrow: 'text-on-accent/80',
    button: 'bg-surface-inverse text-text-inverse',
  },
  dark: {
    wrapper: 'bg-surface-inverse text-text-inverse',
    eyebrow: 'text-text-inverse/70',
    button: 'bg-accent text-on-accent',
  },
  soft: {
    wrapper: 'bg-surface-muted text-text-primary',
    eyebrow: 'text-text-secondary',
    button: 'bg-primary text-on-primary',
  },
};

export function BannerPreview({
  title,
  subtitle,
  ctaLabel,
  theme,
  placementLabel,
  className,
}: {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  theme: Banner['theme'];
  placementLabel?: string;
  className?: string;
}) {
  const styles = THEME_STYLES[theme];

  return (
    <div
      role="group"
      aria-label="ব্যানার প্রিভিউ"
      className={cn('overflow-hidden rounded-card p-4 shadow-xs', styles.wrapper, className)}
    >
      {placementLabel ? (
        <p className={cn('text-xs font-semibold uppercase tracking-wide', styles.eyebrow)}>{placementLabel}</p>
      ) : null}

      <p className="mt-1 text-2xl font-bold leading-snug">{title?.trim() || 'ব্যানারের শিরোনাম'}</p>
      <p className={cn('mt-1 max-w-xl text-sm', styles.eyebrow)}>
        {subtitle?.trim() || 'ব্যানারের উপশিরোনাম এখানে দেখা যাবে।'}
      </p>

      <span
        className={cn(
          'mt-3 inline-flex h-9 items-center rounded-button px-3 text-sm font-medium',
          styles.button,
        )}
      >
        {ctaLabel?.trim() || 'অ্যাকশন'}
      </span>
    </div>
  );
}
