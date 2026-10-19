/** Shared primitive aliases used across the SHOBDOX domain model. */

/** Human-readable, prefixed identifier, e.g. `p-1042`, `ord-2026-0042`. */
export type EntityId = string;

/** ISO-8601 timestamp string. */
export type IsoDateString = string;

/** Amount in Bangladeshi Taka. Values are whole Taka unless a fraction is required. */
export type Taka = number;

export type CurrencyCode = 'BDT';

export type SortDirection = 'asc' | 'desc';

/** Every sortable list in the customer, admin and seller interfaces. */
export type ProductSortKey =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'popularity'
  | 'rating'
  | 'discount';

export const PRODUCT_SORT_LABELS: Record<ProductSortKey, string> = {
  relevance: 'প্রাসঙ্গিকতা (Relevance)',
  'price-asc': 'কম দাম আগে (Price: low to high)',
  'price-desc': 'বেশি দাম আগে (Price: high to low)',
  newest: 'নতুন আগে (Newest)',
  popularity: 'জনপ্রিয়তা (Popularity)',
  rating: 'রেটিং (Rating)',
  discount: 'বেশি ছাড় (Discount)',
};

/** Standard envelope returned by every mock service adapter. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PageQuery {
  page?: number;
  pageSize?: number;
}

/** Mock services resolve asynchronously so loading states are exercised. */
export interface ServiceResult<T> {
  data: T;
  /** Latency the fake adapter simulated, in milliseconds. */
  simulatedLatencyMs: number;
}

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
  labelBn?: string;
  disabled?: boolean;
}

export type LoadState = 'idle' | 'loading' | 'success' | 'error';

/** Locale keys supported by the demo UI. Bangla is the default. */
export type LanguageCode = 'bn' | 'en';

export type ThemePreference = 'light' | 'dark' | 'system';
