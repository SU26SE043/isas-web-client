import { ClipboardCheck } from 'lucide-react';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignWizardValues } from '../../hooks/useCampaignWizard';
import type {
  CampaignProctoringConfig,
  CampaignQuestion,
  RubricCriterion,
} from '../../types/campaignManagement.types';
import { CampaignWizardNav } from './CampaignWizardNav';

interface CampaignReviewStepProps {
  values: CampaignWizardValues;
  rubric: RubricCriterion[];
  questions: CampaignQuestion[];
  proctoring: CampaignProctoringConfig;
  publishError?: string | null;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-satin py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function CampaignReviewStep({
  values,
  rubric,
  questions,
  proctoring,
  publishError,
  onBack,
  onSaveDraft,
  onPublish,
  isSaving,
  isPublishing,
}: CampaignReviewStepProps) {
  const { t } = useLanguage();
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight), 0);

  return (
    <SectionPanel
      icon={<ClipboardCheck className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.review')}
      description={t('employer.campaigns.wizard.steps.reviewDesc')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onSaveDraft={onSaveDraft}
          onPublish={onPublish}
          showPublish
          isSaving={isSaving}
          isPublishing={isPublishing}
        />
      }
    >
      <div className="space-y-6">
        {publishError ? (
          <p className="rounded-lg border border-error/40 bg-error-bg px-3 py-2 text-sm text-error" role="alert">
            {publishError}
          </p>
        ) : null}

        <dl>
          <ReviewRow label={t('employer.campaigns.form.title')} value={values.title || '—'} />
          <ReviewRow label={t('employer.campaigns.form.company')} value={values.company || '—'} />
          <ReviewRow label={t('employer.campaigns.form.location')} value={values.location || '—'} />
          <ReviewRow
            label={t('employer.campaigns.form.mode')}
            value={t(`employer.campaigns.mode.${values.mode}`)}
          />
          <ReviewRow label={t('employer.campaigns.form.summary')} value={values.summary || '—'} />
          <ReviewRow
            label={t('employer.campaigns.form.duration')}
            value={String(values.durationMinutes ?? '—')}
          />
          <ReviewRow
            label={t('employer.campaigns.form.capacity')}
            value={String(values.capacity ?? '—')}
          />
          <ReviewRow label={t('employer.campaigns.form.deadline')} value={values.deadline || '—'} />
          <ReviewRow
            label={t('employer.campaigns.form.weightTotal')}
            value={`${totalWeight}%`}
          />
          <ReviewRow
            label={t('employer.campaigns.form.selectQuestions')}
            value={String(questions.length)}
          />
          <ReviewRow
            label={t('employer.campaigns.form.maxViolations')}
            value={String(proctoring.maxViolations)}
          />
        </dl>

        <div className="rounded-xl border border-satin bg-surface-overlay p-4">
          <p className="text-sm font-medium text-foreground">
            {t('employer.campaigns.form.jobDescription')}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {values.jobDescription || t('employer.campaigns.wizard.emptyJd')}
          </p>
        </div>

        {questions.length > 0 ? (
          <ul className="space-y-2">
            {questions.map((question) => (
              <li
                key={question.id}
                className="rounded-lg border border-satin bg-surface-overlay px-4 py-3 text-sm text-foreground"
              >
                {question.prompt}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </SectionPanel>
  );
}
