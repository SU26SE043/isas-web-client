// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProctoringFlagsButton } from './ProctoringFlagsButton';
import { campaignManagementService } from '../../../services/campaignManagement.service';
import type { CampaignResultFlag } from '../../../types/campaign.api.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => (key === 'employer.campaigns.results.detail.proctoringButton' ? 'button={{count}}' : key),
    language: 'vi',
  }),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const f = (type: string, count: number): CampaignResultFlag => ({ type, count, source: 'Client', note: null, firstAt: null, lastAt: null });

function renderWithQuery(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('ProctoringFlagsButton — cờ giám sát là MỘT NÚT ở đầu trang, bấm mở popup', () => {
  it('0 cờ → badge tĩnh "không ghi nhận", KHÔNG có nút, KHÔNG có dialog', () => {
    renderWithQuery(<ProctoringFlagsButton flags={[]} campaignId="c1" sessionId="s1" />);
    expect(screen.getByText('employer.campaigns.results.detail.proctoringNone')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('nút mang TỔNG lượt ghi nhận; popup đóng và CHƯA gọi dòng thời gian cho tới khi bấm', () => {
    const timeline = vi.spyOn(campaignManagementService, 'getCampaignResultFlagTimeline');
    renderWithQuery(<ProctoringFlagsButton flags={[f('tab_switch', 4), f('face_mismatch', 1)]} campaignId="c1" sessionId="s1" />);
    const btn = screen.getByRole('button', { name: /button=5/ });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(timeline).not.toHaveBeenCalled();
  });

  it('bấm → gọi dòng thời gian ĐÚNG MỘT LẦN cho đúng buổi, popup đếm theo sự việc', async () => {
    const timeline = vi.spyOn(campaignManagementService, 'getCampaignResultFlagTimeline').mockResolvedValue({
      sessionId: 's1',
      candidateId: 'cand-1',
      events: [
        { signalType: 'no_face', detectedAt: '2026-10-05T01:39:07Z', note: null },
        { signalType: 'no_face', detectedAt: '2026-10-05T01:39:19Z', note: null },
        { signalType: 'tab_switch', detectedAt: '2026-10-05T01:39:46Z', note: null },
      ],
    });
    const user = userEvent.setup();
    renderWithQuery(<ProctoringFlagsButton flags={[f('no_face', 2), f('tab_switch', 1)]} campaignId="c1" sessionId="s1" />);
    await user.click(screen.getByRole('button', { name: /button=3/ }));
    const dialog = await screen.findByRole('dialog');
    expect(await screen.findByTestId('proctoring-summary')).toBeInTheDocument();
    expect(timeline).toHaveBeenCalledTimes(1);
    expect(timeline).toHaveBeenCalledWith('c1', 's1');
    expect(dialog).toHaveTextContent('employer.campaigns.results.proctoring.tier.identity.title');
  });

  it('dòng thời gian lỗi ⇒ popup vẫn có danh sách cờ (dữ liệu gộp) + lời báo, không trắng', async () => {
    vi.spyOn(campaignManagementService, 'getCampaignResultFlagTimeline').mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    renderWithQuery(<ProctoringFlagsButton flags={[f('face_mismatch', 1)]} campaignId="c1" sessionId="s1" />);
    await user.click(screen.getByRole('button', { name: /button=1/ }));
    expect(await screen.findByText('employer.campaigns.results.proctoring.timeline.error')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent('employer.campaigns.results.flags.type.face_mismatch');
  });
});
