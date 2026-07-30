import { apiClient } from '@/shared/api/apiClient';
import type { AdminAnalytics, AdminAnalyticsParams } from '../types/adminAnalytics.types';
import { buildAdminAnalyticsParams, parseAdminAnalytics } from '../utils/adminAnalyticsApi';
import { adminAnalyticsEndpoints } from './adminAnalytics.endpoints';

export async function getAdminAnalytics(
  params: AdminAnalyticsParams = {},
): Promise<AdminAnalytics> {
  const response = await apiClient.get<unknown>(adminAnalyticsEndpoints.analytics, {
    params: buildAdminAnalyticsParams(params),
  });
  return parseAdminAnalytics(response.data);
}

export const adminAnalyticsService = { getAdminAnalytics };
