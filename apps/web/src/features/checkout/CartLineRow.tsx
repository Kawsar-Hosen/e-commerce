import { Link } from 'react-router';
import { Trash2 } from 'lucide-react';
import type { CartItem } from '@shobdox/shared-types';
import type { CartLineIssue } from '@shobdox/shared-business-logic';
import { Thumb } from '@/components/ui';
import { Price, QuantityStepper } from '@/components/ui/Display';
import { useCartStore } from '@/store/cart.store';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';
import { cn } from '@/lib/cn';

/**
 * One persisted cart line. Quantity bounds come from the variant snapshot, so
 * the stepper can never push a demo order past available stock.
 */
export function CartLineRow({ line, issue }: { line: CartItem; issue?: CartLineIssue }) {
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const title = line.titleBn ?? line.title;
  const options = Object.entries(line.selectedOptions);

  return (
    <li className="flex gap-3 py-4">
      <Link to={`/product/${line.slug}`} className="shrink-0" tabIndex={-1} aria-hidden>
        <Thumb src={line.image} alt={title} label={line.title} className="size-20 sm:size-24" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/product/${line.slug}`}
              className="line-clamp-2 break-words text-base font-medium text-text-primary hover:text-primary"
            >
              {title}
            </Link>

            {options.length > 0 ? (
              <p className="mt-0.5 break-words text-xs text-text-secondary">
                {options.map(([name, value]) => `${name}: ${value}`).join(' · ')}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => removeItem(line.id)}
            aria-label={`${title} — কার্ট থেকে সরান`}
            className="flex size-9 shrink-0 items-center justify-center rounded-button text-text-secondary hover:bg-error-soft hover:text-error"
          >
            <Trash2 aria-hidden className="size-4" />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <Price value={line.unitPrice} size="sm" />

          <div className="flex items-center gap-2">
            <QuantityStepper
              value={line.quantity}
              min={1}
              max={Math.max(1, line.availableStock)}
              size="sm"
              onDecrease={() => decrementItem(line.id)}
              onIncrease={() => incrementItem(line.id)}
              label={`${title} পরিমাণ`}
            />
            <span className="font-num text-sm font-semibold text-text-primary">
              {formatTaka(line.unitPrice * line.quantity)}
            </span>
          </div>
        </div>

        {line.availableStock > 0 && line.availableStock <= 8 ? (
          <p className="mt-1 text-xs text-warning">
            স্টকে মাত্র {toBanglaDigits(line.availableStock)} টি আছে
          </p>
        ) : null}

        {issue ? (
          <p
            role="status"
            className={cn(
              'mt-1 break-words text-xs font-medium',
              issue.severity === 'error' ? 'text-error' : 'text-warning',
            )}
          >
            {issue.message}
          </p>
        ) : null}
      </div>
    </li>
  );
}
