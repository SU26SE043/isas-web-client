import { getApiStatusCode } from '@/shared/api/apiError';
import type {
  CampaignCandidateListItem,
  UpdateCampaignCandidatePayload,
} from '../types/campaign.api.types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isCandidateInvited(status: string): boolean {
  return status.toLowerCase().includes('invit');
}

export function canEditCandidate(item: Pick<CampaignCandidateListItem, 'status'>): boolean {
  return !isCandidateInvited(item.status);
}

export function isValidCandidateEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function buildUpdateCandidatePayload(
  current: { fullName?: string | null; email?: string | null },
  next: { fullName: string; email: string },
): UpdateCampaignCandidatePayload {
  const payload: UpdateCampaignCandidatePayload = {};
  const fullName = next.fullName.trim();
  const email = next.email.trim().toLowerCase();
  const currentName = (current.fullName ?? '').trim();
  const currentEmail = (current.email ?? '').trim().toLowerCase();

  if (fullName !== currentName && fullName) {
    payload.fullName = fullName;
  }
  if (email !== currentEmail && email) {
    payload.email = email;
  }
  return payload;
}

export function getUpdateCandidateErrorKey(error: unknown): string {
  const status = getApiStatusCode(error);
  switch (status) {
    case 400:
      return 'employer.campaigns.screening.errors.updateBadRequest';
    case 404:
      return 'employer.campaigns.screening.errors.updateNotFound';
    case 409:
      return 'employer.campaigns.screening.errors.updateInvited';
    default:
      return 'employer.campaigns.screening.errors.updateFailed';
  }
}

export function getCandidateCvErrorKey(error: unknown): string {
  const status = getApiStatusCode(error);
  if (status === 404) return 'employer.campaigns.screening.errors.cvNotFound';
  return 'employer.campaigns.screening.errors.cvLoadFailed';
}

/** Safe download filename from candidate display name. */
export function candidateCvDownloadName(fullName?: string | null): string {
  const base = (fullName?.trim() || 'candidate')
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return `${base || 'candidate'}-cv.pdf`;
}
