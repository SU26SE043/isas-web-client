import axios from 'axios';
import { getApiStatusCode } from '@/shared/api/apiError';
import { CampaignRequestError } from '../services/campaignManagement.service';

function getResponseData(error: unknown): unknown {
  if (error instanceof CampaignRequestError) {
    return error.message;
  }
  if (!axios.isAxiosError(error)) {
    return undefined;
  }
  return error.response?.data;
}

/** Map invitation API failures to a translation key or backend reason string. */
export function getCampaignInvitationErrorKey(error: unknown): string {
  const status = getApiStatusCode(error) ?? (error instanceof CampaignRequestError ? error.status : undefined);
  if (status === 409) return 'employer.campaigns.emailInvitations.errors.campaignNotActiveConflict';
  if (status === 404) return 'employer.campaigns.emailInvitations.errors.campaignNotFound';
  if (status === 400) {
    const data = getResponseData(error);
    const text =
      typeof data === 'string'
        ? data
        : data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string'
          ? (data as { error: string }).error
          : error instanceof CampaignRequestError
            ? error.message
            : '';
    if (/empty|rỗng|EMPTY/i.test(text)) {
      return 'employer.campaigns.emailInvitations.errors.emptyList';
    }
    if (/max|quota|capacity|giới hạn/i.test(text)) {
      return 'employer.campaigns.emailInvitations.errors.maxCandidates';
    }
    return 'employer.campaigns.emailInvitations.errors.badRequest';
  }
  return 'employer.campaigns.emailInvitations.errors.sendFailed';
}

export function getCampaignInvitationError(error: unknown, fallback: string): string {
  const data = getResponseData(error);
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }
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
  if (error instanceof Error && error.message.trim() && error.message !== 'EMPTY_EMAILS') {
    return error.message;
  }
  return fallback;
}
