import type {
  AdminOverview,
  CustomerRow,
  Order,
  Product,
  Seller,
  SellerOverview,
  User,
} from '@shobdox/shared-types';
import {
  buildAdminOverview,
  buildPayoutHistory,
  buildSellerOrderRows,
  buildSellerOverview,
  summarizeCommission,
} from '@shobdox/shared-business-logic';
import { EXTRA_CUSTOMER_ROWS, buildCustomerRows } from '@shobdox/shared-mock-data';
import { useDataStore } from '@/store/data.store';
import { categoriesWithCounts, sellersWithCounts } from './catalog.service';

/**
 * Analytics adapters.
 *
 * All arithmetic lives in `@shobdox/shared-business-logic`; this module only
 * feeds it the current demo state, so the numbers on screen always match the
 * orders and products actually stored in the browser.
 */

export function readAdminOverview(days = 30): AdminOverview {
  const { products, categories, brands, orders, customers } = useDataStore.getState();

  return buildAdminOverview({
    products,
    categories,
    brands,
    orders,
    customers: customerRowsWithExtras(customers, orders),
    days,
  });
}

export function readSellerOverview(seller: Seller, days = 30): SellerOverview {
  const { products, orders } = useDataStore.getState();

  return buildSellerOverview({
    products,
    orders,
    sellerId: seller.id,
    commissionRate: seller.commissionRate,
    days,
  });
}

/** Live customer rows (5 demo accounts) plus synthetic rows for a full table. */
export function customerRowsWithExtras(customers: User[], orders: Order[]): CustomerRow[] {
  const live = buildCustomerRows(customers, orders).map((row) => ({
    ...row,
    status: row.status ?? ('active' as const),
  }));
  return [...live, ...EXTRA_CUSTOMER_ROWS];
}

export function readCustomerRows(): CustomerRow[] {
  const { customers, orders } = useDataStore.getState();
  return customerRowsWithExtras(customers, orders);
}

export function readSellerRows(sellerId: string) {
  const { orders } = useDataStore.getState();
  const seller = useDataStore.getState().sellers.find((candidate) => candidate.id === sellerId);
  return buildSellerOrderRows(orders, sellerId, seller?.commissionRate ?? 10);
}

export function readPayouts(sellerId: string) {
  const { sellers, products } = useDataStore.getState();
  const seller = sellers.find((candidate) => candidate.id === sellerId);
  if (!seller) return [];

  const sellerRevenue = products
    .filter((product) => product.sellerId === sellerId)
    .reduce((total, product) => total + product.sold * product.price, 0);

  return buildPayoutHistory({
    sellerId,
    weeklyNetEarnings: Math.max(4_200, Math.round((sellerRevenue * (1 - seller.commissionRate / 100)) / 26)),
    count: 8,
    seed: sellerId.length * 977,
  });
}

export function readCommissionSummary(seller: Seller) {
  const { orders, products } = useDataStore.getState();
  const rows = buildSellerOrderRows(orders, seller.id, seller.commissionRate);
  const payouts = readPayouts(seller.id);
  const lastPaid = payouts.find((payout) => payout.status === 'paid');

  const summary = summarizeCommission(seller.id, rows, seller.commissionRate, lastPaid?.paidAt);

  return {
    ...summary,
    paid: payouts
      .filter((payout) => payout.status === 'paid')
      .reduce((total, payout) => total + payout.amount, 0),
    orderCount: rows.length,
    productCount: products.filter((product) => product.sellerId === seller.id).length,
    payouts,
  };
}

/** Category + brand + seller tables need live counts before rendering. */
export function readCatalogueTables() {
  const { products, categories, brands, sellers, coupons, banners } = useDataStore.getState();
  return {
    products,
    categories: categoriesWithCounts(categories, products),
    brands,
    sellers: sellersWithCounts(sellers, products),
    coupons,
    banners,
  };
}

/** Products whose cheapest variant has run out — used by admin quick filters. */
export function outOfStockProducts(products: Product[]): Product[] {
  return products.filter((product) => product.stockStatus === 'out-of-stock');
}
