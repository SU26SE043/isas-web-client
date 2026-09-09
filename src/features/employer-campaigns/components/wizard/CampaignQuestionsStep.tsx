import { useEffect, useRef, useState } from 'react';
import { HelpCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion } from '../../types/campaignManagement.types';
import { CAMPAIGN_QUESTION_HARD_MAX } from '../../utils/campaignQuestionLimits';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import { AiGenerateCard } from './questions/AiGenerateCard';
import { CampaignQuestionSections } from './questions/CampaignQuestionSections';
import { GenerateOverwriteModal } from './questions/GenerateOverwriteModal';
import { QuestionStartOptions } from './questions/QuestionStartOptions';

interface CampaignQuestionsStepProps {
  campaignTitle: string;
  isDraft: boolean;
  hasJd: boolean;
  questions: CampaignQuestion[];
  questionCount: number;
  questionsPerSession?: number | null;
  questionBankWarnings?: string[];
  error?: string | null;
  onQuestionCount: (count: number) => void;
  onQuestionsPerSession: (count: number | null) => void;
  onGenerateAi: (opts?: { useDefaultCount?: boolean }) => void;
  onAddManual: () => void;
  onImportCsv?: () => void;
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
  isDraft,
  hasJd,
  questions,
  questionCount,
  questionsPerSession,
  questionBankWarnings = [],
  error,
  onQuestionCount,
  onQuestionsPerSession,
  onGenerateAi,
  onAddManual,
  onImportCsv,
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
  const drawMode = questionsPerSession != null;
  const fixedCount = questions.filter((question) => question.isRequired).length;
  const poolCount = questions.length - fixedCount;
  const drawCount = Math.min(Math.max(questionsPerSession ?? 0, 0), poolCount);
  const totalPerCandidate = drawMode ? fixedCount + drawCount : questions.length;
  const canContinue = !busy;

  useEffect(() => {
    if (!drawMode && poolCount > 0) {
      questions.forEach((question) => {
        if (!question.isRequired) onToggleRequired(question.id, true);
      });
    }
    if (drawMode && questionsPerSession != null && questionsPerSession > poolCount) {
      onQuestionsPerSession(poolCount);
    }
  }, [drawMode, onQuestionsPerSession, onToggleRequired, poolCount, questions, questionsPerSession]);

  const selectMode = (nextDrawMode: boolean) => {
    if (nextDrawMode) {
      onQuestionsPerSession(Math.min(Math.max(questionsPerSession ?? poolCount, 0), poolCount));
      return;
    }
    questions.forEach((question) => {
      if (!question.isRequired) onToggleRequired(question.id, true);
    });
    onQuestionsPerSession(null);
  };

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
      title={`${t('employer.campaigns.campaignQuestions.title')} · ${questions.length} / ${max}`}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          isSaving={busy}
          nextDisabled={!canContinue}
          backDisabled={busy}
          nextLabel={t('employer.campaigns.campaignQuestions.actions.continue')}
          backLabel={t('employer.campaigns.campaignQuestions.actions.back')}
        />
      }
    >
      <div className="space-y-5">
        {error ? <FieldError message={error} /> : null}
        {questionBankWarnings.length > 0 ? (
          <div role="status" className="rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm text-warning">
            <p className="font-medium">{t('employer.campaigns.campaignQuestions.bank.warnings')}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {questionBankWarnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
            </ul>
          </div>
        ) : null}

        {questions.length === 0 ? (
          <QuestionStartOptions
            hasJd={hasJd}
            disabled={busy || !isDraft}
            onGenerateAi={requestGenerate}
            onImportCsv={onImportCsv}
            onAddManual={onAddManual}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-satin bg-surface-overlay px-4 py-3">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="radio" name="campaign-question-mode" checked={!drawMode} disabled={busy} onChange={() => selectMode(false)} />
                  {t('employer.campaigns.campaignQuestions.mode.all')}
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="radio" name="campaign-question-mode" checked={drawMode} disabled={busy} onChange={() => selectMode(true)} />
                  {t('employer.campaigns.campaignQuestions.mode.draw')}
                </label>
              </div>
              {drawMode ? (
                <label className="flex items-center gap-2 text-sm text-foreground" htmlFor="campaign-question-draw-count">
                  {t('employer.campaigns.campaignQuestions.draw.countLabel')}
                  <input
                    id="campaign-question-draw-count"
                    type="number"
                    min={0}
                    max={poolCount}
                    value={drawCount}
                    disabled={busy}
                    onChange={(event) => onQuestionsPerSession(Math.min(Math.max(Number(event.target.value) || 0, 0), poolCount))}
                    className="h-9 w-20 rounded-xl border border-satin bg-surface-base px-3 text-sm"
                  />
                </label>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {drawMode
                  ? t('employer.campaigns.campaignQuestions.draw.total').replace('{{fixed}}', String(fixedCount)).replace('{{draw}}', String(drawCount)).replace('{{total}}', String(totalPerCandidate))
                  : t('employer.campaigns.campaignQuestions.mode.allHint')}
              </p>
            </div>

            <AiGenerateCard
              isDraft={isDraft}
              hasJd={hasJd}
              questionCount={questionCount}
              maxQuestions={null}
              useDefaultCount={useDefaultCount}
              currentQuestionCount={questions.length}
              disabled={busy}
              isGenerating={isGenerating}
              onQuestionCount={onQuestionCount}
              onUseDefaultCount={setUseDefaultCount}
              onGenerate={requestGenerate}
            />
            <CampaignQuestionSections
              questions={questions}
              isDraft={isDraft}
              disabled={busy}
              drawMode={drawMode}
              listRef={listRef}
              onChangePrompt={onChangePrompt}
              onToggleRequired={onToggleRequired}
              onChangeGroup={onChangeGroup}
              onMoveQuestion={onMoveQuestion}
              onRemoveQuestion={onRemoveQuestion}
            />
            <Button type="button" variant="outline" size="sm" disabled={!isDraft || busy || questions.length >= max} onClick={onAddManual}>
              <Plus className="size-4" aria-hidden />
              {t('employer.campaigns.campaignQuestions.question.add')}
            </Button>
          </>
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
          queueMicrotask(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        }}
      />
    </SectionPanel>
  );
}
