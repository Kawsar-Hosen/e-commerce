import type { ReactNode } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Info,
  PackageSearch,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { toBanglaDigits } from '@shobdox/shared-utils';
import { useCountdown } from '@/hooks/useCommon';
import { Button } from './Button';

/**
 * Empty, error, alert and status surfaces.
 *
 * Every list in the app routes its "nothing here", "something broke" and
 * "this is a demo" states through these components, which is what keeps the
 * honesty copy and the recovery actions consistent.
 */

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-border-strong bg-surface px-6 py-10 text-center',
        className,
      )}
    >
      <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-surface-muted text-text-secondary">
        {icon ?? <PackageSearch aria-hidden className="size-6" />}
      </span>
      <h3 className="text-xl font-bold text-text-primary">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-text-secondary">{description}</p> : null}
      {action ? <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = 'কিছু একটা ভুল হয়েছে',
  description = 'ডেমো ডেটা লোড করা যায়নি। পেজটি রিফ্রেশ করুন বা ডেমো ডেটা রিসেট করুন।',
  onRetry,
  children,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-error/30 bg-error-soft/40 px-6 py-10 text-center">
      <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-surface text-error">
        <WifiOff aria-hidden className="size-6" />
      </span>
      <h3 className="text-xl font-bold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-text-secondary">{description}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {onRetry ? (
          <Button variant="outline" leftIcon={<RefreshCw aria-hidden className="size-4" />} onClick={onRetry}>
            আবার চেষ্টা করুন
          </Button>
        ) : null}
        {children}
      </div>
    </div>
  );
}

const ALERT_TONES = {
  info: { wrapper: 'border-info/30 bg-info-soft/60 text-blue-700', Icon: Info },
  success: { wrapper: 'border-success/30 bg-success-soft/60 text-green-900', Icon: CheckCircle2 },
  warning: { wrapper: 'border-warning/40 bg-warning-soft/70 text-amber-800', Icon: AlertTriangle },
  error: { wrapper: 'border-error/30 bg-error-soft/60 text-red-900', Icon: AlertTriangle },
} as const;

export function Alert({
  tone = 'info',
  title,
  children,
  action,
  className,
  icon,
}: {
  tone?: keyof typeof ALERT_TONES;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  const { wrapper, Icon } = ALERT_TONES[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-2.5 rounded-card border px-3 py-2.5', wrapper, className)}
    >
      <span className="mt-0.5 shrink-0">{icon ?? <Icon aria-hidden className="size-4" />}</span>
      <div className="min-w-0 flex-1">
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        {children ? <div className="text-sm leading-relaxed opacity-95">{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Persistent, unmissable demo/payment notice. */
export function DemoNotice({
  title = 'এটি একটি ডেমো',
  children,
  className,
}: {
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Alert tone="warning" title={title} className={className}>
      {children ?? (
        <>
          কোনো প্রকৃত পেমেন্ট, অর্ডার বা ডেলিভারি হয় না। সব তথ্য শুধু আপনার ব্রাউজারে সংরক্ষিত থাকে এবং যেকোনো সময়
          রিসেট করা যায়।
        </>
      )}
    </Alert>
  );
}

/* ---------------------------------------------------------------- avatar */

const AVATAR_TONES = [
  'bg-green-100 text-green-800',
  'bg-amber-100 text-amber-800',
  'bg-blue-100 text-blue-700',
  'bg-red-100 text-red-700',
  'bg-purple-100 text-purple-700',
] as const;

export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  const tone = AVATAR_TONES[name.length % AVATAR_TONES.length] ?? AVATAR_TONES[0];

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-num font-bold',
        size === 'sm' ? 'size-8 text-xs' : size === 'lg' ? 'size-14 text-xl' : 'size-10 text-sm',
        tone,
        className,
      )}
    >
      {initials || '?'}
    </span>
  );
}

/* -------------------------------------------------------------- progress */

export function Progress({
  value,
  max = 100,
  tone = 'primary',
  size = 'md',
  label,
  className,
}: {
  value: number;
  max?: number;
  tone?: 'primary' | 'accent' | 'success' | 'error';
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const barTone = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    success: 'bg-success',
    error: 'bg-error',
  }[tone];

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        'w-full overflow-hidden rounded-full bg-surface-muted',
        size === 'sm' ? 'h-1.5' : 'h-2.5',
        className,
      )}
    >
      <span
        className={cn('block h-full rounded-full transition-[width] duration-300', barTone)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------- stat tile */

export function StatTile({
  label,
  value,
  delta,
  trend = 'flat',
  hint,
  icon,
  tone = 'primary',
  href,
}: {
  label: string;
  value: string;
  /** Percentage change vs the previous period. */
  delta?: number;
  trend?: 'up' | 'down' | 'flat';
  hint?: string;
  icon?: ReactNode;
  tone?: 'primary' | 'accent' | 'success' | 'info' | 'error';
  href?: string;
}) {
  const toneRing = {
    primary: 'bg-primary-soft text-primary-dark',
    accent: 'bg-accent-soft text-amber-800',
    success: 'bg-success-soft text-green-800',
    info: 'bg-info-soft text-blue-700',
    error: 'bg-error-soft text-red-800',
  }[tone];

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {icon ? (
          <span className={cn('flex size-9 items-center justify-center rounded-card', toneRing)}>{icon}</span>
        ) : null}
      </div>

      <p className="mt-2 font-num text-3xl font-bold text-text-primary">{value}</p>

      <div className="mt-1 flex items-center gap-2">
        {typeof delta === 'number' ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-semibold',
              trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-text-secondary',
            )}
          >
            {trend === 'up' ? (
              <ArrowUpRight aria-hidden className="size-3.5" />
            ) : trend === 'down' ? (
              <ArrowDownRight aria-hidden className="size-3.5" />
            ) : null}
            {toBanglaDigits(Math.abs(delta).toFixed(1))}%
          </span>
        ) : null}
        {hint ? <span className="text-xs text-text-secondary">{hint}</span> : null}
      </div>
    </>
  );

  const className =
    'block rounded-card border border-border bg-surface p-4 shadow-xs transition-shadow hover:shadow-md';

  if (href) {
    return (
      <Link to={href} className={className}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}

/* ------------------------------------------------------------- countdown */

export function Countdown({
  endsAt,
  tone = 'inverse',
  size = 'md',
  prefix = 'শেষ হবে',
}: {
  endsAt?: string;
  tone?: 'inverse' | 'accent';
  size?: 'sm' | 'md';
  prefix?: string;
}) {
  const countdown = useCountdown(endsAt);

  if (!endsAt || countdown.done) {
    return <span className="text-xs font-semibold text-text-secondary">শেষ হয়েছে</span>;
  }

  return (
    <span
      aria-label={`${prefix} ${countdown.label}`}
      className={cn(
        'inline-flex items-center gap-1 rounded-chip font-num font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        tone === 'accent' ? 'bg-accent text-on-accent' : 'bg-primary-dark text-text-inverse',
      )}
    >
      <span className="text-[0.7em] font-medium opacity-90">{prefix}</span>
      {countdown.label}
    </span>
  );
}

/* ----------------------------------------------------------- key / value */

export function KeyValue({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 py-1.5', className)}>
      <dt className="text-sm text-text-secondary">{label}</dt>
      <dd className="text-right text-sm font-medium text-text-primary">{children}</dd>
    </div>
  );
}

/** "Nothing here yet" row used inside tables. */
export function TableEmpty({
  colSpan,
  title = 'কোনো তথ্য নেই',
  description,
  action,
}: {
  colSpan: number;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center">
        <p className="text-base font-semibold text-text-primary">{title}</p>
        {description ? <p className="mt-1 text-sm text-text-secondary">{description}</p> : null}
        {action ? <div className="mt-3 flex justify-center gap-2">{action}</div> : null}
      </td>
    </tr>
  );
}
