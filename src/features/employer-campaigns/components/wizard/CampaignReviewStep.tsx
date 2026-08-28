import { ListChecks } from 'lucide-react';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion, RubricCriterion } from '../../types/campaignManagement.types';
import type {
  CampaignInfoState,
  CampaignSettingsState,
  JobDescriptionState,
} from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import { CampaignReviewSection } from './review/CampaignReviewSection';
import { useCampaignSlots } from '../../hooks/useCampaignSlots';
import { campaignSlotCapacity } from '../../utils/campaignSlots';

interface CampaignReviewStepProps {
  info: CampaignInfoState;
  jd: JobDescriptionState;
  rubric: RubricCriterion[];
  questions: CampaignQuestion[];
  settings: CampaignSettingsState;
  campaignId?: string;
  domainLabel: string;
  error?: string | null;
  onGoToStep: (step: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function CampaignReviewStep({
  info,
  jd,
  rubric,
  questions,
  settings,
  campaignId,
  domainLabel,
  error,
  onGoToStep,
  onBack,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting = false,
  submitDisabled = false,
}: CampaignReviewStepProps) {
  const { t } = useLanguage();
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const slotsQuery = useCampaignSlots(campaignId, Boolean(campaignId));
  const slots = slotsQuery.data ?? [];
  const slotCapacity = campaignSlotCapacity(slots);

  return (
    <SectionPanel
      icon={<ListChecks className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.review')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onSubmit}
          nextLabel={isSubmitting ? submittingLabel : submitLabel}
          nextDisabled={submitDisabled || isSubmitting}
          isSaving={isSubmitting}
          backDisabled={isSubmitting}
        />
      }
    >
      <div className="space-y-4">
        {error ? <FieldError message={error} /> : null}

        <CampaignReviewSection title={t('employer.campaigns.wizard.check.info')} onEdit={() => onGoToStep(0)}>
          <p>{info.title || t('employer.campaigns.form.noQuestions')}</p>
          <p>
            {domainLabel} · {t('employer.campaigns.form.maxCandidates')}:{' '}
            {info.maxCandidates ?? t('employer.campaigns.form.unlimited')}
          </p>
          <p>
            {t('employer.campaigns.form.timeLimitMinutes')}: {info.timeLimitMinutes} ·{' '}
            {t('employer.campaigns.form.passScorePct')}:{' '}
            {info.passScorePct != null
              ? `${info.passScorePct}%`
              : t('employer.campaigns.form.passScoreHrDecide')}
          </p>
          <p>
            {formatDateTime(info.startsAt)} → {formatDateTime(info.expiresAt)}
          </p>
        </CampaignReviewSection>

        <CampaignReviewSection title={t('employer.campaigns.wizard.check.jd')} onEdit={() => onGoToStep(1)}>
          <p>
            {jd.inputMethod === 'file'
              ? jd.fileName || t('employer.campaigns.wizard.jdFileRequired')
              : jd.jdText.trim().slice(0, 160) || t('employer.campaigns.wizard.jdTextRequired')}
          </p>
          {jd.criteriaText.trim() ? (
            <p className="line-clamp-2">{jd.criteriaText.trim().slice(0, 160)}</p>
          ) : null}
        </CampaignReviewSection>

        <CampaignReviewSection title={t('employer.campaigns.wizard.check.criteria')} onEdit={() => onGoToStep(2)}>
          <p>
            {rubric.length} {t('employer.campaigns.wizard.rubric.name').toLowerCase()} ·{' '}
            {Math.round(totalWeight * 10) / 10}%
          </p>
          <ul className="list-inside list-disc">
            {rubric.map((item) => (
              <li key={item.id}>
                {item.name} — {item.weight}% ({item.maxScore})
              </li>
            ))}
          </ul>
        </CampaignReviewSection>

        <CampaignReviewSection title={t('employer.campaigns.wizard.check.questions')} onEdit={() => onGoToStep(3)}>
          <p>
            {questions.length} {t('employer.campaigns.form.questionsUnit')}
          </p>
          <ul className="list-inside list-disc">
            {questions.slice(0, 5).map((question) => (
              <li key={question.id} className="line-clamp-1">
                {question.prompt || t('employer.campaigns.wizard.questionPromptPlaceholder')}
              </li>
            ))}
          </ul>
        </CampaignReviewSection>

        <CampaignReviewSection title={t('employer.campaigns.wizard.steps.settings')} onEdit={() => onGoToStep(4)}>
          <p>
            {t('employer.campaigns.form.antiCheat')}: {settings.antiCheatEnabled ? t('employer.campaigns.form.yes') : t('employer.campaigns.form.no')}
            {' · '}
            {t('employer.campaigns.form.faceVerify')}: {settings.faceVerifyEnabled ? t('employer.campaigns.form.yes') : t('employer.campaigns.form.no')}
          </p>
          <p>
            {t('employer.campaigns.form.adaptive')}: {settings.adaptiveEnabled ? t('employer.campaigns.form.yes') : t('employer.campaigns.form.no')}
            {settings.adaptiveEnabled
              ? ` · ${t('employer.campaigns.form.maxFollowUps')}: ${settings.maxFollowUps}`
              : null}
            {` · ${t('employer.campaigns.form.maxQuestionsSetting')}: ${settings.maxQuestions}`}
          </p>
        </CampaignReviewSection>

        <CampaignReviewSection title={t('employer.campaigns.slots.title')} onEdit={() => onGoToStep(5)}>
          <p>
            {t('employer.campaigns.slots.reviewSummary')
              .replace('{count}', String(slots.length))
              .replace('{capacity}', String(slotCapacity.total))}
          </p>
          {slots.slice(0, 4).map((slot) => (
            <p key={slot.id}>
              {formatDateTime(slot.startsAt)} → {formatDateTime(slot.endsAt)} ·{' '}
              {slot.assignedCount}/{slot.capacity}
            </p>
          ))}
        </CampaignReviewSection>
      </div>
    </SectionPanel>
  );
}
