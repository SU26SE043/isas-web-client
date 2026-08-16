import { useQuery } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { adminPaymentService } from '../services/adminPayment.service';
import type { AdminAnalyticsGranularity } from '../types/adminAnalytics.types';

export function useAdminRevenue(groupBy: AdminAnalyticsGranularity) {
  const revenue = useQuery({
    queryKey: ['admin-finance-revenue', groupBy],
    queryFn: () => adminPaymentService.getRevenue({ groupBy }),
    retry: (failureCount, error) => {
      const status = getApiStatusCode(error);
      if (status === 400 || status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
  const snapshot = useQuery({
    queryKey: ['admin-finance-snapshot'],
    queryFn: adminPaymentService.getFinanceSnapshot,
    retry: 1,
  });
  return { revenue, snapshot };
}
