import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmployerCampaign } from '../types/campaignManagement.types';
import { mapCampaignResponseToEmployerCampaign, parseCampaignResponse } from '../utils/campaignMapper';
import { CampaignSettingsStep } from '../components/wizard/CampaignSettingsStep';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => (key.endsWith('attemptOptionOne') || key.endsWith('attemptOptionMany') ? `${key} {{n}}` : key) }),
}));
vi.mock('react-hot-toast', () => {
  const toast = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() });
  return { default: toast };
});

import { resolveCampaignErrorStep, useCampaignWizard } from './useCampaignWizard';

const SETTINGS_STEP = 4;

function rawCampaign(extra: Record<string, unknown> = {}) {
  return {
    id: 'c-1', title: 'Backend Dev', domain: 'Backend', status: 'Draft', language: 'vi', jdText: 'JD dài đủ',
    timeLimitMinutes: 45, maxCandidates: 10,
    startsAt: new Date(Date.now() + 3_600_000).toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 3_600_000).toISOString(),
    criteria: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Kỹ thuật', weight: 1, maxScore: 10 }],
    questions: [{ id: '11111111-1111-4111-8111-111111111111', questionText: 'Q1', isRequired: true }],
    ...extra,
  };
}

function mapped(extra: Record<string, unknown> = {}): EmployerCampaign {
  const parsed = parseCampaignResponse(rawCampaign(extra));
  if (!parsed) throw new Error('parse failed');
  return mapCampaignResponseToEmployerCampaign(parsed);
}

function handlers(created: EmployerCampaign) {
  return {
    onCreateCampaign: vi.fn(async () => created), onUpdateCampaign: vi.fn(async () => created), onUpdateQuestions: vi.fn(async () => created),
    onGenerateQuestions: vi.fn(), onImportQuestions: vi.fn(), onUploadFiles: vi.fn(), onReplaceFiles: vi.fn(), onDownloadFile: vi.fn(),
    onAfterSubmit: vi.fn(), onDeployCampaign: vi.fn(), onSendInvitations: vi.fn(),
  };
}

afterEach(() => cleanup());

describe('useCampaignWizard — Luật làm bài (ATT1-F1)', () => {
  it('sửa nháp mà response THIẾU maxAttempts (Backend cũ) ⇒ wizard giữ 1 và bước 5 hiển thị "1 lần" được chọn', () => {
    const campaign = mapped();
    const { result } = renderHook(() => useCampaignWizard({ mode: 'edit', campaign, initialStep: SETTINGS_STEP, ...handlers(campaign) }));
    expect(result.current.state.info.maxAttempts).toBe(1);
    expect(result.current.state.info.timeLimitMinutes).toBe(45);

    render(
      <CampaignSettingsStep settings={result.current.state.settings} timeLimitMinutes={result.current.state.info.timeLimitMinutes}
        maxAttempts={result.current.state.info.maxAttempts} onRulesChange={vi.fn()} onChange={vi.fn()} onBack={vi.fn()} onNext={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'employer.campaigns.form.attemptRules.attemptOptionOne 1' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('sửa nháp có maxAttempts 3 ⇒ wizard nạp đúng 3 (không bị mặc định đè)', () => {
    const campaign = mapped({ maxAttempts: 3 });
    const { result } = renderHook(() => useCampaignWizard({ mode: 'edit', campaign, ...handlers(campaign) }));
    expect(result.current.state.info.maxAttempts).toBe(3);
  });

  it('tạo mới: mặc định 1 lần; thời lượng 4 phút ⇒ kẹt ở bước 5 với timeLimitInvalid; sửa 45 + chọn 2 ⇒ POST mang cả hai', async () => {
    const created = mapped({ maxAttempts: 2 });
    const h = handlers(created);
    const { result } = renderHook(() => useCampaignWizard({ mode: 'create', ...h }));
    expect(result.current.state.info.maxAttempts).toBe(1);
    act(() => {
      result.current.patchInfo({ title: 'Backend Dev', domain: 'backend', language: 'vi' });
      result.current.patchJd({ inputMethod: 'text', jdText: 'JD dài đủ' });
      result.current.setRubric([{ id: 'new-a', name: 'Kỹ thuật', description: '', weight: 100, maxScore: 10 }]);
      result.current.setQuestions([{ id: 'client-1', prompt: 'Q1', skill: '', difficulty: 'middle', source: 'manual', isRequired: true }]);
    });
    for (let step = 0; step < SETTINGS_STEP; step += 1) {
      await act(async () => { await result.current.goNext(); });
    }
    expect(result.current.state.currentStep).toBe(SETTINGS_STEP);

    act(() => { result.current.patchInfo({ timeLimitMinutes: 4, maxAttempts: 2 }); });
    await act(async () => { await result.current.goNext(); });
    expect(result.current.state.currentStep).toBe(SETTINGS_STEP);
    expect(result.current.stepError).toBe('employer.campaigns.wizard.timeLimitInvalid');
    expect(result.current.state.errorSteps).toContain(SETTINGS_STEP);
    expect(h.onCreateCampaign).not.toHaveBeenCalled();

    act(() => { result.current.patchInfo({ timeLimitMinutes: 45 }); });
    await act(async () => { await result.current.goNext(); });
    expect(h.onCreateCampaign).toHaveBeenCalledTimes(1);
    expect(h.onCreateCampaign).toHaveBeenCalledWith(expect.objectContaining({ maxAttempts: 2, timeLimitMinutes: 45 }));
    expect(result.current.state.currentStep).toBeGreaterThan(SETTINGS_STEP);
  });

  it('400 của server về timeLimitMinutes / maxAttempts ⇒ đưa về bước 5 (index 4)', () => {
    expect(resolveCampaignErrorStep('TimeLimitMinutes must be between 5 and 180', 'update')).toBe(SETTINGS_STEP);
    expect(resolveCampaignErrorStep('maxAttempts must be between 1 and 3', 'create')).toBe(SETTINGS_STEP);
  });
});
