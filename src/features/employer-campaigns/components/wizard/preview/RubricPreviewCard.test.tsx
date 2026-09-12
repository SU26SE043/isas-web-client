/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { brokenRun, goodRun, inertPreview, narrowRun, previewQuestions, rubricMissingLevels, rubricWithLevels } from '../../../mocks/rubricPreview.fixtures';
import { RubricPreviewCard } from './RubricPreviewCard';

const messages: Record<string, string> = {
  'employer.campaigns.rubricPreview.blocked.missingLevels': 'Thiếu mốc điểm ở: {{criteria}}.',
  'employer.campaigns.rubricPreview.quota.free': 'Còn {{n}} lượt miễn phí',
  'employer.campaigns.rubricPreview.result.header': 'Lượt {{n}} · thước đo v{{version}} · {{date}}',
  'employer.campaigns.rubricPreview.compact.verified': 'Đã chấm thử · v{{version}} · {{verdict}}',
  'employer.campaigns.rubricPreview.verdict.discriminates': 'phân biệt được ({{range}})',
  'employer.campaigns.rubricPreview.runPaid': '{{label}} · −1 credit',
};
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => messages[key] ?? key, language: 'vi' }) }));

afterEach(cleanup);

const base = {
  campaignId: 'cmp-1',
  campaignStatus: 'draft' as const,
  rubric: rubricWithLevels,
  questions: previewQuestions,
  passScorePct: null,
};

describe('RubricPreviewCard — trạng thái bị chặn', () => {
  it('thiếu mốc: mô tả VẪN hiện + lý do là dòng riêng (nêu đúng tên tiêu chí), nút disabled, có nút Về sửa mốc; KHÔNG toast chung', () => {
    const onGoToCriteria = vi.fn();
    render(<RubricPreviewCard {...base} preview={inertPreview()} rubric={rubricMissingLevels} onGoToCriteria={onGoToCriteria} />);

    // Designer review H8: lần đầu gặp HR phải biết tính năng làm gì — lý do chặn KHÔNG được thay thế mô tả.
    const description = screen.getByTestId('preview-description');
    expect(description).toHaveTextContent('Thiếu mốc điểm ở: Giao tiếp.');
    expect(description).toHaveTextContent('employer.campaigns.rubricPreview.description');
    expect(screen.getByRole('button', { name: /rubricPreview\.run$/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.goToCriteria' }));
    expect(onGoToCriteria).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('preview-quota')).not.toBeInTheDocument();
  });

  it('chưa có campaign: lý do noCampaign thắng thiếu mốc lẫn thiếu câu hỏi', () => {
    render(<RubricPreviewCard {...base} preview={inertPreview()} campaignId={null} rubric={rubricMissingLevels} questions={[]} />);
    expect(screen.getByTestId('preview-description')).toHaveTextContent('employer.campaigns.rubricPreview.blocked.noCampaign');
    expect(screen.getByRole('button', { name: /rubricPreview\.run$/ })).toBeDisabled();
  });

  it('chưa có campaign NHƯNG có onBeforeRun (wizard tạo mới): nút "Lưu & chấm thử" bấm được', () => {
    render(<RubricPreviewCard {...base} preview={inertPreview()} campaignId={null} onBeforeRun={vi.fn(async () => 'c-new')} />);
    expect(screen.getByRole('button', { name: /rubricPreview\.runSave$/ })).toBeEnabled();
  });

  it('chưa có câu hỏi: lý do + link sang bước câu hỏi', () => {
    const onGoToQuestions = vi.fn();
    render(<RubricPreviewCard {...base} preview={inertPreview()} questions={[]} onGoToQuestions={onGoToQuestions} />);
    expect(screen.getByTestId('preview-description')).toHaveTextContent('employer.campaigns.rubricPreview.blocked.noQuestions');
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.goToQuestions' }));
    expect(onGoToQuestions).toHaveBeenCalledOnce();
  });

  it('campaign đã đóng: lý do closed', () => {
    render(<RubricPreviewCard {...base} preview={inertPreview()} campaignStatus="archived" />);
    expect(screen.getByTestId('preview-description')).toHaveTextContent('employer.campaigns.rubricPreview.blocked.closed');
  });
});

describe('RubricPreviewCard — sẵn sàng / đang chạy / kết quả', () => {
  it('chưa lượt nào: chip quota vẫn hiện "còn 3" (BE chỉ trả quota kèm lượt) — HR biết trước giá', () => {
    render(<RubricPreviewCard {...base} preview={inertPreview()} />);
    expect(screen.getByTestId('preview-quota')).toHaveTextContent('Còn 3 lượt miễn phí');
  });

  it('sẵn sàng: mô tả + chip quota + select câu hỏi + nút "Chấm thử" (không có bước lưu)', () => {
    render(<RubricPreviewCard {...base} preview={inertPreview({ freeRunsRemaining: 2 })} />);
    expect(screen.getByTestId('preview-description')).toHaveTextContent('employer.campaigns.rubricPreview.description');
    expect(screen.getByTestId('preview-quota')).toHaveTextContent('Còn 2 lượt miễn phí');
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.run' })).toBeEnabled();
  });

  it('có bước lưu (wizard) ⇒ nút "Lưu & chấm thử"; hết lượt miễn phí ⇒ nút mang giá "−1 credit" + chip trả phí + dòng credit ứng viên + gợi ý reset', () => {
    render(<RubricPreviewCard {...base} preview={inertPreview({ freeRunsRemaining: 0 })} onBeforeRun={async () => 'cmp-1'} />);
    // R1 designer review: hết lượt ⇒ giá phải đứng NGAY TRÊN nút, không chỉ ở chip góc phải.
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.runSave · −1 credit' })).toBeEnabled();
    expect(screen.getByTestId('preview-quota')).toHaveTextContent('employer.campaigns.rubricPreview.quota.paid');
    expect(screen.getByText('employer.campaigns.rubricPreview.quota.paidHint')).toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.rubricPreview.quota.resetHint')).toBeInTheDocument();
  });

  it('còn lượt miễn phí ⇒ nút KHÔNG mang giá, KHÔNG có gợi ý reset', () => {
    render(<RubricPreviewCard {...base} preview={inertPreview({ freeRunsRemaining: 2 })} onBeforeRun={async () => 'cmp-1'} />);
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.runSave' })).toBeEnabled();
    expect(screen.queryByText('employer.campaigns.rubricPreview.quota.resetHint')).not.toBeInTheDocument();
  });

  it('bấm chạy gọi preview.run với câu bắt buộc đầu tiên', async () => {
    const run = vi.fn().mockResolvedValue(goodRun());
    render(<RubricPreviewCard {...base} preview={inertPreview({ run })} />);
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.run' }));
    await waitFor(() => expect(run).toHaveBeenCalledWith({ questionId: 'q-2', customAnswer: null }));
  });

  it('đang chạy: role=status + form VẪN mount nhưng khoá (unmount là mất bài đối chứng HR vừa dán nếu AI lỗi)', () => {
    render(<RubricPreviewCard {...base} preview={inertPreview({ isRunning: true })} />);
    expect(screen.getByRole('status')).toHaveTextContent('employer.campaigns.rubricPreview.running');
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.running' })).toBeDisabled();
  });

  it('có lượt mới nhất: hiện kết quả, form ẩn tới khi bấm Chấm lại', () => {
    const latest = goodRun();
    render(<RubricPreviewCard {...base} preview={inertPreview({ runs: [latest], latest })} />);
    expect(screen.getByText(/Lượt 1 · thước đo v1/)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.rerun' }));
    expect(screen.getByRole('combobox')).toHaveValue('q-1');
  });

  it('mở lượt cũ từ lịch sử rồi quay về lượt mới nhất', () => {
    const older = goodRun({ id: 'run-old', rubricVersion: 1, rubricFingerprint: 'fp-old', createdAt: '2026-09-11T08:00:00Z' });
    const latest = goodRun({ id: 'run-new', rubricVersion: 2, rubricFingerprint: 'fp-new', createdAt: '2026-09-12T08:00:00Z' });
    render(<RubricPreviewCard {...base} preview={inertPreview({ runs: [latest, older], latest })} />);
    expect(screen.getByText(/Lượt 2 · thước đo v2/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.history.open' }));
    expect(screen.getByText(/Lượt 1 · thước đo v1/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.result.backToLatest' }));
    expect(screen.getByText(/Lượt 2 · thước đo v2/)).toBeInTheDocument();
  });

  it('lỗi từ hook: dòng chính là câu HÀNH ĐỘNG theo mã lỗi, nguyên văn BE là dòng phụ; nút bỏ qua gọi clearError', () => {
    const clearError = vi.fn();
    render(<RubricPreviewCard {...base} preview={inertPreview({ error: { code: 'noCredit', message: 'Ví tổ chức hết credit' }, clearError })} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('employer.campaigns.rubricPreview.error.noCredit');
    expect(alert).toHaveTextContent('Ví tổ chức hết credit');
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.error.dismiss' }));
    expect(clearError).toHaveBeenCalledOnce();
  });

  // Ca thật gặp trên dev: BE trả 502 "AIService /score-preview trả 502" — HR không biết phải làm gì với dòng đó.
  it('502 aiFailed: câu hành động đứng TRƯỚC chi tiết kỹ thuật, không in trần nguyên văn làm dòng chính', () => {
    render(<RubricPreviewCard {...base} preview={inertPreview({ error: { code: 'aiFailed', message: 'AIService /score-preview trả 502' } })} />);
    const alert = screen.getByRole('alert');
    expect(alert.textContent?.indexOf('employer.campaigns.rubricPreview.error.aiFailed')).toBeLessThan(alert.textContent?.indexOf('/score-preview') ?? -1);
  });
});

describe('RubricPreviewCard — compact (bước 8)', () => {
  it('chưa chạy: dòng "chưa chấm thử" + nút; bị chặn: dòng là LÝ DO', () => {
    const { unmount } = render(<RubricPreviewCard {...base} variant="compact" preview={inertPreview()} />);
    expect(screen.getByTestId('preview-compact-status')).toHaveTextContent('employer.campaigns.rubricPreview.compact.none');
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.run' })).toBeEnabled();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    unmount();

    render(<RubricPreviewCard {...base} variant="compact" preview={inertPreview()} rubric={rubricMissingLevels} />);
    expect(screen.getByTestId('preview-compact-status')).toHaveTextContent('Thiếu mốc điểm ở: Giao tiếp.');
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.run' })).toBeDisabled();
  });

  it('đã có lượt Succeeded: dòng trạng thái mang version + kết luận; KHÔNG cảnh báo mềm', () => {
    const latest = goodRun({ rubricVersion: 3 });
    render(<RubricPreviewCard {...base} variant="compact" preview={inertPreview({ runs: [latest], latest })} />);
    expect(screen.getByTestId('preview-compact-status')).toHaveTextContent('Đã chấm thử · v3 · phân biệt được (70)');
    expect(screen.queryByTestId('preview-soft-warning')).not.toBeInTheDocument();
  });

  // Bước 8 là màn cuối trước Phát hành: kết luận "chưa tách được 3 mức" mà in màu xám thì HR lướt qua.
  it('dòng trạng thái mang màu theo kết luận: tách được ⇒ success; chưa tách/thứ tự sai ⇒ warning; bị chặn ⇒ warning', () => {
    const good = goodRun();
    const { unmount } = render(<RubricPreviewCard {...base} variant="compact" preview={inertPreview({ runs: [good], latest: good })} />);
    expect(screen.getByTestId('preview-compact-status')).toHaveClass('text-success');
    unmount();

    const narrow = narrowRun();
    const { unmount: unmount2 } = render(<RubricPreviewCard {...base} variant="compact" preview={inertPreview({ runs: [narrow], latest: narrow })} />);
    expect(screen.getByTestId('preview-compact-status')).toHaveClass('text-warning');
    unmount2();

    render(<RubricPreviewCard {...base} variant="compact" preview={inertPreview()} rubric={rubricMissingLevels} />);
    expect(screen.getByTestId('preview-compact-status')).toHaveClass('text-warning');
  });

  it('H11: kết luận xấu ⇒ thứ tự sai tô error + có link "Sửa mốc ở bước 3"; kết luận tốt ⇒ không link', () => {
    const onGoToCriteria = vi.fn();
    const broken = brokenRun();
    const { unmount } = render(<RubricPreviewCard {...base} variant="compact" preview={inertPreview({ runs: [broken], latest: broken })} onGoToCriteria={onGoToCriteria} />);
    expect(screen.getByTestId('preview-compact-status')).toHaveClass('text-error');
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.compact.editLevels' }));
    expect(onGoToCriteria).toHaveBeenCalledOnce();
    unmount();
    const good = goodRun();
    render(<RubricPreviewCard {...base} variant="compact" preview={inertPreview({ runs: [good], latest: good })} onGoToCriteria={onGoToCriteria} />);
    expect(screen.queryByRole('button', { name: 'employer.campaigns.rubricPreview.compact.editLevels' })).not.toBeInTheDocument();
  });

  it('cảnh báo MỀM khi thước đo có mốc mà 0 lượt Succeeded ở bản hiện tại — không chặn gì', () => {
    const { unmount } = render(<RubricPreviewCard {...base} variant="compact" preview={inertPreview()} />);
    expect(screen.getByTestId('preview-soft-warning')).toHaveTextContent('employer.campaigns.rubricPreview.softWarning');
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.run' })).toBeEnabled();
    unmount();

    // Lượt cũ ở v1, bản hiện tại là v2 (truyền tường minh) ⇒ vẫn cảnh báo.
    const stale = goodRun({ rubricVersion: 1 });
    const { unmount: unmount2 } = render(<RubricPreviewCard {...base} variant="compact" currentRubricVersion={2} preview={inertPreview({ runs: [stale], latest: stale })} />);
    expect(screen.getByTestId('preview-soft-warning')).toBeInTheDocument();
    unmount2();

    // Thiếu mốc ⇒ đã có lý do chặn, không chồng thêm cảnh báo mềm.
    render(<RubricPreviewCard {...base} variant="compact" preview={inertPreview()} rubric={rubricMissingLevels} />);
    expect(screen.queryByTestId('preview-soft-warning')).not.toBeInTheDocument();
  });
});
