import { Link } from 'react-router';
import type { OrderLineItem } from '@shobdox/shared-types';
import { Price, Thumb } from '@/components/ui';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';

/**
 * Customer-facing line items. Product titles link back to the storefront so a
 * shopper can re-check the product before buying it again.
 */
export function OrderItemsList({ items }: { items: OrderLineItem[] }) {
  return (
    <ul className="divide-y divide-divider">
      {items.map((item) => {
        const options = Object.entries(item.selectedOptions)
          .map(([name, value]) => `${name}: ${value}`)
          .join(' · ');

        return (
          <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <Thumb src={item.image} alt={item.titleBn ?? item.title} label={item.titleBn ?? item.title} />

            <div className="min-w-0 flex-1">
              <Link
                to={`/product/${item.slug}`}
                className="text-base font-medium text-text-primary hover:text-primary hover:underline"
              >
                {item.titleBn ?? item.title}
              </Link>

              {options ? <p className="mt-0.5 text-xs text-text-secondary">{options}</p> : null}

              <p className="mt-0.5 font-num text-xs text-text-secondary">
                {formatTaka(item.unitPrice)} × {toBanglaDigits(item.quantity)}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <Price value={item.lineTotal} size="sm" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
