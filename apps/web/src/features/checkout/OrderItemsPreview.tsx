import { Thumb } from '@/components/ui';
import { formatTaka, toBanglaDigits } from '@shobdox/shared-utils';

/**
 * Compact read-only line list. Both `CartItem` and `OrderLineItem` satisfy the
 * structural shape, so the same preview serves the cart, checkout, tracking and
 * confirmation screens.
 */
export interface PreviewLine {
  id: string;
  title: string;
  titleBn?: string;
  image: string;
  quantity: number;
  unitPrice: number;
}

export function OrderItemsPreview({
  items,
  max = 3,
  className,
}: {
  items: PreviewLine[];
  max?: number;
  className?: string;
}) {
  const visible = items.slice(0, max);
  const remaining = items.length - visible.length;

  return (
    <div className={className}>
      <ul className="divide-y divide-divider">
        {visible.map((line) => (
          <li key={line.id} className="flex items-center gap-3 py-2.5">
            <Thumb src={line.image} alt={line.titleBn ?? line.title} label={line.title} className="size-12" />

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-text-primary">{line.titleBn ?? line.title}</p>
              <p className="font-num text-xs text-text-secondary">
                {toBanglaDigits(line.quantity)} × {formatTaka(line.unitPrice)}
              </p>
            </div>

            <span className="font-num shrink-0 text-sm font-semibold text-text-primary">
              {formatTaka(line.unitPrice * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {remaining > 0 ? (
        <p className="pt-2 text-xs text-text-secondary">আরও {toBanglaDigits(remaining)} টি পণ্য</p>
      ) : null}
    </div>
  );
}
