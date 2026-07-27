import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { AdminCampaignStatus } from '../../types/adminCampaigns.types';

const statusClass: Record<AdminCampaignStatus, string> = {
  Draft: 'border-subtle bg-surface-overlay text-muted-foreground',
  Active: 'border-success/30 bg-success/10 text-success',
  Closed: 'border-warning/30 bg-warning/10 text-warning',
  Archived: 'border-subtle bg-surface-overlay text-muted-foreground',
};

export function AdminCampaignStatusBadge({ status }: { status: AdminCampaignStatus }) {
  const { t } = useLanguage();
  return (
    <Badge variant="outline" className={cn(statusClass[status])}>
      {t(`admin.campaignsManage.status.${status}`)}
    </Badge>
  );
}
