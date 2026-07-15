import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion } from '../../types/campaignManagement.types';
import type { CampaignWizardValues } from '../../hooks/useCampaignWizard';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignInterviewConfigStepProps {
  register: UseFormRegister<CampaignWizardValues>;
  errors: FieldErrors<CampaignWizardValues>;
  questions: CampaignQuestion[];
  selectedIds: string[];
  onToggleQuestion: (id: string, checked: boolean) => void;
  questionError?: string;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export function CampaignInterviewConfigStep({
  register,
  errors,
  questions,
  selectedIds,
  onToggleQuestion,
  questionError,
  onBack,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignInterviewConfigStepProps) {
  const { t } = useLanguage();

  return (
    <SectionPanel
      icon={<Bot className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.interview')}
      description={t('employer.campaigns.wizard.steps.interviewDesc')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          onSaveDraft={onSaveDraft}
          isSaving={isSaving}
        />
      }
    >
      <div className="space-y-6">
        <div className="max-w-xs space-y-2">
          <Label htmlFor="durationMinutes">{t('employer.campaigns.form.duration')}</Label>
          <Input
            id="durationMinutes"
            type="number"
            min={15}
            aria-invalid={!!errors.durationMinutes}
            {...register('durationMinutes', { valueAsNumber: true })}
          />
          <FieldError message={errors.durationMinutes?.message} />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            {t('employer.campaigns.form.selectQuestions')}
          </h3>
          {questionError ? <FieldError message={questionError} /> : null}
          {questions.map((question) => (
            <label
              key={question.id}
              className="flex gap-3 rounded-xl border border-satin bg-surface-overlay p-4"
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={selectedIds.includes(question.id)}
                onChange={(event) => onToggleQuestion(question.id, event.target.checked)}
              />
              <span>
                <span className="block text-sm font-medium text-foreground">{question.prompt}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {question.skill} · {t(`employer.campaigns.questionDifficulty.${question.difficulty}`)}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </SectionPanel>
  );
}
