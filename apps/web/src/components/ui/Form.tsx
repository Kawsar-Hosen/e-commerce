import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { AlertCircle, Search } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Form primitives.
 *
 * Every field renders its own <label>, hint and error message and wires up
 * `aria-invalid` / `aria-describedby`, so no screen has to remember to do it.
 */

export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  /** Renders the label inline to the right (settings toggles). */
  orientation?: 'vertical' | 'horizontal';
  /** Small "i" tooltip / extra explanation under the field. */
  description?: string;
}

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
  orientation = 'vertical',
  description,
}: FieldProps) {
  return (
    <div
      className={cn(
        orientation === 'horizontal' ? 'flex items-start justify-between gap-4' : 'space-y-1.5',
        className,
      )}
    >
      {label ? (
        <label
          htmlFor={htmlFor}
          className={cn(
            'block text-sm font-medium text-text-primary',
            orientation === 'horizontal' && 'order-2 flex-1',
          )}
        >
          {label}
          {required ? (
            <span className="ml-0.5 text-error" aria-hidden>
              *
            </span>
          ) : null}
          {description ? (
            <span className="mt-0.5 block text-xs font-normal text-text-secondary">{description}</span>
          ) : null}
        </label>
      ) : null}

      <div className={cn(orientation === 'horizontal' && 'order-1 shrink-0')}>
        {children}
        {hint && !error ? <p className="mt-1 text-xs text-text-secondary">{hint}</p> : null}
        {error ? (
          <p className="mt-1 flex items-start gap-1 text-xs font-medium text-error" role="alert">
            <AlertCircle aria-hidden className="mt-px size-3.5 shrink-0" />
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const controlBase =
  'w-full rounded-input border bg-surface text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus-visible:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-secondary';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, rightSlot, className, wrapperClassName, required, id, type = 'text', ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={inputId}
      className={wrapperClassName}
    >
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {leftIcon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            controlBase,
            'h-10 px-3 text-base',
            leftIcon && 'pl-9',
            rightSlot && 'pr-10',
            error ? 'border-error focus:border-error focus:ring-error/20' : 'border-border-strong',
            className,
          )}
          {...rest}
        />

        {rightSlot ? <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</span> : null}
      </div>
    </Field>
  );
});

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, required, id, rows = 4, ...rest },
  ref,
) {
  const autoId = useId();
  const areaId = id ?? autoId;

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={areaId}>
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlBase,
          'px-3 py-2 text-base leading-relaxed',
          error ? 'border-error focus:border-error focus:ring-error/20' : 'border-border-strong',
          className,
        )}
        {...rest}
      />
    </Field>
  );
});

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'children'> & {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, placeholder, className, wrapperClassName, required, id, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={selectId}
      className={wrapperClassName}
    >
      <select
        ref={ref}
        id={selectId}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlBase,
          'h-10 cursor-pointer px-3 text-base',
          error ? 'border-error focus:border-error focus:ring-error/20' : 'border-border-strong',
          className,
        )}
        {...rest}
      >
        {placeholder ? (
          <option value="">{placeholder}</option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
});

/** Debounce-free search box with a clear button; used by every table and the shop. */
export function SearchInput({
  value,
  onValueChange,
  placeholder = 'খুঁজুন…',
  className,
  label,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className={cn(controlBase, 'h-10 border-border-strong pl-9 pr-3 text-base')}
      />
    </div>
  );
}
