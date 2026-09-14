// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StartCampaignNowDialog } from './StartCampaignNowDialog';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    // Giữ placeholder `{{start}}` để test kiểm được hộp thoại NÊU giờ mở hiện tại.
    t: (key: string) => (key === 'employer.campaigns.detail.startNowConfirmDescription' ? `${key} {{start}}` : key),
  }),
}));

afterEach(cleanup);

const K = 'employer.campaigns.detail';

describe('StartCampaignNowDialog (T13 R2)', () => {
  it('xác nhận TRƯỚC khi gọi: bấm trigger chỉ mở hộp thoại nêu giờ mở hiện tại; bấm Xác nhận mới gọi onConfirm đúng 1 lần', async () => {
    let release: (() => void) | undefined;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => { release = resolve; }));
    const user = userEvent.setup();
    render(<StartCampaignNowDialog formattedStart="14/09/2026 09:00" onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: `${K}.startNow` }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent(`${K}.startNowConfirmTitle`);
    expect(dialog).toHaveTextContent('14/09/2026 09:00'); // phải nêu mốc đang bị kéo về
    expect(onConfirm).not.toHaveBeenCalled();

    const confirm = screen.getByRole('button', { name: `${K}.startNowConfirm` });
    await user.dblClick(confirm);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: `${K}.startNowSubmitting` })).toBeDisabled();

    release?.();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Huỷ ⇒ đóng hộp thoại, KHÔNG gọi onConfirm', async () => {
    const onConfirm = vi.fn(async () => undefined);
    const user = userEvent.setup();
    render(<StartCampaignNowDialog formattedStart="x" onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: `${K}.startNow` }));
    await user.click(screen.getByRole('button', { name: `${K}.startNowCancel` }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('disabledReason ⇒ trigger disabled + title, lý do hiện ra, hộp thoại KHÔNG mở được', async () => {
    const onConfirm = vi.fn(async () => undefined);
    render(<StartCampaignNowDialog formattedStart="x" onConfirm={onConfirm} disabledReason="Có 2 ca thi" />);
    const trigger = screen.getByRole('button', { name: `${K}.startNow` });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('title', 'Có 2 ca thi');
    expect(screen.getByTestId('start-now-blocked')).toHaveTextContent('Có 2 ca thi');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('onConfirm ném ⇒ hộp thoại GIỮ MỞ, nút xác nhận bật lại (không kẹt isSubmitting, không ném ra ngoài)', async () => {
    const onConfirm = vi.fn(async () => { throw new Error('409'); });
    const user = userEvent.setup();
    render(<StartCampaignNowDialog formattedStart="x" onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: `${K}.startNow` }));
    await user.click(screen.getByRole('button', { name: `${K}.startNowConfirm` }));
    await waitFor(() => expect(screen.getByRole('button', { name: `${K}.startNowConfirm` })).toBeEnabled());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
