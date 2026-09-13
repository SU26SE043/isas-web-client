/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignQuestion, RubricCriterion } from '../../types/campaignManagement.types';
import type { UseQuestionPreviewApi } from '../../types/rubricPreview.types';
import { CampaignQuestionsStep, type CampaignQuestionsPreviewProps } from './CampaignQuestionsStep';

// Khoá CON SỐ trong badge/lý do chặn — "#?" là chính triệu chứng đang vá.
const messages: Record<string, string> = {
  'employer.campaigns.questionCard.previewRunning': 'Đang chấm câu #{{n}}',
  'employer.campaigns.questionCard.preview.blocked.runningOther': 'Đang chấm câu #{{n}} — chờ xong.',
};
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => messages[key] ?? key, language: 'vi' }) }));

const hook = vi.hoisted(() => ({ run: vi.fn(() => new Promise<null>(() => undefined)) }));
vi.mock('../../hooks/useQuestionPreview', () => ({
  useQuestionPreview: (): UseQuestionPreviewApi => ({
    runs: [], latest: null, isLoadingHistory: false, isRunning: false, runningQuestionId: null, freeRunsRemaining: 1, error: null,
    run: hook.run, clearError: vi.fn(), billingConfirm: null, clearBillingConfirm: vi.fn(),
  }),
}));

afterEach(() => cleanup());

const S1 = '11111111-1111-4111-8111-111111111111';
const S2 = '22222222-2222-4222-8222-222222222222';
const LEVELS = [{ score: 0, descriptor: 'Trống hoàn toàn' }, { score: 5, descriptor: 'Xuất sắc toàn diện' }];
const rubric: RubricCriterion[] = [{ id: 'c-comm', name: 'Giao tiếp', description: '', weight: 100, maxScore: 5, levels: LEVELS, scoringScope: 'Always' }];
const q = (id: string, prompt: string): CampaignQuestion => ({ id, prompt, skill: '', difficulty: 'middle', source: 'manual', isRequired: true });
const preview: CampaignQuestionsPreviewProps = {
  campaignId: null, campaignStatus: null, rubric, passScorePct: null, currentRubricVersion: null,
  beforeRun: vi.fn(async () => 'c-1'), resolveQuestionId: (id) => id,
};
const props = {
  campaignTitle: 'C', isDraft: true, hasJd: true, questionCount: 2, rubric, preview,
  onQuestionCount: vi.fn(), onQuestionsPerSession: vi.fn(), onGenerateAi: vi.fn(), onAddManual: vi.fn(),
  onChangePrompt: vi.fn(), onToggleRequired: vi.fn(), onChangeGroup: vi.fn(), onMoveQuestion: vi.fn(), onRemoveQuestion: vi.fn(),
  onBack: vi.fn(), onNext: vi.fn(),
};
const cardOf = (id: string) => document.getElementById(`question-card-${id}`) as HTMLElement;

describe('CampaignQuestionsStep — correction T9-R3 (F2): câu đang chấm sống sót qua re-key client → GUID', () => {
  it('bấm "Lưu & chấm thử" ở client-2, rồi questions đổi thành [S1,S2] ⇒ header S2 mang badge "#2", card S1 chặn "#2" (không "#?")', () => {
    const { rerender } = render(<CampaignQuestionsStep {...props} questions={[q('client-1', 'Câu một'), q('client-2', 'Câu hai')]} />);
    fireEvent.click(within(cardOf('client-2')).getByRole('button', { name: /Câu hai/ }));
    fireEvent.click(within(cardOf('client-2')).getByRole('button', { name: 'employer.campaigns.rubricPreview.runSave' }));
    expect(hook.run).toHaveBeenCalledTimes(1);
    expect(within(cardOf('client-2')).getByTestId('question-card-running')).toHaveTextContent('Đang chấm câu #2');

    rerender(<CampaignQuestionsStep {...props} questions={[q(S1, 'Câu một'), q(S2, 'Câu hai')]} />);
    expect(within(cardOf(S2)).getByTestId('question-card-running')).toHaveTextContent('Đang chấm câu #2');
    expect(within(cardOf(S2)).getByTestId('question-card-panel')).not.toHaveAttribute('hidden');
    expect(within(cardOf(S1)).getByTestId('question-preview-blocked')).toHaveTextContent('Đang chấm câu #2 — chờ xong.');
    expect(document.body.textContent).not.toContain('#?');
  });
});
