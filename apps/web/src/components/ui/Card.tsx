import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Card shell: surface, radius and shadow come from tokens, not from call sites. */

export interface CardProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section' | 'li' | 'form';
  interactive?: boolean;
  padded?: boolean;
}

export function Card({ children, className, as = 'div', interactive = false, padded = true }: CardProps) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        'rounded-card border border-border bg-surface shadow-xs',
        padded && 'p-4',
        interactive && 'transition-shadow duration-200 hover:shadow-md focus-within:shadow-md',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  action?: ReactNode;
  className?: string;
  /** Flash-sale rails put a countdown where the link would be. */
  trailing?: ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = 'সব দেখুন',
  action,
  className,
  trailing,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-3 flex items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p> : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {trailing}
        {action}
        {href ? (
          <Link
            to={href}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {linkLabel}
            <ChevronRight aria-hidden className="size-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

const TONES = {
  neutral: 'bg-surface-muted text-text-secondary',
  primary: 'bg-primary-soft text-primary-dark',
  accent: 'bg-accent-soft text-amber-800',
  success: 'bg-success-soft text-green-800',
  warning: 'bg-warning-soft text-amber-800',
  danger: 'bg-error-soft text-red-800',
  info: 'bg-info-soft text-blue-700',
  inverse: 'bg-surface-inverse text-text-inverse',
} as const;

export type Tone = keyof typeof TONES;

export function Badge({
  children,
  tone = 'neutral',
  className,
  size = 'md',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-chip font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone = 'neutral', className }: { tone?: Tone; className?: string }) {
  const colors: Record<Tone, string> = {
    neutral: 'bg-text-muted',
    primary: 'bg-primary',
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-error',
    info: 'bg-info',
    inverse: 'bg-text-inverse',
  };
  return <span className={cn('size-2 rounded-full', colors[tone], className)} aria-hidden />;
}

/** Page title block used by every dashboard screen. */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('mb-5', className)}>
      {breadcrumbs}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-base text-text-secondary">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
