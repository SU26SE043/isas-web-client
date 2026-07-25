import { useQuery } from '@tanstack/react-query';
import { adminCampaignsService } from '../services/adminCampaigns.service';
import type { GetAdminCampaignsParams } from '../types/adminCampaigns.types';

export const adminCampaignKeys = {
  all: ['admin-campaigns'] as const,
  list: (params: GetAdminCampaignsParams) => [...adminCampaignKeys.all, params] as const,
};

export function useAdminCampaigns(
  params: GetAdminCampaignsParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: adminCampaignKeys.list(params),
    queryFn: () => adminCampaignsService.getAdminCampaigns(params),
    enabled: options?.enabled ?? true,
    placeholderData: (previous) => previous,
  });
}
