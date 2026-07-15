import { QueryClient } from '@tanstack/react-query';
import { HttpStatus } from '@/shared/constants/http-status';
import { getApiStatusCode } from '@/shared/api/apiError';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        const status = getApiStatusCode(error);

        if (status === HttpStatus.UNAUTHORIZED) {
          return false;
        }

        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
    },
  },
});
