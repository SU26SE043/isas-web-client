// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { roadmapPracticeService } from '../../services/roadmapPractice.service';
import type { MilestoneScoreCriterion, MilestoneScoreReport, MilestoneScoreSession } from '../../types/roadmapPractice.api.types';
import { MilestoneScoreReportPanel } from './MilestoneScoreReportPanel';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

const session = (o: Partial<MilestoneScoreSession> = {}): MilestoneScoreSession => ({
  sessionId: 's-1', lessonTitle: 'Bài 1', attemptNo: 1, percentage: 60, scoredAt: '2026-08-01', ...o,
});
const criterion = (o: Partial<MilestoneScoreCriterion> = {}): MilestoneScoreCriterion => ({
  name: 'Giao tiếp & trình bày', currentAveragePercentage: 50, currentSessions: [session()],
  referenceAveragePercentage: 70, referenceSessions: [], deltaPct: -20, headlineDeltaPct: -20, ...o,
});
const report = (o: Partial<MilestoneScoreReport> = {}): MilestoneScoreReport => ({
  milestoneId: 'ms-2', milestoneTitle: 'Chặng 2', orderNo: 2, milestoneStatus: 'Completed',
  source: 'snapshot', comparedWith: 'previousMilestone', comparedWithTitle: 'Chặng 1', criteria: [criterion()], ...o,
});

const apiError = (status: number) =>
  Object.assign(new Error('request failed'), { isAxiosError: true, response: { status, data: {} } });

const renderPanel = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { gcTime: 0, retryDelay: 0 } } })}>
      <MilestoneScoreReportPanel roadmapId="rm-1" milestoneId="ms-2" />
    </QueryClientProvider>,
  );

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('MilestoneScoreReportPanel — phần tính ra con số "So với chặng trước"', () => {
  it('hiện điểm chặng này, mốc đem so, chênh lệch và những buổi đã cộng vào', async () => {
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockResolvedValue(report());
    renderPanel();

    expect(await screen.findByText('50%')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('−20%')).toBeInTheDocument();
    expect(screen.getByText('Bài 1')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('practice.milestoneReport.sessionsCurrent')).toBeInTheDocument();
    expect(screen.getByText('practice.milestoneReport.noSessions')).toBeInTheDocument();
  });

  it('KHÔNG CÓ MỐC thì hiện KHUYẾT, tuyệt đối không vẽ thành 0%', async () => {
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockResolvedValue(
      report({ criteria: [criterion({ referenceAveragePercentage: null, deltaPct: null, headlineDeltaPct: null })] }),
    );
    renderPanel();

    expect(await screen.findByText('50%')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
    // Vẽ 0 làm mốc tụt xuống đáy ⇒ người học trông như đang VƯỢT mốc ở đúng
    // tiêu chí chưa hề có mốc. Sai lệch luôn nghiêng về phía khen.
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
    expect(screen.queryByText('+0%')).not.toBeInTheDocument();
  });

  it('buổi chưa chấm cũng hiện khuyết chứ không phải 0%', async () => {
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockResolvedValue(
      report({ criteria: [criterion({ currentSessions: [session({ percentage: null })] })] }),
    );
    renderPanel();

    expect(await screen.findByText('Bài 1')).toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it.each(['snapshot', 'computed', 'recomputed', 'unknown'] as const)('nói ra nguồn số liệu `%s`, không nuốt', async (source) => {
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockResolvedValue(report({ source }));
    renderPanel();
    expect(await screen.findByText(`practice.milestoneReport.source.${source}`)).toBeInTheDocument();
  });

  it('recomputed mà lệch tiêu đề thì CẢNH BÁO và hiện CẢ HAI con số, không im lặng chọn một bên', async () => {
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockResolvedValue(
      report({ source: 'recomputed', criteria: [criterion({ deltaPct: -15, headlineDeltaPct: -20 })] }),
    );
    renderPanel();

    expect(await screen.findByText('practice.milestoneReport.mismatchWarning')).toBeInTheDocument();
    expect(screen.getByText('−15%')).toBeInTheDocument();
    expect(screen.getByText('practice.milestoneReport.headlineValue')).toBeInTheDocument();
    expect(screen.getByText('−20%')).toBeInTheDocument();
  });

  it('snapshot mà VẪN lệch thì cũng phải cảnh báo — cảnh báo bám độ lệch THẬT, không bám nhãn source', async () => {
    // `snapshot` tự nhận là "chốt cùng lúc với tiêu đề ⇒ không thể lệch". Lệch mà vẫn
    // im lặng thì đúng là "im lặng chọn một bên", và giấu mất một bug thật ở thượng nguồn.
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockResolvedValue(
      report({ source: 'snapshot', criteria: [criterion({ deltaPct: -15, headlineDeltaPct: -20 })] }),
    );
    renderPanel();

    expect(await screen.findByText('practice.milestoneReport.mismatchWarning')).toBeInTheDocument();
    expect(screen.getByText('−15%')).toBeInTheDocument();
    expect(screen.getByText('−20%')).toBeInTheDocument();
  });

  it('trùng nhau thì KHÔNG cảnh báo (nếu không thì cảnh báo mất hết ý nghĩa)', async () => {
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockResolvedValue(report({ source: 'recomputed' }));
    renderPanel();

    expect(await screen.findByText('practice.milestoneReport.source.recomputed')).toBeInTheDocument();
    expect(screen.queryByText('practice.milestoneReport.mismatchWarning')).not.toBeInTheDocument();
  });

  it('làm lại bài thì ghi rõ là lần thứ mấy; lần đầu thì không ghi', async () => {
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockResolvedValue(
      report({ criteria: [criterion({ currentSessions: [session({ sessionId: 's-1' }), session({ sessionId: 's-2', attemptNo: 2 })] })] }),
    );
    renderPanel();

    const attempts = await screen.findAllByText(/practice\.milestoneReport\.attempt/);
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toHaveTextContent('practice.milestoneReport.attempt 2');
  });

  it('nêu rõ đang đem so với cái gì, kèm tên chặng khi có', async () => {
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockResolvedValue(report());
    renderPanel();
    expect(await screen.findByText(/practice\.milestoneReport\.comparedWith\.previousMilestone/)).toHaveTextContent('Chặng 1');
  });

  it('mốc là baseline thì không bịa ra tên chặng', async () => {
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockResolvedValue(
      report({ comparedWith: 'baseline', comparedWithTitle: null }),
    );
    renderPanel();
    const label = await screen.findByText('practice.milestoneReport.comparedWith.baseline');
    expect(label).not.toHaveTextContent('—');
  });

  it('403 và 404 hiện hai thông điệp KHÁC nhau và không mời thử lại', async () => {
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockRejectedValue(apiError(404));
    renderPanel();
    expect(await screen.findByText('practice.milestoneReport.notFound')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'practice.milestoneReport.retry' })).not.toBeInTheDocument();

    cleanup();
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockRejectedValue(apiError(403));
    renderPanel();
    expect(await screen.findByText('practice.milestoneReport.forbidden')).toBeInTheDocument();
  });

  it('lỗi tạm thời thì cho thử lại', async () => {
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockRejectedValue(apiError(500));
    renderPanel();
    expect(await screen.findByText('practice.milestoneReport.error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'practice.milestoneReport.retry' })).toBeInTheDocument();
  });

  it('chặng chưa có tiêu chí nào được chấm thì nói thẳng, không hiện bảng rỗng', async () => {
    vi.spyOn(roadmapPracticeService, 'getMilestoneScoreReport').mockResolvedValue(report({ criteria: [] }));
    renderPanel();
    expect(await screen.findByText('practice.milestoneReport.empty')).toBeInTheDocument();
  });
});
