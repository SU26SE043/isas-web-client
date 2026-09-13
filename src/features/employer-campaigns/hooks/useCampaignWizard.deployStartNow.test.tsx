import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CampaignDeployResult, EmployerCampaign } from '../types/campaignManagement.types';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
const toastMock = vi.hoisted(() => Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

import { useCampaignWizard } from './useCampaignWizard';
import { useCampaignDeployOptionsStore } from '../stores/campaignDeployOptionsStore';
import { startNowChoiceKey } from '../utils/campaignStartNow';

/**
 * T13 R2 — khe nối "bước Review ghi store → handleFinalSubmit đọc store → onDeployCampaign
 * nhận `{ startNow }`". Component có test, service có test, util có test; chỗ dễ hỏng câm nhất
 * là chính chỗ gọi này (lớp lỗ Q10-M2: mảnh nào cũng có test, khe giữa chúng thì không).
 */
function campaignResponse(overrides: Partial<EmployerCampaign> = {}): EmployerCampaign {
  return {
    id: 'c-1',
    title: 'Backend Dev',
    domain: 'Backend',
    status: 'draft',
    jobDescription: 'JD dài đủ',
    rubric: [
      { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Giao tiếp', description: '', weight: 0.6, maxScore: 10 },
      { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', name: 'Kỹ thuật', description: '', weight: 0.4, maxScore: 10 },
    ],
    questions: [
      { id: '11111111-1111-4111-8111-111111111111', prompt: 'Q1', skill: '', difficulty: 'middle', source: 'manual', isRequired: true },
    ],
    invitedEmails: [],
    startsAt: new Date(Date.now() + 2 * 3_600_000).toISOString(), // ≤ 24h ⇒ D-6 mặc định BẬT
    deadline: new Date(Date.now() + 30 * 24 * 3_600_000).toISOString(),
    capacity: 10,
    durationMinutes: 60,
    updatedAt: '2026-09-12T10:00:00Z',
    createdAt: '2026-09-12T09:00:00Z',
    locale: 'vi',
    ...overrides,
  } as unknown as EmployerCampaign;
}

function deployed(overrides: Partial<CampaignDeployResult> = {}): CampaignDeployResult {
  return { campaign: campaignResponse({ status: 'active' }), warnings: [], invitations: null, startNow: 'skipped', ...overrides };
}

function makeHandlers() {
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
    onDeployCampaign: vi.fn(async () => deployed()),
    onSendInvitations: vi.fn(),
  };
}

let handlers: ReturnType<typeof makeHandlers>;
beforeEach(() => {
  handlers = makeHandlers();
  useCampaignDeployOptionsStore.getState().reset();
  toastMock.mockClear();
  toastMock.success.mockClear();
});
afterEach(() => cleanup());

function renderEdit() {
  return renderHook(() => useCampaignWizard({ mode: 'edit', campaign: campaignResponse(), ...handlers }));
}

describe('handleFinalSubmit → onDeployCampaign(…, { startNow }) (T13 R2)', () => {
  it('HR chưa đụng checkbox + giờ mở ≤ 24h ⇒ mặc định D-6: startNow=true', async () => {
    const { result } = renderEdit();
    await act(async () => { await result.current.handleFinalSubmit(); });
    expect(handlers.onDeployCampaign).toHaveBeenCalledWith('c-1', [], { startNow: true });
    expect(toastMock.success).toHaveBeenCalledWith('employer.campaigns.wizard.deploy.deploySuccess');
    expect(handlers.onAfterSubmit).toHaveBeenCalledTimes(1);
  });

  it('HR bỏ tick (choice=false trong store, ĐÚNG key draftId|startsAt) ⇒ startNow=false', async () => {
    const { result } = renderEdit();
    const key = startNowChoiceKey(result.current.campaignId, result.current.state.info.startsAt);
    act(() => { useCampaignDeployOptionsStore.getState().setChoice(key, false); });
    await act(async () => { await result.current.handleFinalSubmit(); });
    expect(handlers.onDeployCampaign).toHaveBeenCalledWith('c-1', [], { startNow: false });
  });

  it('bước Review đã ghi blocked (có ca) ⇒ startNow=false dù HR từng tick', async () => {
    const { result } = renderEdit();
    const key = startNowChoiceKey(result.current.campaignId, result.current.state.info.startsAt);
    act(() => {
      useCampaignDeployOptionsStore.getState().setChoice(key, true);
      useCampaignDeployOptionsStore.getState().setBlocked(key, true);
    });
    await act(async () => { await result.current.handleFinalSubmit(); });
    expect(handlers.onDeployCampaign).toHaveBeenCalledWith('c-1', [], { startNow: false });
  });

  it('lựa chọn ghi dưới KEY KHÁC (campaign khác) ⇒ coi như chưa đụng, về mặc định D-6', async () => {
    const { result } = renderEdit();
    act(() => { useCampaignDeployOptionsStore.getState().setChoice('c-999|2099-01-01T00:00', false); });
    await act(async () => { await result.current.handleFinalSubmit(); });
    expect(handlers.onDeployCampaign).toHaveBeenCalledWith('c-1', [], { startNow: true });
  });

  it("startNow 'failed' ⇒ toast TRUNG TÍNH riêng + vẫn toast deploySuccess + onAfterSubmit (KHÔNG hiện như deploy hỏng)", async () => {
    handlers.onDeployCampaign.mockResolvedValue(deployed({ startNow: 'failed', startNowError: { status: 409, message: 'slots' } }));
    const { result } = renderEdit();
    await act(async () => { await result.current.handleFinalSubmit(); });
    expect(toastMock).toHaveBeenCalledWith('employer.campaigns.wizard.deploy.startNowFailedAfterDeploy', expect.objectContaining({ icon: expect.any(String) }));
    expect(toastMock.success).toHaveBeenCalledWith('employer.campaigns.wizard.deploy.deploySuccess');
    expect(toastMock.error).not.toHaveBeenCalled();
    expect(result.current.actionError).toBeNull();
    expect(handlers.onAfterSubmit).toHaveBeenCalledTimes(1);
  });

  it("startNow 'done' ⇒ KHÔNG có toast cảnh báo start-now", async () => {
    handlers.onDeployCampaign.mockResolvedValue(deployed({ startNow: 'done' }));
    const { result } = renderEdit();
    await act(async () => { await result.current.handleFinalSubmit(); });
    expect(toastMock).not.toHaveBeenCalledWith('employer.campaigns.wizard.deploy.startNowFailedAfterDeploy', expect.anything());
  });
});
