import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaignStatus } from '../types/campaignManagement.types';

const statusClass: Record<EmployerCampaignStatus, string> = {
  draft: 'border-subtle bg-surface-overlay text-muted-foreground',
  active: 'border-success/30 bg-success-bg text-success',
  paused: 'border-warning/30 bg-warning-bg text-warning',
  closed: 'border-error/30 bg-error-bg text-error',
  archived: 'border-subtle bg-surface-overlay text-muted-foreground',
};

export function CampaignManagementStatusBadge({ status }: { status: EmployerCampaignStatus }) {
  const { t } = useLanguage();
  return (
    <Badge variant="outline" className={cn(statusClass[status])}>
      {t(`employer.campaigns.status.${status}`)}
    </Badge>
  );
}
