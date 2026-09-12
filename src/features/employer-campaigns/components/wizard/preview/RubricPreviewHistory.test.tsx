/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { goodRun } from '../../../mocks/rubricPreview.fixtures';
import { RubricPreviewHistory, runNumberOf } from './RubricPreviewHistory';

const messages: Record<string, string> = { 'employer.campaigns.rubricPreview.history.run': 'Lượt {{n}}' };
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
  it('liệt kê các lượt KHÁC lượt đang xem, nhóm theo câu hỏi, đánh số theo thời gian', () => {
    render(<RubricPreviewHistory runs={runs} latest={latest} viewingId="r4" onOpen={vi.fn()} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items.map((item) => within(item).getByText(/^Lượt \d$/).textContent)).toEqual(['Lượt 3', 'Lượt 1', 'Lượt 2']);
    expect(runNumberOf(runs, 'r1')).toBe(1);
    expect(runNumberOf(runs, 'r4')).toBe(4);
    expect(runNumberOf(runs, 'ghost')).toBe(0);
    expect(screen.getByText('Câu khác')).toBeInTheDocument();
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
