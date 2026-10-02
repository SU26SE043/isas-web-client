import { act, cleanup, renderHook } from '@testing-library/react';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmployerCampaign } from '../types/campaignManagement.types';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('react-hot-toast', () => {
  const toast = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() });
  return { default: toast };
});

import { useCampaignWizard } from './useCampaignWizard';

/**
 * ATT1-F5b (dọn sau KIỂM) — nút Triển khai cuối wizard trước đây có CHỐT 409 RIÊNG trong
 * `handleFinalSubmit`: chỉ đọc body CHUỖI TRẦN, còn lại dán câu `deployConflict`. Chốt đó chặn
 * chính bản sửa F5b (`getDeployWarnings` đã đọc body OBJECT `{ error }` cho 400 VÀ 409): backend
 * ATT1 trả `{ error }` cho mọi 400/409 của POST/PUT /campaign ⇒ HR vẫn mất lời server khi bấm
 * Triển khai. Các ca dưới khoá: đường publish của wizard đi CHUNG `mapDeployError`, và 409 không
 * body vẫn giữ câu `deployConflict` (không tụt xuống `deployFailed` chung chung).
 */
const CRIT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const CRIT_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const SERVER_Q1 = '11111111-1111-4111-8111-111111111111';

function campaignResponse(overrides: Partial<EmployerCampaign> = {}): EmployerCampaign {
  return {
    id: 'c-1',
    title: 'Backend Dev',
    domain: 'Backend',
    status: 'draft',
    jobDescription: 'JD dài đủ',
    rubric: [
      { id: CRIT_A, name: 'Giao tiếp', description: '', weight: 0.6, maxScore: 10 },
      { id: CRIT_B, name: 'Kỹ thuật', description: '', weight: 0.4, maxScore: 10 },
    ],
    questions: [
      { id: SERVER_Q1, prompt: 'Q1', skill: '', difficulty: 'middle', source: 'manual', isRequired: true },
    ],
    invitedEmails: [],
    startsAt: new Date(Date.now() + 3_600_000).toISOString(),
    deadline: new Date(Date.now() + 30 * 24 * 3_600_000).toISOString(),
    capacity: 10,
    durationMinutes: 60,
    updatedAt: '2026-09-12T10:00:00Z',
    createdAt: '2026-09-12T09:00:00Z',
    locale: 'vi',
    ...overrides,
  } as unknown as EmployerCampaign;
}

function makeHandlers(deployRejection: unknown) {
  return {
    onCreateCampaign: vi.fn(async () => campaignResponse()),
    onUpdateCampaign: vi.fn(async () => campaignResponse()),
    onUpdateQuestions: vi.fn(async () => campaignResponse()),
    onGenerateQuestions: vi.fn(),
    onImportQuestions: vi.fn(),
    onUploadFiles: vi.fn(),
    onReplaceFiles: vi.fn(),
    onDownloadFile: vi.fn(),
    onAfterSubmit: vi.fn(),
    onDeployCampaign: vi.fn(async () => { throw deployRejection; }),
    onSendInvitations: vi.fn(),
  };
}

/** Bấm Triển khai trên nháp hợp lệ ⇒ publish lỗi ⇒ trả về câu hiện trên khung lỗi của wizard. */
async function publishErrorMessage(deployRejection: unknown): Promise<string | null> {
  const handlers = makeHandlers(deployRejection);
  const { result } = renderHook(() => useCampaignWizard({ mode: 'edit', campaign: campaignResponse(), ...handlers }));
  await act(async () => { await result.current.handleFinalSubmit(); });
  expect(handlers.onDeployCampaign).toHaveBeenCalledTimes(1);
  expect(handlers.onAfterSubmit).not.toHaveBeenCalled();
  return result.current.actionError;
}

function deployError(status: number, data: unknown) {
  const error = new axios.AxiosError('Request failed');
  error.response = { status, statusText: '', headers: {}, config: {} as never, data };
  return error;
}

describe('ATT1-F5b — publish ở wizard dùng chung mapDeployError', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => cleanup());

  it('409 CHUỖI TRẦN ⇒ hiện nguyên lời server (hồi quy chốt cũ)', async () => {
    const reason = 'Campaign has interview slots configured.';
    await expect(publishErrorMessage(deployError(409, reason))).resolves.toBe(reason);
  });

  it('409 body `{ error }` ⇒ hiện nguyên lời server, KHÔNG dán đè câu chung về trạng thái', async () => {
    const reason = 'Không sửa được thời lượng sau khi triển khai.';
    await expect(publishErrorMessage(deployError(409, { code: 'TIME_LIMIT_LOCKED', error: reason })))
      .resolves.toBe(reason);
  });

  it('409 KHÔNG body ⇒ vẫn là câu mặc định về trạng thái (deployConflict), không phải deployFailed', async () => {
    await expect(publishErrorMessage(deployError(409, undefined)))
      .resolves.toBe('employer.campaigns.wizard.deploy.deployConflict');
    await expect(publishErrorMessage(deployError(409, '   ')))
      .resolves.toBe('employer.campaigns.wizard.deploy.deployConflict');
  });

  it('400 body `{ error }` ⇒ vẫn hiện nguyên lời server (hồi quy F5b)', async () => {
    const reason = 'Thời lượng làm bài phải trong khoảng 5–180 phút.';
    await expect(publishErrorMessage(deployError(400, { error: reason }))).resolves.toBe(reason);
  });

  it('500 ⇒ câu chung, không lộ lỗi kỹ thuật', async () => {
    await expect(publishErrorMessage(deployError(500, { error: 'NullReferenceException' })))
      .resolves.toBe('employer.campaigns.wizard.deploy.deployFailed');
  });
});
