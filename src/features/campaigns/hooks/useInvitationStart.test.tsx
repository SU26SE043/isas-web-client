import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInvitationStart } from './useInvitationStart';
import { CampaignCandidateError, campaignCandidateService } from '../services/campaignCandidate.service';
import { saveCampaignInterviewSession } from '../utils/campaignInterviewSession';
import { campaignsTranslations } from '../languages/translations';
const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => campaignsTranslations.vi[key] ?? key }) }));
vi.mock('../utils/campaignInterviewSession', () => ({ saveCampaignInterviewSession: vi.fn() }));
vi.mock('../services/campaignCandidate.service', async (original) => ({
  ...await original<typeof import('../services/campaignCandidate.service')>(),
  campaignCandidateService: { startCampaignInterview: vi.fn() },
}));
beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);
describe('F7 useInvitationStart', () => {
  it.each([[false, 'c7'], [true, '']])('blocks start when enabled=%s and campaign=%s', async (enabled, id) => {
    const { result } = renderHook(() => useInvitationStart(id, enabled));
    await act(() => result.current.start());
    expect(campaignCandidateService.startCampaignInterview).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
  it('stores the server session and navigates using its id, not campaign id', async () => {
    const session = { campaignId: 'c7', sessionId: 'session-92', questions: [], antiCheatEnabled: true, faceEnrollRequired: true, adaptiveEnabled: false };
    vi.mocked(campaignCandidateService.startCampaignInterview).mockResolvedValue(session);
    const { result } = renderHook(() => useInvitationStart('c7', true));
    await act(() => result.current.start());
    expect(campaignCandidateService.startCampaignInterview).toHaveBeenCalledExactlyOnceWith('c7');
    expect(saveCampaignInterviewSession).toHaveBeenCalledWith(session);
    expect(navigate).toHaveBeenCalledWith('/interview/session-92/prepare');
    expect(result.current.isStarting).toBe(false);
  });
  it('preserves 409 backend explanation and formats the opening time', async () => {
    const slot = '2026-09-05T08:30:00Z';
    vi.mocked(campaignCandidateService.startCampaignInterview).mockRejectedValue(new CampaignCandidateError('conflict', 'Chưa đến giờ thi', 409, { slotStartsAt: slot }));
    const { result } = renderHook(() => useInvitationStart('c7', true));
    await act(() => result.current.start());
    expect(result.current.startError).toContain('Chưa đến giờ thi');
    expect(result.current.startError).toContain(new Date(slot).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }));
    expect(saveCampaignInterviewSession).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
  it('shows localized fallback for unexpected network failure and releases pending state', async () => {
    vi.mocked(campaignCandidateService.startCampaignInterview).mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useInvitationStart('c7', true));
    await act(() => result.current.start());
    expect(result.current.startError).toBe(campaignsTranslations.vi['campaigns.detail.startUnknown']);
    expect(result.current.isStarting).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});
