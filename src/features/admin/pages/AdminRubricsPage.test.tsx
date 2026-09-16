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
    { id: 'c-1', name: 'Giao tiếp & trình bày', description: 'Rõ ràng.', weight: 0.15, maxScore: 5, scoringScope: 'Always', levels: [{ score: 0, descriptor: LONG('Không trả lời hoặc lạc đề') }, { score: 5, descriptor: LONG('Mạch lạc, có ví dụ') }] },
    { id: 'c-2', name: 'Chiều sâu kỹ thuật', description: null, weight: 0.25, maxScore: 5, scoringScope: 'WhenTargeted', levels: [] },
  ],
  sampleQuestions: [{ id: 'q-1', text: 'Giải thích index trong PostgreSQL.' }, { id: 'q-2', text: 'Transaction isolation là gì?' }],
};
const matrix: AdminRubricMatrixRow[] = [
  { jobCategory: 'BE', language: 'vi', version: 2, criteriaCount: 2, withLevelsCount: 1 },
  { jobCategory: 'FE', language: 'vi', version: 1, criteriaCount: 7, withLevelsCount: 7 },
];
const run: AdminRubricPreviewRun = {
  id: 'r-1', status: 'Succeeded', jobCategory: 'BE', language: 'vi', rubricVersion: 2, questionText: 'Giải thích index trong PostgreSQL.', rubricFingerprint: 'fp', promptVersion: null,
  deliveryMetricsAvailable: false, lengthParityWarning: false, freeRunsRemaining: 4,
  rubric: [{ criterionId: 'c-1', name: 'Giao tiếp & trình bày', weight: 0.15, maxScore: 5, levels: rubric.criteria[0].levels }],
  samples: [
    { band: 'Weak', answerText: 'bài yếu', wordCount: 20, expectedPct: 20, actualPct: 48.4, scores: [{ criterionId: 'c-1', criterionName: 'Giao tiếp & trình bày', maxScore: 5, expectedLevel: 1, actualScore: 2, levelMatched: 2, reasoning: 'ngắn' }] },
    { band: 'Good', answerText: 'bài khá', wordCount: 60, expectedPct: 60, actualPct: 66.4, scores: [{ criterionId: 'c-1', criterionName: 'Giao tiếp & trình bày', maxScore: 5, expectedLevel: 3, actualScore: 3, levelMatched: 3, reasoning: 'ổn' }] },
    { band: 'Excellent', answerText: 'bài xuất sắc', wordCount: 120, expectedPct: 100, actualPct: 70.2, scores: [{ criterionId: 'c-1', criterionName: 'Giao tiếp & trình bày', maxScore: 5, expectedLevel: 5, actualScore: 4, levelMatched: 4, reasoning: 'tốt' }] },
  ],
  errorReason: null, createdAt: '2026-09-16T09:00:00Z', completedAt: '2026-09-16T09:00:40Z',
};

function mockHappyPath() {
  vi.spyOn(adminRubricService, 'list').mockResolvedValue(matrix);
  vi.spyOn(adminRubricService, 'get').mockResolvedValue(rubric);
  vi.spyOn(adminRubricService, 'history').mockResolvedValue([{ version: 2, isActive: true, criteriaCount: 2, withLevelsCount: 1 }, { version: 1, isActive: false, criteriaCount: 2, withLevelsCount: 0 }]);
  vi.spyOn(adminRubricService, 'previewHistory').mockResolvedValue([]);
}
const renderPage = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><MemoryRouter><AdminRubricsPage /></MemoryRouter></QueryClientProvider>);
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminRubricsPage — hiện đúng dữ liệu BE', () => {
  it('bảng hiện descriptor THẬT của mốc và báo tiêu chí chưa có mốc; ma trận 3×2 có chip; tải với mã enum BE/vi', async () => {
    mockHappyPath();
    const getSpy = vi.mocked(adminRubricService.get);
    renderPage();
    expect(await screen.findByText(/Không trả lời hoặc lạc đề/)).toBeInTheDocument();
    expect(screen.getByText('admin.rubrics.levels.none')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'admin.rubrics.category.FE · admin.rubrics.lang.vi' })).toBeInTheDocument();
    expect(getSpy.mock.calls[0]).toEqual(['BE', 'vi']);
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
      ],
    });
    expect(JSON.stringify(body)).not.toMatch(/"name"|"weight"|"maxScore"|"scoringScope"/);
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

describe('AdminRubricsPage — chấm thử', () => {
  it('chặn chấm thử khi còn tiêu chí thiếu mốc và nêu TÊN tiêu chí (BE sẽ 400)', async () => {
    mockHappyPath();
    renderPage();
    expect(await screen.findByText('admin.rubrics.preview.needsLevels')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'admin.rubrics.preview.run' })).toBeDisabled();
  });

  it('gửi {sampleQuestionId} theo hợp đồng BE (không phải {criterionKey, answer}) và RENDER 3 bài mẫu sau khi chạy', async () => {
    const full: AdminRubricSet = { ...rubric, criteria: rubric.criteria.map((c) => (c.levels.length ? c : { ...c, levels: rubric.criteria[0].levels })) };
    vi.spyOn(adminRubricService, 'list').mockResolvedValue(matrix);
    vi.spyOn(adminRubricService, 'get').mockResolvedValue(full);
    vi.spyOn(adminRubricService, 'history').mockResolvedValue([]);
    vi.spyOn(adminRubricService, 'previewHistory').mockResolvedValue([]);
    const previewSpy = vi.spyOn(adminRubricService, 'preview').mockResolvedValue(run);
    renderPage();
    const runButton = await screen.findByRole('button', { name: 'admin.rubrics.preview.run' });
    fireEvent.change(screen.getByLabelText('admin.rubrics.preview.questionSample'), { target: { value: 'q-2' } });
    fireEvent.change(screen.getByLabelText('admin.rubrics.preview.customAnswer'), { target: { value: 'Bài tôi tự dán.' } });
    fireEvent.click(runButton);
    await waitFor(() => expect(previewSpy).toHaveBeenCalledTimes(1));
    expect(previewSpy.mock.calls[0]).toEqual(['BE', 'vi', { sampleQuestionId: 'q-2', customAnswer: 'Bài tôi tự dán.' }]);
    expect(JSON.stringify(previewSpy.mock.calls[0][2])).not.toMatch(/criterionKey|"answer"/);
    // Kết quả phải HIỆN: 3 dải Yếu/Khá/Xuất sắc của lượt vừa chạy.
    expect(await screen.findByText('employer.campaigns.rubricPreview.band.Weak')).toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.rubricPreview.band.Excellent')).toBeInTheDocument();
  });
});
