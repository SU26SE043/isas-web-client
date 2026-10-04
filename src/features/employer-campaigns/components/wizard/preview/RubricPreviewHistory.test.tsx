/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { goodRun, legacyAiOnlyRun, sample } from '../../../mocks/rubricPreview.fixtures';
import { formatRunTime } from './formatRunTime';
import { RubricPreviewHistory } from './RubricPreviewHistory';

const messages: Record<string, string> = {
  'employer.campaigns.rubricPreview.history.score': 'Bài của bạn {{pct}}%',
  'employer.campaigns.rubricPreview.history.legacy': 'Lượt cũ (3 bài mẫu AI)',
};
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => messages[key] ?? key, language: 'vi' }) }));

afterEach(cleanup);

// GET trả mới-nhất-trước.
const latest = goodRun({ id: 'r4', rubricFingerprint: 'fp-b', promptVersion: 8, questionId: 'q-1', createdAt: '2026-09-12T10:00:00Z' });
const runs = [
  latest,
  goodRun({ id: 'r3', rubricFingerprint: 'fp-b', promptVersion: 7, questionId: 'q-1', createdAt: '2026-09-12T09:00:00Z' }),
  goodRun({ id: 'r2', rubricFingerprint: 'fp-a', promptVersion: 8, questionId: 'q-2', questionText: 'Câu khác', createdAt: '2026-09-12T08:00:00Z', status: 'Failed', samples: [] }),
  goodRun({ id: 'r1', rubricFingerprint: 'fp-a', promptVersion: 7, questionId: 'q-1', createdAt: '2026-09-12T07:00:00Z' }),
];

describe('RubricPreviewHistory', () => {
  it('liệt kê các lượt KHÁC lượt đang xem, nhóm theo câu hỏi, mỗi lượt gắn nhãn bằng GIỜ của chính nó', () => {
    render(<RubricPreviewHistory runs={runs} latest={latest} viewingId="r4" onOpen={vi.fn()} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    const times = items.map((item) => item.querySelector('time'));
    expect(times.map((node) => node?.getAttribute('datetime'))).toEqual(['2026-09-12T09:00:00Z', '2026-09-12T07:00:00Z', '2026-09-12T08:00:00Z']);
    expect(times.map((node) => node?.textContent)).toEqual(['r3', 'r1', 'r2'].map((id) => formatRunTime(runs.find((r) => r.id === id)!.createdAt, 'vi')));
    expect(screen.getByText('Câu khác')).toBeInTheDocument();
  });

  it('BE chỉ trả 20 lượt mới nhất ⇒ KHÔNG đánh số "Lượt N" (vị trí trong cửa sổ, kẹt ở 20); hai lượt cùng phút vẫn phân biệt nhờ giây', () => {
    // 25 lượt thật, GET trả 20 mới nhất (mới-nhất-trước) — cách 7 giây như một lượt chấm thật.
    const window = Array.from({ length: 20 }, (_, i) => goodRun({ id: `w${i}`, questionId: 'q-1', createdAt: new Date(Date.UTC(2026, 9, 3, 7, 5, 0) - i * 7000).toISOString() }));
    render(<RubricPreviewHistory runs={window} latest={window[0]} viewingId="w0" onOpen={vi.fn()} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(19);
    expect(document.body.textContent).not.toMatch(/Lượt \d+|Run \d+/);
    const labels = items.map((item) => item.querySelector('time')?.textContent);
    expect(new Set(labels).size).toBe(19);
    expect(labels[0]).toBe(formatRunTime(window[1].createdAt, 'vi'));
  });

  it('badge so với lượt mới nhất: cùng fingerprint khác prompt ⇒ promptChanged; khác fp cùng prompt ⇒ rubricChanged; khác cả hai ⇒ bothChanged', () => {
    render(<RubricPreviewHistory runs={runs} latest={latest} viewingId="r4" onOpen={vi.fn()} />);
    const badges = [...document.querySelectorAll('[data-comparability]')].map((node) => node.getAttribute('data-comparability'));
    expect(badges).toEqual(['promptChanged', 'bothChanged', 'rubricChanged']);
  });

  it('lượt cùng thước đo lẫn prompt ⇒ same; lượt Failed mang badge lỗi', () => {
    const same = goodRun({ id: 'r0', rubricFingerprint: 'fp-b', promptVersion: 8, createdAt: '2026-09-12T06:00:00Z' });
    render(<RubricPreviewHistory runs={[latest, same, runs[2]]} latest={latest} viewingId="r4" onOpen={vi.fn()} />);
    const items = screen.getAllByRole('listitem');
    expect(within(items[0]).getByText('employer.campaigns.rubricPreview.history.same')).toBeInTheDocument();
    expect(within(items[1]).getByText('employer.campaigns.rubricPreview.history.failed')).toBeInTheDocument();
  });

  it('mỗi dòng Succeeded in điểm BÀI CỦA BẠN (cùng thước đo mà điểm nhảy là nhiễu bộ chấm); lượt cũ chỉ có bài AI ghi rõ', () => {
    const mine = goodRun({ id: 'r9', createdAt: '2026-09-12T05:00:00Z', samples: [sample('Custom', 0, 55)] });
    const legacy = legacyAiOnlyRun({ id: 'r8', createdAt: '2026-09-12T04:00:00Z' });
    render(<RubricPreviewHistory runs={[latest, mine, legacy]} latest={latest} viewingId="r4" onOpen={vi.fn()} />);
    const scores = screen.getAllByTestId('history-scores');
    expect(scores[0]).toHaveTextContent('Bài của bạn 55%');
    expect(scores[1]).toHaveTextContent('Lượt cũ (3 bài mẫu AI)');
    expect(scores[1]).not.toHaveTextContent('62');
  });

  it('bấm Mở trả về id lượt; không còn lượt nào khác thì không render', () => {
    const onOpen = vi.fn();
    const { unmount } = render(<RubricPreviewHistory runs={runs} latest={latest} viewingId="r4" onOpen={onOpen} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'employer.campaigns.rubricPreview.history.open' })[0]);
    expect(onOpen).toHaveBeenCalledWith('r3');
    unmount();
    const { container } = render(<RubricPreviewHistory runs={[latest]} latest={latest} viewingId="r4" onOpen={onOpen} />);
    expect(container).toBeEmptyDOMElement();
  });
});
