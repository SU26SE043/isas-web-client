import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { adminRoadmapThresholdService } from '../services/adminRoadmapThreshold.service';
import type { RoadmapThreshold } from '../types/adminApi.types';

export const adminRoadmapThresholdKeys = {
  all: ['admin-roadmap-thresholds'] as const,
  list: () => ['admin-roadmap-thresholds', 'list'] as const,
};

const retry = (count: number, error: unknown) =>
  getApiStatusCode(error) === 401 || getApiStatusCode(error) === 403 ? false : count < 2;

export function useAdminRoadmapThresholds() {
  const queryClient = useQueryClient();
  const list = useQuery({
    queryKey: adminRoadmapThresholdKeys.list(),
    queryFn: () => adminRoadmapThresholdService.list(),
    retry,
  });
  const update = useMutation({
    mutationFn: (thresholds: Record<string, number>) => adminRoadmapThresholdService.update(thresholds),
    // PUT đã trả bộ đầy đủ -> nạp thẳng, khỏi một vòng GET nữa.
    onSuccess: (data: RoadmapThreshold[]) => queryClient.setQueryData(adminRoadmapThresholdKeys.list(), data),
  });
  const reset = useMutation({
    mutationFn: (level: string) => adminRoadmapThresholdService.reset(level),
    // DELETE trả 204 (không có body) nên bắt buộc phải đọc lại.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminRoadmapThresholdKeys.all }),
  });
  return { list, update, reset };
}
