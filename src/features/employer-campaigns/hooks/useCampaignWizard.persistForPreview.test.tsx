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

  it('⑥ CHƯA có câu hỏi (AI đề xuất mốc ở bước 3 của wizard tạo mới): vẫn tạo draft + PUT thước đo, KHÔNG PUT câu hỏi, không lỗi bước 3', async () => {
    const { result } = renderCreateWizard(handlers);
    act(() => { result.current.setQuestions([]); });
    let id: string | null = null;
    await act(async () => { id = await result.current.persistForPreview(); });
    expect(id).toBe('c-1');
    expect(handlers.onCreateCampaign).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateQuestions).not.toHaveBeenCalled();
    expect(result.current.stepError).toBeNull();
    expect(result.current.state.errorSteps).not.toContain(3);
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

/**
 * SC2 · T9 — quyết định (a) của scope picker: sau PUT metadata, id tạm của tiêu chí vừa thêm ở bước 3 được thay
 * bằng id server (ghép theo tên) TRƯỚC khi PUT câu hỏi, để nhãn câu trỏ vào tiêu chí mới không bị lọc rớt
 * (FACT T7-R1). Và `resolveQuestionId` tra id server cho câu `client-…` vừa được lưu.
 */
describe('persistForPreview — SC2 · T9: id tạm → id server (tiêu chí theo TÊN, câu hỏi theo response)', () => {
  const CRIT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const CRIT_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  it('nhãn câu trỏ id tạm ⇒ sau PUT metadata (trả rubric có id) PUT câu hỏi mang id SERVER; state.rubric nhận id server; lần 2 không PUT lại', async () => {
    handlers.onUpdateCampaign = vi.fn(async () => campaignResponse({
      rubric: [
        { id: CRIT_A, name: 'Giao tiếp', description: '', weight: 0.6, maxScore: 10 },
        { id: CRIT_B, name: 'Kỹ thuật', description: '', weight: 0.4, maxScore: 10 },
      ],
    }));
    const { result } = renderCreateWizard(handlers);
    act(() => {
      result.current.setQuestions([
        { ...clientQuestions[0], targetCriterionIds: ['new-b'] },
        { ...clientQuestions[1], targetCriterionIds: null },
      ]);
    });

    await act(async () => { await result.current.persistForPreview(); });

    expect(handlers.onUpdateQuestions).toHaveBeenCalledTimes(1);
    const payload = (handlers.onUpdateQuestions as ReturnType<typeof vi.fn>).mock.calls[0][1] as Array<Record<string, unknown>>;
    expect(payload[0].targetCriterionIds).toEqual([CRIT_B]);
    expect(payload[1]).not.toHaveProperty('targetCriterionIds');
    expect(result.current.state.rubric.map((item) => item.id)).toEqual([CRIT_A, CRIT_B]);

    await act(async () => { await result.current.persistForPreview(); });
    expect(handlers.onUpdateCampaign).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateQuestions).toHaveBeenCalledTimes(1);
  });

  it('resolveQuestionId: trước lưu trả nguyên id client; sau lưu trả id server của ĐÚNG câu đó', async () => {
    const { result } = renderCreateWizard(handlers);
    expect(result.current.resolveQuestionId('client-2')).toBe('client-2');
    await act(async () => { await result.current.persistForPreview(); });
    expect(result.current.resolveQuestionId('client-1')).toBe(SERVER_Q1);
    expect(result.current.resolveQuestionId('client-2')).toBe(SERVER_Q2);
    expect(result.current.resolveQuestionId('id-la')).toBe('id-la');
  });

  // R1(c) — ĐỔI TIỀN ĐỀ: trước đây ca này "không ném, nhãn id tạm bị omit như trước" — tức HR gắn nhãn, bấm lưu,
  // thấy "đã lưu", mà server nhận `null`. Server không echo rubric là bất thường (mọi đường ghi đều echo criteria);
  // nay không có sự thật để ghép ⇒ id tạm còn sót ⇒ lỗi hiển thị ở bước Câu hỏi, KHÔNG PUT câu hỏi, trả null.
  it('R1(c): PUT metadata trả rubric rỗng/không khớp tên ⇒ id tạm không resolve được ⇒ lỗi ở bước Câu hỏi, KHÔNG PUT câu hỏi', async () => {
    const { result } = renderCreateWizard(handlers);
    act(() => { result.current.setQuestions([{ ...clientQuestions[0], targetCriterionIds: ['new-b'] }]); });
    let id: string | null = 'sentinel';
    await act(async () => { id = await result.current.persistForPreview(); });
    expect(id).toBeNull();
    expect(handlers.onUpdateQuestions).not.toHaveBeenCalled();
    expect(result.current.stepError).toBe('employer.campaigns.wizard.questions.unresolvedCriterionIds');
    expect(result.current.state.currentStep).toBe(3);
    expect(result.current.state.errorSteps).toContain(3);
    expect(result.current.state.rubric.map((item) => item.id)).toEqual(['new-a', 'new-b']);
  });
});

/**
 * R1 — nhãn chip từng MẤT IM LẶNG ở mọi đường lưu trừ "Lưu & chấm thử": create mode giữ id tạm trong `state.rubric`
 * tới tận `persistForPreview` (ensureDraft không adopt `created.rubric`), còn Triển khai / Lưu câu hỏi dựng payload
 * câu hỏi TRƯỚC PUT metadata và vứt response ⇒ nhãn `[temp]` bị omit ⇒ câu lưu `null`. R2 — xoá tiêu chí ở bước 3
 * để lại GUID chết trong nhãn ⇒ Triển khai 400.
 */
describe('R1/R2 — nhãn chip sống sót qua MỌI đường lưu; GUID chết bị cắt', () => {
  const CRIT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const CRIT_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const serverRubric = [
    { id: CRIT_A, name: 'Giao tiếp', description: '', weight: 0.6, maxScore: 10 },
    { id: CRIT_B, name: 'Kỹ thuật', description: '', weight: 0.4, maxScore: 10 },
  ];
  const lastQuestionsPayload = () => {
    const calls = (handlers.onUpdateQuestions as ReturnType<typeof vi.fn>).mock.calls;
    return calls[calls.length - 1][1] as Array<Record<string, unknown>>;
  };

  it('R1(a)+(b) create mode → Triển khai (handleFinalSubmit): nhãn id tạm ⇒ PUT /questions mang GUID; state.rubric nhận GUID', async () => {
    handlers.onCreateCampaign = vi.fn(async () => campaignResponse({ rubric: serverRubric, questions: [] }));
    handlers.onUpdateCampaign = vi.fn(async () => campaignResponse({ rubric: serverRubric }));
    // Server echo nhãn (như BE thật) — mock mặc định trả câu KHÔNG nhãn nên state sau lưu sẽ mất nhãn vì mock, không vì code.
    (handlers.onUpdateQuestions as unknown as { mockImplementation: (fn: unknown) => void }).mockImplementation(
      async (_id: string, payload: Array<{ targetCriterionIds?: string[] }>) => campaignResponse({
        rubric: serverRubric,
        questions: payload.map((item, index) => ({ ...serverQuestions[index], targetCriterionIds: item.targetCriterionIds ?? null })),
      }),
    );
    handlers.onDeployCampaign = vi.fn(async () => ({ campaign: campaignResponse({ status: 'active' }), warnings: [], invitations: null, startNow: 'skipped' }));
    const { result } = renderCreateWizard(handlers);
    act(() => {
      result.current.patchInfo({ maxCandidates: 10 });
      result.current.setQuestions([
        { ...clientQuestions[0], targetCriterionIds: ['new-b'] },
        { ...clientQuestions[1], targetCriterionIds: ['new-a', 'new-b'] },
      ]);
    });
    // Nháp sinh ra qua goNext ở bước 4 (đường thật của wizard tạo mới) — chỉ POST, KHÔNG PUT gì.
    for (let step = 0; step <= 4; step += 1) {
      await act(async () => { await result.current.goNext(); });
    }
    expect(result.current.state.currentStep).toBe(5);
    expect(handlers.onCreateCampaign).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateQuestions).not.toHaveBeenCalled();
    // R1(a): ensureDraft ghép created.rubric ⇒ state mang GUID ngay, không đợi Lưu & chấm thử.
    expect(result.current.state.rubric.map((item) => item.id)).toEqual([CRIT_A, CRIT_B]);
    expect(result.current.state.questions.map((q) => q.targetCriterionIds)).toEqual([[CRIT_B], [CRIT_A, CRIT_B]]);

    // Triển khai (handleUpdateDraft): PUT metadata TRƯỚC, payload câu hỏi dựng SAU ⇒ mang GUID (trước R1: undefined).
    await act(async () => { await result.current.handleFinalSubmit(); });
    expect(handlers.onDeployCampaign).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateCampaign.mock.invocationCallOrder[0]).toBeLessThan(handlers.onUpdateQuestions.mock.invocationCallOrder[0]);
    const payload = lastQuestionsPayload();
    expect(payload[0].targetCriterionIds).toEqual([CRIT_B]);
    expect(payload[1].targetCriterionIds).toEqual([CRIT_A, CRIT_B]);
  });

  // Mutation M2 (bỏ adopt trong handleUpdateDraft) XANH với ca trên vì rubric đã GUID từ ensureDraft ⇒ ca này mới
  // là ca R1(b) thật: nháp ĐÃ có, HR thêm tiêu chí mới ở bước 3 (id tạm) + gắn nhãn, bấm Triển khai.
  it('R1(b) edit mode: thêm tiêu chí mới (id tạm) + gắn nhãn rồi Triển khai ⇒ PUT metadata trước, PUT /questions mang GUID mới từ saved.rubric', async () => {
    const CRIT_C = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    handlers.onUpdateCampaign = vi.fn(async () => campaignResponse({
      rubric: [...serverRubric, { id: CRIT_C, name: 'Mới', description: '', weight: 0.2, maxScore: 10 }],
    }));
    handlers.onDeployCampaign = vi.fn(async () => ({ campaign: campaignResponse({ status: 'active' }), warnings: [], invitations: null, startNow: 'skipped' }));
    const { result } = renderEditWizard(handlers);
    act(() => {
      result.current.setRubric([
        { ...result.current.state.rubric[0], weight: 50 },
        { ...result.current.state.rubric[1], weight: 30 },
        { id: 'new-c', name: 'Mới', description: '', weight: 20, maxScore: 10 },
      ]);
      result.current.updateQuestion(SERVER_Q1, { targetCriterionIds: ['new-c'] });
    });
    await act(async () => { await result.current.handleFinalSubmit(); });
    expect(handlers.onUpdateCampaign).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateQuestions).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateCampaign.mock.invocationCallOrder[0]).toBeLessThan(handlers.onUpdateQuestions.mock.invocationCallOrder[0]);
    expect(lastQuestionsPayload()[0].targetCriterionIds).toEqual([CRIT_C]);
    expect(handlers.onDeployCampaign).toHaveBeenCalledTimes(1);
    expect(result.current.stepError).toBeNull();
    expect(result.current.state.rubric.map((item) => item.id)).toEqual([CRIT_A, CRIT_B, CRIT_C]);
  });

  it('R1(a) handleCreateCampaign (create mode chưa có nháp, bấm Triển khai thẳng): POST bỏ nhãn tạm rồi PUT /questions mang GUID sau khi ghép created.rubric', async () => {
    handlers.onCreateCampaign = vi.fn(async () => campaignResponse({ rubric: serverRubric, questions: serverQuestions }));
    handlers.onDeployCampaign = vi.fn(async () => ({ campaign: campaignResponse({ status: 'active' }), warnings: [], invitations: null, startNow: 'skipped' }));
    const { result } = renderCreateWizard(handlers);
    act(() => {
      result.current.patchInfo({ maxCandidates: 10 });
      result.current.setQuestions([{ ...clientQuestions[0], targetCriterionIds: ['new-b'] }, clientQuestions[1]]);
    });
    await act(async () => { await result.current.handleFinalSubmit(); });
    expect(handlers.onCreateCampaign).toHaveBeenCalledTimes(1);
    const posted = (handlers.onCreateCampaign as ReturnType<typeof vi.fn>).mock.calls[0][0] as { questions: Array<Record<string, unknown>> };
    expect(posted.questions[0]).not.toHaveProperty('targetCriterionIds');
    expect(handlers.onUpdateQuestions).toHaveBeenCalledTimes(1);
    expect(lastQuestionsPayload()[0].targetCriterionIds).toEqual([CRIT_B]);
    expect(handlers.onUpdateQuestions.mock.invocationCallOrder[0]).toBeLessThan(handlers.onDeployCampaign.mock.invocationCallOrder[0]);
    expect(result.current.state.rubric.map((item) => item.id)).toEqual([CRIT_A, CRIT_B]);
  });

  it('R1(b) saveQuestionsNow (Lưu câu hỏi): PUT metadata TRƯỚC, PUT /questions SAU và mang GUID đã ghép', async () => {
    handlers.onCreateCampaign = vi.fn(async () => campaignResponse({ rubric: [], questions: [] }));
    handlers.onUpdateCampaign = vi.fn(async () => campaignResponse({ rubric: serverRubric }));
    const { result } = renderCreateWizard(handlers);
    act(() => { result.current.setQuestions([{ ...clientQuestions[0], targetCriterionIds: ['new-a'] }]); });
    await act(async () => { await result.current.saveQuestionsNow(); });
    expect(handlers.onUpdateCampaign).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateQuestions).toHaveBeenCalledTimes(1);
    expect(handlers.onUpdateCampaign.mock.invocationCallOrder[0]).toBeLessThan(handlers.onUpdateQuestions.mock.invocationCallOrder[0]);
    expect(lastQuestionsPayload()[0].targetCriterionIds).toEqual([CRIT_A]);
    expect(result.current.stepError).toBeNull();
  });

  it('R1(a) AI sinh câu ở create mode: nhãn GUID của câu khớp state.rubric đã ghép từ created.rubric (chip sáng, coverage cục bộ đúng)', async () => {
    handlers.onCreateCampaign = vi.fn(async () => campaignResponse({ rubric: serverRubric, questions: [] }));
    handlers.onGenerateQuestions = vi.fn(async () => campaignResponse({
      rubric: serverRubric,
      questions: [{ ...serverQuestions[0], source: 'ai', targetCriterionIds: [CRIT_B] }],
    }));
    const { result } = renderCreateWizard(handlers);
    act(() => { result.current.setQuestions([]); });
    await act(async () => { await result.current.generateQuestionsWithAi({ useDefaultCount: true }); });
    const rubricIds = new Set(result.current.state.rubric.map((item) => item.id));
    expect(rubricIds).toEqual(new Set([CRIT_A, CRIT_B]));
    expect(result.current.state.questions[0].targetCriterionIds).toEqual([CRIT_B]);
    expect(result.current.state.questions[0].targetCriterionIds!.every((id) => rubricIds.has(id))).toBe(true);
  });

  it('R2 setRubric xoá tiêu chí ⇒ nhãn trỏ nó bị cắt ngay trong state (null giữ null, cắt hết ⇒ [])', () => {
    const { result } = renderCreateWizard(handlers);
    act(() => {
      result.current.setQuestions([
        { ...clientQuestions[0], targetCriterionIds: ['new-a', 'new-b'] },
        { ...clientQuestions[1], targetCriterionIds: null },
        { id: 'client-3', prompt: 'Q3', skill: '', difficulty: 'middle', source: 'manual', isRequired: true, targetCriterionIds: ['new-b'] },
      ]);
      result.current.setRubric([rubric[0]]);
    });
    expect(result.current.state.questions.map((q) => q.targetCriterionIds)).toEqual([['new-a'], null, []]);
    act(() => result.current.resetRubric());
    expect(result.current.state.questions.map((q) => q.targetCriterionIds)).toEqual([[], null, []]);
  });

  it('R2 trước PUT /questions cắt theo saved.rubric: GUID không còn trên server (edit mode, tiêu chí đã xoá) không đi vào payload', async () => {
    const DEAD = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
    const campaign = campaignResponse({
      rubric: [...serverRubric, { id: DEAD, name: 'Cũ', description: '', weight: 0, maxScore: 10 }],
      questions: [{ ...serverQuestions[0], targetCriterionIds: [DEAD, CRIT_A] }],
      startsAt: new Date(Date.now() + 3_600_000).toISOString(),
      deadline: new Date(Date.now() + 30 * 24 * 3_600_000).toISOString(),
      capacity: 10,
      durationMinutes: 60,
    });
    // Server đã cắt DEAD trong replace-all ⇒ response chỉ còn A, B.
    handlers.onUpdateCampaign = vi.fn(async () => campaignResponse({ rubric: serverRubric }));
    const { result } = renderEditWizard(handlers, campaign);
    // Giả lập nhãn còn GUID chết dù rubric state không còn nó (đường nào đó bỏ qua prune ở setRubric).
    act(() => {
      result.current.setRubric(result.current.state.rubric.filter((item) => item.id !== DEAD).map((item, index) => ({ ...item, weight: index === 0 ? 70 : 30 })));
      result.current.updateQuestion(SERVER_Q1, { targetCriterionIds: [DEAD, CRIT_A] });
    });
    await act(async () => { await result.current.persistForPreview(); });
    expect(handlers.onUpdateCampaign).toHaveBeenCalledTimes(1);
    expect(lastQuestionsPayload()[0].targetCriterionIds).toEqual([CRIT_A]);
  });
});
