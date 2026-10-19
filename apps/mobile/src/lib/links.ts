/**
 * Small route helper.
 *
 * The mock dataset stores web-style hrefs (`/category/smartphones`,
 * `/shop?sort=discount`). The native app routes differ, so every navigation from
 * fixture data goes through `resolveAppHref()` instead of guessing in a screen.
 */

import type { Href } from 'expo-router';

export interface ResolvedHref {
  pathname: string;
  params: Record<string, string>;
}

/** Query string -> params object, ignoring empty values. */
function parseQuery(query: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const pair of query.replace(/^\?/, '').split('&')) {
    if (!pair) continue;
    const [rawKey, rawValue = ''] = pair.split('=');
    if (!rawKey) continue;
    params[rawKey] = decodeURIComponent(rawValue);
  }
  return params;
}

/**
 * Maps a fixture href onto a native route:
 *  - `/category/<slug>`  -> `/categories/<slug>`
 *  - `/shop?...`, `/search?...` -> `/search` with the query preserved
 *  - `/product/<slug>`   -> `/product/<slug>`
 *  - `/wishlist`, `/cart`, `/account/orders`, `/brands` -> the matching tab or
 *    stack screen.
 */
export function resolveAppHref(href: string): ResolvedHref {
  const [path = '', query = ''] = href.split('?');
  const params = parseQuery(query);

  if (path.startsWith('/category/')) {
    return { pathname: `/categories/${path.replace('/category/', '')}`, params };
  }
  if (path.startsWith('/product/')) {
    return { pathname: path, params };
  }
  if (path === '/shop' || path === '/search') {
    return { pathname: '/search', params };
  }
  if (path === '/wishlist') {
    return { pathname: '/(tabs)/wishlist', params };
  }
  if (path === '/cart') {
    return { pathname: '/(tabs)/cart', params };
  }
  if (path === '/account/orders' || path === '/orders') {
    return { pathname: '/orders', params };
  }
  if (path === '/account') {
    return { pathname: '/(tabs)/account', params };
  }
  if (path === '/brands') {
    return { pathname: '/brands', params };
  }
  if (path === '/' || path === '') {
    return { pathname: '/(tabs)', params };
  }

  return { pathname: path, params };
}

/** Flat string form, handy for `router.push()` and toast actions. */
export function resolveAppHrefString(href: string): string {
  const { pathname, params } = resolveAppHref(href);
  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * `router.push()` argument for a fixture href.
 *
 * Fixture links are data, so their target cannot be known at compile time. The
 * mapping in `resolveAppHref()` above is the contract that guarantees the route
 * exists; this cast is the single boundary between that data and Expo Router's
 * generated `Href` union.
 */
export function resolveAppHrefTarget(href: string): Href {
  const { pathname, params } = resolveAppHref(href);
  return { pathname, params } as Href;
}
