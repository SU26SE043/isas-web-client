// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { isCampaignSlotsUiEnabled } from '@/shared/config';
import { CampaignWizardShell } from './CampaignWizardShell';
import { CampaignReviewStep } from './CampaignReviewStep';
import {
  CAMPAIGN_WIZARD_STEPS, canNavigateToWizardStep, hiddenWizardStepsBetween, isHiddenWizardStep,
  nextVisibleWizardStep, visibleWizardStepPosition, visibleWizardSteps,
} from './campaignWizard.steps';
import { createEmptyJdState } from '../../types/campaignWizard.types';
import type { CampaignSlotResponse } from '../../types/campaign.api.types';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => (key === 'employer.campaigns.wizard.stepCounter' ? 'Bước {current}/{total}' : key), language: 'vi' }) }));
vi.mock('../../hooks/useRubricPreview', () => ({ useRubricPreview: () => ({ runs: [], latest: null, isLoading: false, run: vi.fn(), isRunning: false }) }));
const slotsHook = vi.fn((_campaignId: string | null | undefined, _enabled?: boolean) => ({ data: slotsData, isLoading: false, isError: false }));
let slotsData: CampaignSlotResponse[] = [];
vi.mock('../../hooks/useCampaignSlots', () => ({ useCampaignSlots: (...args: [string | null | undefined, boolean?]) => slotsHook(...args) }));

afterEach(() => { cleanup(); slotsData = []; slotsHook.mockClear(); });

const SLOTS = CAMPAIGN_WIZARD_STEPS.findIndex((s) => s.id === 'slots');   // 5 — index nội bộ KHÔNG đổi

/**
 * Bước "Khung giờ" TẠM ẨN (chốt 2026-09-17, `VITE_ENABLE_CAMPAIGN_SLOTS_UI` mặc định tắt). Khoá trạng thái
 * MẶC ĐỊNH: stepper không có bước, Tiếp/Quay lại nhảy qua, bộ đếm "x/7", Review coi như 0 ca. Hành vi KHI BẬT
 * giữ ở CampaignReviewStep.test (mock cờ = true). Index nội bộ 0–7 giữ nguyên nên mọi `step === n` cũ vẫn đúng.
 */
describe('cờ mặc định', () => {
  it('VITE_ENABLE_CAMPAIGN_SLOTS_UI không đặt ⇒ tắt, và bước ẩn đúng là `slots` (index 5)', () => {
    expect(isCampaignSlotsUiEnabled()).toBe(false);
    expect(SLOTS).toBe(5);
    expect(isHiddenWizardStep(SLOTS)).toBe(true);
    expect([0, 1, 2, 3, 4, 6, 7].some(isHiddenWizardStep)).toBe(false);
  });
});

describe('helper bước — nhảy qua bước ẩn, index nội bộ giữ nguyên', () => {
  it('visibleWizardSteps = 7 bước, không có slots, index nội bộ giữ 0,1,2,3,4,6,7', () => {
    const visible = visibleWizardSteps();
    expect(visible.map((v) => v.index)).toEqual([0, 1, 2, 3, 4, 6, 7]);
    expect(visible.some((v) => v.step.id === 'slots')).toBe(false);
  });

  it('Tiếp từ settings (4) → invites (6); Quay lại từ invites (6) → settings (4); biên không vượt', () => {
    expect(nextVisibleWizardStep(4, 1)).toBe(6);
    expect(nextVisibleWizardStep(6, -1)).toBe(4);
    expect(nextVisibleWizardStep(7, 1)).toBe(7);
    expect(nextVisibleWizardStep(0, -1)).toBe(0);
    expect(hiddenWizardStepsBetween(4, 6)).toEqual([5]);
    expect(hiddenWizardStepsBetween(3, 4)).toEqual([]);
  });

  it('bộ đếm: settings = 5/7, invites = 6/7, review = 7/7 (không còn "x/8")', () => {
    expect(visibleWizardStepPosition(4)).toEqual({ position: 5, total: 7 });
    expect(visibleWizardStepPosition(6)).toEqual({ position: 6, total: 7 });
    expect(visibleWizardStepPosition(7)).toEqual({ position: 7, total: 7 });
  });

  it('không cho điều hướng tới bước ẩn dù đã "hoàn thành"', () => {
    expect(canNavigateToWizardStep(SLOTS, 6, [0, 1, 2, 3, 4, 5])).toBe(false);
    expect(canNavigateToWizardStep(4, 6, [0, 1, 2, 3, 4, 5])).toBe(true);
  });
});

describe('CampaignWizardShell — stepper 7 mục, không có Khung giờ', () => {
  it('render 7 bước ở thanh dọc, không có tiêu đề slots; đứng ở invites thì bộ đếm là 6/7', () => {
    render(
      <MemoryRouter>
        <CampaignWizardShell currentStep={6} completedSteps={[0, 1, 2, 3, 4, 5]} onStepChange={vi.fn()} autosaveStatus="saved" lastSavedAt="2026-09-07T12:34:00.000Z">
          <div>content</div>
        </CampaignWizardShell>
      </MemoryRouter>,
    );
    // Hai stepper: dọc (aria-label nằm trên <nav>, <ol> bên trong KHÔNG có tên) + ngang (<ol> có tên).
    // Chỉ lấy list-có-tên là bỏ sót stepper dọc — mutation "vẽ cả 8 ở thanh dọc" từng XANH vì thế.
    const desktop = within(screen.getByRole('navigation', { name: 'employer.campaigns.wizard.stepperLabel' })).getByRole('list');
    const mobile = screen.getByRole('list', { name: 'employer.campaigns.wizard.stepperLabel' });
    expect(desktop).not.toBe(mobile);
    for (const list of [desktop, mobile]) {
      const items = within(list).getAllByRole('listitem');
      expect(items).toHaveLength(7);
      expect(within(list).queryByText('employer.campaigns.wizard.steps.slots')).not.toBeInTheDocument();
      // Vòng tròn số = vị trí HIỂN THỊ liên tục 1..7 — không phải index nội bộ (…5, 7, 8) để lộ "thiếu bước 6".
      const invites = items.find((li) => within(li).queryByText('employer.campaigns.wizard.steps.invites'));
      const review = items.find((li) => within(li).queryByText('employer.campaigns.wizard.steps.review'));
      expect(invites && within(invites).getByText('6')).toBeInTheDocument();
      expect(review && within(review).getByText('7')).toBeInTheDocument();
      expect(within(list).queryByText('8')).not.toBeInTheDocument();
    }
    expect(screen.getByText(/Bước 6\/7/)).toBeInTheDocument();
  });
});

describe('CampaignReviewStep — coi như 0 ca: không query, không bảng ca, không chặn theo ca', () => {
  it('có ca trong dữ liệu nhưng cờ tắt ⇒ hook bị disabled, không bảng ca, nút triển khai không bị chặn vì ca', () => {
    slotsData = [{ id: 's1', startsAt: '2026-09-08T09:00:00Z', endsAt: '2026-09-08T10:00:00Z', capacity: 1, assignedCount: 0, startedCount: 0 }];
    render(
      <CampaignReviewStep
        info={{ title: 'Frontend campaign', domain: 'frontend', maxCandidates: 10, timeLimitMinutes: 60, passScorePct: 70, startsAt: '2026-09-07T09:00', expiresAt: '2026-10-07T09:00', timezone: 'Asia/Ho_Chi_Minh' }}
        jd={{ ...createEmptyJdState(), inputMethod: 'text', jdText: 'Build a frontend product.' }}
        rubric={[]} questions={[]} questionsPerSession={5}
        settings={{ antiCheatEnabled: true, faceVerifyEnabled: true, adaptiveEnabled: true, maxFollowUps: 3, maxQuestions: 20, maxDeepPerQuestion: 2 }}
        campaignId="c1" inviteEmails={['a@x.vn', 'b@x.vn', 'c@x.vn']} domainLabel="Frontend"
        onGoToStep={vi.fn()} onBack={vi.fn()} onSubmit={vi.fn()} submitLabel="publish" submittingLabel="publishing"
      />,
    );
    // hook được gọi với enabled=false ⇒ không có request /slots nào dù có campaignId
    expect(slotsHook.mock.calls.every(([, enabled]) => enabled === false)).toBe(true);
    expect(screen.queryByText('employer.campaigns.wizard.deploy.blockSlotShortfall')).not.toBeInTheDocument();
    expect(screen.queryByRole('table', { name: /slot/i })).not.toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.wizard.deploy.scheduleNoSlots')).toBeInTheDocument();
  });

  it('"Sửa" ở thẻ Lịch & khung giờ trỏ về bước 1 (cửa sổ thi), KHÔNG phải bước 5 đã ẩn (goToStep(5) bị từ chối ⇒ nút chết)', () => {
    const onGoToStep = vi.fn();
    render(
      <CampaignReviewStep
        info={{ title: 'Frontend campaign', domain: 'frontend', maxCandidates: 10, timeLimitMinutes: 60, passScorePct: 70, startsAt: '2026-09-07T09:00', expiresAt: '2026-10-07T09:00', timezone: 'Asia/Ho_Chi_Minh' }}
        jd={{ ...createEmptyJdState(), inputMethod: 'text', jdText: 'Build a frontend product.' }}
        rubric={[]} questions={[]} questionsPerSession={5}
        settings={{ antiCheatEnabled: true, faceVerifyEnabled: true, adaptiveEnabled: true, maxFollowUps: 3, maxQuestions: 20, maxDeepPerQuestion: 2 }}
        campaignId="c1" inviteEmails={[]} domainLabel="Frontend"
        onGoToStep={onGoToStep} onBack={vi.fn()} onSubmit={vi.fn()} submitLabel="publish" submittingLabel="publishing"
      />,
    );
    const card = screen.getByText('employer.campaigns.wizard.deploy.summarySchedule').parentElement!.parentElement!;
    fireEvent.click(within(card).getByRole('button', { name: 'employer.campaigns.wizard.deploy.edit' }));
    expect(onGoToStep).toHaveBeenCalledWith(0);
    expect(onGoToStep).not.toHaveBeenCalledWith(5);
  });
});
