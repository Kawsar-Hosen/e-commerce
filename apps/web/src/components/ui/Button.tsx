import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Button system.
 *
 * `buttonStyles()` is exported so links, labels and file inputs can wear the
 * same skin without nesting a <button> inside an <a> (invalid HTML, breaks
 * keyboard activation).
 */

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'accent'
  | 'danger'
  | 'success'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary shadow-sm hover:bg-primary-dark active:bg-primary-dark disabled:bg-primary/50',
  secondary:
    'bg-primary-soft text-primary-dark hover:bg-green-100 active:bg-green-200 disabled:opacity-60',
  outline:
    'border border-border-strong bg-surface text-text-primary hover:border-primary hover:text-primary active:bg-primary-soft disabled:opacity-60',
  ghost: 'text-text-secondary hover:bg-surface-muted hover:text-text-primary disabled:opacity-50',
  accent:
    'bg-accent text-on-accent shadow-sm hover:bg-accent-dark active:bg-accent-dark disabled:opacity-60',
  danger: 'bg-error text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:opacity-60',
  success: 'bg-success text-white shadow-sm hover:bg-green-700 active:bg-green-800 disabled:opacity-60',
  link: 'text-primary underline-offset-4 hover:underline disabled:opacity-60 px-0',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-sm rounded-button',
  md: 'h-10 gap-2 px-4 text-base rounded-button',
  lg: 'h-12 gap-2 px-6 text-lg rounded-button',
  icon: 'h-10 w-10 justify-center rounded-button',
};

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'disabled:cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  );
}

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading ? <Loader2 aria-hidden className="size-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

export interface ButtonLinkProps {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
  /** External links render a plain anchor with the same styling. */
  external?: boolean;
  /** Lets a link button close the drawer/sheet it lives in. */
  onClick?: () => void;
  'aria-label'?: string;
  title?: string;
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  children,
  external = false,
  ...rest
}: ButtonLinkProps) {
  const styles = buttonStyles({ variant, size, fullWidth, className });

  if (external) {
    return (
      <a href={to} className={styles} target="_blank" rel="noreferrer noopener" {...rest}>
        {leftIcon}
        {children}
        {rightIcon}
      </a>
    );
  }

  return (
    <Link to={to} className={styles} {...rest}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'size'> {
  label: string;
  size?: ButtonSize;
  children: ReactNode;
}

/** Square icon-only button that always carries an accessible name. */
export function IconButton({ label, className, children, size = 'icon', ...rest }: IconButtonProps) {
  return (
    <Button aria-label={label} title={label} size={size} className={className} {...rest}>
      {children}
    </Button>
  );
}
