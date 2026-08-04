'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useT } from '@/lib/i18n/use-t';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback
          title={this.props.fallbackTitle}
          message={this.props.fallbackMessage}
          onRetry={this.handleRetry}
          error={this.state.error}
        />
      );
    }

    return this.props.children;
  }
}

/* ── Fallback UI (hook dipisah karena ErrorBoundary class) ── */
function ErrorBoundaryFallback({
  title,
  message,
  onRetry,
  error,
}: {
  title?: string;
  message?: string;
  onRetry: () => void;
  error: Error | null;
}) {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center justify-center min-h-[240px] p-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-text-primary mb-2">
        {title || t('errors.defaultTitle')}
      </h2>
      <p className="text-sm text-text-secondary mb-6 max-w-sm">
        {message || t('errors.defaultMessage')}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        {t('errors.retry')}
      </button>
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 w-full max-w-md text-left">
          <summary className="text-xs text-text-secondary cursor-pointer">{t('errors.devDetails')}</summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg overflow-auto max-h-32">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
    </div>
  );
}

export default ErrorBoundary;
