import { ORDER_STATUS_LABELS, type OrderStatus, type OrderStatusEvent } from '@shobdox/shared-types';
import { StatusDot } from '@/components/ui';
import { formatDateTime } from '@shobdox/shared-utils';
import { orderStatusTone } from './StatusBadges';

/** Vertical order timeline used by the detail screens and the printable receipt. */
export function OrderTimeline({
  events,
  title = 'অর্ডার টাইমলাইন',
}: {
  events: OrderStatusEvent[];
  title?: string;
}) {
  if (events.length === 0) {
    return <p className="text-sm text-text-secondary">এই অর্ডারের কোনো টাইমলাইন এন্ট্রি নেই।</p>;
  }

  return (
    <ol className="space-y-0" aria-label={title}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        return (
          <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast ? <span className="absolute left-[5px] top-4 h-full w-px bg-border" aria-hidden /> : null}
            <StatusDot tone={orderStatusTone(event.status)} className="mt-1.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">{ORDER_STATUS_LABELS[event.status].bn}</p>
              <p className="text-sm text-text-secondary">{event.note}</p>
              <p className="mt-0.5 text-xs text-text-muted">
                {formatDateTime(event.at)}
                {event.actor ? ` · ${event.actor}` : ''}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Compact one-line summary used inside table rows. */
export function OrderStatusTrail({ status }: { status: OrderStatus }) {
  return (
    <span className="text-xs text-text-secondary" title={ORDER_STATUS_LABELS[status].en}>
      {ORDER_STATUS_LABELS[status].bn}
    </span>
  );
}
