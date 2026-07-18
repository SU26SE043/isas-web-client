import { HelpCircle, Sparkles, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion } from '../../types/campaignManagement.types';
import type { QuestionSource } from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignQuestionsStepProps {
  questionSource: QuestionSource;
  questionCount: number;
  questions: CampaignQuestion[];
  error?: string | null;
  onSelectSource: (source: 'ai' | 'upload') => void;
  onQuestionCount: (count: number) => void;
  onGenerateAi: () => void;
  onChangeQuestions: (questions: CampaignQuestion[]) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export function CampaignQuestionsStep({
  questionSource,
  questionCount,
  questions,
  error,
  onSelectSource,
  onQuestionCount,
  onGenerateAi,
  onChangeQuestions,
  onBack,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignQuestionsStepProps) {
  const { t } = useLanguage();

  const patchPrompt = (index: number, prompt: string) => {
    onChangeQuestions(
      questions.map((item, i) => (i === index ? { ...item, prompt } : item)),
    );
  };

  return (
    <SectionPanel
      icon={<HelpCircle className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.questions')}
      description={t('employer.campaigns.wizard.steps.questionsDesc')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          onSaveDraft={onSaveDraft}
          isSaving={isSaving}
        />
      }
    >
      <div className="space-y-5">
        {error ? <FieldError message={error} /> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={cn(
              'flex flex-col gap-2 rounded-lg border border-satin bg-surface-overlay p-4 text-left transition',
              questionSource === 'ai' && 'border-foreground/40 bg-white/[0.06]',
            )}
            onClick={() => onSelectSource('ai')}
          >
            <Sparkles className="size-5 text-foreground" aria-hidden />
            <span className="font-medium text-foreground">
              {t('employer.campaigns.wizard.questionsAi')}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('employer.campaigns.wizard.questionsAiDesc')}
            </span>
          </button>

          <button
            type="button"
            className={cn(
              'flex flex-col gap-2 rounded-lg border border-satin bg-surface-overlay p-4 text-left transition',
              questionSource === 'upload' && 'border-foreground/40 bg-white/[0.06]',
            )}
            onClick={() => onSelectSource('upload')}
          >
            <Upload className="size-5 text-foreground" aria-hidden />
            <span className="font-medium text-foreground">
              {t('employer.campaigns.wizard.questionsUpload')}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('employer.campaigns.wizard.questionsUploadDesc')}
            </span>
          </button>
        </div>

        {questionSource === 'ai' ? (
          <div className="flex flex-wrap items-end gap-3 rounded-lg border border-satin bg-surface-overlay p-4">
            <div className="space-y-2">
              <Label htmlFor="question-count">{t('employer.campaigns.form.questionCount')}</Label>
              <Input
                id="question-count"
                type="number"
                min={1}
                max={20}
                className="w-28"
                value={questionCount}
                onChange={(e) =>
                  onQuestionCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))
                }
              />
            </div>
            <button type="button" className="btn-primary" onClick={onGenerateAi}>
              {t('employer.campaigns.wizard.generateQuestions')}
            </button>
          </div>
        ) : null}

        {questions.length > 0 ? (
          <ul className="space-y-3">
            {questions.map((question, index) => (
              <li
                key={question.id}
                className="space-y-2 rounded-lg border border-satin bg-surface-overlay p-4"
              >
                <Label htmlFor={`q-${question.id}`}>
                  {t('employer.campaigns.form.questionN').replace('{n}', String(index + 1))}
                </Label>
                <textarea
                  id={`q-${question.id}`}
                  rows={2}
                  className="w-full rounded-lg border border-satin bg-surface-base px-3 py-2 text-sm"
                  value={question.prompt}
                  onChange={(e) => patchPrompt(index, e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {question.skill} · {t(`employer.campaigns.questionDifficulty.${question.difficulty}`)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t('employer.campaigns.form.noQuestions')}</p>
        )}
      </div>
    </SectionPanel>
  );
}
