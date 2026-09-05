import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { campaignsTranslations } from '../languages/translations';
import { UserRole } from '@/features/auth/types/auth.types';
import { campaignCandidateService } from '../services/campaignCandidate.service';
import { MagicLinkLandingPage } from './MagicLinkLandingPage';

vi.mock('@/shared/mock/config', () => ({ isPlaywrightRuntime: () => false }));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ language: 'vi', t }) }));
vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: Object.assign((selector: (state: unknown) => unknown) => selector({
    isAuthenticated: true, user: { role: UserRole.CANDIDATE }, isLoading: false,
    setUser: vi.fn(), logout: vi.fn(),
  }), { persist: { hasHydrated: () => true, onFinishHydration: () => () => {} } }),
}));
vi.mock('../services/campaignCandidate.service', async (importOriginal) => ({
  ...await importOriginal<typeof import('../services/campaignCandidate.service')>(),
  campaignCandidateService: { getInvitationByToken: vi.fn(), startCampaignInterview: vi.fn(), joinCampaignByToken: vi.fn() },
}));
const t = (key: string) => campaignsTranslations.vi[key] ?? key;
const now = new Date('2026-09-05T03:00:00Z');
async function show(startsAt: string | null, orgName: string | null = 'Công ty Sao') {
  vi.mocked(campaignCandidateService.getInvitationByToken).mockResolvedValue({
    campaignId: 'campaign-7', title: 'Tuyển Frontend', jobTitle: 'React developer',
    orgName, startsAt, criteria: [], durationMinutes: 35, questionCount: 8, faceVerifyEnabled: true,
  });
  await act(async () => {
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/invitations/token-7']}><Routes>
        <Route path="/invitations/:token" element={<MagicLinkLandingPage />} />
      </Routes></MemoryRouter>
    </QueryClientProvider>);
  });
}
beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear(); vi.useFakeTimers(); vi.setSystemTime(now); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
describe('F7 invitation opening time at the page boundary', () => {
  it('future startsAt disables Start but enables Join and shows countdown (M5)', async () => {
    await show('2026-09-05T04:00:00Z');
    const start = screen.getByRole('button', { name: t('campaigns.detail.start') });
    expect(start).toBeDisabled();
    expect(start).toHaveAttribute('title', expect.stringContaining('01:00:00'));
    expect(screen.getByRole('button', { name: t('campaigns.invite.join') })).toBeEnabled();
    expect(screen.getByText(/01:00:00/)).toBeVisible();
    fireEvent.click(start);
    expect(campaignCandidateService.startCampaignInterview).not.toHaveBeenCalled();
  });
  it('past startsAt enables both actions without a countdown', async () => {
    await show('2026-09-05T02:59:59Z');
    expect(screen.getByRole('button', { name: t('campaigns.detail.start') })).toBeEnabled();
    expect(screen.getByRole('button', { name: t('campaigns.invite.join') })).toBeEnabled();
    expect(screen.queryByText(/00:00:00/)).not.toBeInTheDocument();
  });
  it('ticks across opening time and enables Start without reloading the invitation', async () => {
    await show('2026-09-05T03:00:02Z');
    expect(screen.getByRole('button', { name: t('campaigns.detail.start') })).toBeDisabled();
    await act(async () => { vi.advanceTimersByTime(2000); });
    expect(screen.getByRole('button', { name: t('campaigns.detail.start') })).toBeEnabled();
    expect(campaignCandidateService.getInvitationByToken).toHaveBeenCalledExactlyOnceWith('token-7');
  });
  it('null orgName omits the company row and placeholder', async () => {
    await show(null, null);
    expect(screen.getByText('React developer')).toBeVisible();
    expect(screen.queryByText('Công ty Sao')).not.toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });
  it('renders supplied company below job title', async () => {
    await show(null);
    const job = screen.getByText('React developer');
    const org = screen.getByText('Công ty Sao');
    expect(job.compareDocumentPosition(org) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
