import axios from 'axios';
import { getApiStatusCode } from '@/shared/api/apiError';
import { CampaignRequestError } from '../services/campaignManagement.service';

function getResponseData(error: unknown): unknown {
  if (error instanceof CampaignRequestError) return error.message;
  if (!axios.isAxiosError(error)) return undefined;
  return error.response?.data;
}

export function getInvitationListErrorKey(error: unknown): string {
  const status =
    getApiStatusCode(error) ??
    (error instanceof CampaignRequestError ? error.status : undefined);
  if (status === 403) return 'employer.campaigns.campaignInvitations.errors.forbidden';
  if (status === 404) return 'employer.campaigns.campaignInvitations.errors.campaignNotFound';
  return 'employer.campaigns.campaignInvitations.errors.loadFailed';
}

export function getInvitationReissueErrorKey(error: unknown): string {
  const status =
    getApiStatusCode(error) ??
    (error instanceof CampaignRequestError ? error.status : undefined);
  if (status === 409) return 'employer.campaigns.campaignInvitations.errors.campaignNotActive';
  if (status === 404) return 'employer.campaigns.campaignInvitations.errors.invitationNotFound';
  return 'employer.campaigns.campaignInvitations.errors.reissueFailed';
}

export function getInvitationApiErrorMessage(error: unknown, fallback: string): string {
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
