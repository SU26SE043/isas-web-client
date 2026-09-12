/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { brokenRun, goodRun, narrowRun, positiveBiasRun, sample } from '../../../mocks/rubricPreview.fixtures';
import { formatDelta, RubricPreviewResult } from './RubricPreviewResult';

const messages: Record<string, string> = {
  'employer.campaigns.rubricPreview.result.header': 'Lượt {{n}} · thước đo v{{version}} · {{date}}',
  'employer.campaigns.rubricPreview.verdict.discriminates': 'Thứ tự đúng · biên độ {{range}} điểm',
  'employer.campaigns.rubricPreview.verdict.weak': 'Thứ tự KHÔNG giữ',
  'employer.campaigns.rubricPreview.verdict.inconclusive': 'Biên độ chỉ {{range}} điểm',
  'employer.campaigns.rubricPreview.threshold.failing': 'Với ngưỡng {{pct}}%, bài {{bands}} sẽ KHÔNG đạt',
  'employer.campaigns.rubricPreview.threshold.allPass': 'Với ngưỡng {{pct}}%, cả bài Yếu cũng đạt',
  'employer.campaigns.rubricPreview.band.Weak': 'Yếu',
  'employer.campaigns.rubricPreview.band.Good': 'Khá',
  'employer.campaigns.rubricPreview.band.Excellent': 'Xuất sắc',
  'employer.campaigns.rubricPreview.band.Custom': 'Của bạn',
  'employer.campaigns.rubricPreview.result.failed': 'Lỗi: {{reason}}',
};
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => messages[key] ?? key, language: 'vi' }) }));

afterEach(cleanup);

function bandCard(band: string) {
  const card = screen.getByTestId('preview-bands').querySelector(`[data-band="${band}"]`);
  if (!card) throw new Error(`missing band ${band}`);
  return card as HTMLElement;
}

describe('RubricPreviewResult — tầng 1', () => {
  it('hàng Kỳ vọng mang expectedWeightedPct, hàng Thật mang actualWeightedPct kèm Δ có dấu (fixture: kỳ vọng ≠ thật)', () => {
    render(<RubricPreviewResult run={goodRun()} runNumber={1} passScorePct={null} />);
    const weak = bandCard('Weak');
    expect(within(weak).getByText('Yếu')).toBeInTheDocument();
    expect(weak.querySelector('[data-role="expected"]')).toHaveTextContent('20%');
    expect(weak.querySelector('[data-role="actual"]')).toHaveTextContent('18%');
    expect(weak.querySelector('[data-role="actual"]')).toHaveTextContent('(−2)');
    const excellent = bandCard('Excellent');
    expect(excellent.querySelector('[data-role="expected"]')).toHaveTextContent('100%');
    expect(excellent.querySelector('[data-role="actual"]')).toHaveTextContent('88%');
    expect(excellent.querySelector('[data-role="actual"]')).toHaveTextContent('(−12)');
    expect(bandCard('Good').querySelector('[data-role="actual"]')).toHaveTextContent('(+2)');
  });

  it('header có số lượt + version; bài Custom: cột thứ 4, Kỳ vọng là "—", không Δ', () => {
    const run = goodRun({ rubricVersion: 2, samples: [...goodRun().samples, sample('Custom', 0, 55)] });
    render(<RubricPreviewResult run={run} runNumber={3} passScorePct={null} />);
    expect(screen.getByText(/Lượt 3 · thước đo v2 ·/)).toBeInTheDocument();
    const custom = bandCard('Custom');
    expect(custom.querySelector('[data-role="expected"]')).toHaveTextContent('—');
    expect(custom.querySelector('[data-role="actual"]')).toHaveTextContent('55%');
    expect(custom.querySelector('[data-role="actual"]')).not.toHaveTextContent('(');
    expect(screen.getByTestId('preview-bands').querySelectorAll('[data-band]')).toHaveLength(4);
  });

  it('kết luận: discriminates (success) · weak (error) · inconclusive (warning)', () => {
    const { unmount } = render(<RubricPreviewResult run={goodRun()} runNumber={1} passScorePct={null} />);
    expect(screen.getByTestId('preview-verdict')).toHaveTextContent('Thứ tự đúng · biên độ 70 điểm');
    expect(screen.getByTestId('preview-verdict')).toHaveClass('text-success');
    unmount();
    const { unmount: unmount2 } = render(<RubricPreviewResult run={brokenRun()} runNumber={1} passScorePct={null} />);
    expect(screen.getByTestId('preview-verdict')).toHaveTextContent('Thứ tự KHÔNG giữ');
    expect(screen.getByTestId('preview-verdict')).toHaveClass('text-error');
    unmount2();
    render(<RubricPreviewResult run={narrowRun()} runNumber={1} passScorePct={null} />);
    expect(screen.getByTestId('preview-verdict')).toHaveTextContent('Biên độ chỉ 12 điểm');
    expect(screen.getByTestId('preview-verdict')).toHaveClass('text-warning');
  });

  it('bias: câu tự khen chỉ hiện khi cả 3 bài lệch dương', () => {
    const { unmount } = render(<RubricPreviewResult run={positiveBiasRun()} runNumber={1} passScorePct={null} />);
    expect(screen.getByText('employer.campaigns.rubricPreview.bias.positive')).toBeInTheDocument();
    unmount();
    render(<RubricPreviewResult run={goodRun()} runNumber={1} passScorePct={null} />);
    expect(screen.queryByText('employer.campaigns.rubricPreview.bias.positive')).not.toBeInTheDocument();
  });

  it('chồng ngưỡng Đạt: liệt kê bài KHÔNG đạt; ngưỡng thấp ⇒ nhắc cả Yếu cũng đạt; không ngưỡng ⇒ im', () => {
    const { unmount } = render(<RubricPreviewResult run={goodRun()} runNumber={1} passScorePct={70} />);
    expect(screen.getByText('Với ngưỡng 70%, bài Yếu · Khá sẽ KHÔNG đạt')).toBeInTheDocument();
    unmount();
    const { unmount: unmount2 } = render(<RubricPreviewResult run={goodRun()} runNumber={1} passScorePct={10} />);
    expect(screen.getByText('Với ngưỡng 10%, cả bài Yếu cũng đạt')).toBeInTheDocument();
    unmount2();
    render(<RubricPreviewResult run={goodRun()} runNumber={1} passScorePct={null} />);
    expect(screen.queryByText(/Với ngưỡng/)).not.toBeInTheDocument();
    expect(screen.getByText('employer.campaigns.rubricPreview.result.footnote')).toBeInTheDocument();
  });

  it('ba cảnh báo cố định: văn bản (deliveryMetricsAvailable=false) · độ dài · đã trừ credit', () => {
    const { unmount } = render(<RubricPreviewResult run={goodRun({ lengthParityWarning: true, billed: true })} runNumber={1} passScorePct={null} />);
    const warnings = screen.getByTestId('preview-warnings');
    expect(within(warnings).getByText('employer.campaigns.rubricPreview.warn.textOnly')).toBeInTheDocument();
    expect(within(warnings).getByText('employer.campaigns.rubricPreview.warn.lengthParity')).toBeInTheDocument();
    expect(within(warnings).getByText('employer.campaigns.rubricPreview.warn.billed')).toBeInTheDocument();
    unmount();
    render(<RubricPreviewResult run={goodRun({ deliveryMetricsAvailable: true })} runNumber={1} passScorePct={null} />);
    expect(screen.queryByText('employer.campaigns.rubricPreview.warn.textOnly')).not.toBeInTheDocument();
    expect(screen.queryByText('employer.campaigns.rubricPreview.warn.lengthParity')).not.toBeInTheDocument();
    expect(screen.queryByText('employer.campaigns.rubricPreview.warn.billed')).not.toBeInTheDocument();
  });

  it('nút Chấm lại / Sửa mốc / Về lượt mới nhất gọi đúng callback; thiếu callback thì không hiện', () => {
    const onRerun = vi.fn();
    const onEditLevels = vi.fn();
    const onBackToLatest = vi.fn();
    const { unmount } = render(<RubricPreviewResult run={goodRun()} runNumber={1} passScorePct={null} onRerun={onRerun} onEditLevels={onEditLevels} onBackToLatest={onBackToLatest} />);
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.rerun' }));
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.editLevels' }));
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.result.backToLatest' }));
    expect(onRerun).toHaveBeenCalledOnce();
    expect(onEditLevels).toHaveBeenCalledOnce();
    expect(onBackToLatest).toHaveBeenCalledOnce();
    unmount();
    render(<RubricPreviewResult run={goodRun()} runNumber={1} passScorePct={null} />);
    expect(screen.queryByRole('button', { name: 'employer.campaigns.rubricPreview.editLevels' })).not.toBeInTheDocument();
    expect(screen.queryByText('employer.campaigns.rubricPreview.result.viewingOld')).not.toBeInTheDocument();
  });

  it('tầng 2 đóng mặc định, mở ra bảng tiêu chí × bài', () => {
    render(<RubricPreviewResult run={goodRun()} runNumber={1} passScorePct={null} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.details.show' }));
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.details.hide' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('lượt Failed: hiện lý do lỗi, không hiện bảng band', () => {
    render(<RubricPreviewResult run={goodRun({ status: 'Failed', errorReason: 'AI trả JSON hỏng', samples: [] })} runNumber={1} passScorePct={null} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Lỗi: AI trả JSON hỏng');
    expect(screen.queryByTestId('preview-bands')).not.toBeInTheDocument();
  });

  it('formatDelta có dấu, làm tròn 1 chữ số', () => {
    expect(formatDelta(2)).toBe('+2');
    expect(formatDelta(-12.04)).toBe('−12');
    expect(formatDelta(0.04)).toBe('0');
    expect(formatDelta(1.25)).toBe('+1.3');
  });
});
