import { Alert, ButtonLink } from '@/components/ui';
import type { BlockingCartLine } from './useBlockingCartLines';

/** Renders nothing for a healthy cart, so the page can always mount it. */
export function StockIssuesAlert({ lines }: { lines: BlockingCartLine[] }) {
  if (lines.length === 0) return null;

  return (
    <Alert tone="error" title="স্টকে না থাকা পণ্য চেকআউট আটকে দিয়েছে">
      <ul className="list-disc space-y-0.5 pl-4">
        {lines.map(({ issue, line }) => (
          <li key={issue.lineId}>
            {line?.titleBn ?? line?.title ?? 'পণ্য'}: {issue.message}
          </li>
        ))}
      </ul>
      <ButtonLink to="/cart" variant="outline" size="sm" className="mt-2">
        কার্টে গিয়ে ঠিক করুন
      </ButtonLink>
    </Alert>
  );
}
