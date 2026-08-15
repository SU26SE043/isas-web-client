import { apiClient } from '@/shared/api/apiClient';
import type {
  AdminCampaignPage,
  GetAdminCampaignsParams,
} from '../types/adminCampaigns.types';
import { buildAdminCampaignQueryParams } from '../utils/adminCampaignsActions';
import { parseAdminCampaignPage } from '../utils/adminCampaignsApi';
import { adminCampaignEndpoints } from './adminCampaigns.endpoints';
import { adminApiEndpoints } from './adminApi.endpoints';
import type { AdminCampaignAnalytics } from '../types/adminApi.types';

export async function getAdminCampaigns(
  params: GetAdminCampaignsParams,
): Promise<AdminCampaignPage> {
  const response = await apiClient.get<unknown>(adminCampaignEndpoints.list, {
    params: buildAdminCampaignQueryParams(params),
  });
  return parseAdminCampaignPage(response.data, response.headers);
}

export const adminCampaignsService = {
  getAdminCampaigns,
  async getAnalytics(params: { from?: string; to?: string; groupBy?: 'day' | 'month' } = {}): Promise<AdminCampaignAnalytics> {
    const response = await apiClient.get<AdminCampaignAnalytics>(adminApiEndpoints.campaignAnalytics, { params });
    return response.data;
  },
};
