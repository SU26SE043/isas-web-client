import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { CampaignWizardController } from '../../hooks/useCampaignWizard';

/**
 * Khoá KHE NỐI wizard → bước Tiêu chí → bảng tiêu chí (CAMP-19/CAMP-16). Card chấm thử và nút AI đề xuất mốc đều
 * có test riêng, nhưng khe giữa chúng (StepContent chuyền `persistForPreview` xuống làm `onBeforeRun` /
 * `onEnsurePersisted`) thì không — gỡ một prop ở đây là cả hai tính năng rơi về trạng thái "chưa có campaign"
 * mà không test nào đỏ (tiền lệ Q10-M2). Mock hai component con để bắt đúng prop chúng nhận.
 */
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));
const criteriaStepSpy = vi.fn();
const manualListSpy = vi.fn();
vi.mock('./CampaignCriteriaStepV2', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./CampaignCriteriaStepV2')>();
  return { ...mod, CampaignCriteriaStepV2: (props: Record<string, unknown>) => { criteriaStepSpy(props); return null; } };
});
vi.mock('./CampaignCriteriaManualList', () => ({
  CampaignCriteriaManualList: (props: Record<string, unknown>) => { manualListSpy(props); return null; },
}));
vi.mock('../../hooks/useRubricPreview', () => ({
  useRubricPreview: () => ({ runs: [], latest: null, isLoadingHistory: false, isRunning: false, freeRunsRemaining: null, error: null, run: async () => null, clearError: () => undefined }),
}));
vi.mock('../../services/campaignCriteria.service', () => ({ campaignCriteriaService: { preview: vi.fn(async () => ({ jobCategory: 'BE', language: 'vi', criteria: [] })) } }));

const { CampaignWizardStepContent } = await import('./CampaignWizardStepContent');
const { CampaignCriteriaStepV2 } = await vi.importActual<typeof import('./CampaignCriteriaStepV2')>('./CampaignCriteriaStepV2');

function wizardAt(step: number): CampaignWizardController {
  const persistForPreview = vi.fn(async () => 'c-1');
  const goToStep = vi.fn();
  const questions = [{ id: 'q1', prompt: 'Câu 1', skill: '', difficulty: 'junior', source: 'manual', isRequired: true }];
  return {
    step, mode: 'create', errorSteps: [], completedSteps: [], stepError: null, actionError: null, partialDeploy: null,
    canRetryInvitations: true, isSavingStep: false, isSubmitting: false, isDraftEditable: true, metadataSaved: false, questionsSaved: false,
    domainLabel: 'Backend', jobCategory: 'BE', campaignStatus: 'draft', persistForPreview, goToStep,
    state: { currentStep: step, draftId: 'c-1', info: { title: 't', domain: 'backend', language: 'vi', passScorePct: 60, startsAt: '', expiresAt: '', maxCandidates: 5, timeLimitMinutes: 60 },
      jd: { inputMethod: 'text', jdText: 'jd' }, rubric: [], rubricCustomized: false, questions, questionCount: 5, questionsPerSession: null,
      settings: {}, inviteEmails: [], errorSteps: [], completedSteps: [], autosaveStatus: 'idle' },
  } as unknown as CampaignWizardController;
}

describe('CampaignWizardStepContent — khe nối chấm thử/đề xuất mốc', () => {
  it('bước 3: CriteriaStepV2 nhận persistForPreview làm onBeforeRun, câu hỏi thật, campaignStatus và goToStep(3)', () => {
    const wizard = wizardAt(2);
    render(<CampaignWizardStepContent wizard={wizard} campaign={{ rubricVersion: 4 } as never} onCancel={() => undefined} finalSubmitLabel="x" finalLoadingLabel="y" />);
    const props = criteriaStepSpy.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(props.onBeforeRun).toBe(wizard.persistForPreview);
    expect(props.questions).toBe(wizard.state.questions);
    expect(props.campaignStatus).toBe('draft');
    expect(props.currentRubricVersion).toBe(4);
    (props.onGoToQuestions as () => void)();
    expect(wizard.goToStep).toHaveBeenCalledWith(3);
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
});
