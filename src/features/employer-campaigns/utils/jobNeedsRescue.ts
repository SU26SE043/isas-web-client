import type {
  JobNeedCategory,
  UpdateCampaignJobNeedsRequest,
} from '../types/campaign.api.types';

export const DEFAULT_RESCUE_JOB_NEED_CATEGORY: JobNeedCategory = 'Technical';

export function buildJobNeedsRescuePayload(
  text: string,
  category: JobNeedCategory = DEFAULT_RESCUE_JOB_NEED_CATEGORY,
): UpdateCampaignJobNeedsRequest[] {
  const trimmedText = text.trim();
  return trimmedText ? [{ category, text: trimmedText }] : [];
}

