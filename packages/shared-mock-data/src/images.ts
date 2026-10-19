/**
 * Demo imagery.
 *
 * Every remote photograph below was verified to return HTTP 200 before being
 * committed, so the demo can never render a broken image. On top of that each
 * `<img>`/`<Image>` in the apps falls back to `placeholderImage()`, an inline
 * SVG data URI, so a blocked network still produces a designed layout rather
 * than a torn one.
 *
 * Photographs are hot-linked from Unsplash's CDN under the Unsplash licence.
 */

const UNSPLASH_PREFIX = 'https://images.unsplash.com/photo-';

export interface ImageSizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  /** `crop` produces square-ish product tiles; `fit` keeps the full frame. */
  mode?: 'crop' | 'fit';
}

/** Builds an optimised, correctly sized Unsplash CDN URL. */
export function photo(id: string, options: ImageSizeOptions = {}): string {
  const { width = 800, height = 800, quality = 78, mode = 'crop' } = options;
  const params = new URLSearchParams({
    auto: 'format',
    cs: 'tinysrgb',
    q: String(quality),
    w: String(width),
  });
  if (mode === 'crop') {
    params.set('fit', 'crop');
    params.set('h', String(height));
  }
  return `${UNSPLASH_PREFIX}${id}?${params.toString()}`;
}

/**
 * Verified photo ids grouped by subject, so a product always pulls gallery
 * images that plausibly belong together.
 */
export const PHOTO_POOLS = {
  audio: ['1505740420928-5e560c06d30e', '1587829741301-dc798b83add3', '1484704849700-f032a568e944', '1508685096489-7aacd43bd3b1', '1583394838336-acd977736f90'],
  wearables: ['1523275335684-37898b6baf30', '1523170335258-f5ed11844a49', '1547949003-9792a18a2601', '1608043152269-423dbba4e7e1', '1546868871-7041f2a55e12'],
  phones: ['1511707171634-5f897ff02aa9', '1512499617640-c74ae3a79d37', '1580910051074-3eb694886505'],
  computers: ['1496181133206-80ce9b88a853', '1517336714731-489689fd1ca8', '1588872657578-7efd1f1555ed', '1526170375885-4d8ecf77b99f'],
  footwear: ['1542291026-7eec264c27ff', '1549298916-b41d501d3772', '1560769629-975ec94e6a86'],
  mensFashion: ['1521572163474-6864f9cf17ab', '1576566588028-4147f3842f27', '1620799140408-edc6dcb6d633', '1489987707025-afc232f7ea0f', '1554568218-0f1715e72254', '1607083206968-13611e3d76db'],
  womensFashion: ['1596755094514-f87e34085b2c', '1490481651871-ab68de25d43d', '1483985988355-763728e1935b', '1445205170230-053b83016050', '1560243563-062bfc001d68', '1539109136881-3be0616acf4b'],
  beauty: ['1594633312681-425c7b97ccd1', '1571781926291-c477ebfd024b', '1556228720-195a672e8a03', '1522335789203-aabd1fc54bc9', '1585386959984-a4155224a1ad', '1596040033229-a9821ebd058d'],
  homeLiving: ['1556909212-d5b604d0c90d', '1616486338812-3dadae4b4ace', '1555041469-a586c61ea9bc', '1586023492125-27b2c045efd7', '1524758631624-e2822e304c36', '1519710164239-da123dc03ef4'],
  kitchen: ['1583847268964-b28dc8f51f92', '1556909114-f6e7ad7d3136', '1587049352846-4a222e784d38'],
  grocery: ['1586201375761-83865001e31c', '1542838132-92c53300491e', '1567401893414-76b7b1e5a7a5', '1604719312566-8912e9227c6a', '1468495244123-6c6c332eeece', '1583258292688-d0213dc5a3a8'],
  books: ['1512820790803-83ca734da794', '1544947950-fa07a98d237f', '1584100936595-c0654b55a2e2', '1495446815901-a7297e633e8d'],
  sports: ['1517836357463-d25dfeac3438', '1571019613454-1cb2f99b2d8b', '1461896836934-ffe607ba8211', '1517649763962-0c623066013b', '1571902943202-507ec2618e8f'],
  bags: ['1553062407-98eeb64c6a62', '1548036328-c9fa89d128fa', '1552674605-db6ffd4facb5', '1590874103328-eac38a683ce7'],
  eyewear: ['1511499767150-a48a237f0083', '1572635196237-14b3f281503f'],
  retail: ['1441986300917-64674bd600d8', '1472851294608-062f824d29cc'],
} as const;

export type PhotoPoolName = keyof typeof PHOTO_POOLS;

/** Returns the first `count` photos from a pool as ready-to-use URLs. */
export function poolPhotos(pool: PhotoPoolName, count = 4, options?: ImageSizeOptions): string[] {
  return PHOTO_POOLS[pool].slice(0, count).map((id) => photo(id, options));
}

/** Deterministic stand-in photo for anything without curated artwork. */
export function seededPhoto(seed: string, options?: ImageSizeOptions): string {
  const { width = 800, height = 800 } = options ?? {};
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

/**
 * Inline SVG used as the `onError` fallback everywhere an image is rendered.
 * Keeps the layout intact when the device is offline or a CDN is blocked.
 */
export function placeholderImage(label = 'SHOBDOX', size = 400): string {
  const text = label.slice(0, 22).replace(/[<>&]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="#F0FDF4"/><stop offset="100%" stop-color="#DCFCE7"/>
</linearGradient></defs>
<rect width="${size}" height="${size}" fill="url(#g)"/>
<circle cx="${size / 2}" cy="${size / 2 - 18}" r="${size / 9}" fill="#166534" opacity="0.14"/>
<text x="50%" y="${size / 2 + 26}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${size / 16}" font-weight="700" fill="#166534" opacity="0.75">${text}</text>
<text x="50%" y="${size / 2 + 52}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${size / 34}" fill="#166534" opacity="0.5">শব্দক্স</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Square category/brand tiles. */
export function categoryImage(pool: PhotoPoolName, seed: number): string {
  const id = PHOTO_POOLS[pool][seed % PHOTO_POOLS[pool].length];
  return photo(id ?? PHOTO_POOLS[pool][0], { width: 600, height: 450 });
}

/** Wide promotional artwork for hero banners and strips. */
export function bannerImage(pool: PhotoPoolName, seed = 0): string {
  const id = PHOTO_POOLS[pool][seed % PHOTO_POOLS[pool].length];
  return photo(id ?? PHOTO_POOLS[pool][0], { width: 1400, height: 700, quality: 72 });
}
