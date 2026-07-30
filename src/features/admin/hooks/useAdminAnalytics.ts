import { useQuery } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { adminAnalyticsService } from '../services/adminAnalytics.service';
import type { AdminAnalyticsParams } from '../types/adminAnalytics.types';

export const adminAnalyticsKeys = {
  all: ['admin-auth-analytics'] as const,
  detail: (params: AdminAnalyticsParams) =>
    [...adminAnalyticsKeys.all, params] as const,
};

export function useAdminAnalytics(params: AdminAnalyticsParams = {}) {
  return useQuery({
    queryKey: adminAnalyticsKeys.detail(params),
    queryFn: () => adminAnalyticsService.getAdminAnalytics(params),
    retry: (failureCount, error) => {
      const status = getApiStatusCode(error);
      if (status === 400 || status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
}
