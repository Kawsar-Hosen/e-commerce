/**
 * @shobdox/shared-business-logic
 *
 * Every calculation the SHOBDOX interface performs lives here: pricing, cart
 * totals, delivery fees, coupon validation, the order state machine, search,
 * analytics rollups, commission and recommendations.
 *
 * Neither the website nor the Android app re-implements these rules, so the two
 * platforms can never disagree about money, stock or order status.
 */
export * from './pricing';
export * from './stock';
export * from './variants';
export * from './coupon';
export * from './cart';
export * from './orders';
export * from './search';
export * from './analytics';
export * from './commission';
export * from './recommendations';
