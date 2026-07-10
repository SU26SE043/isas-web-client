import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        const status =
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof (error as { response?: { status?: number } }).response?.status === 'number'
            ? (error as { response: { status: number } }).response.status
            : undefined;

        if (status === 401) {
          return false;
        }

        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
    },
  },
});
