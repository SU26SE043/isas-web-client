// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { adminRubricService } from '../services/adminRubric.service';
import type { AdminRubricMatrixRow, AdminRubricPreviewRun, AdminRubricSet } from '../types/adminApi.types';
import { AdminRubricsPage } from './AdminRubricsPage';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));

// Fixture theo ĐÚNG DTO `AdminRubric.cs` (descriptor · id · jobCategory). Bản test cũ dựng
// `{ key, description }` theo type FE tự bịa ⇒ xanh vì lý do sai, màn hình thật trống.
const LONG = (s: string) => `${s} ${'x'.repeat(24)}`;
const rubric: AdminRubricSet = {
  jobCategory: 'BE', language: 'vi', version: 2, changed: false,
  criteria: [
    { id: 'c-1', name: 'Giao tiếp & trình bày', description: 'Rõ ràng.', weight: 0.15, maxScore: 5, scoringScope: 'Always', scoringMethod: 'Ai', levels: [{ score: 0, descriptor: LONG('Không trả lời hoặc lạc đề') }, { score: 5, descriptor: LONG('Mạch lạc, có ví dụ') }] },
    { id: 'c-2', name: 'Chiều sâu kỹ thuật', description: null, weight: 0.25, maxScore: 5, scoringScope: 'WhenTargeted', scoringMethod: 'Ai', levels: [] },
    // Tiêu chí ĐO (F11): hệ tự tính từ bản ghi, không gửi AI ⇒ 0 mốc là bình thường, không được báo thiếu.
    { id: 'c-3', name: 'Độ trôi chảy & tự tin', description: null, weight: 0.1, maxScore: 5, scoringScope: 'Always', scoringMethod: 'DeliveryMetrics', levels: [] },
  ],
  sampleQuestions: [{ id: 'q-1', text: 'Giải thích index trong PostgreSQL.' }, { id: 'q-2', text: 'Transaction isolation là gì?' }],
};
const matrix: AdminRubricMatrixRow[] = [
  { jobCategory: 'BE', language: 'vi', version: 2, criteriaCount: 2, withLevelsCount: 1 },
  { jobCategory: 'FE', language: 'vi', version: 1, criteriaCount: 7, withLevelsCount: 7 },
  { jobCategory: 'FE', language: 'en', version: 1, criteriaCount: 7, withLevelsCount: 0 },
];
const run: AdminRubricPreviewRun = {
  id: 'r-1', status: 'Succeeded', jobCategory: 'BE', language: 'vi', rubricVersion: 2, questionText: 'Giải thích index trong PostgreSQL.', rubricFingerprint: 'fp', promptVersion: null,
  deliveryMetricsAvailable: false, lengthParityWarning: false, freeRunsRemaining: 4,
  rubric: [{ criterionId: 'c-1', name: 'Giao tiếp & trình bày', weight: 0.15, maxScore: 5, levels: rubric.criteria[0].levels }],
  samples: [
    { band: 'Weak', answerText: 'bài yếu', wordCount: 20, expectedPct: 20, actualPct: 48.4, scores: [{ criterionId: 'c-1', criterionName: 'Giao tiếp & trình bày', maxScore: 5, expectedLevel: 1, actualScore: 2, levelMatched: 2, reasoning: 'ngắn', measured: false }], deliveryMetrics: null },
    { band: 'Good', answerText: 'bài khá', wordCount: 60, expectedPct: 60, actualPct: 66.4, scores: [{ criterionId: 'c-1', criterionName: 'Giao tiếp & trình bày', maxScore: 5, expectedLevel: 3, actualScore: 3, levelMatched: 3, reasoning: 'ổn', measured: false }], deliveryMetrics: null },
    { band: 'Excellent', answerText: 'bài xuất sắc', wordCount: 120, expectedPct: 100, actualPct: 70.2, scores: [{ criterionId: 'c-1', criterionName: 'Giao tiếp & trình bày', maxScore: 5, expectedLevel: 5, actualScore: 4, levelMatched: 4, reasoning: 'tốt', measured: false }], deliveryMetrics: null },
  ],
  errorReason: null, createdAt: '2026-09-16T09:00:00Z', completedAt: '2026-09-16T09:00:40Z',
};

function mockHappyPath() {
  vi.spyOn(adminRubricService, 'list').mockResolvedValue(matrix);
  vi.spyOn(adminRubricService, 'get').mockResolvedValue(rubric);
  vi.spyOn(adminRubricService, 'history').mockResolvedValue([{ version: 2, isActive: true, criteriaCount: 2, withLevelsCount: 1 }, { version: 1, isActive: false, criteriaCount: 2, withLevelsCount: 0 }]);
  vi.spyOn(adminRubricService, 'previewHistory').mockResolvedValue([]);
}
const renderPage = (initialEntries = ['/admin/rubrics']) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><MemoryRouter initialEntries={initialEntries}><AdminRubricsPage /></MemoryRouter></QueryClientProvider>);
const openTryTab = () => fireEvent.click(screen.getByRole('tab', { name: 'admin.rubrics.tab.try' }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminRubricsPage — hiện đúng dữ liệu BE', () => {
  it('bảng hiện descriptor THẬT của mốc và báo tiêu chí chưa có mốc; ma trận 3×2 có chip; tải với mã enum BE/vi', async () => {
    mockHappyPath();
    const getSpy = vi.mocked(adminRubricService.get);
    renderPage();
    expect(await screen.findByText(/Không trả lời hoặc lạc đề/)).toBeInTheDocument();
    // Đúng MỘT tiêu chí AI thiếu mốc (c-2); tiêu chí đo (c-3) 0 mốc nhưng hiện "không cần mốc" + badge "hệ tự đo", KHÔNG phải cảnh báo.
    expect(screen.getAllByText('admin.rubrics.levels.none')).toHaveLength(1);
    expect(screen.getByText('admin.rubrics.measured.noLevelsNeeded')).toBeInTheDocument();
    expect(screen.getByText('admin.rubrics.measured.badge')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'admin.rubrics.category.FE · admin.rubrics.lang.vi' })).toBeInTheDocument();
    expect(getSpy.mock.calls[0]).toEqual(['BE', 'vi']);
    // Ma trận phải phủ CẢ HAI ngôn ngữ trong một lượt gọi — gọi kèm `?language=vi` thì 3 ô English rơi về "chưa tải được" (đo trên dev).
    expect(vi.mocked(adminRubricService.list)).toHaveBeenCalledWith();
    expect(screen.getByRole('button', { name: 'admin.rubrics.category.FE · admin.rubrics.lang.en' })).toHaveTextContent('admin.rubrics.matrix.missing');
    // Lịch sử phiên bản có mặt (fetch về phải HIỆN, không để trong hook).
    expect(screen.getByText('admin.rubrics.history.active')).toBeInTheDocument();
  });
});

describe('AdminRubricsPage — lưu', () => {
  it('sửa mô tả → Lưu → confirm → PUT chỉ mang {id, description, levels[{score, descriptor}]}, KHÔNG có name/weight/maxScore', async () => {
    mockHappyPath();
    const updateSpy = vi.spyOn(adminRubricService, 'update').mockResolvedValue({ ...rubric, version: 3, changed: true });
    renderPage();
    const textarea = await screen.findByLabelText('admin.rubrics.column.description Chiều sâu kỹ thuật');
    expect(screen.getByRole('button', { name: 'admin.rubrics.save' })).toBeDisabled();
    fireEvent.change(textarea, { target: { value: 'Đo độ sâu hiểu biết kỹ thuật.' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.save' }));
    expect(await screen.findByText('admin.rubrics.saveDescription')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.saveConfirm' }));
    await waitFor(() => expect(updateSpy).toHaveBeenCalledTimes(1));
    const [category, language, body] = updateSpy.mock.calls[0];
    expect([category, language]).toEqual(['BE', 'vi']);
    expect(body).toEqual({
      criteria: [
        { id: 'c-1', description: 'Rõ ràng.', levels: rubric.criteria[0].levels },
        { id: 'c-2', description: 'Đo độ sâu hiểu biết kỹ thuật.', levels: null },
        { id: 'c-3', description: null, levels: null },
      ],
    });
    expect(JSON.stringify(body)).not.toMatch(/"name"|"weight"|"maxScore"|"scoringScope"|"scoringMethod"/);
    expect(await screen.findByText('admin.rubrics.saveSuccess')).toBeInTheDocument();
  });

  it('BE trả changed:false ⇒ nói rõ "không tạo phiên bản mới", không giả vờ đã lưu', async () => {
    mockHappyPath();
    vi.spyOn(adminRubricService, 'update').mockResolvedValue({ ...rubric, changed: false });
    renderPage();
    fireEvent.change(await screen.findByLabelText('admin.rubrics.column.description Chiều sâu kỹ thuật'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.save' }));
    fireEvent.click(await screen.findByRole('button', { name: 'admin.rubrics.saveConfirm' }));
    expect(await screen.findByText('admin.rubrics.saveUnchanged')).toBeInTheDocument();
  });

  it('"Về bản gốc" có nút, có confirm, và gọi reset đúng (bản cũ có mutation nhưng không nút)', async () => {
    mockHappyPath();
    const resetSpy = vi.spyOn(adminRubricService, 'reset').mockResolvedValue({ ...rubric, version: 3, changed: true });
    renderPage();
    // Nút "Về bản gốc" disabled tới khi bộ tải xong — chờ dữ liệu trước rồi mới bấm.
    await screen.findByText(/Không trả lời hoặc lạc đề/);
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.reset' }));
    expect(await screen.findByText('admin.rubrics.resetDescription')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.resetConfirm' }));
    await waitFor(() => expect(resetSpy).toHaveBeenCalledWith('BE', 'vi'));
  });
});

describe('AdminRubricsPage — tự thử thước đo', () => {
  const customRun: AdminRubricPreviewRun = {
    ...run, id: 'r-2', deliveryMetricsAvailable: false,
    samples: [{ band: 'Custom', answerText: 'Bài tôi tự dán.', wordCount: 4, expectedPct: 60, actualPct: 60, deliveryMetrics: null,
      scores: [{ criterionId: 'c-1', criterionName: 'Giao tiếp & trình bày', maxScore: 5, expectedLevel: 3, actualScore: 3, levelMatched: 3, reasoning: 'có ý chính', measured: false }] }],
  };

  it('tiêu chí thiếu mốc ⇒ CẢNH BÁO nêu tên nhưng KHÔNG chặn (BE mới biết tiêu chí nào do AI chấm; tiêu chí đo bằng số cố ý 0 mốc)', async () => {
    mockHappyPath();
    renderPage();
    await screen.findByRole('tab', { name: 'admin.rubrics.tab.try' });
    openTryTab();
    expect(await screen.findByText('admin.rubrics.preview.needsLevels')).toBeInTheDocument();
    // Chưa có bài ⇒ nút Chấm tắt (không phải vì thiếu mốc).
    expect(screen.getByRole('button', { name: 'admin.rubrics.try.run.free' })).toBeDisabled();
  });

  it('CHỈ tiêu chí đo (DeliveryMetrics) thiếu mốc ⇒ KHÔNG cảnh báo — BE không đòi mốc ở tiêu chí hệ tự đo', async () => {
    mockHappyPath();
    vi.mocked(adminRubricService.get).mockResolvedValue({
      ...rubric,
      // c-2 (AI) nay có mốc ⇒ thứ duy nhất còn 0 mốc là c-3 (đo).
      criteria: rubric.criteria.map((c) => (c.id === 'c-2' ? { ...c, levels: rubric.criteria[0].levels } : c)),
    });
    renderPage();
    await screen.findByRole('tab', { name: 'admin.rubrics.tab.try' });
    openTryTab();
    await screen.findByRole('button', { name: 'admin.rubrics.try.run.free' });
    expect(screen.queryByText('admin.rubrics.preview.needsLevels')).not.toBeInTheDocument();
  });

  it('DÁN bài → chấm CHỈ bài của mình (includeAiSamples=false, không số đo) đúng hợp đồng BE, rồi RENDER "Bài của bạn" và nói rõ trôi chảy không chấm', async () => {
    mockHappyPath();
    const previewSpy = vi.spyOn(adminRubricService, 'preview').mockResolvedValue(customRun);
    renderPage();
    await screen.findByRole('tab', { name: 'admin.rubrics.tab.try' });
    openTryTab();
    const runButton = await screen.findByRole('button', { name: 'admin.rubrics.try.run.free' });
    fireEvent.change(screen.getByLabelText('admin.rubrics.preview.questionSample'), { target: { value: 'q-2' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.try.mode.paste' }));
    expect(screen.getByText('admin.rubrics.try.chip.noAudio')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('admin.rubrics.try.mode.paste'), { target: { value: 'Bài tôi tự dán.' } });
    expect(runButton).toBeEnabled();
    fireEvent.click(runButton);
    await waitFor(() => expect(previewSpy).toHaveBeenCalledTimes(1));
    expect(previewSpy.mock.calls[0]).toEqual(['BE', 'vi', { sampleQuestionId: 'q-2', customAnswer: 'Bài tôi tự dán.', includeAiSamples: false }]);
    expect(JSON.stringify(previewSpy.mock.calls[0][2])).not.toMatch(/deliveryMetrics|criterionKey|"answer"/);
    expect(await screen.findByLabelText('admin.rubrics.try.result.yours')).toBeInTheDocument();
    expect(screen.getByText('admin.rubrics.try.result.fluencySkipped')).toBeInTheDocument();
    expect(screen.getAllByText('có ý chính').length).toBeGreaterThan(0);   // trích dẫn (rút gọn + đầy đủ trong <details>)
    // Không có bài AI ⇒ không có mục so sánh 3 bài.
    expect(screen.queryByText('admin.rubrics.try.result.aiSection')).not.toBeInTheDocument();
  });

  it('bật "3 bài AI" ⇒ gửi includeAiSamples=true và lượt có bài AI hiện mục so sánh (3 dải Yếu/Khá/Xuất sắc)', async () => {
    mockHappyPath();
    const previewSpy = vi.spyOn(adminRubricService, 'preview').mockResolvedValue(run);
    renderPage();
    await screen.findByRole('tab', { name: 'admin.rubrics.tab.try' });
    openTryTab();
    const runButton = await screen.findByRole('button', { name: 'admin.rubrics.try.run.free' });
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.try.mode.paste' }));
    fireEvent.change(screen.getByLabelText('admin.rubrics.try.mode.paste'), { target: { value: 'Bài tôi tự dán.' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(runButton);
    await waitFor(() => expect(previewSpy).toHaveBeenCalledTimes(1));
    expect(previewSpy.mock.calls[0][2]).toMatchObject({ includeAiSamples: true, customAnswer: 'Bài tôi tự dán.' });
    expect(await screen.findByText('admin.rubrics.try.result.aiSection')).toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.rubricPreview.band.Weak')).toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.rubricPreview.band.Excellent')).toBeInTheDocument();
  });

  it('đổi câu hỏi khi ĐÃ có bài ⇒ hỏi trước; huỷ thì giữ nguyên câu và bài', async () => {
    mockHappyPath();
    renderPage();
    await screen.findByRole('tab', { name: 'admin.rubrics.tab.try' });
    openTryTab();
    await screen.findByRole('button', { name: 'admin.rubrics.try.run.free' });
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.try.mode.paste' }));
    fireEvent.change(screen.getByLabelText('admin.rubrics.try.mode.paste'), { target: { value: 'Bài đang gõ dở.' } });
    fireEvent.change(screen.getByLabelText('admin.rubrics.preview.questionSample'), { target: { value: 'q-2' } });
    expect(await screen.findByText('admin.rubrics.try.changeQuestion.title')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.cancel' }));
    await waitFor(() => expect(screen.queryByText('admin.rubrics.try.changeQuestion.title')).not.toBeInTheDocument());
    expect(screen.getByLabelText('admin.rubrics.preview.questionSample')).toHaveValue('q-1');
    expect(screen.getByLabelText('admin.rubrics.try.mode.paste')).toHaveValue('Bài đang gõ dở.');
  });

  it('mặc định mở tab Mốc điểm (panel tự thử KHÔNG hiện); nút ở đầu trang nhảy sang tab tự thử; ?tab=try mở thẳng tab thử', async () => {
    mockHappyPath();
    const { unmount } = renderPage();
    await screen.findByText(/Không trả lời hoặc lạc đề/);
    expect(screen.queryByRole('region', { name: 'admin.rubrics.try.title' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'admin.rubrics.tab.levels' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('button', { name: /admin\.rubrics\.tab\.try/ }));   // nút header (kèm icon)
    expect(await screen.findByRole('region', { name: 'admin.rubrics.try.title' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'admin.rubrics.tab.try' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText(/Không trả lời hoặc lạc đề/)).not.toBeInTheDocument();          // bảng mốc ẩn khi ở tab thử
    // Ở tab thử nút header không lặp lại chính nó — chỉ còn tab để quay về.
    expect(screen.queryByRole('button', { name: /admin\.rubrics\.tab\.try/ })).not.toBeInTheDocument();
    unmount();
    renderPage(['/admin/rubrics?tab=try']);
    expect(await screen.findByRole('region', { name: 'admin.rubrics.try.title' })).toBeInTheDocument();
  });
});
