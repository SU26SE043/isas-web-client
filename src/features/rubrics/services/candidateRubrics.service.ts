import { apiClient } from '@/shared/api/apiClient';
import { getApiStatusCode } from '@/shared/api/apiError';
import type { JobCategory, RubricResponse, UpdateRubricRequest } from '../types/rubric.types';
import { candidateRubricsEndpoints } from './candidateRubrics.endpoints';

function normalizeRubricResponse(data: RubricResponse): RubricResponse {
  return {
    jobCategory: data.jobCategory,
    isCustom: Boolean(data.isCustom),
    criteria: Array.isArray(data.criteria) ? data.criteria : [],
  };
}

export async function getRubric(jobCategory: JobCategory): Promise<RubricResponse> {
  const response = await apiClient.get<RubricResponse>(candidateRubricsEndpoints.rubric(jobCategory));
  return normalizeRubricResponse(response.data);
}

export async function updateRubric(
  jobCategory: JobCategory,
  payload: UpdateRubricRequest,
): Promise<RubricResponse> {
  const response = await apiClient.put<RubricResponse>(
    candidateRubricsEndpoints.rubric(jobCategory),
    payload,
  );
  return normalizeRubricResponse(response.data);
}

export async function resetRubric(jobCategory: JobCategory): Promise<void> {
  await apiClient.delete(candidateRubricsEndpoints.rubric(jobCategory), {
    validateStatus: (status) => status === 204 || (status >= 200 && status < 300),
  });
}

export function isRubricValidationError(status?: number): boolean {
  return status === 400;
}

export function getRubricErrorStatus(error: unknown): number | undefined {
  return getApiStatusCode(error);
}
