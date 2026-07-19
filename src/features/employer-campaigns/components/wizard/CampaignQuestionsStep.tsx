import { HelpCircle, Plus, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion } from '../../types/campaignManagement.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import { CampaignQuestionCard } from './questions/CampaignQuestionCard';

interface CampaignQuestionsStepProps {
  questions: CampaignQuestion[];
  questionCount: number;
  maxQuestions: number | null;
  error?: string | null;
  onQuestionCount: (count: number) => void;
  onGenerateAi: () => void;
  onAddManual: () => void;
  onChangePrompt: (id: string, prompt: string) => void;
  onToggleRequired: (id: string, isRequired: boolean) => void;
  onMoveQuestion: (id: string, direction: 'up' | 'down') => void;
  onRemoveQuestion: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  isSaving?: boolean;
}

export function CampaignQuestionsStep({
  questions,
  questionCount,
  maxQuestions,
  error,
  onQuestionCount,
  onGenerateAi,
  onAddManual,
  onChangePrompt,
  onToggleRequired,
  onMoveQuestion,
  onRemoveQuestion,
  onBack,
  onNext,
  isSaving,
}: CampaignQuestionsStepProps) {
  const { t } = useLanguage();
  const exceedsMax = maxQuestions != null && questions.length > maxQuestions;

  return (
    <SectionPanel
      icon={<HelpCircle className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.questions')}
      description={t('employer.campaigns.wizard.steps.questionsDesc')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          isSaving={isSaving}
          nextDisabled={isSaving || questions.length === 0}
          backDisabled={isSaving}
        />
      }
    >
      <div className="space-y-5">
        {error ? <FieldError message={error} /> : null}

        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-satin bg-surface-overlay p-4">
          <div className="space-y-2">
            <Label htmlFor="question-count">{t('employer.campaigns.form.questionCount')}</Label>
            <Input
              id="question-count"
              type="number"
              min={1}
              max={20}
              className="w-28"
              disabled={isSaving}
              value={questionCount}
              onChange={(e) =>
                onQuestionCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))
              }
            />
          </div>
          <button
            type="button"
            disabled={isSaving}
            className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onGenerateAi}
          >
            <Sparkles className="size-4" aria-hidden />
            {t('employer.campaigns.wizard.generateQuestions')}
          </button>
          <button
            type="button"
            disabled={isSaving}
            className="btn-secondary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onAddManual}
          >
            <Plus className="size-4" aria-hidden />
            {t('employer.campaigns.wizard.addManualQuestion')}
          </button>
        </div>

        {maxQuestions != null ? (
          <p className={exceedsMax ? 'text-sm text-error' : 'text-xs text-muted-foreground'}>
            {t('employer.campaigns.wizard.questionCountVsMax')
              .replace('{count}', String(questions.length))
              .replace('{max}', String(maxQuestions))}
          </p>
        ) : null}

        {questions.length > 0 ? (
          <ul className="space-y-3">
            {questions.map((question, index) => (
              <CampaignQuestionCard
                key={question.id}
                question={question}
                index={index}
                total={questions.length}
                disabled={isSaving}
                onChangePrompt={(prompt) => onChangePrompt(question.id, prompt)}
                onToggleRequired={(isRequired) => onToggleRequired(question.id, isRequired)}
                onMoveUp={() => onMoveQuestion(question.id, 'up')}
                onMoveDown={() => onMoveQuestion(question.id, 'down')}
                onRemove={() => onRemoveQuestion(question.id)}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t('employer.campaigns.form.noQuestions')}</p>
        )}
      </div>
    </SectionPanel>
  );
}
