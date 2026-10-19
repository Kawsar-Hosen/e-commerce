import type { ImgHTMLAttributes } from 'react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { handleImageError, productPlaceholder } from '@/lib/media';

/**
 * The only <img> wrapper in the app.
 *
 * - `loading="lazy"` + `decoding="async"` by default (opt out above the fold)
 * - swaps a broken CDN request for an inline SVG placeholder, once
 * - keeps a soft background so a slow image never collapses the layout
 */

export interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  /** Text drawn inside the fallback placeholder. */
  fallbackLabel?: string;
  /** Above-the-fold images should pass `eager` so LCP is not delayed. */
  priority?: boolean;
  /** Adds the skeleton shimmer until the image has decoded. */
  withSkeleton?: boolean;
}

export function SmartImage({
  src,
  alt = '',
  className,
  fallbackLabel,
  priority = false,
  withSkeleton = false,
  ...rest
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      draggable={false}
      className={cn(
        'bg-surface-muted object-cover',
        withSkeleton && !loaded && !failed && 'skeleton',
        className,
      )}
      onLoad={() => setLoaded(true)}
      onError={(event) => {
        setFailed(true);
        handleImageError(event, fallbackLabel ?? alt);
      }}
      {...rest}
    />
  );
}

/** Product avatar used in tables and order rows. */
export function Thumb({
  src,
  alt,
  className,
  label,
}: {
  src?: string;
  alt: string;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        'block size-12 shrink-0 overflow-hidden rounded-image border border-border bg-surface-muted',
        className,
      )}
    >
      <SmartImage
        src={src || productPlaceholder(label ?? alt)}
        alt={alt}
        className="size-full"
        fallbackLabel={label ?? alt}
      />
    </span>
  );
}
