import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Checkbox, EmptyState, TableEmpty } from '@/components/ui';

/**
 * The table shell every admin list page renders.
 *
 * Phones get a card list — a seven-column table would otherwise push the whole
 * page sideways — while `lg` and up get the real `<table>` with `scope="col"`
 * headers. Row selection and pagination live in the pages; this component only
 * decides how a row is drawn.
 */

export interface AdminColumn<T> {
  id: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Adds the column to the mobile card; columns without a label stay desktop-only. */
  mobileLabel?: string;
  align?: 'left' | 'right';
  className?: string;
}

export interface AdminTableEmpty {
  title: string;
  description?: string;
  action?: ReactNode;
}

export interface AdminTableSelection<T> {
  isSelected: (row: T) => boolean;
  onToggle: (row: T) => void;
  /** Accessible name for the row checkbox. */
  label: (row: T) => string;
  allSelected: boolean;
  onToggleAll: () => void;
  /** Sits next to the header checkbox on desktop, e.g. "বাল্ক স্টক আপডেট". */
  toolbar?: ReactNode;
}

export interface ResponsiveTableProps<T> {
  rows: T[];
  columns: AdminColumn<T>[];
  rowKey: (row: T) => string;
  /** Heading of the mobile card. */
  mobileTitle: (row: T) => ReactNode;
  mobileTrailing?: (row: T) => ReactNode;
  mobileActions?: (row: T) => ReactNode;
  selection?: AdminTableSelection<T>;
  empty?: AdminTableEmpty;
  caption?: string;
  className?: string;
}

export function ResponsiveTable<T>({
  rows,
  columns,
  rowKey,
  mobileTitle,
  mobileTrailing,
  mobileActions,
  selection,
  empty,
  caption,
  className,
}: ResponsiveTableProps<T>) {
  const emptyContent: AdminTableEmpty = empty ?? { title: 'কোনো তথ্য পাওয়া যায়নি' };
  const mobileColumns = columns.filter((column) => column.mobileLabel);
  const colSpan = columns.length + (selection ? 1 : 0);

  return (
    <>
      <div className={cn('hidden overflow-x-auto lg:block', className)}>
        <table className="w-full border-collapse text-left text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}

          <thead>
            <tr className="border-b border-border">
              {selection ? (
                <th scope="col" className="w-12 px-3 py-2">
                  <Checkbox
                    checked={selection.allSelected}
                    onChange={() => selection.onToggleAll()}
                    label={<span className="sr-only">এই পেজের সব সারি নির্বাচন করুন</span>}
                  />
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    'px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-secondary',
                    column.align === 'right' && 'text-right',
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-divider">
            {rows.length === 0 ? (
              <TableEmpty
                colSpan={colSpan}
                title={emptyContent.title}
                description={emptyContent.description}
                action={emptyContent.action}
              />
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)} className="align-middle hover:bg-surface-muted/60">
                  {selection ? (
                    <td className="w-12 px-3 py-2.5">
                      <Checkbox
                        checked={selection.isSelected(row)}
                        onChange={() => selection.onToggle(row)}
                        label={<span className="sr-only">{selection.label(row)}</span>}
                      />
                    </td>
                  ) : null}

                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        'px-3 py-2.5 text-text-primary',
                        column.align === 'right' && 'text-right',
                        column.className,
                      )}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul className={cn('space-y-3 lg:hidden', className)}>
        {rows.length === 0 ? (
          <li>
            <EmptyState title={emptyContent.title} description={emptyContent.description} action={emptyContent.action} />
          </li>
        ) : (
          rows.map((row) => (
            <li key={rowKey(row)} className="rounded-card border border-border bg-surface p-3 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">{mobileTitle(row)}</div>
                <div className="flex shrink-0 items-center gap-2">
                  {selection ? (
                    <Checkbox
                      checked={selection.isSelected(row)}
                      onChange={() => selection.onToggle(row)}
                      label={<span className="sr-only">{selection.label(row)}</span>}
                    />
                  ) : null}
                  {mobileTrailing?.(row)}
                </div>
              </div>

              {mobileColumns.length > 0 ? (
                <dl className="mt-2 space-y-1">
                  {mobileColumns.map((column) => (
                    <div key={column.id} className="flex items-start justify-between gap-3 text-sm">
                      <dt className="text-text-secondary">{column.mobileLabel}</dt>
                      <dd className="max-w-[60%] text-right font-medium text-text-primary">{column.render(row)}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {mobileActions ? (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-divider pt-3">{mobileActions(row)}</div>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </>
  );
}
