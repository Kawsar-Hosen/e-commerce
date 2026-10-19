import { useId, useRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { toBanglaDigits } from '@shobdox/shared-utils';

/** Tabs, accordions, pagination, breadcrumbs and filter chips. */

/* ------------------------------------------------------------------- tabs */

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
  disabled?: boolean;
}

export function Tabs({
  items,
  activeId,
  onChange,
  className,
  size = 'md',
  'aria-label': ariaLabel = 'বিভাগ',
}: {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('no-scrollbar flex gap-1 overflow-x-auto border-b border-border', className)}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`panel-${item.id}`}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 font-medium transition-colors',
              size === 'sm' ? 'px-3 py-2 text-sm' : 'px-3.5 py-2.5 text-base',
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary',
              item.disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {item.icon}
            {item.label}
            {typeof item.count === 'number' ? (
              <span
                className={cn(
                  'rounded-chip px-1.5 py-0.5 font-num text-xs',
                  active ? 'bg-primary-soft text-primary-dark' : 'bg-surface-muted text-text-secondary',
                )}
              >
                {toBanglaDigits(item.count)}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, active, children }: { id: string; active: boolean; children: ReactNode }) {
  if (!active) return null;
  return (
    <div id={`panel-${id}`} role="tabpanel" tabIndex={0}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------ segmented */

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex rounded-button border border-border bg-surface-muted p-0.5', className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-[8px] px-3 py-1.5 text-sm font-medium transition-colors',
            value === option.value
              ? 'bg-surface text-text-primary shadow-xs'
              : 'text-text-secondary hover:text-text-primary',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- accordion */

export function Accordion({
  items,
  allowMultiple = true,
  className,
  defaultOpenIds = [],
}: {
  items: Array<{ id: string; title: string; content: ReactNode; count?: number }>;
  allowMultiple?: boolean;
  className?: string;
  defaultOpenIds?: string[];
}) {
  const name = useId();

  return (
    <div className={cn('divide-y divide-divider rounded-card border border-border bg-surface', className)}>
      {items.map((item) => (
        <details
          key={item.id}
          name={allowMultiple ? undefined : name}
          open={defaultOpenIds.includes(item.id)}
          className="group"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium text-text-primary hover:bg-surface-muted/70">
            <span className="flex items-center gap-2">
              {item.title}
              {typeof item.count === 'number' ? (
                <span className="font-num text-xs text-text-secondary">({toBanglaDigits(item.count)})</span>
              ) : null}
            </span>
            <ChevronDown aria-hidden className="size-4 shrink-0 text-text-secondary transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4 text-sm leading-relaxed text-text-secondary">{item.content}</div>
        </details>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- pagination */

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const windowSize = 1;
  const pages: number[] = [];
  for (let candidate = 1; candidate <= totalPages; candidate += 1) {
    if (candidate === 1 || candidate === totalPages || Math.abs(candidate - page) <= windowSize) {
      pages.push(candidate);
    }
  }

  return (
    <nav aria-label="পেজ" className={cn('flex flex-wrap items-center justify-center gap-1', className)}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="আগের পেজ"
        className="flex size-9 items-center justify-center rounded-button border border-border bg-surface text-text-secondary hover:border-primary hover:text-primary disabled:opacity-40"
      >
        <ChevronLeft aria-hidden className="size-4" />
      </button>

      {pages.map((candidate, index) => {
        const previous = pages[index - 1];
        const gap = previous !== undefined && candidate - previous > 1;

        return (
          <span key={candidate} className="flex items-center gap-1">
            {gap ? <span className="px-1 text-text-muted">…</span> : null}
            <button
              type="button"
              onClick={() => onPageChange(candidate)}
              aria-current={candidate === page ? 'page' : undefined}
              aria-label={`পেজ ${toBanglaDigits(candidate)}`}
              className={cn(
                'flex size-9 items-center justify-center rounded-button border font-num text-sm transition-colors',
                candidate === page
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-border bg-surface text-text-primary hover:border-primary hover:text-primary',
              )}
            >
              {toBanglaDigits(candidate)}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="পরের পেজ"
        className="flex size-9 items-center justify-center rounded-button border border-border bg-surface text-text-secondary hover:border-primary hover:text-primary disabled:opacity-40"
      >
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </nav>
  );
}

/* ------------------------------------------------------------ breadcrumbs */

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="ব্রেডক্রাম্ব" className={cn('mb-2', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-text-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link to={item.href} className="hover:text-primary hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast && 'font-medium text-text-primary')} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? <ChevronRight aria-hidden className="size-3 text-text-muted" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------------ chips */

export function Chip({
  children,
  selected = false,
  onClick,
  onRemove,
  className,
  count,
  disabled,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
  count?: number;
  disabled?: boolean;
}) {
  const interactive = Boolean(onClick);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-chip border px-3 py-1.5 text-sm font-medium transition-colors',
        selected
          ? 'border-primary bg-primary-soft text-primary-dark'
          : 'border-border-strong bg-surface text-text-primary',
        interactive && 'hover:border-primary',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {interactive ? (
        <button type="button" onClick={onClick} disabled={disabled} className="flex items-center gap-1.5">
          {children}
          {typeof count === 'number' ? (
            <span className="font-num text-xs text-text-secondary">{toBanglaDigits(count)}</span>
          ) : null}
        </button>
      ) : (
        <span className="flex items-center gap-1.5">
          {children}
          {typeof count === 'number' ? (
            <span className="font-num text-xs text-text-secondary">{toBanglaDigits(count)}</span>
          ) : null}
        </span>
      )}

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="ফিল্টার সরান"
          className="-mr-1 flex size-5 items-center justify-center rounded-full hover:bg-surface-muted"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      ) : null}
    </span>
  );
}

/** The "ফিল্টার (৩)" button that opens the mobile filter sheet. */
export function FilterButton({
  onClick,
  activeCount,
  className,
}: {
  onClick: () => void;
  activeCount: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={activeCount > 0 ? `ফিল্টার, ${activeCount}টি চালু` : 'ফিল্টার'}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-button border border-border-strong bg-surface px-3 text-sm font-medium text-text-primary hover:border-primary',
        className,
      )}
    >
      <SlidersHorizontal aria-hidden className="size-4" />
      ফিল্টার
      {activeCount > 0 ? (
        <span className="rounded-full bg-primary px-1.5 font-num text-xs text-on-primary">
          {toBanglaDigits(activeCount)}
        </span>
      ) : null}
    </button>
  );
}

/** Horizontal scroller with arrow controls on desktop. */
export function ScrollRail({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const node = ref.current;
    if (!node) return;
    node.scrollBy({ left: direction * Math.max(240, node.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <div className={cn('relative', className)}>
      <div ref={ref} className="rail no-scrollbar pb-1" aria-label={label} tabIndex={0}>
        {children}
      </div>

      <div className="pointer-events-none absolute -top-9 right-0 hidden gap-1 xl:flex">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="আগের পণ্য"
          className="pointer-events-auto flex size-8 items-center justify-center rounded-full border border-border bg-surface text-text-secondary hover:text-primary"
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="পরের পণ্য"
          className="pointer-events-auto flex size-8 items-center justify-center rounded-full border border-border bg-surface text-text-secondary hover:text-primary"
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}
