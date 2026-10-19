import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@shobdox/shared-types';
import { nextStatuses } from '@shobdox/shared-business-logic';
import { Button, StatusDot } from '@/components/ui';
import { useEscapeKey } from '@/hooks/useCommon';
import { orderStatusTone } from './StatusBadges';

/**
 * Status advance menu.
 *
 * The options come from `nextStatuses()`, the shared order state machine, so a
 * screen can never offer an illegal jump (delivered → placed). Terminal states
 * render a plain label instead of an empty menu.
 */
export function OrderStatusMenu({
  status,
  onSelect,
  label = 'স্ট্যাটাস',
}: {
  status: OrderStatus;
  onSelect: (next: OrderStatus) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  useEscapeKey(open, () => setOpen(false));

  const options = nextStatuses(status);

  if (options.length === 0) {
    return <span className="text-xs text-text-muted">শেষ ধাপ</span>;
  }

  return (
    <div className="relative inline-block text-left">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        rightIcon={<ChevronDown aria-hidden className="size-4" />}
      >
        {label}
      </Button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="মেনু বন্ধ করুন"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul
            role="menu"
            className="absolute right-0 z-50 mt-1 w-56 overflow-hidden rounded-card border border-border bg-surface py-1 shadow-lg"
          >
            <li className="px-3 py-1 text-xs font-semibold text-text-secondary" role="none">
              পরবর্তী সম্ভাব্য ধাপ
            </li>
            {options.map((option) => (
              <li key={option} role="none">
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSelect(option);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-muted"
                >
                  <StatusDot tone={orderStatusTone(option)} />
                  {ORDER_STATUS_LABELS[option].bn}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
