import { CheckCircle2, XCircle } from 'lucide-react';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_SEQUENCE,
  type Order,
  type OrderStatus,
  type OrderStatusEvent,
} from '@shobdox/shared-types';
import { formatDateTime, toBanglaDigits } from '@shobdox/shared-utils';
import { cn } from '@/lib/cn';

/**
 * Six-step customer timeline.
 *
 * Renders the events written by the shared order state machine, plus the
 * remaining steps as muted placeholders, so tracking and confirmation can
 * never disagree about where an order is.
 */
export function OrderTimeline({ order, className }: { order: Order; className?: string }) {
  const eventByStatus = new Map<OrderStatus, OrderStatusEvent>();
  for (const event of order.timeline) {
    if (!eventByStatus.has(event.status)) eventByStatus.set(event.status, event);
  }

  const branch =
    order.status === 'cancelled' || order.status === 'returned'
      ? eventByStatus.get(order.status)
      : undefined;

  return (
    <ol className={cn('text-sm', className)}>
      {ORDER_STATUS_SEQUENCE.map((status, index) => {
        const event = eventByStatus.get(status);
        const reached = Boolean(event);
        const isCurrent = order.status === status;
        const hasNext = index < ORDER_STATUS_SEQUENCE.length - 1 || Boolean(branch);

        return (
          <li key={status} className="relative flex gap-3 pb-5 last:pb-0">
            {hasNext ? (
              <span
                aria-hidden
                className="absolute left-4 top-7 h-[calc(100%-1.75rem)] w-px -translate-x-1/2 bg-border"
              />
            ) : null}

            <span
              className={cn(
                'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border font-num text-xs font-semibold',
                reached
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-border-strong bg-surface text-text-muted',
                isCurrent && 'ring-2 ring-primary/30',
              )}
            >
              {reached ? <CheckCircle2 aria-hidden className="size-4" /> : toBanglaDigits(index + 1)}
            </span>

            <div className="min-w-0 pt-0.5">
              <p className={cn('font-semibold', reached ? 'text-text-primary' : 'text-text-muted')}>
                {ORDER_STATUS_LABELS[status].bn}
              </p>
              {event ? (
                <p className="mt-0.5 break-words text-xs text-text-secondary">
                  {formatDateTime(event.at)}
                  {event.location ? ` · ${event.location}` : ''}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-text-muted">অপেক্ষমাণ</p>
              )}
            </div>
          </li>
        );
      })}

      {branch ? (
        <li className="relative flex gap-3 pt-1">
          <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-error bg-error-soft text-error">
            <XCircle aria-hidden className="size-4" />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="font-semibold text-error">{ORDER_STATUS_LABELS[branch.status].bn}</p>
            <p className="mt-0.5 break-words text-xs text-text-secondary">
              {formatDateTime(branch.at)} · {branch.note}
            </p>
          </div>
        </li>
      ) : null}
    </ol>
  );
}
