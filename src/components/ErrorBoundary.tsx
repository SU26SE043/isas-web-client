import { Component, type ErrorInfo, type ReactNode } from 'react';

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
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen flex items-center justify-center surface-base px-4">
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-semibold text-foreground mb-2">Something went wrong</h1>
              <p className="text-muted-foreground mb-6">
                An unexpected error occurred. Reload the page or try again later.
              </p>
              <button type="button" className="btn-primary px-6 py-2" onClick={() => window.location.reload()}>
                Reload
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
