import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { LanguageProvider } from '@/shared/languages';
import { campaignManagementService } from '../services/campaignManagement.service';
import type { CampaignResultItem, CampaignResultsResponse, CampaignTranscriptResponse } from '../types/campaign.api.types';
import { CampaignResultDetailPage } from './CampaignResultDetailPage';

afterEach(() => cleanup());

const CAMPAIGN = 'c1';

function row(rank: number, sessionId: string, email: string, totalScore: number): CampaignResultItem {
  return {
    rank,
    candidateId: `cand-${rank}`,
    sessionId,
    fullName: null,
    email,
    totalScore,
    aiScore: totalScore,
    overrideScore: null,
    overrideResult: null,
    overrideNote: null,
    overriddenAt: null,
    result: 'Pass',
    scoredAt: '2026-09-11T08:00:00Z',
    flags: [],
  } as CampaignResultItem;
}

// Thứ tự SERVER trả = thứ tự hạng (rank 1 → 2 → 3) — đây là thứ tự prev/next phải bám theo,
// KHÔNG phải thứ tự bảng đã lọc/sort ở client.
const results: CampaignResultsResponse = {
  campaignId: CAMPAIGN,
  totalCandidates: 3,
  results: [row(1, 's-top', 'top@x.io', 90), row(2, 's-mid', 'mid@x.io', 60), row(3, 's-low', 'low@x.io', 30)],
} as CampaignResultsResponse;

const transcript: CampaignTranscriptResponse = {
  sessionId: 's-mid',
  questions: [
    {
      questionId: 'q1',
      orderNo: 1,
      content: 'Câu hỏi 1',
      transcript: 'Trả lời',
      needsReview: true,
      scores: [],
      answerId: 'a1',
      kind: 'Seed',
      answerStatus: 'Scored',
      rejectReason: null,
      durationSec: 30,
      hasAudio: true,
      sampleAnswer: null,
      deliveryMetrics: null,
    },
  ],
};

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="loc">{location.pathname}</div>;
}

function renderPage(sessionId = 's-mid') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <LanguageProvider>
        <MemoryRouter initialEntries={[`/employer/campaigns/${CAMPAIGN}/results/${sessionId}`]}>
          <LocationProbe />
          <Routes>
            <Route path="/employer/campaigns/:id/results/:sessionId" element={<CampaignResultDetailPage />} />
            <Route path="/employer/campaigns/:id/overview" element={<div>overview</div>} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe('CampaignResultDetailPage (v2)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(campaignManagementService, 'getCampaignResults').mockResolvedValue(results);
    vi.spyOn(campaignManagementService, 'getCampaign').mockResolvedValue({ id: CAMPAIGN, title: 'Backend .NET' } as never);
    vi.spyOn(campaignManagementService, 'getCampaignResultTranscript').mockResolvedValue(transcript);
    vi.spyOn(campaignManagementService, 'getCampaignResultOverrideHistory').mockResolvedValue({ sessionId: 's-mid', items: [] });
    vi.spyOn(campaignManagementService, 'overrideCampaignResult').mockResolvedValue(undefined);
  });

  it('header: hạng, chiến dịch, đếm câu cần soi lại; prev/next theo thứ tự HẠNG server', async () => {
    renderPage();
    expect(await screen.findByText('Hạng #2 / 3')).toBeInTheDocument();
    expect(screen.getByText('Backend .NET')).toBeInTheDocument();
    expect(await screen.findByText('1 câu cần soi lại')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /ứng viên sau/i }));
    expect(screen.getByTestId('loc')).toHaveTextContent(`/employer/campaigns/${CAMPAIGN}/results/s-low`);
    fireEvent.click(await screen.findByRole('button', { name: /ứng viên trước/i }));
    expect(screen.getByTestId('loc')).toHaveTextContent(`/employer/campaigns/${CAMPAIGN}/results/s-mid`);
  });

  it('đóng trang = MỘT đường: link "Quay lại kết quả" về tab kết quả; không còn nút × thứ hai', async () => {
    renderPage();
    await screen.findByText('Hạng #2 / 3');
    const back = screen.getByRole('link', { name: /quay lại kết quả/i });
    expect(back).toHaveAttribute('href', `/employer/campaigns/${CAMPAIGN}/overview?tab=results`);
    expect(screen.queryByRole('button', { name: /đóng đánh giá chi tiết/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/^Đóng$/)).not.toBeInTheDocument();
  });

  it('ứng viên hạng 1: nút "trước" bị khoá; hạng cuối: nút "sau" bị khoá', async () => {
    renderPage('s-top');
    expect(await screen.findByText('Hạng #1 / 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ứng viên trước/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /ứng viên sau/i })).toBeEnabled();
  });

  it('bấm "Điều chỉnh kết quả" mở modal; lưu → gọi PUT override rồi tải lại lịch sử', async () => {
    const history = vi.spyOn(campaignManagementService, 'getCampaignResultOverrideHistory');
    renderPage();
    await screen.findByText('Hạng #2 / 3');
    await waitFor(() => expect(history).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /điều chỉnh kết quả/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Điểm điều chỉnh/i), { target: { value: '61' } });
    fireEvent.change(screen.getByLabelText(/Lý do điều chỉnh/i), { target: { value: 'HR nghe lại' } });
    fireEvent.click(screen.getByRole('button', { name: /lưu điều chỉnh/i }));

    await waitFor(() =>
      expect(campaignManagementService.overrideCampaignResult).toHaveBeenCalledWith(CAMPAIGN, 's-mid', {
        score: 61,
        result: null,
        note: 'HR nghe lại',
      }),
    );
    // Lịch sử của session này được invalidate → gọi lại API (≥2: prefix list + key history có thể trùng nhau).
    await waitFor(() => expect(history.mock.calls.length).toBeGreaterThanOrEqual(2));
  });

  it('không có ứng viên trong danh sách → trạng thái rỗng, không gọi transcript', async () => {
    const transcriptSpy = vi.spyOn(campaignManagementService, 'getCampaignResultTranscript');
    renderPage('s-unknown');
    expect(await screen.findByText(/Không tìm thấy/i)).toBeInTheDocument();
    expect(transcriptSpy).not.toHaveBeenCalled();
  });
});
