/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import toast from 'react-hot-toast';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ATT1-F2 — hộp thoại "Tăng số lần làm bài". Đo XUYÊN hook + service thật tới tận `apiClient.put`
 * để khoá body PUT đúng `{ title, maxAttempts }` (không chỉ khoá đối số của một hàm ở giữa).
 */
const api = vi.hoisted(() => ({ put: vi.fn() }));
vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { put: api.put, get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
vi.mock('react-hot-toast', () => {
  const toastFn = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() });
  return { default: toastFn };
});
const WITH_N = new Set([
  'employer.campaigns.detail.attemptRules.confirm',
  'employer.campaigns.detail.attemptRules.success',
  'employer.campaigns.detail.attemptRules.dialogCurrentOne',
  'employer.campaigns.detail.attemptRules.dialogCurrentMany',
  'employer.campaigns.form.attemptRules.attemptOptionMany',
]);
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => (WITH_N.has(key) ? `${key}:{{n}}` : key), language: 'vi' }),
}));

const { IncreaseMaxAttemptsDialog } = await import('./IncreaseMaxAttemptsDialog');

const K = 'employer.campaigns.detail.attemptRules';
const OPTION = 'employer.campaigns.form.attemptRules.attemptOptionMany';
const TITLE = 'Backend Developer';

function httpError(status: number, data: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, { status, statusText: '', headers: {}, config, data });
}

let queryClient: QueryClient;
beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function openDialog(current: number) {
  const user = userEvent.setup();
  render(
    <QueryClientProvider client={queryClient}>
      <IncreaseMaxAttemptsDialog campaignId="cmp-1" title={TITLE} current={current} />
    </QueryClientProvider>,
  );
  await user.click(screen.getByRole('button', { name: `${K}.increase` }));
  const dialog = await screen.findByRole('dialog');
  return { user, dialog };
}

function optionNames(dialog: HTMLElement) {
  return within(within(dialog).getByRole('group')).getAllByRole('button').map((button) => button.getAttribute('aria-label'));
}

describe('IncreaseMaxAttemptsDialog — chỉ cho chọn giá trị > hiện tại', () => {
  it('đang 1 ⇒ chỉ liệt kê 2 và 3; chọn sẵn 2; nêu hiện tại + 3 hệ quả; nút "Tăng lên 2 lần"', async () => {
    const { dialog } = await openDialog(1);
    expect(optionNames(dialog)).toEqual([`${OPTION}:2`, `${OPTION}:3`]);
    expect(within(dialog).getByRole('button', { name: `${OPTION}:2` })).toHaveAttribute('aria-pressed', 'true');
    expect(dialog).toHaveTextContent(`${K}.dialogCurrentOne:1`);
    for (const key of ['consequenceUnfinishedOnly', 'consequenceCredit', 'consequenceNoDecrease']) {
      expect(dialog).toHaveTextContent(`${K}.${key}`);
    }
    expect(within(dialog).getByRole('button', { name: `${K}.confirm:2` })).toBeEnabled();
  });

  it('đang 2 ⇒ chỉ liệt kê 3', async () => {
    const { dialog } = await openDialog(2);
    expect(optionNames(dialog)).toEqual([`${OPTION}:3`]);
    expect(dialog).toHaveTextContent(`${K}.dialogCurrentMany:2`);
    expect(within(dialog).getByRole('button', { name: `${K}.confirm:3` })).toBeInTheDocument();
  });

  it('Hủy ⇒ đóng, KHÔNG gọi PUT', async () => {
    const { user, dialog } = await openDialog(1);
    // Nút X góc trên cũng mang nhãn Hủy (closeLabel i18n) — bấm nút Hủy ở footer.
    const footer = dialog.querySelector<HTMLElement>('[data-slot="dialog-footer"]')!;
    await user.click(within(footer).getByRole('button', { name: `${K}.cancel` }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.put).not.toHaveBeenCalled();
  });
});

describe('IncreaseMaxAttemptsDialog — lưu', () => {
  it('chọn 3 ⇒ PUT /api/v1/campaign/cmp-1 body ĐÚNG { title, maxAttempts: 3 }; thành công ⇒ invalidate chi tiết + danh sách, toast, đóng', async () => {
    api.put.mockResolvedValueOnce({ data: { id: 'cmp-1', title: TITLE, status: 'Active', maxAttempts: 3 } });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { user, dialog } = await openDialog(1);

    await user.click(within(dialog).getByRole('button', { name: `${OPTION}:3` }));
    await user.click(within(dialog).getByRole('button', { name: `${K}.confirm:3` }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.put).toHaveBeenCalledTimes(1);
    const [url, body] = api.put.mock.calls[0] as [string, Record<string, unknown>];
    expect(url).toBe('/api/v1/campaign/cmp-1');
    expect(body).toStrictEqual({ title: TITLE, maxAttempts: 3 });
    expect(Object.keys(body).sort()).toEqual(['maxAttempts', 'title']);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['employer', 'campaign', 'cmp-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['employer', 'campaigns'] });
    expect(toast.success).toHaveBeenCalledWith(`${K}.success:3`);
  });

  it.each(['MAX_ATTEMPTS_DECREASE', 'TIME_LIMIT_LOCKED'])(
    '409 %s ⇒ hiện NGUYÊN lời server trong hộp thoại, hộp thoại KHÔNG đóng, không invalidate/toast',
    async (code) => {
      const serverText = `Lời server cho ${code} — giữ nguyên văn.`;
      api.put.mockRejectedValueOnce(httpError(409, { code, error: serverText }));
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
      const { user, dialog } = await openDialog(1);

      await user.click(within(dialog).getByRole('button', { name: `${K}.confirm:2` }));

      const alert = await within(dialog).findByRole('alert');
      // So khớp TUYỆT ĐỐI: Alert chỉ render children ⇒ không được chèn câu chung trước/sau lời server.
      expect(alert.textContent?.trim()).toBe(serverText);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: `${K}.confirm:2` })).toBeEnabled();
      expect(invalidate).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
    },
  );

  it('lỗi 500 ⇒ câu i18n chung (không lộ lời server kỹ thuật), hộp thoại vẫn mở', async () => {
    api.put.mockRejectedValueOnce(httpError(500, { error: 'NullReferenceException' }));
    const { user, dialog } = await openDialog(1);
    await user.click(within(dialog).getByRole('button', { name: `${K}.confirm:2` }));
    const alert = await within(dialog).findByRole('alert');
    expect(alert).toHaveTextContent(`${K}.failed`);
    expect(alert).not.toHaveTextContent('NullReferenceException');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
