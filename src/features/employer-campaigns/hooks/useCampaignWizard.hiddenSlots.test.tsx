import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmployerCampaign } from '../types/campaignManagement.types';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('react-hot-toast', () => {
  const toast = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() });
  return { default: toast };
});

import { useCampaignWizard } from './useCampaignWizard';

/**
 * Bước "Khung giờ" (index 5) TẠM ẨN (`VITE_ENABLE_CAMPAIGN_SLOTS_UI` mặc định tắt). Khoá ba đường đi
 * vào/ra bước ẩn ở tầng HOOK (helper thuần đã khoá ở campaignSlotsUi.hidden.test): deep-link `?step=`
 * trỏ vào bước ẩn, Quay lại từ bước sau, Tiếp từ bước trước. Index nội bộ giữ nguyên nên mọi
 * `step === n` trong wizard vẫn đúng — chỉ tầng điều hướng nhảy qua.
 */
const SLOTS = 5;

function campaign(): EmployerCampaign {
  return {
    id: 'c-1', title: 'Backend Dev', domain: 'Backend', status: 'draft', jobDescription: 'JD dài đủ',
    rubric: [
      { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Giao tiếp', description: '', weight: 0.6, maxScore: 10 },
      { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', name: 'Kỹ thuật', description: '', weight: 0.4, maxScore: 10 },
    ],
    questions: [{ id: '11111111-1111-4111-8111-111111111111', prompt: 'Q1', skill: '', difficulty: 'middle', source: 'manual', isRequired: true }],
    invitedEmails: [], updatedAt: '2026-09-12T10:00:00Z', createdAt: '2026-09-12T09:00:00Z', locale: 'vi',
    startsAt: new Date(Date.now() + 3_600_000).toISOString(), deadline: new Date(Date.now() + 30 * 24 * 3_600_000).toISOString(),
    capacity: 10, durationMinutes: 60,
  } as unknown as EmployerCampaign;
}

function handlers() {
  const c = campaign();
  return {
    onCreateCampaign: vi.fn(async () => c), onUpdateCampaign: vi.fn(async () => c), onUpdateQuestions: vi.fn(async () => c),
    onGenerateQuestions: vi.fn(), onImportQuestions: vi.fn(), onUploadFiles: vi.fn(), onReplaceFiles: vi.fn(), onDownloadFile: vi.fn(),
    onAfterSubmit: vi.fn(), onDeployCampaign: vi.fn(), onSendInvitations: vi.fn(),
  };
}

const renderEdit = (initialStep: number) => renderHook(() => useCampaignWizard({ mode: 'edit', campaign: campaign(), initialStep, ...handlers() }));

afterEach(() => cleanup());

describe('useCampaignWizard — bước khung giờ ẩn', () => {
  it('deep-link ?step= trỏ vào bước ẩn (5) ⇒ đứng ở bước hiển thị kế trước (4), không phải 5', () => {
    const { result } = renderEdit(SLOTS);
    expect(result.current.state.currentStep).toBe(4);
  });

  it('deep-link vào bước hiển thị (6) giữ nguyên 6', () => {
    const { result } = renderEdit(6);
    expect(result.current.state.currentStep).toBe(6);
  });

  it('Quay lại từ invites (6) ⇒ settings (4), nhảy qua 5', () => {
    const { result } = renderEdit(6);
    act(() => { result.current.goBack(); });
    expect(result.current.state.currentStep).toBe(4);
  });

  it('Tiếp từ settings (4) ⇒ invites (6)', async () => {
    const { result } = renderEdit(4);
    await act(async () => { await result.current.goNext(); });
    expect(result.current.state.currentStep).toBe(6);
  });

  it('create: đi Tiếp 0→4 rồi Tiếp ⇒ đứng ở 6, bước 5 ẩn được ĐÁNH DẤU hoàn thành (validate/nav coi như đã đi)', async () => {
    // Edit mode có sẵn completedSteps 0–7 nên không phân biệt được; phải đi đường create thật.
    const { result } = renderHook(() => useCampaignWizard({ mode: 'create', ...handlers() }));
    act(() => {
      result.current.patchInfo({ title: 'Backend Dev', domain: 'backend', language: 'vi', maxCandidates: 10 });
      result.current.patchJd({ inputMethod: 'text', jdText: 'JD dài đủ' });
      result.current.setRubric([
        { id: 'new-a', name: 'Giao tiếp', description: '', weight: 60, maxScore: 10 },
        { id: 'new-b', name: 'Kỹ thuật', description: '', weight: 40, maxScore: 10 },
      ]);
      result.current.setQuestions([
        { id: 'client-1', prompt: 'Q1', skill: '', difficulty: 'middle', source: 'manual', isRequired: true, targetCriterionIds: ['new-b'] },
        { id: 'client-2', prompt: 'Q2', skill: '', difficulty: 'middle', source: 'manual', isRequired: true, targetCriterionIds: ['new-a', 'new-b'] },
      ]);
    });
    expect(result.current.state.completedSteps).not.toContain(SLOTS);
    for (let step = 0; step <= 4; step += 1) {
      await act(async () => { await result.current.goNext(); });
    }
    expect(result.current.state.currentStep).toBe(6);
    expect(result.current.state.completedSteps).toContain(SLOTS);
  });

  it('goToStep(5) bị từ chối — đứng nguyên', () => {
    const { result } = renderEdit(6);
    act(() => { result.current.goToStep(SLOTS); });
    expect(result.current.state.currentStep).toBe(6);
  });
});
