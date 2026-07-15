import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import type { CampaignStatus } from '../types/campaign.types';

const statusClass: Record<CampaignStatus, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  'closing-soon': 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  filled: 'border-red-500/30 bg-red-500/10 text-red-300',
  enrolled: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const { t } = useLanguage();
  return (
    <Badge variant="outline" className={statusClass[status]}>
      {t(`campaigns.status.${status}`)}
    </Badge>
  );
}
