import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'surface-elevated border border-default text-sm text-foreground shadow-lg',
        duration: 4000,
        success: { className: 'surface-elevated border border-success/30 bg-success-bg text-foreground' },
        error: { className: 'surface-elevated border border-error/30 bg-error-bg text-foreground' },
      }}
    />
  );
}
