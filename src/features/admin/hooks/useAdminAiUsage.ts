import { useQuery } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { adminPaymentService } from '../services/adminPayment.service';
import type { AdminAnalyticsGranularity } from '../types/adminAnalytics.types';

const retry = (failureCount: number, error: unknown) => {
  const status = getApiStatusCode(error);
  if (status === 400 || status === 401 || status === 403) return false;
  return failureCount < 2;
};

/**
 * Chi phí AI (F22) đọc theo ĐÚNG kỳ `[from,to)` của báo cáo doanh thu — không tự chọn kỳ. Revenue đã trả
 * `aiCostVnd` cùng kỳ; nếu khối này tự lấy kỳ mặc định khác, hai con số đứng cạnh nhau sẽ lệch mà không
 * ai giải thích được. `enabled` chỉ bật khi đã có `from/to` từ revenue (dependent query).
 */
export function useAdminAiUsage(range: { from: string; to: string } | null, groupBy: AdminAnalyticsGranularity) {
  return useQuery({
    queryKey: ['admin-ai-usage', range?.from ?? null, range?.to ?? null, groupBy],
    queryFn: () => adminPaymentService.getAiUsage({ from: range!.from, to: range!.to, groupBy }),
    enabled: range !== null,
    retry,
  });
}

/** Traffic (FR18) — cùng kỳ với doanh thu, nhóm theo ngày (BE chỉ nhận hour|day). */
export function useAdminTraffic(range: { from: string; to: string } | null) {
  return useQuery({
    queryKey: ['admin-traffic', range?.from ?? null, range?.to ?? null],
    queryFn: () => adminPaymentService.getTraffic({ from: range!.from, to: range!.to, groupBy: 'day' }),
    enabled: range !== null,
    retry,
  });
}
