import { placeholderImage } from '@shobdox/shared-mock-data';

/**
 * Image helpers.
 *
 * Remote photography is hot-linked from a CDN. When a request fails (offline
 * demo, blocked CDN, deleted asset) the `<img>`/`<Image>` error handler swaps in
 * an inline SVG placeholder so the layout stays intact — no broken icon, no
 * collapsed grid cell.
 */

export { placeholderImage };

/** Placeholder sized for a product card / gallery tile. */
export function productPlaceholder(label: string): string {
  return placeholderImage(label, 480);
}

/** Applies the fallback exactly once, so a broken placeholder cannot loop. */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>, label?: string): void {
  const target = event.currentTarget;
  const fallback = productPlaceholder(label ?? target.alt ?? 'SHOBDOX');
  if (target.src === fallback) return;
  target.src = fallback;
  target.dataset['fallback'] = 'true';
}

/**
 * Sizes an Unsplash URL for a specific slot. Any other URL is returned as-is so
 * admin-entered image links keep working.
 */
export function sizedImage(url: string, width: number, height?: number): string {
  if (!url.includes('images.unsplash.com')) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('w', String(width));
    if (height) parsed.searchParams.set('h', String(height));
    return parsed.toString();
  } catch {
    return url;
  }
}
