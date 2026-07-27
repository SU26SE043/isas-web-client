import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    return (
      <p className="text-sm text-muted-foreground">
        {t('employer.campaigns.detail.candidatesEmpty')}
      </p>
    );
  }

  return (
    <Table className="min-w-[520px]">
      <TableHeader>
        <TableRow>
          <TableHead>{t('employer.campaigns.detail.candidateEmail')}</TableHead>
          <TableHead>{t('employer.campaigns.detail.candidateName')}</TableHead>
          <TableHead>{t('employer.campaigns.detail.candidateStatus')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => (
          <TableRow key={candidate.email}>
            <TableCell className="font-medium text-foreground">{candidate.email}</TableCell>
            <TableCell>{candidate.displayName ?? '—'}</TableCell>
            <TableCell>
              <Badge variant="outline" className={cn(statusClass[candidate.status])}>
                {t(`employer.campaigns.candidateStatus.${candidate.status}`)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
