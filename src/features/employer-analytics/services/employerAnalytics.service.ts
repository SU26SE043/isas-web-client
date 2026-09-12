import { apiClient } from '@/shared/api/apiClient';
import type { EmployerAnalytics, EmployerAnalyticsParams } from '../types/employerAnalytics.types';
import { buildEmployerAnalyticsParams, parseEmployerAnalytics } from '../utils/employerAnalyticsApi';
import { employerAnalyticsEndpoints } from './employerAnalytics.endpoints';

/**
 * Luôn gọi gateway thật — KHÔNG đi qua `usesMockData`: dưới Playwright cờ mock bật theo
 * `navigator.webdriver`, còn e2e của trang này stub bằng `page.route` nên service phải phát HTTP thật.
 */
export async function getEmployerAnalytics(
  params: EmployerAnalyticsParams = {},
): Promise<EmployerAnalytics> {
  const response = await apiClient.get<unknown>(employerAnalyticsEndpoints.analytics, {
    params: buildEmployerAnalyticsParams(params),
  });
  return parseEmployerAnalytics(response.data);
}

export const employerAnalyticsService = { getEmployerAnalytics };
