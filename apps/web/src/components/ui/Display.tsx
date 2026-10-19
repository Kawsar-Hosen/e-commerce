import { Minus, Plus, Star } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';

/**
 * Commerce display primitives.
 *
 * Prices, ratings, stock labels and quantity steppers are rendered here once so
 * that a product card, an order row and an admin table all show the same
 * formatting. Feedback/empty/error surfaces live in `Feedback.tsx`.
 */

/* ------------------------------------------------------------------ price */

export interface PriceProps {
  /** Selling price, in Taka. */
  value: number;
  /** Original price; when higher than `value` a strikethrough is shown. */
  compareAt?: number;
  discountPercent?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Range label for products whose variants differ in price. */
  fromLabel?: boolean;
  inline?: boolean;
}

const PRICE_SIZES = {
  sm: 'text-md',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-5xl',
} as const;

export function Price({
  value,
  compareAt,
  discountPercent,
  size = 'md',
  className,
  fromLabel = false,
  inline = true,
}: PriceProps) {
  const showCompare = typeof compareAt === 'number' && compareAt > value;

  return (
    <span className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', inline && 'inline-flex', className)}>
      <span className={cn('font-num font-bold text-text-primary', PRICE_SIZES[size])}>
        {fromLabel ? <span className="mr-0.5 text-xs font-medium text-text-secondary">শুরু</span> : null}
        {formatTaka(value)}
      </span>

      {showCompare ? (
        <span className="font-num text-sm text-text-muted line-through">{formatTaka(compareAt)}</span>
      ) : null}

      {discountPercent && discountPercent > 0 ? (
        <span className="rounded-chip bg-error-soft px-1.5 py-0.5 font-num text-xs font-semibold text-red-700">
          -{toBanglaDigits(discountPercent)}%
        </span>
      ) : null}
    </span>
  );
}

/* ----------------------------------------------------------------- rating */

export function Rating({
  value,
  count,
  size = 'md',
  showValue = true,
  className,
  label,
}: {
  value: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  label?: string;
}) {
  const starSize = size === 'sm' ? 'size-3' : size === 'lg' ? 'size-5' : 'size-3.5';
  const rounded = Math.round(value);

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span
        className="flex items-center gap-0.5"
        role="img"
        aria-label={label ?? `রেটিং ${toBanglaDigits(value.toFixed(1))} / ৫`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            aria-hidden
            className={cn(
              starSize,
              star <= rounded ? 'fill-accent text-accent' : 'fill-transparent text-border-strong',
            )}
          />
        ))}
      </span>

      {showValue ? (
        <span className="font-num text-xs font-semibold text-text-primary">
          {toBanglaDigits(value.toFixed(1))}
        </span>
      ) : null}

      {typeof count === 'number' ? (
        <span className="text-xs text-text-secondary">({toBanglaDigits(count)})</span>
      ) : null}
    </span>
  );
}

/* --------------------------------------------------------------- stock tag */

export function StockBadge({ status, stock }: { status: string; stock?: number }) {
  if (status === 'out-of-stock') {
    return <span className="text-xs font-semibold text-error">স্টক শেষ</span>;
  }
  if (status === 'pre-order') {
    return <span className="text-xs font-semibold text-info">প্রি-অর্ডার</span>;
  }
  if (status === 'low-stock') {
    return (
      <span className="text-xs font-semibold text-warning">
        {typeof stock === 'number' ? `মাত্র ${toBanglaDigits(stock)}টি বাকি` : 'সীমিত স্টক'}
      </span>
    );
  }
  return <span className="text-xs font-semibold text-success">স্টকে আছে</span>;
}

/* -------------------------------------------------------------- stepper */

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  min = 1,
  max = 99,
  size = 'md',
  label = 'পরিমাণ',
  className,
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}) {
  const buttonSize = size === 'sm' ? 'size-7' : 'size-9';

  return (
    <div
      className={cn('inline-flex items-center rounded-button border border-border-strong bg-surface', className)}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={onDecrease}
        disabled={value <= min}
        aria-label="একটি কম করুন"
        className={cn(
          'flex items-center justify-center rounded-l-button text-text-primary transition-colors hover:bg-surface-muted disabled:opacity-40',
          buttonSize,
        )}
      >
        <Minus aria-hidden className="size-4" />
      </button>

      <span
        aria-live="polite"
        className={cn(
          'min-w-8 text-center font-num font-semibold text-text-primary',
          size === 'sm' ? 'text-sm' : 'text-base',
        )}
      >
        {toBanglaDigits(value)}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={value >= max}
        aria-label="একটি বাড়ান"
        className={cn(
          'flex items-center justify-center rounded-r-button text-text-primary transition-colors hover:bg-surface-muted disabled:opacity-40',
          buttonSize,
        )}
      >
        <Plus aria-hidden className="size-4" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------- feedback */

export function Spinner({ className, label = 'লোড হচ্ছে' }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-2', className)}>
      <span
        aria-hidden
        className="size-4 animate-[spin-slow_0.9s_linear_infinite] rounded-full border-2 border-border-strong border-t-primary"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Skeleton({ className, rounded = 'rounded-card' }: { className?: string; rounded?: string }) {
  return <span aria-hidden className={cn('skeleton block', rounded, className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      <Skeleton className="aspect-square w-full" rounded="rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-2/3" rounded="rounded-full" />
        <Skeleton className="h-3 w-1/2" rounded="rounded-full" />
        <Skeleton className="h-5 w-1/3" rounded="rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-3">
          {Array.from({ length: columns }, (_, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={cn('h-8 flex-1', columnIndex === 0 && 'max-w-56')}
              rounded="rounded-input"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
