import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import type { CampaignPdfErrorCode } from '../../utils/campaignFiles';

export function canSelectCandidate(item: CampaignCandidateListItem): boolean {
  if (!item.email?.trim()) return false;
  const status = item.status.toLowerCase();
  if (status === 'rejected') return false;
  if (status.includes('invit')) return false;
  return true;
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

export type PendingCvFile = {
  file: File;
  errorKey?: string;
};
