// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ResultDetailHeader } from './ResultDetailHeader';
import type { CampaignResultItem } from '../../../types/campaign.api.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));

afterEach(() => cleanup());

function makeItem(flags: CampaignResultItem['flags']): CampaignResultItem {
  return {
    rank: 1, candidateId: 'cand-1', sessionId: 's1', fullName: 'Nguyễn Văn A', email: 'a@example.com',
    totalScore: 60, aiScore: 60, result: 'Pass', scoredAt: '2026-09-15T08:00:00Z', flags,
  } as CampaignResultItem;
}

const headerProps = { campaignName: 'Chiến dịch X', total: 3, questions: [], previous: null, next: null, onNavigate: () => undefined };

/** KHE NỐI header → nút giám sát: mutation "gỡ <ProctoringFlagsButton/> khỏi header" từng XANH vì
 *  component nút có test riêng nhưng không test nào kiểm nó thật sự được GẮN vào đầu trang. */
describe('ResultDetailHeader — cờ giám sát nằm ở ĐẦU trang', () => {
  it('buổi có cờ → header có nút "Vi phạm giám sát", bấm mở popup danh sách cờ', async () => {
    const user = userEvent.setup();
    render(<ResultDetailHeader {...headerProps} item={makeItem([{ type: 'tab_switch', count: 2, source: 'Client' }, { type: 'face_mismatch', count: 1, source: 'Client' }])} />);
    const btn = screen.getByRole('button', { name: /proctoringButton/ });
    await user.click(btn);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('employer.campaigns.results.flags.type.face_mismatch: 1');
  });

  it('buổi 0 cờ → badge "không ghi nhận", không có nút giám sát', () => {
    render(<ResultDetailHeader {...headerProps} item={makeItem([])} />);
    expect(screen.getByText('employer.campaigns.results.detail.proctoringNone')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /proctoringButton/ })).not.toBeInTheDocument();
  });
});
