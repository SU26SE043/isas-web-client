/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { StrictMode, type ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';

/**
 * ATT1-F4 CẤM gọi begin ở trang chuẩn bị — đồng hồ cả buổi sẽ chạy trong lúc ứng viên kiểm thiết bị.
 * Đi hết luồng chuẩn bị B2B (đồng ý → kiểm thiết bị → vào phòng) với service THẬT của trang chuẩn bị;
 * begin (service) và mọi POST …/begin (apiClient) phải là 0 lần.
 */

const CAMPAIGN_ID = '11111111-1111-1111-1111-111111111111';
const SESSION_ID = '22222222-2222-4222-8222-222222222222';

const begin = vi.hoisted(() => vi.fn());

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn().mockResolvedValue({ data: {} }), put: vi.fn(), delete: vi.fn() },
}));
vi.mock('@/features/practice/services/b2cPracticeSession.service', () => ({
  beginPracticeSession: begin,
  getPracticeSession: vi.fn().mockResolvedValue({ id: SESSION_ID, status: 'InProgress', questions: [], answers: [] }),
}));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));
vi.mock('@/shared/mock', () => ({ usesMockData: () => false, mockDelay: vi.fn() }));
vi.mock('@/features/campaigns/utils/campaignInterviewSession', () => ({
  readCampaignInterviewSession: (id: string) => (id === SESSION_ID
    ? {
        mode: 'b2b-campaign', campaignId: CAMPAIGN_ID, sessionId: SESSION_ID, antiCheatEnabled: true,
        faceEnrollRequired: false, adaptiveEnabled: false, deadlineAt: null, startedAt: '2026-10-02T00:00:00Z',
        questions: [{ id: 'q-1', orderNo: 1, content: '', timeLimitSec: 120 }],
      }
    : null),
  isB2bCampaignSessionId: (id: string) => id === SESSION_ID,
}));
vi.mock('@/features/practice/hooks/useInterviewGate', () => ({
  useInterviewGate: () => ({ isLoading: false, canStart: true, hasSufficientTokens: true, tokenAvailable: 1, tokenReserved: 0, creditsRemaining: 1, isLearning: false }),
}));
vi.mock('@/features/practice/hooks/useInterviewFlowSession', () => ({ useInterviewFlowSession: vi.fn() }));
vi.mock('@/features/practice/components/flow/InterviewFlowShell', () => ({
  InterviewFlowShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock('@/features/practice/components/preparation/PreparationChecklistStep', () => ({
  PreparationChecklistStep: (props: { onConsentChange: (v: boolean) => void; onContinue: () => void }) => (
    <button type="button" onClick={() => { props.onConsentChange(true); props.onContinue(); }}>prepare-continue</button>
  ),
}));
vi.mock('@/features/practice/components/preparation/DeviceCheckStep', () => ({
  DeviceCheckStep: (props: { onContinue: () => void }) => (
    <button type="button" onClick={props.onContinue}>device-continue</button>
  ),
}));

const { CampaignInterviewPreparationPage } = await import('./CampaignInterviewPreparationPage');
const { practiceSessionService } = await import('@/features/practice/services/practiceSession.service');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function beginPosts() {
  return vi.mocked(apiClient.post).mock.calls.filter(([url]) => String(url).includes('/begin'));
}

describe('CampaignInterviewPreparationPage — KHÔNG begin', () => {
  it('đi hết chuẩn bị → kiểm thiết bị → vào phòng: begin 0 lần', async () => {
    render(
      <StrictMode>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <MemoryRouter initialEntries={[`/interview/${SESSION_ID}/prepare`]}>
            <Routes>
              <Route path="/interview/:sessionId/prepare" element={<CampaignInterviewPreparationPage />} />
              <Route path="/candidate/campaigns/:campaignId/interview/:sessionId" element={<p>ROOM</p>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </StrictMode>,
    );

    await userEvent.click(await screen.findByText('prepare-continue'));
    await userEvent.click(await screen.findByText('device-continue'));

    expect(await screen.findByText('ROOM')).toBeInTheDocument();
    expect(begin).not.toHaveBeenCalled();
    expect(beginPosts()).toHaveLength(0);
  });

  it('marker start có câu content "" (ATT1 [C7]) ⇒ trang chuẩn bị KHÔNG kẹt initializing', async () => {
    const session = await practiceSessionService.getSession(SESSION_ID);
    expect(session.status).toBe('ready');
    expect(session.questions).toHaveLength(1);
    expect(begin).not.toHaveBeenCalled();
  });
});
