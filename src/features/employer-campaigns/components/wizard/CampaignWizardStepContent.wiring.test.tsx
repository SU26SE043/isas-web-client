import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { CampaignWizardController } from '../../hooks/useCampaignWizard';

/**
 * Khoá KHE NỐI wizard → bước Tiêu chí → bảng tiêu chí (CAMP-16). Nút AI đề xuất mốc có test riêng,
 * nhưng khe giữa chúng (StepContent chuyền `persistForPreview` xuống làm `onBeforeRun` /
 * `onEnsurePersisted`) thì không — gỡ một prop ở đây là tính năng rơi về trạng thái "chưa lưu"
 * mà không test nào đỏ (tiền lệ Q10-M2). Mock hai component con để bắt đúng prop chúng nhận.
 *
 * SC2 — card chấm thử ĐÃ RỜI bước 3 (nay theo từng câu, sống ở bước khác). `useRubricPreview` được
 * spy (không phải factory ẩn danh) để khoá luôn vế "bước 3 KHÔNG mount card": gọi nó tức là card
 * còn sống ở đây, sai với thiết kế SC2.
 */
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));
const criteriaStepSpy = vi.fn();
const manualListSpy = vi.fn();
const useRubricPreviewSpy = vi.fn(() => ({
  runs: [], latest: null, isLoadingHistory: false, isRunning: false, freeRunsRemaining: null, error: null,
  run: async () => null, clearError: () => undefined,
}));
vi.mock('./CampaignCriteriaStepV2', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./CampaignCriteriaStepV2')>();
  return { ...mod, CampaignCriteriaStepV2: (props: Record<string, unknown>) => { criteriaStepSpy(props); return null; } };
});
vi.mock('./CampaignCriteriaManualList', () => ({
  CampaignCriteriaManualList: (props: Record<string, unknown>) => { manualListSpy(props); return null; },
}));
const questionsStepSpy = vi.fn();
vi.mock('./CampaignQuestionsStep', () => ({
  CampaignQuestionsStep: (props: Record<string, unknown>) => { questionsStepSpy(props); return null; },
}));
vi.mock('../../hooks/useRubricPreview', () => ({ useRubricPreview: useRubricPreviewSpy }));
vi.mock('../../services/campaignCriteria.service', () => ({ campaignCriteriaService: { preview: vi.fn(async () => ({ jobCategory: 'BE', language: 'vi', criteria: [] })) } }));

const { CampaignWizardStepContent } = await import('./CampaignWizardStepContent');
const { CampaignCriteriaStepV2 } = await vi.importActual<typeof import('./CampaignCriteriaStepV2')>('./CampaignCriteriaStepV2');

function wizardAt(step: number): CampaignWizardController {
  const persistForPreview = vi.fn(async () => 'c-1');
  const goToStep = vi.fn();
  const resolveQuestionId = vi.fn((id: string) => id);
  const updateQuestion = vi.fn();
  const questions = [{ id: 'q1', prompt: 'Câu 1', skill: '', difficulty: 'junior', source: 'manual', isRequired: true }];
  return {
    step, mode: 'create', errorSteps: [], completedSteps: [], stepError: null, actionError: null, partialDeploy: null,
    canRetryInvitations: true, isSavingStep: false, isSubmitting: false, isDraftEditable: true, metadataSaved: false, questionsSaved: false,
    domainLabel: 'Backend', jobCategory: 'BE', campaignStatus: 'draft', persistForPreview, goToStep, resolveQuestionId, updateQuestion,
    state: { currentStep: step, draftId: 'c-1', info: { title: 't', domain: 'backend', language: 'vi', passScorePct: 60, startsAt: '', expiresAt: '', maxCandidates: 5, timeLimitMinutes: 60 },
      jd: { inputMethod: 'text', jdText: 'jd' }, rubric: [], rubricCustomized: false, questions, questionCount: 5, questionsPerSession: null,
      settings: {}, inviteEmails: [], errorSteps: [], completedSteps: [], autosaveStatus: 'idle' },
  } as unknown as CampaignWizardController;
}

describe('CampaignWizardStepContent — khe nối đề xuất mốc (SC2: card chấm thử đã rời bước 3)', () => {
  it('bước 3: CriteriaStepV2 nhận persistForPreview làm onBeforeRun — khe DUY NHẤT còn lại giữa StepContent và bước này', () => {
    const wizard = wizardAt(2);
    render(<CampaignWizardStepContent wizard={wizard} campaign={{ rubricVersion: 4 } as never} onCancel={() => undefined} finalSubmitLabel="x" finalLoadingLabel="y" />);
    const props = criteriaStepSpy.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(props.onBeforeRun).toBe(wizard.persistForPreview);
    // SC2 — 4 prop của card chấm thử cũ KHÔNG còn tồn tại trên CriteriaStepV2 nữa.
    expect(props).not.toHaveProperty('campaignStatus');
    expect(props).not.toHaveProperty('questions');
    expect(props).not.toHaveProperty('onGoToQuestions');
    expect(props).not.toHaveProperty('currentRubricVersion');
  });

  it('CriteriaStepV2 chuyền onBeforeRun xuống bảng tiêu chí làm onEnsurePersisted (AI đề xuất mốc cần lưu trước)', () => {
    const onBeforeRun = vi.fn(async () => 'c-1');
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={qc}><CampaignCriteriaStepV2 passScorePct={null} onPassScoreChange={() => undefined} rubric={[]} customized onCustomize={() => undefined}
      campaignId="c-1" jobCategory="BE" onChangeRubric={() => undefined} onReset={() => undefined} onBack={() => undefined} onNext={() => undefined}
      onBeforeRun={onBeforeRun} /></QueryClientProvider>);
    const props = manualListSpy.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(props.onEnsurePersisted).toBe(onBeforeRun);
    expect(props.campaignId).toBe('c-1');
  });

  it('bước 3 KHÔNG mount card chấm thử — render CriteriaStepV2 THẬT, useRubricPreview không được gọi', () => {
    const onBeforeRun = vi.fn(async () => 'c-1');
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={qc}><CampaignCriteriaStepV2 passScorePct={null} onPassScoreChange={() => undefined} rubric={[]} customized onCustomize={() => undefined}
      campaignId="c-1" jobCategory="BE" onChangeRubric={() => undefined} onReset={() => undefined} onBack={() => undefined} onNext={() => undefined}
      onBeforeRun={onBeforeRun} /></QueryClientProvider>);
    expect(useRubricPreviewSpy).not.toHaveBeenCalled();
  });
});

/**
 * SC2 · T9 — khe nối wizard → bước 4: chấm thử THEO CÂU sống ở đây (D-1). Gỡ một prop là card mất panel/picker
 * mà không test nào ở tầng card đỏ (card nhận mọi thứ qua props) — nên khoá đúng giá trị StepContent chuyền xuống.
 */
describe('CampaignWizardStepContent — khe nối bước 4 (SC2 · T9)', () => {
  it('QuestionsStep nhận rubric + preview{beforeRun=persistForPreview, resolveQuestionId, campaignId, currentRubricVersion} + initialOpenQuestionId + coverageWarnings', () => {
    const wizard = wizardAt(3);
    render(<CampaignWizardStepContent wizard={wizard} campaign={{ id: 'c-1', rubricVersion: 4, questionBank: { coverageWarnings: [{ criterionId: 'x', name: 'X' }] } } as never} onCancel={() => undefined} finalSubmitLabel="x" finalLoadingLabel="y" initialQuestionId="q1" />);
    const props = questionsStepSpy.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(props.rubric).toBe(wizard.state.rubric);
    const preview = props.preview as Record<string, unknown>;
    expect(preview.beforeRun).toBe(wizard.persistForPreview);
    expect(preview.resolveQuestionId).toBe(wizard.resolveQuestionId);
    expect(preview.campaignId).toBe('c-1');
    expect(preview.currentRubricVersion).toBe(4);
    expect(preview.passScorePct).toBe(60);
    expect(props.initialOpenQuestionId).toBe('q1');
    expect(props.coverageWarnings).toEqual([{ criterionId: 'x', name: 'X' }]);
  });

  it('onChangeTargets/onChangeSampleAnswer đi vào wizard.updateQuestion đúng khoá (I2: [] giữ [] không thành null); onGoToCriteria ⇒ goToStep(2)', () => {
    const wizard = wizardAt(3);
    render(<CampaignWizardStepContent wizard={wizard} campaign={null} onCancel={() => undefined} finalSubmitLabel="x" finalLoadingLabel="y" />);
    const props = questionsStepSpy.mock.calls.at(-1)?.[0] as { onChangeTargets: (id: string, next: string[] | null) => void; onChangeSampleAnswer: (id: string, text: string) => void; onGoToCriteria: () => void; preview: { onGoToCriteria: () => void } };
    props.onChangeTargets('q1', []);
    expect(wizard.updateQuestion).toHaveBeenLastCalledWith('q1', { targetCriterionIds: [] });
    props.onChangeTargets('q1', ['c-1']);
    expect(wizard.updateQuestion).toHaveBeenLastCalledWith('q1', { targetCriterionIds: ['c-1'] });
    props.onChangeSampleAnswer('q1', 'mẫu');
    expect(wizard.updateQuestion).toHaveBeenLastCalledWith('q1', { sampleAnswer: 'mẫu' });
    props.onGoToCriteria();
    props.preview.onGoToCriteria();
    expect(wizard.goToStep).toHaveBeenCalledTimes(2);
    expect(wizard.goToStep).toHaveBeenCalledWith(2);
  });
});
