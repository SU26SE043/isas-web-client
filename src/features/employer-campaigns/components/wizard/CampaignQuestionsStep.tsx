import { useRef, useState } from 'react';
import { HelpCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion, RubricCriterion } from '../../types/campaignManagement.types';
import type { QuestionCoverageWarning, QuestionPreviewContext } from '../../types/questionPreview.types';
import { CAMPAIGN_QUESTION_HARD_MAX } from '../../utils/campaignQuestionLimits';
import { splitQuestionBankWarnings } from '../../utils/questionCoverage';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import { AiGenerateCard } from './questions/AiGenerateCard';
import { CampaignQuestionSections } from './questions/CampaignQuestionSections';
import { GenerateOverwriteModal } from './questions/GenerateOverwriteModal';
import { QuestionStartOptions } from './questions/QuestionStartOptions';
import { CampaignQuestionModeControls } from './questions/CampaignQuestionModeControls';
import { QuestionImportControl, type QuestionImportControlHandle } from './questions/QuestionImportControl';
import { QuestionCoverageNotice } from './questions/QuestionCoverageNotice';
import { useQuestionDrawMode } from './questions/useQuestionDrawMode';

/** SC2 · T9 — phần ngữ cảnh chấm thử mà màn cha cung cấp; Step tự thêm `questions` + state "câu đang chạy". */
export type CampaignQuestionsPreviewProps = Omit<QuestionPreviewContext, 'questions' | 'runningQuestionId' | 'onRunningChange'>;

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
  onImportCsv?: (file: File) => Promise<import('../../types/campaign.api.types').CampaignQuestionImportResult>;
  onConfirmImport?: (items: import('../../types/campaign.api.types').CampaignQuestionImportResult['items']) => Promise<void>;
  onChangePrompt: (id: string, prompt: string) => void;
  onToggleRequired: (id: string, isRequired: boolean) => void;
  onChangeGroup: (id: string, group: string) => void;
  onMoveQuestion: (id: string, direction: 'up' | 'down') => void;
  onRemoveQuestion: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  isGenerating?: boolean;
  isSaving?: boolean;
  /** SC2 — thước đo bước 3 (picker nhãn, chip, bao phủ cục bộ). Vắng ⇒ bước 4 như trước SC2. */
  rubric?: RubricCriterion[];
  onChangeTargets?: (id: string, next: string[] | null) => void;
  onChangeSampleAnswer?: (id: string, text: string) => void;
  onGoToCriteria?: () => void;
  /** SC2 — chấm thử theo câu (D-1). Vắng ⇒ card không có panel. */
  preview?: CampaignQuestionsPreviewProps;
  /** `questionBank.coverageWarnings` server trả — dùng khi không có `rubric` để tính cục bộ. */
  coverageWarnings?: QuestionCoverageWarning[];
  /** Deep-link `?question=<id>`. */
  initialOpenQuestionId?: string | null;
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
  onConfirmImport,
  onChangePrompt,
  onToggleRequired,
  onChangeGroup,
  onMoveQuestion,
  onRemoveQuestion,
  onBack,
  onNext,
  isGenerating = false,
  isSaving = false,
  rubric,
  onChangeTargets,
  onChangeSampleAnswer,
  onGoToCriteria,
  preview,
  coverageWarnings,
  initialOpenQuestionId,
}: CampaignQuestionsStepProps) {
  const { t } = useLanguage();
  const listRef = useRef<HTMLUListElement | null>(null);
  // POST chấm thử chạy 20–60s trong MỘT card; các card khác chỉ biết qua state này (mutation là per-instance).
  const [runningQuestionId, setRunningQuestionId] = useState<string | null>(null);
  const previewCtx: QuestionPreviewContext | undefined = preview
    ? { ...preview, questions, runningQuestionId, onRunningChange: setRunningQuestionId }
    : undefined;
  // K-rule (chặn publish) đi vào QuestionCoverageNotice như lỗi; phần còn lại giữ khối cảnh báo mềm như trước.
  const { soft: softBankWarnings } = splitQuestionBankWarnings(questionBankWarnings);
  const [useDefaultCount, setUseDefaultCount] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const importControlRef = useRef<QuestionImportControlHandle | null>(null);
  const busy = isGenerating || isSaving;
  const max = CAMPAIGN_QUESTION_HARD_MAX;
  const canContinue = !busy;
  const { drawMode, fixedCount, poolCount, drawCount, totalPerCandidate, selectMode } = useQuestionDrawMode({
    questions, questionsPerSession, onToggleRequired, onQuestionsPerSession,
  });

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
      // Bộ đếm chỉ có nghĩa khi ĐÃ có câu hỏi. Ở màn rỗng, "· 0 / 20" là một phân số trần
      // không đơn vị: 20 là TRẦN CỨNG, không phải mục tiêu — nó đọc như một hạn mức đang
      // cảnh báo, trong khi việc cần làm chỉ là chọn cách bắt đầu.
      title={questions.length === 0
        ? t('employer.campaigns.campaignQuestions.title')
        : `${t('employer.campaigns.campaignQuestions.title')} · ${t('employer.campaigns.campaignQuestions.countUnit').replace('{{n}}', String(questions.length)).replace('{{max}}', String(max))}`}
      description={questions.length === 0 ? t('employer.campaigns.campaignQuestions.start.lede') : undefined}
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
        <QuestionImportControl ref={importControlRef} existingCount={questions.length} max={max} disabled={!isDraft || busy || !onImportCsv} onImportCsv={onImportCsv} onConfirmImport={onConfirmImport} />
        {error ? <FieldError message={error} /> : null}
        {softBankWarnings.length > 0 ? (
          <div role="status" className="rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm text-warning">
            <p className="font-medium">{t('employer.campaigns.campaignQuestions.bank.warnings')}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {softBankWarnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
            </ul>
          </div>
        ) : null}

        {questions.length === 0 ? (
          <QuestionStartOptions
            hasJd={hasJd}
            disabled={busy || !isDraft}
            onGenerateAi={requestGenerate}
            onImportCsv={onImportCsv ? () => importControlRef.current?.open() : undefined}
            onAddManual={onAddManual}
          />
        ) : (
          <>
            <CampaignQuestionModeControls
              drawMode={drawMode}
              fixedCount={fixedCount}
              poolCount={poolCount}
              drawCount={drawCount}
              totalPerCandidate={totalPerCandidate}
              disabled={busy}
              onSelectMode={selectMode}
              onDrawCountChange={onQuestionsPerSession}
            />

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
              rubric={rubric}
              onChangeTargets={onChangeTargets}
              onChangeSampleAnswer={onChangeSampleAnswer}
              onGoToCriteria={onGoToCriteria}
              previewCtx={previewCtx}
              initialOpenQuestionId={initialOpenQuestionId}
            />
            <QuestionCoverageNotice
              questions={questions}
              questionsPerSession={questionsPerSession}
              rubric={rubric}
              serverCoverageWarnings={coverageWarnings}
              questionBankWarnings={questionBankWarnings}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" disabled={!isDraft || busy || questions.length >= max} onClick={onAddManual}>
                <Plus className="size-4" aria-hidden />
                {t('employer.campaigns.campaignQuestions.question.add')}
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={!isDraft || busy || !onImportCsv} onClick={() => importControlRef.current?.open()}>
                {t('employer.campaigns.campaignQuestions.import.open')}
              </Button>
            </div>
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
