import { ORDER_STATUS_LABELS, type OrderStatusEvent } from '@shobdox/shared-types';
import { formatDateTime } from '@shobdox/shared-utils';
import { StatusDot } from '@/components/ui';
import { cn } from '@/lib/cn';
import { orderStatusTone } from './labels';

/**
 * Vertical order timeline. Events arrive oldest-first from the data store; the
 * newest event is highlighted so the shopper can see the current step at a
 * glance. Every row also carries the raw timestamp for readers who need it.
 */
export function OrderTimeline({ events }: { events: OrderStatusEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-text-secondary">এখনো কোনো ট্র্যাকিং আপডেট নেই।</p>;
  }

  return (
    <ol className="space-y-0">
      {events.map((event, index) => {
        const isLatest = index === events.length - 1;
        return (
          <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLatest ? (
              <span aria-hidden className="absolute left-1 top-2.5 h-full w-px bg-border" />
            ) : null}

            <span className="mt-1.5 shrink-0">
              <StatusDot tone={orderStatusTone(event.status)} />
            </span>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-base',
                  isLatest ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary',
                )}
              >
                {ORDER_STATUS_LABELS[event.status].bn}
              </p>
              <p className="mt-0.5 text-sm text-text-secondary">{event.note}</p>
              <p className="mt-0.5 text-xs text-text-muted">
                {formatDateTime(event.at)}
                {event.actor ? ` · ${event.actor}` : ''}
                {event.location ? ` · ${event.location}` : ''}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
