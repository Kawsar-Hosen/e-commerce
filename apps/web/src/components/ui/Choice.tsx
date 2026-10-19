import { useId, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Choice controls: checkbox, switch and radio group.
 *
 * All three are built on native inputs that stay in the accessibility tree
 * (`peer sr-only`), so keyboard behaviour and screen-reader announcements come
 * from the browser instead of from hand-rolled ARIA.
 */

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  value?: string;
  /** Renders a visually-hidden native checkbox that keeps browser semantics. */
  id?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  error,
  disabled,
  className,
  name,
  value,
  id,
}: CheckboxProps) {
  const autoId = useId();
  const boxId = id ?? autoId;

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <input
        id={boxId}
        name={name}
        value={value}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-invalid={error ? true : undefined}
        className="peer sr-only"
      />
      <label
        htmlFor={boxId}
        className={cn(
          'mt-0.5 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-xs border transition-colors',
          'peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
          'peer-checked:[&_svg]:opacity-100',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
          error ? 'border-error' : 'border-border-strong bg-surface',
        )}
      >
        <Check aria-hidden className="size-3.5 text-on-primary opacity-0 transition-opacity" />
      </label>

      <div className="min-w-0">
        <label htmlFor={boxId} className="cursor-pointer text-base text-text-primary">
          {label}
        </label>
        {description ? <p className="text-xs text-text-secondary">{description}</p> : null}
        {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
      </div>
    </div>
  );
}

/** Accessible switch built on a native checkbox. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}) {
  const autoId = useId();
  const switchId = id ?? autoId;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={switchId} className="block text-base font-medium text-text-primary">
          {label}
        </label>
        {description ? <p className="text-xs text-text-secondary">{description}</p> : null}
      </div>

      <input
        id={switchId}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <label
        htmlFor={switchId}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors',
          'peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
          checked ? 'bg-primary' : 'bg-border-strong',
        )}
      >
        <span className="sr-only">{label}</span>
        <span
          className={cn(
            'absolute size-5 rounded-full bg-surface shadow-sm transition-transform duration-200',
            checked ? 'translate-x-5.5' : 'translate-x-0.5',
          )}
        />
      </label>
    </div>
  );
}

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Optional right-hand content, e.g. a fee or a badge. */
  trailing?: ReactNode;
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  label,
  error,
  className,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
  error?: string;
  className?: string;
}) {
  return (
    <fieldset className={cn('space-y-2', className)} aria-invalid={error ? true : undefined}>
      {label ? <legend className="mb-1 text-sm font-medium text-text-primary">{label}</legend> : null}

      {options.map((option) => {
        const inputId = `${name}-${option.value}`;
        const selected = value === option.value;

        return (
          <div
            key={option.value}
            className={cn(
              'flex items-start gap-3 rounded-card border p-3 transition-colors',
              selected
                ? 'border-primary bg-primary-soft/60'
                : 'border-border bg-surface hover:border-border-strong',
              option.disabled && 'opacity-60',
            )}
          >
            <input
              id={inputId}
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <label htmlFor={inputId} className="mt-0.5 cursor-pointer">
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full border transition-colors',
                  selected ? 'border-primary' : 'border-border-strong',
                )}
              >
                {selected ? <span className="size-2.5 rounded-full bg-primary" /> : null}
              </span>
            </label>

            <label htmlFor={inputId} className="min-w-0 flex-1 cursor-pointer">
              <span className="block text-base font-medium text-text-primary">{option.label}</span>
              {option.description ? (
                <span className="mt-0.5 block text-xs text-text-secondary">{option.description}</span>
              ) : null}
            </label>

            {option.trailing ? (
              <span className="shrink-0 text-sm text-text-secondary">{option.trailing}</span>
            ) : null}
          </div>
        );
      })}

      {error ? (
        <p className="text-xs font-medium text-error" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
