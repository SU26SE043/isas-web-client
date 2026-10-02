import { CampaignCandidateError } from '../services/campaignCandidate.service';

/** [C8] 409 { code: "ATTEMPT_LIMIT_REACHED" } — service đã đọc `code` trước status. */
export function isAttemptLimitReached(error: unknown): boolean {
  return error instanceof CampaignCandidateError && error.code === 'attemptLimitReached';
}

export function startErrorMessage(error: unknown, t: (key: string) => string): string {
  if (!(error instanceof CampaignCandidateError)) return t('campaigns.detail.startUnknown');
  if (isAttemptLimitReached(error)) return t('campaigns.detail.startAttemptLimitReached');
  if (error.code === 'unauthorized') return t('campaigns.detail.startUnauthorized');
  if (error.code === 'paymentRequired') return t('campaigns.detail.startPaymentRequired');
  if (error.code === 'forbidden') return t('campaigns.detail.startForbidden');
  if (error.code === 'outsideSlotWindow') return t('campaigns.detail.startOutsideSlotWindow');
  if (error.code === 'concurrentLimit') return t('campaigns.detail.startConcurrentLimit');
  if (error.code === 'conflict') return error.message || t('campaigns.detail.startConflict');
  if (error.code === 'identityError' || error.code === 'serverError') {
    return t('campaigns.detail.startServerError');
  }
  return error.message || t('campaigns.detail.startUnknown');
}
