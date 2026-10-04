/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { goodRun, legacyAiOnlyRun, sample, score } from '../../../mocks/rubricPreview.fixtures';
import { formatRunTime } from './formatRunTime';
import { RubricPreviewResult } from './RubricPreviewResult';

const messages: Record<string, string> = {
  'employer.campaigns.rubricPreview.result.header': 'Lượt lúc {{date}} · thước đo v{{version}}',
  'employer.campaigns.rubricPreview.result.pass': 'Đạt (ngưỡng {{pct}}%)',
  'employer.campaigns.rubricPreview.result.fail': 'Chưa đạt (ngưỡng {{pct}}%)',
  'employer.campaigns.rubricPreview.result.level': 'mức {{level}}',
  'employer.campaigns.rubricPreview.result.answer': 'Câu trả lời đã chấm ({{n}} từ)',
  'employer.campaigns.rubricPreview.result.failed': 'Lỗi: {{reason}}',
};
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => messages[key] ?? key, language: 'vi' }) }));

afterEach(cleanup);

/** Bài người dùng 62%, hai tiêu chí khác điểm/mức/lý do — để mọi hoán đổi cột đều lộ. */
function myRun(actual = 62, overrides = {}) {
  return goodRun({
    samples: [sample('Custom', 0, actual, [
      { ...score('c-depth', 'Chiều sâu kỹ thuật', 0, 2, 'Thiếu ví dụ cụ thể về idempotency'), levelMatched: 2 },
      { ...score('c-comm', 'Giao tiếp', 0, 4, 'Trình bày mạch lạc'), levelMatched: 4 },
    ])],
    ...overrides,
  });
}

describe('RubricPreviewResult — chỉ chấm câu trả lời người dùng (2026-10-03)', () => {
  it('một con số cho bài của bạn + từng tiêu chí đúng điểm/mức/lý do; không còn Yếu/Khá/Xuất sắc', () => {
    render(<RubricPreviewResult run={myRun()} passScorePct={null} />);
    expect(screen.getByTestId('preview-score')).toHaveTextContent(/^62\s*\/ 100$/);
    const depth = screen.getByText('Chiều sâu kỹ thuật').closest('li') as HTMLElement;
    expect(within(depth).getByText('mức 2')).toBeInTheDocument();
    expect(depth.querySelector('[data-role="score"]')).toHaveTextContent(/^2\/5$/);
    expect(within(depth).getAllByText('Thiếu ví dụ cụ thể về idempotency').length).toBeGreaterThan(0);
    const comm = screen.getByText('Giao tiếp').closest('li') as HTMLElement;
    expect(comm.querySelector('[data-role="score"]')).toHaveTextContent(/^4\/5$/);
    expect(within(comm).getByText('mức 4')).toBeInTheDocument();
    expect(screen.queryByText(/Yếu|Khá|Xuất sắc/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('preview-pass')).not.toBeInTheDocument();   // không có ngưỡng ⇒ không kết luận
  });

  it('header gọi lượt bằng GIỜ (có giây) + phiên bản thước đo, không có số "Lượt N"', () => {
    const run = myRun(62, { createdAt: '2026-10-03T07:05:09Z', rubricVersion: 12 });
    render(<RubricPreviewResult run={run} passScorePct={null} />);
    const header = `Lượt lúc ${formatRunTime('2026-10-03T07:05:09Z', 'vi')} · thước đo v12`;
    expect(screen.getByText(header)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: header })).toBeInTheDocument();
    expect(header).toMatch(/:09\b/);   // giây — múi giờ nào cũng không đổi số giây
  });

  it('Đạt/Chưa đạt theo ngưỡng chiến dịch: bằng ngưỡng là Đạt, dưới ngưỡng là Chưa đạt', () => {
    const { rerender } = render(<RubricPreviewResult run={myRun(50)} passScorePct={50} />);
    expect(screen.getByTestId('preview-pass')).toHaveTextContent('Đạt (ngưỡng 50%)');
    rerender(<RubricPreviewResult run={myRun(49.5)} passScorePct={50} />);
    expect(screen.getByTestId('preview-pass')).toHaveTextContent('Chưa đạt (ngưỡng 50%)');
  });

  it('câu trả lời đã chấm xem lại được; lượt trả phí có nhãn', () => {
    render(<RubricPreviewResult run={myRun(62, { billed: true })} passScorePct={null} />);
    expect(screen.getByText('Câu trả lời đã chấm (210 từ)')).toBeInTheDocument();
    expect(screen.getByText('Bài Custom — nội dung trả lời mẫu.')).toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.rubricPreview.warn.billed')).toBeInTheDocument();
  });

  it('lượt CŨ chỉ có 3 bài AI ⇒ nói rõ là lượt cũ, không vẽ điểm', () => {
    render(<RubricPreviewResult run={legacyAiOnlyRun()} passScorePct={50} />);
    expect(screen.getByTestId('preview-legacy')).toHaveTextContent('employer.campaigns.rubricPreview.result.legacyAiOnly');
    expect(screen.queryByTestId('preview-score')).not.toBeInTheDocument();
  });

  it('lượt Failed ⇒ báo lỗi kèm lý do, không có điểm', () => {
    render(<RubricPreviewResult run={myRun(62, { status: 'Failed', errorReason: 'AI hết giờ' })} passScorePct={null} />);
    expect(screen.getByText('Lỗi: AI hết giờ')).toBeInTheDocument();
    expect(screen.queryByTestId('preview-score')).not.toBeInTheDocument();
  });

  it('nút sửa mốc và quay về lượt mới nhất gọi đúng callback', () => {
    const onEditLevels = vi.fn();
    const onBackToLatest = vi.fn();
    render(<RubricPreviewResult run={myRun()} passScorePct={null} onEditLevels={onEditLevels} onBackToLatest={onBackToLatest} />);
    fireEvent.click(screen.getByText('employer.campaigns.rubricPreview.editLevels'));
    fireEvent.click(screen.getByText('employer.campaigns.rubricPreview.result.backToLatest'));
    expect(onEditLevels).toHaveBeenCalledTimes(1);
    expect(onBackToLatest).toHaveBeenCalledTimes(1);
  });
});
