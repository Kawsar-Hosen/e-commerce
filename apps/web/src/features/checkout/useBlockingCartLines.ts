import { useMemo } from 'react';
import type { CartItem } from '@shobdox/shared-types';
import type { UseCartResult } from '@/hooks/useCart';

/** A cart line that the audit flagged as a checkout blocker. */
export interface BlockingCartLine {
  issue: UseCartResult['issues'][number];
  line?: CartItem;
}

/** Filters `auditCartLines()` output down to the errors that stop checkout. */
export function useBlockingCartLines(
  issues: UseCartResult['issues'],
  items: CartItem[],
): BlockingCartLine[] {
  return useMemo(
    () =>
      issues
        .filter((issue) => issue.severity === 'error')
        .map((issue) => ({ issue, line: items.find((item) => item.id === issue.lineId) })),
    [issues, items],
  );
}
