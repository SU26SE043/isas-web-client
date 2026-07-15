import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ServerErrorPage } from '@/pages/errors/ErrorPages';
import { captureError } from '@/shared/monitoring/errorMonitoring';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ServerErrorPage />;
    }

    return this.props.children;
  }
}
