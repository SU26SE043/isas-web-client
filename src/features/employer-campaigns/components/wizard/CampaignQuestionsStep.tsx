import { useRef, useState } from 'react';
import { HelpCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion } from '../../types/campaignManagement.types';
import { CAMPAIGN_QUESTION_HARD_MAX } from '../../utils/campaignQuestionLimits';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import { AiGenerateCard } from './questions/AiGenerateCard';
import { CampaignQuestionCard } from './questions/CampaignQuestionCard';
import { GenerateOverwriteModal } from './questions/GenerateOverwriteModal';
import { QuestionsSummaryCard } from './questions/QuestionsSummaryCard';

interface CampaignQuestionsStepProps {
  campaignTitle: string;
  domainLabel: string;
  isDraft: boolean;
  hasJd: boolean;
  questions: CampaignQuestion[];
  questionCount: number;
  questionsPerSession?: number | null;
  maxQuestions: number | null;
  error?: string | null;
  onQuestionCount: (count: number) => void;
  onQuestionsPerSession: (count: number | null) => void;
  onGenerateAi: (opts?: { useDefaultCount?: boolean }) => void;
  onSaveQuestions: () => void;
  onAddManual: () => void;
  onChangePrompt: (id: string, prompt: string) => void;
  onToggleRequired: (id: string, isRequired: boolean) => void;
  onChangeGroup: (id: string, group: string) => void;
  onMoveQuestion: (id: string, direction: 'up' | 'down') => void;
  onRemoveQuestion: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  isGenerating?: boolean;
  isSaving?: boolean;
}

export function CampaignQuestionsStep({
  campaignTitle,
  domainLabel,
  isDraft,
  hasJd,
  questions,
  questionCount,
  questionsPerSession,
  maxQuestions,
  error,
  onQuestionCount,
  onQuestionsPerSession,
  onGenerateAi,
  onSaveQuestions,
  onAddManual,
  onChangePrompt,
  onToggleRequired,
  onChangeGroup,
  onMoveQuestion,
  onRemoveQuestion,
  onBack,
  onNext,
  isGenerating = false,
  isSaving = false,
}: CampaignQuestionsStepProps) {
  const { t } = useLanguage();
  const listRef = useRef<HTMLUListElement | null>(null);
  const [useDefaultCount, setUseDefaultCount] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const busy = isGenerating || isSaving;
  const max = CAMPAIGN_QUESTION_HARD_MAX;
  const canSave =
    isDraft &&
    questions.length > 0 &&
    questions.every((item) => item.prompt.trim().length > 0) &&
    questions.length <= max &&
    !busy;
  const canContinue = !busy;

  const requestGenerate = () => {
    if (!isDraft || busy) return;
    if (questions.length > 0) {
      setConfirmOpen(true);
      return;
    }
    onGenerateAi({ useDefaultCount });
    queueMicrotask(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <SectionPanel
      icon={<HelpCircle className="size-4" aria-hidden />}
      title={t('employer.campaigns.campaignQuestions.title')}
      footer={
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={!canSave}
            loading={isSaving}
            onClick={onSaveQuestions}
          >
            {isSaving
              ? t('employer.campaigns.campaignQuestions.actions.saving')
              : t('employer.campaigns.campaignQuestions.actions.save')}
          </Button>
          <CampaignWizardNav
            onBack={onBack}
            onNext={onNext}
            isSaving={busy}
            nextDisabled={!canContinue}
            backDisabled={busy}
            nextLabel={t('employer.campaigns.campaignQuestions.actions.continue')}
            backLabel={t('employer.campaigns.campaignQuestions.actions.back')}
          />
        </div>
      }
    >
      <div className="space-y-5">
        {error ? <FieldError message={error} /> : null}
        <div className="rounded-lg border border-satin bg-surface-overlay p-4"><label className="text-sm font-medium text-foreground" htmlFor="questions-per-session">{t('employer.campaigns.campaignQuestions.bank.perCandidate')}</label><input id="questions-per-session" type="number" min={1} value={questionsPerSession ?? ''} onChange={(event) => onQuestionsPerSession(event.target.value === '' ? null : Number(event.target.value))} className="mt-2 h-9 w-32 rounded-md border border-satin bg-surface-base px-3 text-sm" /><p className="mt-1 text-xs text-muted-foreground">{t('employer.campaigns.campaignQuestions.bank.perCandidateHelp')}</p></div>

        <QuestionsSummaryCard
          campaignTitle={campaignTitle}
          domainLabel={domainLabel}
          isDraft={isDraft}
          hasJd={hasJd}
          questionCount={questions.length}
          maxQuestions={maxQuestions}
        />
        <datalist id="campaign-question-groups">
          {Array.from(new Set(questions.map((question) => question.questionGroup?.trim()).filter(Boolean))).map((group) => <option key={group} value={group} />)}
        </datalist>

        <AiGenerateCard
          isDraft={isDraft}
          hasJd={hasJd}
          questionCount={questionCount}
          maxQuestions={maxQuestions}
          useDefaultCount={useDefaultCount}
          currentQuestionCount={questions.length}
          disabled={busy}
          isGenerating={isGenerating}
          onQuestionCount={onQuestionCount}
          onUseDefaultCount={setUseDefaultCount}
          onGenerate={requestGenerate}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isDraft || busy || questions.length >= max}
            onClick={onAddManual}
          >
            <Plus className="size-4" aria-hidden />
            {t('employer.campaigns.campaignQuestions.question.add')}
          </Button>
        </div>

        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('employer.campaigns.campaignQuestions.validation.listRequired')}
          </p>
        ) : (
          <ul
            ref={listRef}
            className={`space-y-3 ${isGenerating ? 'pointer-events-none opacity-60' : ''}`}
          >
            {questions.map((question, index) => (
              <CampaignQuestionCard
                key={question.id}
                question={question}
                index={index}
                total={questions.length}
                disabled={!isDraft || busy}
                onChangePrompt={(prompt) => onChangePrompt(question.id, prompt)}
                onToggleRequired={(isRequired) => onToggleRequired(question.id, isRequired)}
                onChangeGroup={(group) => onChangeGroup(question.id, group)}
                onMoveUp={() => onMoveQuestion(question.id, 'up')}
                onMoveDown={() => onMoveQuestion(question.id, 'down')}
                onRemove={() => onRemoveQuestion(question.id)}
              />
            ))}
          </ul>
        )}
      </div>

      <GenerateOverwriteModal
        open={confirmOpen}
        campaignTitle={campaignTitle}
        currentCount={questions.length}
        requestedCount={useDefaultCount ? null : questionCount}
        isConfirming={isGenerating}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onGenerateAi({ useDefaultCount });
          queueMicrotask(() =>
            listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          );
        }}
      />
    </SectionPanel>
  );
}
