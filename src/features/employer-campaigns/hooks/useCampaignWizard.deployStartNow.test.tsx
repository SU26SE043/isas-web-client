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

/** datetime-local (giá trị ô "Giờ mở" ở bước 1) cách hiện tại `hours` giờ. */
function localInHours(hours: number): string {
  const date = new Date(Date.now() + hours * 3_600_000);
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Create-mode: CHƯA có nháp lúc HR tick ở bước 8 ⇒ key = `new|startsAt`; nháp chỉ sinh ra trong handleFinalSubmit. */
function renderCreate(startsAt: string) {
  const hook = renderHook(() => useCampaignWizard({ mode: 'create', ...handlers }));
  act(() => {
    hook.result.current.patchInfo({ title: 'Backend Dev', domain: 'backend', language: 'vi', startsAt, expiresAt: localInHours(24 * 30) });
    hook.result.current.patchJd({ inputMethod: 'text', jdText: 'JD dài đủ' });
    hook.result.current.setRubric([
      { id: 'new-a', name: 'Giao tiếp', description: '', weight: 60, maxScore: 10 },
      { id: 'new-b', name: 'Kỹ thuật', description: '', weight: 40, maxScore: 10 },
    ]);
    hook.result.current.setQuestions([
      { id: 'client-1', prompt: 'Q1', skill: '', difficulty: 'middle', source: 'manual', isRequired: true },
    ]);
  });
  return hook;
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

  // Tester T13-M2: đọc store theo `saved.id` (id nháp vừa tạo) thay vì `state.draftId` (lúc HR tick) vẫn
  // XANH khi mọi test đều edit-mode — vì hai giá trị đó trùng nhau. Create-mode tách chúng ra: HR tick
  // khi CHƯA có nháp (key `new|startsAt`), handleFinalSubmit mới tạo nháp `c-new` ⇒ đọc theo id mới là
  // đọc hụt ⇒ rơi về mặc định D-6 — nên giờ mở đặt XA hơn 24h để mặc định (false) KHÁC lựa chọn (true).
  it('create-mode: tick ở bước 8 khi chưa có nháp (key new|startsAt) ⇒ nháp sinh ra trong submit, onDeployCampaign vẫn nhận { startNow: true }', async () => {
    handlers.onCreateCampaign.mockResolvedValue(campaignResponse({ id: 'c-new', questions: [] }));
    const startsAt = localInHours(72);
    const { result } = renderCreate(startsAt);
    expect(result.current.campaignId).toBeNull();
    expect(result.current.state.info.startsAt).toBe(startsAt);
    act(() => { useCampaignDeployOptionsStore.getState().setChoice(startNowChoiceKey(undefined, startsAt), true); });

    await act(async () => { await result.current.handleFinalSubmit(); });

    expect(handlers.onCreateCampaign).toHaveBeenCalledTimes(1);
    expect(handlers.onDeployCampaign).toHaveBeenCalledWith('c-new', [], { startNow: true });
    expect(handlers.onAfterSubmit).toHaveBeenCalledTimes(1);
  });

  it("startNow 'done' ⇒ KHÔNG có toast cảnh báo start-now", async () => {
    handlers.onDeployCampaign.mockResolvedValue(deployed({ startNow: 'done' }));
    const { result } = renderEdit();
    await act(async () => { await result.current.handleFinalSubmit(); });
    expect(toastMock).not.toHaveBeenCalledWith('employer.campaigns.wizard.deploy.startNowFailedAfterDeploy', expect.anything());
  });
});
