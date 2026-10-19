import type { ReactNode } from 'react';
import { Card } from '@/components/ui';
import { toBanglaDigits } from '@shobdox/shared-utils';

/** Numbered card wrapping one step of the one-page checkout. */
export function CheckoutSection({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card as="section" className="scroll-mt-24">
      <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft font-num text-xs font-bold text-primary-dark">
          {toBanglaDigits(step)}
        </span>
        <span className="min-w-0 break-words">{title}</span>
      </h2>
      {description ? <p className="mt-1 text-sm text-text-secondary">{description}</p> : null}
      <div className="mt-3 space-y-3">{children}</div>
    </Card>
  );
}
