import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import type { Product } from '@shobdox/shared-types';
import { cn } from '@/lib/cn';
import { Modal, SmartImage } from '@/components/ui';
import { toBanglaDigits } from '@shobdox/shared-utils';

/**
 * Product image gallery.
 *
 * The thumbnail row is a list of buttons (keyboard reachable) rather than a
 * scroll rail, and the enlarged view is the shared `Modal` so Escape, focus and
 * scroll-locking behave exactly like every other overlay in the app.
 */

export function ProductGallery({
  product,
  variantImage,
  className,
}: {
  product: Product;
  /** Photo carried by the currently selected variant, if any. */
  variantImage?: string;
  className?: string;
}) {
  const images = useMemo(() => {
    const base = product.images.length > 0
      ? product.images
      : [{ id: `${product.id}-fallback`, url: product.thumbnail, alt: product.title }];

    if (variantImage && !base.some((image) => image.url === variantImage)) {
      return [{ id: `${product.id}-variant`, url: variantImage, alt: product.title }, ...base];
    }

    return base;
  }, [product.id, product.images, product.thumbnail, product.title, variantImage]);

  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  // A variant with its own photo should be shown immediately.
  useEffect(() => {
    if (!variantImage) return;
    const found = images.findIndex((image) => image.url === variantImage);
    if (found >= 0) setIndex(found);
  }, [variantImage, images]);

  const active = images[index] ?? images[0];
  const total = images.length;

  const step = (delta: number) => {
    setIndex((current) => (current + delta + total) % total);
  };

  if (!active) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative overflow-hidden rounded-panel border border-border bg-surface">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="block w-full"
          aria-label="ছবিটি বড় করে দেখুন"
        >
          <SmartImage
            src={active.url}
            alt={active.alt || product.titleBn || product.title}
            fallbackLabel={product.titleBn ?? product.title}
            priority
            withSkeleton
            className="aspect-square w-full"
          />
        </button>

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="আগের ছবি"
              className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/90 text-text-primary shadow-sm hover:bg-surface"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="পরের ছবি"
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/90 text-text-primary shadow-sm hover:bg-surface"
            >
              <ChevronRight aria-hidden className="size-4" />
            </button>
          </>
        ) : null}

        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-chip bg-surface-inverse/85 px-2 py-1 font-num text-xs text-text-inverse">
          <Maximize2 aria-hidden className="size-3" />
          {toBanglaDigits(index + 1)}/{toBanglaDigits(total)}
        </span>
      </div>

      {total > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="পণ্যের ছবি">
          {images.map((image, imageIndex) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(imageIndex)}
                aria-label={`ছবি ${toBanglaDigits(imageIndex + 1)} দেখান`}
                aria-current={imageIndex === index}
                className={cn(
                  'block size-16 overflow-hidden rounded-image border-2 transition-colors sm:size-20',
                  imageIndex === index ? 'border-primary' : 'border-border hover:border-border-strong',
                )}
              >
                <SmartImage
                  src={image.url}
                  alt={image.alt || product.titleBn || product.title}
                  fallbackLabel={product.title}
                  className="size-full"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Modal
        open={zoomed}
        onClose={() => setZoomed(false)}
        title={product.titleBn ?? product.title}
        size="xl"
      >
        <SmartImage
          src={active.url}
          alt={active.alt || product.titleBn || product.title}
          fallbackLabel={product.title}
          priority
          className="max-h-[70vh] w-full rounded-card object-contain"
        />
      </Modal>
    </div>
  );
}
