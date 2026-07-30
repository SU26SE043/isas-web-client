// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EndCampaignDialog } from './EndCampaignDialog';

const messages: Record<string, string> = {
  'employer.campaigns.detail.endCampaign': 'Kết thúc chiến dịch',
  'employer.campaigns.detail.endTooltip': 'Kết thúc chiến dịch và ngừng nhận thêm ứng viên',
  'employer.campaigns.endConfirm.phrase': 'KẾT THÚC',
  'employer.campaigns.endConfirm.title': 'Xác nhận kết thúc chiến dịch?',
  'employer.campaigns.endConfirm.description': 'Mô tả',
  'employer.campaigns.endConfirm.dataRetention': 'Dữ liệu được giữ lại',
  'employer.campaigns.endConfirm.irreversible': 'Không thể hoàn tác',
  'employer.campaigns.endConfirm.inputLabel': 'Nhập “{phrase}” để xác nhận',
  'employer.campaigns.endConfirm.cancel': 'Tiếp tục chiến dịch',
  'employer.campaigns.endConfirm.confirm': 'Xác nhận kết thúc',
  'employer.campaigns.endConfirm.submitting': 'Đang kết thúc chiến dịch...',
  'employer.campaigns.endConfirm.errorTitle': 'Không thể kết thúc chiến dịch',
  'employer.campaigns.endConfirm.errorDescription': 'Vui lòng thử lại',
};

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => messages[key] ?? key }),
}));

vi.mock('@/shared/api/apiError', () => ({
  getApiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));

afterEach(cleanup);

describe('EndCampaignDialog', () => {
  it('requires the exact confirmation phrase and submits only once while pending', async () => {
    let resolveRequest: (() => void) | undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const user = userEvent.setup();
    render(<EndCampaignDialog onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Kết thúc chiến dịch' }));
    const confirmButton = screen.getByRole('button', { name: 'Xác nhận kết thúc' });
    const input = screen.getByLabelText('Nhập “KẾT THÚC” để xác nhận');

    expect(confirmButton).toBeDisabled();
    await user.type(input, 'Kết thúc');
    expect(confirmButton).toBeDisabled();
    await user.clear(input);
    await user.type(input, 'KẾT THÚC');
    expect(confirmButton).toBeEnabled();

    await user.dblClick(confirmButton);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Đang kết thúc chiến dịch...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Tiếp tục chiến dịch' })).toBeDisabled();

    resolveRequest?.();
    await waitFor(() =>
      expect(screen.queryByText('Xác nhận kết thúc chiến dịch?')).not.toBeInTheDocument(),
    );
  });

  it('keeps the dialog open and restores confirmation after a failed request', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('failed'));
    const user = userEvent.setup();
    render(<EndCampaignDialog onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Kết thúc chiến dịch' }));
    await user.type(screen.getByLabelText('Nhập “KẾT THÚC” để xác nhận'), 'KẾT THÚC');
    await user.click(screen.getByRole('button', { name: 'Xác nhận kết thúc' }));

    expect(await screen.findByText('Không thể kết thúc chiến dịch')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng thử lại')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xác nhận kết thúc' })).toBeEnabled();
  });
});
