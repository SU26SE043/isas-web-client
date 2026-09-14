import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { employerAnalyticsService } from '../services/employerAnalytics.service';
import type { EmployerAnalyticsParams } from '../types/employerAnalytics.types';

export const employerAnalyticsKeys = {
  all: ['employer-campaign-analytics'] as const,
  detail: (params: EmployerAnalyticsParams) => [...employerAnalyticsKeys.all, params] as const,
};

/**
 * Khoá query mang trọn `params` (kỳ + nhóm) ⇒ đổi lọc là khoá mới. `placeholderData: keepPreviousData`
 * (TanStack v5 — thay `keepPreviousData: true` của v4) giữ số cũ trên màn trong lúc tải kỳ mới thay vì
 * nháy về skeleton; `isPlaceholderData` cho UI mờ số đang chờ.
 * 400/401/403 là lỗi ổn định (kỳ sai · chưa đăng nhập · phiên không có tổ chức) — thử lại vô ích.
 */
export function useEmployerAnalytics(params: EmployerAnalyticsParams = {}) {
  return useQuery({
    queryKey: employerAnalyticsKeys.detail(params),
    queryFn: () => employerAnalyticsService.getEmployerAnalytics(params),
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      const status = getApiStatusCode(error);
      if (status === 400 || status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
}
