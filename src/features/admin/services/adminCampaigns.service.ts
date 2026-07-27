import { apiClient } from '@/shared/api/apiClient';
import type {
  AdminCampaignPage,
  GetAdminCampaignsParams,
} from '../types/adminCampaigns.types';
import { buildAdminCampaignQueryParams } from '../utils/adminCampaignsActions';
import { parseAdminCampaignPage } from '../utils/adminCampaignsApi';
import { adminCampaignEndpoints } from './adminCampaigns.endpoints';

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
};
