import { apiClient } from '@/shared/api/apiClient';
import type { RoadmapThreshold } from '../types/adminApi.types';
import { adminApiEndpoints } from './adminApi.endpoints';

const unwrap = <T>(data: unknown): T => {
  if (data && typeof data === 'object' && 'data' in data) return (data as { data: T }).data;
  return data as T;
};

export const adminRoadmapThresholdService = {
  list: async () => unwrap<RoadmapThreshold[]>((await apiClient.get(adminApiEndpoints.roadmapThresholds)).data),
  /**
   * PUT trả về ĐÚNG shape của GET nên caller nạp thẳng vào cache, không cần refetch.
   * Gửi phần ĐÃ SỬA thôi: DELETE mới là đường "trả về mặc định", PUT chỉ đặt override.
   */
  update: async (thresholds: Record<string, number>) =>
    unwrap<RoadmapThreshold[]>((await apiClient.put(adminApiEndpoints.roadmapThresholds, { thresholds })).data),
  reset: async (level: string) => {
    await apiClient.delete(adminApiEndpoints.roadmapThreshold(level));
  },
};
