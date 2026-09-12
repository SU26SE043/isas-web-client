/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { inertPreview, previewQuestions, rubricWithLevels } from '../../mocks/rubricPreview.fixtures';
import { CampaignCriteriaStepV2 } from './CampaignCriteriaStepV2';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));
vi.mock('../../services/campaignCriteria.service', () => ({ campaignCriteriaService: { preview: vi.fn(async () => ({ jobCategory: 'BE', language: 'vi', criteria: [] })) } }));

const hookCalls = vi.hoisted(() => ({ args: [] as Array<{ campaignId: string | null; beforeRun?: unknown }> }));
vi.mock('../../hooks/useRubricPreview', () => ({
  useRubricPreview: (options: { campaignId: string | null; beforeRun?: unknown }) => {
    hookCalls.args.push(options);
    return inertPreviewApi;
  },
}));
const inertPreviewApi = inertPreview();

afterEach(() => {
  cleanup();
  hookCalls.args = [];
});

const baseProps = {
  passScorePct: 70,
  onPassScoreChange: vi.fn(),
  rubric: rubricWithLevels,
  customized: true,
  onCustomize: vi.fn(),
  jobCategory: 'BE',
  onChangeRubric: vi.fn(),
  onReset: vi.fn(),
  onBack: vi.fn(),
  onNext: vi.fn(),
};

function renderStep(props: Partial<React.ComponentProps<typeof CampaignCriteriaStepV2>>) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <CampaignCriteriaStepV2 {...baseProps} campaignId={null} {...props} />
    </QueryClientProvider>,
  );
}

describe('CampaignCriteriaStepV2 — card chấm thử ở bước 3', () => {
  it('card nằm SAU ô ngưỡng Đạt, cùng tầm mắt với passScorePct', () => {
    renderStep({ campaignId: 'cmp-1', campaignStatus: 'draft', questions: previewQuestions });
    const passScore = screen.getByLabelText(/employer\.campaigns\.form\.passScorePct/);
    const card = screen.getByRole('region', { name: 'employer.campaigns.rubricPreview.title' });
    expect(passScore.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('thiếu mọi prop tuỳ chọn ⇒ card vẫn hiện, ở trạng thái chặn "chưa có campaign" (không biến mất, không crash)', () => {
    renderStep({});
    expect(screen.getByTestId('preview-description')).toHaveTextContent('employer.campaigns.rubricPreview.blocked.noCampaign');
    expect(hookCalls.args[0]).toEqual({ campaignId: null, beforeRun: undefined });
  });

  it('có campaignId + onBeforeRun ⇒ hook nhận đúng cả hai, nút là "Lưu & chấm thử"', () => {
    const onBeforeRun = vi.fn(async () => 'cmp-1');
    renderStep({ campaignId: 'cmp-1', campaignStatus: 'draft', questions: previewQuestions, onBeforeRun });
    expect(hookCalls.args[0]).toEqual({ campaignId: 'cmp-1', beforeRun: onBeforeRun });
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.runSave' })).toBeEnabled();
  });

  it('chưa có câu hỏi ⇒ lý do + nút sang bước 4 (onGoToQuestions)', () => {
    const onGoToQuestions = vi.fn();
    renderStep({ campaignId: 'cmp-1', campaignStatus: 'draft', questions: [], onGoToQuestions });
    expect(screen.getByTestId('preview-description')).toHaveTextContent('employer.campaigns.rubricPreview.blocked.noQuestions');
    screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.goToQuestions' }).click();
    expect(onGoToQuestions).toHaveBeenCalledOnce();
  });
});
