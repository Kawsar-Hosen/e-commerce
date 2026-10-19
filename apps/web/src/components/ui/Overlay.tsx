import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useEscapeKey, useLockBodyScroll, usePrefersReducedMotion } from '@/hooks/useCommon';
import { useUiStore, type Toast } from '@/store/ui.store';
import { Button } from './Button';

/**
 * Modals, drawers, sheets and the toast host.
 *
 * All of them are portalled to <body>, lock background scrolling, close on
 * Escape and move focus into the panel when they open — the minimum a keyboard
 * user should be able to expect from an overlay.
 */

function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;

    // Focus the first sensible control inside the panel.
    const focusables = node?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    (focusables && focusables.length > 0 ? focusables[0] : node)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !node) return;
      const items = Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [active]);

  return ref;
}

/* --------------------------------------------------------------- modal */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Hides the header title visually but keeps it for screen readers. */
  hideTitle?: boolean;
}

const MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  hideTitle = false,
}: ModalProps) {
  const reduceMotion = usePrefersReducedMotion();
  const panelRef = useFocusTrap<HTMLDivElement>(open);
  useLockBodyScroll(open);
  useEscapeKey(open, onClose);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-0 md:items-center md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.16 }}
        >
          <div
            className="absolute inset-0 bg-overlay"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.2, 0, 0, 1] }}
            className={cn(
              'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-sheet bg-surface shadow-xl md:rounded-panel',
              MODAL_SIZES[size],
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 md:px-5">
              <div className="min-w-0">
                <h2
                  className={cn(
                    'text-xl font-bold text-text-primary',
                    hideTitle && 'sr-only',
                  )}
                >
                  {title}
                </h2>
                {description ? <p className="mt-0.5 text-sm text-text-secondary">{description}</p> : null}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="বন্ধ করুন"
                className="tap-target -mr-1 flex shrink-0 items-center justify-center rounded-button text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">{children}</div>

            {footer ? (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface-muted/60 px-4 py-3 md:px-5">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onClose: () => void;
  /** Extra content, e.g. a typed confirmation field. */
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'নিশ্চিত করুন',
  cancelLabel = 'বাতিল',
  tone = 'danger',
  onConfirm,
  onClose,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-base leading-relaxed text-text-secondary">{message}</p>
      {children}
    </Modal>
  );
}

/* -------------------------------------------------------------- drawers */

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'left' | 'right' | 'bottom';
  /** Width for left/right drawers; ignored by the bottom sheet. */
  widthClassName?: string;
}

/**
 * Side panel on desktop, bottom sheet on phones — the same component so a
 * screen never has to branch on viewport width.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = 'right',
  widthClassName = 'sm:max-w-md',
}: DrawerProps) {
  const reduceMotion = usePrefersReducedMotion();
  const panelRef = useFocusTrap<HTMLDivElement>(open);
  useLockBodyScroll(open);
  useEscapeKey(open, onClose);

  if (typeof document === 'undefined') return null;

  const fromX = side === 'right' ? 32 : -32;
  const hidden = side === 'bottom' ? { y: '4%' } : { x: fromX };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className={cn(
            'fixed inset-0 z-[60] flex',
            side === 'bottom' ? 'items-end justify-center' : side === 'right' ? 'justify-end' : 'justify-start',
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
        >
          <div className="absolute inset-0 bg-overlay" onClick={onClose} aria-hidden />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={reduceMotion ? false : { opacity: 0, ...hidden }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, ...hidden }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}
            className={cn(
              'relative flex w-full flex-col overflow-hidden bg-surface shadow-xl',
              side === 'bottom'
                ? 'max-h-[88vh] rounded-t-sheet'
                : cn('h-full', side === 'right' ? 'ml-auto' : 'mr-auto', 'md:max-w-md', widthClassName),
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              {side === 'bottom' ? (
                <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-border-strong" aria-hidden />
              ) : null}
              <h2 className="text-xl font-bold text-text-primary">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="বন্ধ করুন"
                className="tap-target -mr-1 flex shrink-0 items-center justify-center rounded-button text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>

            {footer ? <div className="border-t border-border bg-surface px-4 py-3">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/* --------------------------------------------------------------- toasts */

const TOAST_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
} as const;

const TOAST_STYLES = {
  success: 'border-success/40 bg-success-soft text-green-900',
  error: 'border-error/40 bg-error-soft text-red-900',
  info: 'border-info/40 bg-info-soft text-blue-700',
  warning: 'border-warning/40 bg-warning-soft text-amber-800',
} as const;

function ToastCard({ toast }: { toast: Toast }) {
  const dismissToast = useUiStore((state) => state.dismissToast);
  const Icon = TOAST_ICONS[toast.tone];

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = window.setTimeout(() => dismissToast(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, dismissToast]);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-2.5 rounded-card border px-3 py-2.5 shadow-md',
        TOAST_STYLES[toast.tone],
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description ? <p className="mt-0.5 text-xs opacity-90">{toast.description}</p> : null}
        {toast.actionLabel && toast.actionHref ? (
          <a
            href={toast.actionHref}
            className="mt-1 inline-block text-xs font-semibold underline underline-offset-2"
          >
            {toast.actionLabel}
          </a>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label="নোটিফিকেশন বন্ধ করুন"
        className="-mr-1 flex size-6 shrink-0 items-center justify-center rounded-button opacity-70 hover:opacity-100"
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </motion.li>
  );
}

/** Renders the toast queue. Mounted once, next to the router outlet. */
export function ToastHost() {
  const toasts = useUiStore((state) => state.toasts);
  const clearToasts = useUiStore((state) => state.clearToasts);

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') clearToasts();
  }, [clearToasts]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <ul
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-3 bottom-20 z-[80] flex flex-col items-center gap-2 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </ul>,
    document.body,
  );
}
