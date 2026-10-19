import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '@shobdox/shared-types';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { SmartImage } from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks/useCommon';

/**
 * Hero carousel.
 *
 * Auto-advances only when the visitor has not asked for reduced motion, pauses
 * on hover/focus, and always offers dots plus previous/next buttons so the
 * carousel is fully operable by keyboard.
 */

const THEMES: Record<Banner['theme'], string> = {
  primary: 'bg-primary text-on-primary',
  accent: 'bg-accent text-on-accent',
  dark: 'bg-surface-inverse text-text-inverse',
  soft: 'bg-primary-soft text-primary-dark',
};

export function HomeHero({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const total = banners.length;

  const go = useCallback(
    (delta: number) => {
      if (total === 0) return;
      setIndex((current) => (current + delta + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (reduceMotion || paused || total <= 1) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % total), 7_000);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, total]);

  if (total === 0) return null;

  const banner = banners[index] ?? banners[0];
  if (!banner) return null;

  return (
    <section
      aria-label="প্রধান প্রচার"
      aria-roledescription="ক্যারোসেল"
      className="relative overflow-hidden rounded-panel border border-border"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={cn('grid items-center gap-6 p-5 sm:p-7 lg:grid-cols-[1.1fr_1fr] lg:p-9', THEMES[banner.theme])}>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
            SHOBDOX · ডেমো ক্যাম্পেইন
          </p>

          <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">{banner.title}</h1>
          <p className="mt-2 max-w-lg text-base leading-relaxed opacity-90">{banner.subtitle}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to={banner.href}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-button px-5 text-base font-semibold transition-colors',
                banner.theme === 'soft'
                  ? 'bg-primary text-on-primary hover:bg-primary-dark'
                  : 'bg-surface text-text-primary hover:bg-surface-muted',
              )}
            >
              {banner.ctaLabel}
              <ArrowRight aria-hidden className="size-4" />
            </Link>

            <Link
              to="/shop"
              className="inline-flex h-11 items-center rounded-button border border-current/30 px-5 text-base font-medium hover:bg-black/5"
            >
              সব পণ্য দেখুন
            </Link>
          </div>
        </div>

        <div className="relative hidden overflow-hidden rounded-card bg-black/5 sm:block">
          <SmartImage
            src={banner.image ?? ''}
            alt={banner.title}
            fallbackLabel={banner.title}
            priority
            withSkeleton
            className="aspect-[4/3] w-full lg:aspect-[5/4]"
          />
        </div>
      </div>

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="আগের স্লাইড"
            className="absolute left-3 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/85 text-text-primary shadow-sm hover:bg-surface sm:flex"
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="পরের স্লাইড"
            className="absolute right-3 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/85 text-text-primary shadow-sm hover:bg-surface sm:flex"
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((item, dotIndex) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(dotIndex)}
                aria-label={`স্লাইড ${dotIndex + 1} দেখান`}
                aria-current={dotIndex === index}
                className={cn(
                  'h-2 rounded-full transition-all',
                  dotIndex === index ? 'w-6 bg-primary' : 'w-2 bg-surface-inverse/40 hover:bg-surface-inverse/60',
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

/** Smaller promotional cards for the "strip" placement banners. */
export function PromoStrip({ banners, className }: { banners: Banner[]; className?: string }) {
  if (banners.length === 0) return null;

  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-3', className)}>
      {banners.map((banner) => (
        <li key={banner.id}>
          <Link
            to={banner.href}
            className={cn(
              'flex h-full items-center justify-between gap-3 rounded-card border border-border p-4 transition-shadow hover:shadow-md',
              THEMES[banner.theme],
            )}
          >
            <span className="min-w-0">
              <span className="block text-base font-bold">{banner.title}</span>
              <span className="mt-0.5 block text-sm opacity-90">{banner.subtitle}</span>
            </span>
            <ArrowRight aria-hidden className="size-5 shrink-0 opacity-80" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
