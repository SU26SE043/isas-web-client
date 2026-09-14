import { LoaderCircle } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { getCandidateAnalysisProgress } from './screeningUtils';

interface CandidateAnalysisProgressProps {
  candidates: CampaignCandidateListItem[];
  trackedCandidateIds?: ReadonlySet<string>;
}

export function CandidateAnalysisProgress({ candidates, trackedCandidateIds }: CandidateAnalysisProgressProps) {
  const { t } = useLanguage();
  const progress = getCandidateAnalysisProgress(candidates, trackedCandidateIds);
  if (progress.pending === 0) return null;

  return (
    <p
      className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/5 px-3 py-2 text-sm text-info"
      aria-live="polite"
    >
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      {t('employer.campaigns.screening.analysisProgress')
        .replace('{{pending}}', String(progress.pending))
        .replace('{{total}}', String(progress.total))
        .replace('{{completed}}', String(progress.completed))
        .replace('{{errors}}', String(progress.errors))}
    </p>
  );
}
