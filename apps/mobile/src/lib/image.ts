/**
 * Image helpers shared by the `AppImage` component.
 *
 * Remote photographs come from the demo dataset; when a device is offline (or a
 * CDN is blocked) every image falls back to `placeholderImage()`, an inline SVG
 * data URI, so the layout never tears.
 */

import { placeholderImage } from '@shobdox/shared-mock-data';

export const IMAGE_PLACEHOLDER = placeholderImage('SHOBDOX');

/** True for the inline SVG data URIs produced by `placeholderImage()`. */
export function isInlineImage(uri: string | undefined): boolean {
  return Boolean(uri && uri.startsWith('data:'));
}

/** Picks the first usable URI from a list, else the placeholder. */
export function firstImage(...candidates: Array<string | undefined>): string {
  return candidates.find((uri) => Boolean(uri && uri.length > 0)) ?? IMAGE_PLACEHOLDER;
}

export function fallbackImage(label?: string): string {
  return label ? placeholderImage(label) : IMAGE_PLACEHOLDER;
}

export { placeholderImage };
