import { Archive, BriefcaseBusiness, CheckCircle2, FilePenLine, Send, Users } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/patterns/StatCard';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../types/campaignManagement.types';
import { computeCampaignStats } from '../utils/campaignStats';

interface CampaignSummaryCardsProps {
  campaigns: EmployerCampaign[];
}

/** 6 số liệu đầu trang chiến dịch — dùng StatCard chung (trước đây mỗi ô một gradient màu riêng, lệch UI monochrome). */
export function CampaignSummaryCards({ campaigns }: CampaignSummaryCardsProps) {
  const { t } = useLanguage();
  const stats = computeCampaignStats(campaigns);

  const cards = [
    { key: 'total', value: stats.total, label: t('employer.campaigns.list.stats.total'), icon: BriefcaseBusiness },
    { key: 'active', value: stats.active, label: t('employer.campaigns.list.stats.active'), icon: CheckCircle2 },
    { key: 'draft', value: stats.draft, label: t('employer.campaigns.list.stats.draft'), icon: FilePenLine },
    { key: 'closed', value: stats.closed, label: t('employer.campaigns.list.stats.closed'), icon: Archive },
    { key: 'invited', value: stats.invited, label: t('employer.campaigns.list.stats.invited'), icon: Send },
    { key: 'completed', value: stats.completed, label: t('employer.campaigns.list.stats.completed'), icon: Users },
  ] as const;

  return (
    <StatGrid columns={6}>
      {cards.map(({ key, value, label, icon: Icon }) => (
        <StatCard key={key} label={label} value={value} icon={<Icon aria-hidden />} />
      ))}
    </StatGrid>
  );
}
