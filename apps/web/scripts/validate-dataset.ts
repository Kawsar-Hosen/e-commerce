/**
 * Dataset integrity check.
 *
 *   cd apps/web && npx vite build --ssr scripts/validate-dataset.ts --outDir ../../.tmp/validate
 *   node ../../.tmp/validate/validate-dataset.js
 *
 * Exits non-zero when a demo fixture is internally inconsistent (dangling
 * category/brand/seller ids, a product without variants, duplicate order
 * numbers, coupons that can never apply, prices that do not match the variant
 * rows ...). Run it after editing anything in `packages/shared-mock-data`.
 */
import {
  MOCK_BANNERS,
  MOCK_BRANDS,
  MOCK_CATEGORIES,
  MOCK_COUPONS,
  MOCK_CUSTOMERS,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_SELLERS,
} from '@shobdox/shared-mock-data';
import {
  computeCartTotals,
  repriceCartItems,
  runProductQuery,
  validateCoupon,
  productPriceRange,
  recalculateProduct,
} from '@shobdox/shared-business-logic';
import { ORDER_STATUS_LABELS } from '@shobdox/shared-types';

const problems: string[] = [];
const notes: string[] = [];

function check(condition: boolean, message: string): void {
  if (!condition) problems.push(message);
}

/* --------------------------------------------------------------- catalogue */

check(MOCK_PRODUCTS.length >= 24, `only ${MOCK_PRODUCTS.length} products (need 24+)`);
notes.push(`products: ${MOCK_PRODUCTS.length}`);

const slugs = new Set<string>();
const productIds = new Set<string>();

for (const product of MOCK_PRODUCTS) {
  check(!slugs.has(product.slug), `duplicate product slug: ${product.slug}`);
  check(!productIds.has(product.id), `duplicate product id: ${product.id}`);
  slugs.add(product.slug);
  productIds.add(product.id);

  check(product.variants.length > 0, `${product.slug}: no variants`);
  check(Boolean(product.thumbnail), `${product.slug}: empty thumbnail`);
  check(product.images.length > 0, `${product.slug}: no images`);
  for (const image of product.images) {
    check(/^https:\/\//.test(image.url), `${product.slug}: non-https image ${image.url}`);
  }

  const range = productPriceRange(product);
  check(
    product.price === range.min,
    `${product.slug}: product.price (${product.price}) !== cheapest variant (${range.min})`,
  );

  const totalFromVariants = product.variants.reduce((total, variant) => total + variant.stock, 0);
  check(
    product.stock === totalFromVariants,
    `${product.slug}: stock ${product.stock} !== variant total ${totalFromVariants}`,
  );

  const recalculated = recalculateProduct(product);
  check(
    recalculated.discountPercent === product.discountPercent,
    `${product.slug}: discount badge drifted (${product.discountPercent} vs ${recalculated.discountPercent})`,
  );

  // A product with options must expose a variant for every combination.
  if (product.options.length > 0) {
    const combinations = product.options.reduce((total, option) => total * option.values.length, 1);
    check(
      product.variants.length === combinations,
      `${product.slug}: ${product.variants.length} variants for ${combinations} combinations`,
    );
  }

  // Option values referenced by variants must exist.
  for (const variant of product.variants) {
    for (const [optionId, valueId] of Object.entries(variant.optionValues)) {
      const option = product.options.find((candidate) => candidate.id === optionId);
      check(Boolean(option), `${product.slug}: variant references unknown option ${optionId}`);
      check(
        Boolean(option?.values.some((value) => value.id === valueId)),
        `${product.slug}: variant references unknown value ${valueId}`,
      );
    }
  }
}

const categoryIds = new Set(MOCK_CATEGORIES.map((category) => category.id));
const brandIds = new Set(MOCK_BRANDS.map((brand) => brand.id));
const sellerIds = new Set(MOCK_SELLERS.map((seller) => seller.id));

for (const product of MOCK_PRODUCTS) {
  check(categoryIds.has(product.categoryId), `${product.slug}: unknown category ${product.categoryId}`);
  if (product.brandId) check(brandIds.has(product.brandId), `${product.slug}: unknown brand ${product.brandId}`);
  check(sellerIds.has(product.sellerId), `${product.slug}: unknown seller ${product.sellerId}`);
}

for (const seller of MOCK_SELLERS) {
  check(
    seller.commissionRate > 0 && seller.commissionRate < 30,
    `seller ${seller.slug}: implausible commission ${seller.commissionRate}`,
  );
}

/* ------------------------------------------------------------------ orders */

const orderNumbers = new Set<string>();
check(MOCK_ORDERS.length >= 10, `only ${MOCK_ORDERS.length} demo orders`);
notes.push(`orders: ${MOCK_ORDERS.length}`);

for (const order of MOCK_ORDERS) {
  check(!orderNumbers.has(order.orderNumber), `duplicate order number ${order.orderNumber}`);
  orderNumbers.add(order.orderNumber);
  check(order.items.length > 0, `${order.orderNumber}: no line items`);
  check(
    Boolean(ORDER_STATUS_LABELS[order.status]),
    `${order.orderNumber}: unknown status ${order.status}`,
  );

  // Recomputed exactly the way the cart page does it: same line items, same
  // coupon and the order's own delivery address, so a fee or discount rule
  // change that breaks an order total is caught here.
  const recomputed = computeCartTotals({
    items: order.items,
    coupon: order.couponCode
      ? MOCK_COUPONS.find((candidate) => candidate.code === order.couponCode)
      : undefined,
    address: order.shippingAddress,
    deliveryMethodId: order.deliveryMethod,
  });
  check(
    Math.abs(recomputed.total - order.totals.total) <= 2,
    `${order.orderNumber}: stored total ${order.totals.total} vs recomputed ${recomputed.total}`,
  );
  check(
    recomputed.subtotal === order.totals.subtotal,
    `${order.orderNumber}: subtotal drift ${order.totals.subtotal} vs ${recomputed.subtotal}`,
  );

  for (const item of order.items) {
    check(
      typeof item.unitPrice === 'number' && item.unitPrice > 0,
      `${order.orderNumber}: bad unit price on ${item.productId}`,
    );
  }
}

notes.push(`order numbers unique: ${orderNumbers.size}`);

/* ----------------------------------------------------------------- coupons */

for (const coupon of MOCK_COUPONS) {
  check(coupon.code === coupon.code.toUpperCase(), `coupon ${coupon.code} is not uppercase`);
  check(new Date(coupon.expiresAt) > new Date(coupon.startsAt), `coupon ${coupon.code}: invalid window`);
}

const usableCoupon = MOCK_COUPONS.find((coupon) => coupon.isActive && coupon.type !== 'free-delivery');
if (usableCoupon) {
  const result = validateCoupon(usableCoupon, {
    items: MOCK_ORDERS[0]?.items ?? [],
    subtotal: MOCK_ORDERS[0]?.totals.subtotal ?? 0,
  });
  notes.push(`sample coupon ${usableCoupon.code}: ${result.valid ? `valid, saves ৳${result.discountAmount}` : result.message}`);
}

/* ----------------------------------------------------------------- banners */

for (const banner of MOCK_BANNERS) {
  check(Boolean(banner.title), `banner ${banner.id}: empty title`);
}

/* --------------------------------------------------------------- customers */

for (const customer of MOCK_CUSTOMERS) {
  check(/^01\d{9}$/.test(customer.phone), `customer ${customer.id}: phone ${customer.phone}`);
  check(customer.addresses.length > 0, `customer ${customer.id}: no saved address`);
}

/* ------------------------------------------------------- search + pricing */

const sample = MOCK_PRODUCTS[0]!;
const queryResult = runProductQuery(
  MOCK_PRODUCTS,
  { query: '', categoryIds: [sample.categoryId] },
  { categories: MOCK_CATEGORIES, brands: MOCK_BRANDS },
  1,
  12,
);
check(queryResult.items.length > 0, `category query for ${sample.categoryId} returned nothing`);
notes.push(`category query: ${queryResult.total} matches for ${sample.categoryId}`);

const reprice = repriceCartItems(MOCK_ORDERS[0]?.items ?? [], MOCK_PRODUCTS);
check(reprice.length === (MOCK_ORDERS[0]?.items.length ?? 0), 'reprice changed the number of lines');

/* ------------------------------------------------------------------ report */

console.log(notes.map((note) => `• ${note}`).join('\n'));

if (problems.length > 0) {
  console.error(`\n✖ ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log('\n✓ demo dataset is internally consistent');
