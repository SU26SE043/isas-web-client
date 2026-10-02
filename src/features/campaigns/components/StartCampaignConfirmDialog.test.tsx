/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { campaignsTranslations } from '../languages/translations';

/** Chữ thật (vi) để so khớp TUYỆT ĐỐI từng dòng luật trong hộp thoại. */
const VI = campaignsTranslations.vi as Record<string, string>;
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => VI[key] ?? key }),
}));

const { StartCampaignConfirmDialog } = await import('./StartCampaignConfirmDialog');

afterEach(() => cleanup());

type Props = Partial<Parameters<typeof StartCampaignConfirmDialog>[0]>;

function renderDialog(props: Props = {}) {
  render(<StartCampaignConfirmDialog open onOpenChange={() => undefined} onConfirm={() => undefined} {...props} />);
  return screen.getByRole('dialog');
}

function ruleLines(dialog: HTMLElement) {
  const list = within(dialog).queryByTestId('start-confirm-rules');
  return list ? within(list).getAllByRole('listitem').map((item) => item.textContent) : [];
}

const RESUME = 'Thoát giữa chừng vẫn quay lại được trong thời gian còn lại; hết giờ là bài tự nộp.';

describe('StartCampaignConfirmDialog — ATT1-F3', () => {
  it('field vắng (Backend cũ) ⇒ y như hôm nay: không có dòng luật, nút "Bắt đầu"', () => {
    const dialog = renderDialog();
    expect(within(dialog).queryByTestId('start-confirm-rules')).toBeNull();
    expect(within(dialog).getByRole('button', { name: VI['campaigns.detail.startConfirm'] })).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: VI['campaigns.detail.confirm.goToPrepare'] })).toBeNull();
    expect(dialog).toHaveTextContent(VI['campaigns.detail.startConfirmBody']);
  });

  it('lần đầu: thời lượng + "Bạn có N lượt" + luật đồng hồ; KHÔNG có dòng lượt n/N', () => {
    const dialog = renderDialog({ timeLimitMinutes: 45, maxAttempts: 3 });
    expect(ruleLines(dialog)).toEqual([
      'Bài thi 45 phút, tính từ lúc vào phòng.',
      `Bạn có 3 lượt. ${RESUME}`,
    ]);
    expect(within(dialog).getByRole('button', { name: 'Vào bước chuẩn bị' })).toBeInTheDocument();
  });

  it('làm lại: thêm dòng "Đây là lượt n/N — bộ câu khác"', () => {
    const dialog = renderDialog({ timeLimitMinutes: 20, maxAttempts: 3, retryAttemptNo: 2 });
    expect(ruleLines(dialog)).toEqual([
      'Bài thi 20 phút, tính từ lúc vào phòng.',
      `Bạn có 3 lượt. ${RESUME}`,
      'Đây là lượt 2/3 — bộ câu khác.',
    ]);
  });

  it('chiến dịch không đặt thời lượng (null) ⇒ không có dòng thời lượng lẫn luật hết giờ', () => {
    const dialog = renderDialog({ timeLimitMinutes: null, maxAttempts: 1 });
    expect(ruleLines(dialog)).toEqual(['Bạn có 1 lượt.']);
  });

  it('lỗi start hiện trong hộp thoại', () => {
    const dialog = renderDialog({ maxAttempts: 1, errorMessage: 'Lỗi gì đó' });
    expect(within(dialog).getByRole('alert').textContent).toBe('Lỗi gì đó');
  });
});
