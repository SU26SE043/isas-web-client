import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { CampaignCandidateRow } from '../types/campaignManagement.types';

const statusClass: Record<CampaignCandidateRow['status'], string> = {
  invited: 'border-success/30 bg-success-bg text-success',
  invite_pending: 'border-warning/30 bg-warning-bg text-warning',
};

interface CampaignCandidateTableProps {
  candidates: CampaignCandidateRow[];
}

export function CampaignCandidateTable({ candidates }: CampaignCandidateTableProps) {
  const { t } = useLanguage();

  if (candidates.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('employer.campaigns.detail.candidatesEmpty')}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-subtle text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-medium">{t('employer.campaigns.detail.candidateEmail')}</th>
            <th className="px-3 py-2 font-medium">{t('employer.campaigns.detail.candidateName')}</th>
            <th className="px-3 py-2 font-medium">{t('employer.campaigns.detail.candidateStatus')}</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate.email} className="border-b border-subtle/70">
              <td className="px-3 py-3 text-foreground">{candidate.email}</td>
              <td className="px-3 py-3 text-muted-foreground">{candidate.displayName ?? '—'}</td>
              <td className="px-3 py-3">
                <Badge variant="outline" className={cn(statusClass[candidate.status])}>
                  {t(`employer.campaigns.candidateStatus.${candidate.status}`)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
