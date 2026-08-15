import { CalendarClock } from 'lucide-react';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import { CampaignSlotsPanel } from '../slots/CampaignSlotsPanel';
import { CampaignWizardNav } from './CampaignWizardNav';

interface CampaignSlotsStepProps {
  campaignId: string;
  onBack: () => void;
  onNext: () => void;
}

export function CampaignSlotsStep({ campaignId, onBack, onNext }: CampaignSlotsStepProps) {
  const { t } = useLanguage();
  return (
    <SectionPanel
      icon={<CalendarClock className="size-4" aria-hidden />}
      title={t('employer.campaigns.slots.title')}
      description={t('employer.campaigns.slots.stepDescription')}
      footer={<CampaignWizardNav onBack={onBack} onNext={onNext} />}
    >
      <CampaignSlotsPanel campaignId={campaignId} editable />
    </SectionPanel>
  );
}
