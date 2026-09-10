import { CalendarClock } from 'lucide-react';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import { CampaignSlotsPanel } from '../slots/CampaignSlotsPanel';
import { CampaignCapacitySection } from './CampaignCapacitySection';
import { CampaignWizardNav } from './CampaignWizardNav';
import { WizardSection } from './WizardSection';

interface CampaignSlotsStepProps {
  campaignId: string | null;
  maxCandidates: number | null;
  campaignStartsAt: string;
  campaignExpiresAt: string;
  error?: string | null;
  onMaxCandidatesChange: (value: number | null) => void;
  onBack: () => void;
  onNext: () => void;
}

/**
 * Sức chứa & ca thi. Trần ứng viên nằm ở đây chứ không ở bước 1 vì nó CÙNG BẢN CHẤT với sức
 * chứa từng ca — và đây là chỗ duy nhất so được hai con số đó với nhau.
 *
 * ⚠ Phần sức chứa LUÔN hiện (bắt buộc); chỉ phần ca thi mới là tuỳ chọn, và nó cần
 * `campaignId` vì ca lưu thẳng qua API chứ không nằm trong state nháp.
 */
export function CampaignSlotsStep({
  campaignId, maxCandidates, campaignStartsAt, campaignExpiresAt, error,
  onMaxCandidatesChange, onBack, onNext,
}: CampaignSlotsStepProps) {
  const { t } = useLanguage();
  return (
    <SectionPanel
      icon={<CalendarClock className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.slots')}
      description={t('employer.campaigns.slots.stepDescription')}
      footer={<CampaignWizardNav onBack={onBack} onNext={onNext} />}
    >
      <div className="space-y-5">
        <CampaignCapacitySection
          campaignId={campaignId}
          maxCandidates={maxCandidates}
          campaignStartsAt={campaignStartsAt}
          campaignExpiresAt={campaignExpiresAt}
          invalid={Boolean(error) && maxCandidates == null}
          onChange={onMaxCandidatesChange}
        />
        <WizardSection divided hint={t('employer.campaigns.form.group.slotsHint')}>
          {campaignId ? (
            <CampaignSlotsPanel campaignId={campaignId} editable />
          ) : (
            <p className="text-xs leading-relaxed text-muted-foreground">{t('employer.campaigns.form.slotsNeedDraft')}</p>
          )}
        </WizardSection>
      </div>
    </SectionPanel>
  );
}
