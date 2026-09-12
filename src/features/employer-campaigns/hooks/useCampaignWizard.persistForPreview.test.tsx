import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CampaignQuestion, EmployerCampaign, RubricCriterion } from '../types/campaignManagement.types';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('react-hot-toast', () => {
  const toast = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() });
  return { default: toast };
});

import { useCampaignWizard } from './useCampaignWizard';

/**
 * CAMP-19 — `persistForPreview` = đường "lưu rồi mới chấm". Wizard KHÔNG PUT thước đo/câu hỏi cho
 * tới lúc Phát hành; BE chấm thử bộ ĐANG LƯU ⇒ không lưu trước là chấm bộ cũ trong khi màn hình hiện
 * bộ mới. Các ca dưới khoá đúng thứ tự ghi, id server thay id client, và việc KHÔNG kéo validate
 * bước 5 (maxCandidates null mặc định) vào đường này.
 */
const SERVER_Q1 = '11111111-1111-4111-8111-111111111111';
const SERVER_Q2 = '22222222-2222-4222-8222-222222222222';

const rubric: RubricCriterion[] = [
  { id: 'new-a', name: 'Giao tiếp', description: '', weight: 60, maxScore: 10 },
  { id: 'new-b', name: 'Kỹ thuật', description: '', weight: 40, maxScore: 10 },
];

const clientQuestions: CampaignQuestion[] = [
  { id: 'client-1', prompt: 'Q1', skill: '', difficulty: 'middle', source: 'manual', isRequired: true },
  { id: 'client-2', prompt: 'Q2', skill: '', difficulty: 'middle', source: 'manual', isRequired: true },
];

const serverQuestions: CampaignQuestion[] = [
  { id: SERVER_Q1, prompt: 'Q1', skill: '', difficulty: 'middle', source: 'manual', isRequired: true },
  { id: SERVER_Q2, prompt: 'Q2', skill: '', difficulty: 'middle', source: 'manual', isRequired: true },
];

function campaignResponse(overrides: Partial<EmployerCampaign> = {}): EmployerCampaign {
  return {
    id: 'c-1',
    title: 'Backend Dev',
    domain: 'Backend',
    status: 'draft',
    jobDescription: 'JD dài đủ',
    rubric: [],
    questions: serverQuestions,
    invitedEmails: [],
    updatedAt: '2026-09-12T10:00:00Z',
    createdAt: '2026-09-12T09:00:00Z',
    locale: 'vi',
    ...overrides,
  } as unknown as EmployerCampaign;
}

function future(hours: number): string {
  const date = new Date(Date.now() + hours * 3_600_000);
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function makeHandlers() {
  return {
    onCreateCampaign: vi.fn(async () => campaignResponse({ questions: [] })),
    onUpdateCampaign: vi.fn(async () => campaignResponse()),
    onUpdateQuestions: vi.fn(async () => campaignResponse()),
    onGenerateQuestions: vi.fn(),
    onImportQuestions: vi.fn(),
    onUploadFiles: vi.fn(),
    onReplaceFiles: vi.fn(),
    onDownloadFile: vi.fn(),
    onAfterSubmit: vi.fn(),
    onDeployCampaign: vi.fn(),
    onSendInvitations: vi.fn(),
  };
}

type Handlers = ReturnType<typeof makeHandlers>;

function renderCreateWizard(handlers: Handlers) {
  const hook = renderHook(() => useCampaignWizard({ mode: 'create', ...handlers }));
  act(() => {
    hook.result.current.patchInfo({ title: 'Backend Dev', domain: 'backend', language: 'vi' });
    hook.result.current.patchJd({ inputMethod: 'text', jdText: 'JD dài đủ' });
    hook.result.current.setRubric(rubric);
    hook.result.current.setQuestions(clientQuestions);
  });
  return hook;
}

function renderEditWizard(handlers: Handlers, campaign = campaignResponse({
  rubric: [
    { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Giao tiếp', description: '', weight: 0.6, maxScore: 10 },
    { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', name: 'Kỹ thuật', description: '', weight: 0.4, maxScore: 10 },
  ],
  startsAt: new Date(Date.now() + 3_600_000).toISOString(),
  deadline: new Date(Date.now() + 30 * 24 * 3_600_000).toISOString(),
  capacity: 10,
  durationMinutes: 60,
})) {
  return renderHook(() => useCampaignWizard({ mode: 'edit', campaign, ...handlers }));
}

let handlers: Handlers;
beforeEach(() => { handlers = makeHandlers(); });
afterEach(() => cleanup());

describe('persistForPreview — create mode', () => {
  it('① ensureDraft → PUT metadata → PUT câu hỏi, KHÔNG deploy; trả id draft', async () => {
    const { result } = renderCreateWizard(handlers);
    expect(result.current.campaignId).toBeNull();

    let id: string | null = null;
    await act(async () => { id = await result.current.persistForPreview(); });

    expect(id).toBe('c-1');
    expect(handlers.onCreateCampaign).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateCampaign).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateCampaign).toHaveBeenCalledWith('c-1', expect.objectContaining({
      title: 'Backend Dev',
      criteria: expect.arrayContaining([expect.objectContaining({ name: 'Giao tiếp', weight: 0.6 })]),
    }));
    expect(handlers.onUpdateQuestions).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateQuestions).toHaveBeenCalledWith('c-1', [
      { questionText: 'Q1', isRequired: true },
      { questionText: 'Q2', isRequired: true },
    ]);
    const order = [
      handlers.onCreateCampaign.mock.invocationCallOrder[0],
      handlers.onUpdateCampaign.mock.invocationCallOrder[0],
      handlers.onUpdateQuestions.mock.invocationCallOrder[0],
    ];
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(handlers.onDeployCampaign).not.toHaveBeenCalled();
    expect(handlers.onAfterSubmit).not.toHaveBeenCalled();
    expect(result.current.campaignId).toBe('c-1');
    expect(result.current.state.autosaveStatus).toBe('saved');
    expect(result.current.isPersistingForPreview).toBe(false);
  });

  it('② state.questions nhận id SERVER sau khi lưu (questionId chấm thử phải là id đã lưu)', async () => {
    const { result } = renderCreateWizard(handlers);
    expect(result.current.state.questions.map((q) => q.id)).toEqual(['client-1', 'client-2']);
    await act(async () => { await result.current.persistForPreview(); });
    expect(result.current.state.questions.map((q) => q.id)).toEqual([SERVER_Q1, SERVER_Q2]);
  });

  it('③ maxCandidates=null (bước 5 chưa điền) KHÔNG chặn — chấm thử không cần trần ứng viên', async () => {
    const { result } = renderCreateWizard(handlers);
    expect(result.current.state.info.maxCandidates).toBeNull();
    let id: string | null = null;
    await act(async () => { id = await result.current.persistForPreview(); });
    expect(id).toBe('c-1');
    expect(result.current.stepError).toBeNull();
    expect(result.current.state.errorSteps).not.toContain(5);
  });

  it('④ rubric Σweight ≠ 100 → trả null, báo lỗi ở bước 2, KHÔNG gọi API nào', async () => {
    const { result } = renderCreateWizard(handlers);
    act(() => {
      result.current.setRubric([{ ...rubric[0], weight: 70 }, rubric[1]]);
    });
    let id: string | null = 'sentinel';
    await act(async () => { id = await result.current.persistForPreview(); });
    expect(id).toBeNull();
    expect(result.current.stepError).toBe('employer.campaigns.wizard.rubric.mustEqual100');
    expect(result.current.state.currentStep).toBe(2);
    expect(result.current.state.errorSteps).toContain(2);
    expect(handlers.onCreateCampaign).not.toHaveBeenCalled();
    expect(handlers.onUpdateCampaign).not.toHaveBeenCalled();
    expect(handlers.onUpdateQuestions).not.toHaveBeenCalled();
  });

  it('⑤ lần 2 không đổi gì → KHÔNG PUT metadata lại, KHÔNG PUT câu hỏi lại', async () => {
    const { result } = renderCreateWizard(handlers);
    await act(async () => { await result.current.persistForPreview(); });
    expect(handlers.onUpdateCampaign).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateQuestions).toHaveBeenCalledTimes(1);

    let id: string | null = null;
    await act(async () => { id = await result.current.persistForPreview(); });
    expect(id).toBe('c-1');
    expect(handlers.onCreateCampaign).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateCampaign).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateQuestions).toHaveBeenCalledTimes(1);
  });

  it('không được bật cờ retry `metadataSaved` — nó làm Phát hành bỏ qua PUT metadata, rơi mất chỉnh sửa sau chấm thử', async () => {
    const { result } = renderCreateWizard(handlers);
    await act(async () => { await result.current.persistForPreview(); });
    expect(result.current.metadataSaved).toBe(false);
  });

  it('thiếu tiêu đề (bước 0) → lỗi đúng câu ở bước 0, không rơi vào "tạo thất bại" chung', async () => {
    const { result } = renderCreateWizard(handlers);
    act(() => result.current.patchInfo({ title: '' }));
    let id: string | null = 'sentinel';
    await act(async () => { id = await result.current.persistForPreview(); });
    expect(id).toBeNull();
    expect(result.current.stepError).toBe('employer.campaigns.wizard.titleRequired');
    expect(result.current.state.currentStep).toBe(0);
    expect(handlers.onCreateCampaign).not.toHaveBeenCalled();
  });

  it('PUT câu hỏi lỗi → actionError theo mapSubmitError, trả null, mở khoá để thử lại', async () => {
    handlers.onUpdateQuestions.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderCreateWizard(handlers);
    let id: string | null = 'sentinel';
    await act(async () => { id = await result.current.persistForPreview(); });
    expect(id).toBeNull();
    expect(result.current.actionError).toBe('employer.campaigns.wizard.saveFailedRetry');
    expect(result.current.isPersistingForPreview).toBe(false);

    await act(async () => { id = await result.current.persistForPreview(); });
    expect(id).toBe('c-1');
    expect(handlers.onUpdateQuestions).toHaveBeenCalledTimes(2);
  });
});

describe('persistForPreview — edit mode (đã có baseline server)', () => {
  it('chỉ câu hỏi đổi → KHÔNG PUT metadata, CÓ PUT câu hỏi', async () => {
    const { result } = renderEditWizard(handlers);
    act(() => result.current.updateQuestion(SERVER_Q1, { prompt: 'Q1 đã sửa' }));

    let id: string | null = null;
    await act(async () => { id = await result.current.persistForPreview(); });
    expect(id).toBe('c-1');
    expect(handlers.onCreateCampaign).not.toHaveBeenCalled();
    expect(handlers.onUpdateCampaign).not.toHaveBeenCalled();
    expect(handlers.onUpdateQuestions).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateQuestions).toHaveBeenCalledWith('c-1', [
      { id: SERVER_Q1, questionText: 'Q1 đã sửa', isRequired: true },
      { id: SERVER_Q2, questionText: 'Q2', isRequired: true },
    ]);
  });

  it('chỉ thước đo đổi → PUT metadata chỉ phần dirty (+title/domain BE đòi), KHÔNG PUT câu hỏi', async () => {
    const { result } = renderEditWizard(handlers);
    act(() => result.current.setRubric([
      { ...result.current.state.rubric[0], weight: 70 },
      { ...result.current.state.rubric[1], weight: 30 },
    ]));

    await act(async () => { await result.current.persistForPreview(); });
    expect(handlers.onUpdateCampaign).toHaveBeenCalledTimes(1);
    const [, payload] = handlers.onUpdateCampaign.mock.calls[0] as unknown as [string, Record<string, unknown>];
    expect(payload.criteria).toEqual([
      expect.objectContaining({ name: 'Giao tiếp', weight: 0.7 }),
      expect.objectContaining({ name: 'Kỹ thuật', weight: 0.3 }),
    ]);
    expect(payload).not.toHaveProperty('jdText');
    expect(handlers.onUpdateQuestions).not.toHaveBeenCalled();
  });

  it('không đổi gì → không gọi API nào, vẫn trả id', async () => {
    const { result } = renderEditWizard(handlers);
    let id: string | null = null;
    await act(async () => { id = await result.current.persistForPreview(); });
    expect(id).toBe('c-1');
    expect(handlers.onUpdateCampaign).not.toHaveBeenCalled();
    expect(handlers.onUpdateQuestions).not.toHaveBeenCalled();
  });

  it('expose campaignStatus từ campaign prop', () => {
    const { result } = renderEditWizard(handlers);
    expect(result.current.campaignStatus).toBe('draft');
    expect(result.current.campaignId).toBe('c-1');
  });
});

describe('persistForPreview — ngày bắt đầu', () => {
  it('create mode: ngày bắt đầu trong tương lai qua bước 0 (không phải lỗi giả do fixture)', async () => {
    const { result } = renderCreateWizard(handlers);
    act(() => result.current.patchInfo({ startsAt: future(2), expiresAt: future(48) }));
    let id: string | null = null;
    await act(async () => { id = await result.current.persistForPreview(); });
    expect(id).toBe('c-1');
  });
});
