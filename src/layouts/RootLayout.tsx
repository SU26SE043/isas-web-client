import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteLoadingFallback } from '@/components/RouteLoadingFallback';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { LanguageProvider } from '@/shared/languages';
import { queryClient } from '@/shared/query';

export function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider />
        <ErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
