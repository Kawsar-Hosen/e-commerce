import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from '@/components/ui';
import { AppRouter } from './router';

/**
 * App shell.
 *
 * A render error anywhere in a page shows a recoverable Bangla error card
 * instead of a white screen, with a "reset demo data" escape hatch — the demo
 * state is the most likely cause of a broken screen.
 */

interface BoundaryState {
  error?: Error;
}

class RootErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  override state: BoundaryState = {};

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // No telemetry in this phase; the console is the debugging surface.
    console.error('[SHOBDOX] render error', error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div className="page-shell py-10">
        <ErrorState
          title="পেজটি দেখানো যাচ্ছে না"
          description="সম্ভবত সংরক্ষিত ডেমো ডেটা অসঙ্গত। নিচের বাটন দিয়ে ডেমো ডেটা রিসেট করলে সমস্যা সমাধান হতে পারে।"
          onRetry={() => window.location.reload()}
        >
          <button
            type="button"
            onClick={() => {
              Object.keys(window.localStorage)
                .filter((key) => key.startsWith('shobdox.'))
                .forEach((key) => window.localStorage.removeItem(key));
              window.location.href = '/';
            }}
            className="inline-flex h-10 items-center rounded-button bg-error px-4 text-sm font-medium text-white hover:bg-red-700"
          >
            ডেমো ডেটা মুছে আবার শুরু করুন
          </button>
        </ErrorState>

        <details className="mx-auto mt-4 max-w-2xl rounded-card border border-border bg-surface p-3 text-xs text-text-secondary">
          <summary className="cursor-pointer font-medium text-text-primary">টেকনিক্যাল বিবরণ</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{this.state.error.message}</pre>
        </details>
      </div>
    );
  }
}

export function App() {
  return (
    <RootErrorBoundary>
      <AppRouter />
    </RootErrorBoundary>
  );
}
