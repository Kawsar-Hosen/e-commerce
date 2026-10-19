/**
 * @shobdox/shared-mock-data
 *
 * The deterministic demo dataset behind every screen in the project: products,
 * categories, brands, sellers, customers, orders, coupons, banners and the
 * derived analytics that the dashboards read.
 *
 * There is no backend in this phase. Nothing in this package performs I/O, and
 * the web/mobile service modules read from it through interfaces that a real API
 * can implement later.
 */
export * from './images';
export * from './categories';
export * from './brands';
export * from './people';
export * from './coupons';
export * from './content';
export * from './product-builder';
export * from './product-seeds';
export * from './products';
export * from './orders';
export * from './notifications';
