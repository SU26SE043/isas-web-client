import axios from 'axios';
import { getApiStatusCode } from '@/shared/api/apiError';
import { CampaignRequestError } from '../services/campaignManagement.service';

function getResponseData(error: unknown): unknown {
  if (error instanceof CampaignRequestError) return error.message;
  if (!axios.isAxiosError(error)) return undefined;
  return error.response?.data;
}

export function getGenerateQuestionsErrorKey(error: unknown): string {
  const status =
    getApiStatusCode(error) ??
    (error instanceof CampaignRequestError ? error.status : undefined);

  if (status === 409) return 'employer.campaigns.campaignQuestions.errors.draftOnly';
  if (status === 404) return 'employer.campaigns.campaignQuestions.errors.campaignNotFound';
  if (status === 403) return 'employer.campaigns.campaignQuestions.errors.forbidden';
  if (status === 502 || status === 503) {
    return 'employer.campaigns.campaignQuestions.errors.aiUnavailable';
  }
  if (status === 400) {
    const data = getResponseData(error);
    const text =
      typeof data === 'string'
        ? data
        : data && typeof data === 'object' && 'error' in data
          ? String((data as { error: unknown }).error ?? '')
          : error instanceof Error
            ? error.message
            : '';
    if (/jd|job description|mô tả công việc/i.test(text)) {
      return 'employer.campaigns.campaignQuestions.errors.jdRequired';
    }
    if (/count|số lượng/i.test(text)) {
      return 'employer.campaigns.campaignQuestions.validation.countMaximum';
    }
    return 'employer.campaigns.campaignQuestions.errors.generateFailed';
  }
  return 'employer.campaigns.campaignQuestions.errors.generateFailed';
}

export function getGenerateQuestionsErrorMessage(error: unknown, fallback: string): string {
  const data = getResponseData(error);
  if (typeof data === 'string' && data.trim()) return data.trim();
  if (
    data &&
    typeof data === 'object' &&
    'error' in data &&
    typeof (data as { error: unknown }).error === 'string'
  ) {
    return (data as { error: string }).error;
  }
  if (
    data &&
    typeof data === 'object' &&
    'message' in data &&
    typeof (data as { message: unknown }).message === 'string'
  ) {
    return (data as { message: string }).message;
  }
  return fallback;
}
