import * as Sentry from '@sentry/react';

type ErrorContext = Record<string, unknown>;

let initialized = false;

function getSentryDsn(): string | undefined {
  const value = import.meta.env.VITE_SENTRY_DSN;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function initErrorMonitoring(): void {
  if (initialized || typeof window === 'undefined') {
    return;
  }

  initialized = true;
  const dsn = getSentryDsn();
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0,
  });

  window.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason, { source: 'unhandledrejection' });
  });
}

export function captureError(error: unknown, context?: ErrorContext): void {
  const dsn = getSentryDsn();

  if (dsn) {
    Sentry.captureException(error, { extra: context });
    return;
  }

  if (import.meta.env.DEV) {
    console.error('[error-monitoring]', error, context);
  }
}
