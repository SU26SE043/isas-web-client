import { useQuery } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { roadmapPracticeService } from '../services/roadmapPractice.service';

export const MILESTONE_SCORE_REPORT_QUERY_KEY = ['learning', 'milestone-score-report'] as const;

export function milestoneScoreReportQueryKey(roadmapId: string, milestoneId: string) {
  return [...MILESTONE_SCORE_REPORT_QUERY_KEY, roadmapId, milestoneId] as const;
}

/**
 * Lười theo THIẾT KẾ: hook chỉ chạy khi panel được mount, mà panel chỉ mount khi
 * người học bấm mở. Phần tính là thứ chỉ xem lúc thắc mắc — nạp sẵn cho mọi chặng
 * của mọi lộ trình là gọi API cho thứ gần như không ai mở.
 */
export function useMilestoneScoreReport(roadmapId: string, milestoneId: string) {
  return useQuery({
    queryKey: milestoneScoreReportQueryKey(roadmapId, milestoneId),
    queryFn: () => roadmapPracticeService.getMilestoneScoreReport(roadmapId, milestoneId),
    enabled: Boolean(roadmapId) && Boolean(milestoneId),
    retry: (count, error) => {
      const status = getApiStatusCode(error);
      return status === 403 || status === 404 ? false : count < 2;
    },
  });
}
