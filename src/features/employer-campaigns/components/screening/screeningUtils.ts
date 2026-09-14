import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import type { CampaignPdfErrorCode } from '../../utils/campaignFiles';

export function canSelectCandidate(item: CampaignCandidateListItem): boolean {
  if (!item.email?.trim()) return false;
  const status = item.status.toLowerCase();
  if (status === 'rejected') return false;
  if (status.includes('invit')) return false;
  if (item.eligible === false) return false;
  return true;
}

/** Server returns candidates in score order; preserve that order for display ranks. */
export function getCandidateRanks(
  candidates: CampaignCandidateListItem[],
): Map<string, number> {
  const ranks = new Map<string, number>();
  let rank = 0;
  candidates.forEach((candidate) => {
    if (candidate.overallMatchScore == null) return;
    rank += 1;
    ranks.set(candidate.id, rank);
  });

  return ranks;
}

export function pdfValidationMessageKey(code: CampaignPdfErrorCode): string {
  switch (code) {
    case 'notPdf':
      return 'employer.campaigns.screening.upload.pdfOnly';
    case 'tooLarge':
      return 'employer.campaigns.files.errors.maxSize';
    case 'corrupt':
      return 'employer.campaigns.screening.upload.invalid';
    default:
      return 'employer.campaigns.screening.upload.invalid';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function verificationRiskTranslationKey(risk: string): string {
  return `employer.campaigns.screening.verificationRisk.${risk}`;
}

export type CandidateAnalysisProgress = {
  total: number;
  pending: number;
  completed: number;
  errors: number;
};

export function getCandidateAnalysisProgress(
  candidates: CampaignCandidateListItem[],
  trackedCandidateIds?: ReadonlySet<string>,
): CandidateAnalysisProgress {
  const tracked = trackedCandidateIds?.size
    ? candidates.filter((candidate) => trackedCandidateIds.has(candidate.id))
    : candidates;
  const isStatus = (candidate: CampaignCandidateListItem, status: string) =>
    candidate.status.toLowerCase() === status.toLowerCase();

  return {
    total: tracked.length,
    pending: tracked.filter(
      (candidate) => isStatus(candidate, 'Analyzing') || isStatus(candidate, 'Filtered'),
    ).length,
    completed: tracked.filter((candidate) => isStatus(candidate, 'Analyzed')).length,
    errors: tracked.filter((candidate) => isStatus(candidate, 'AnalysisFailed')).length,
  };
}

export type PendingCvFile = {
  file: File;
  errorKey?: string;
};
