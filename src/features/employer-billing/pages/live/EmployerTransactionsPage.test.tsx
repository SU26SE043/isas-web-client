// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { employerPaymentService } from '../../services/employerPayment.service';
import type { CreditTransactionPage } from '../../types/employerPayment.types';
import { EmployerTransactionsPage } from './EmployerTransactionsPage';

const messages: Record<string, string> = {
  'employerBilling.live.loading': 'Đang tải dữ liệu',
  'employerBilling.live.retry': 'Thử lại',
  'employerBilling.live.emptyTransactions': 'Chưa có biến động credit',
  'employerBilling.live.emptyTransactionsHint':
    'Các giao dịch cộng, trừ hoặc credit dùng thử sẽ xuất hiện tại đây.',
  'employerBilling.transactions.errorTitle': 'Không thể tải biến động credit',
  'employerBilling.transactions.errorDescription':
    'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.',
  'employerBilling.transactions.time': 'Thời gian',
  'employerBilling.transactions.content': 'Nội dung',
  'employerBilling.transactions.reference': 'Liên kết',
  'employerBilling.transactions.delta': 'Biến động',
  'employerBilling.transactions.grant': 'Credit khuyến mãi',
  'employerBilling.transactions.generic': 'Giao dịch credit',
  'employerBilling.transactions.orderLink': 'Đơn {id}',
  'employerBilling.transactions.sessionLink': 'Phiên {id}',
  'employerBilling.transactions.creditUnit': '{delta} credit',
  'employerBilling.pagination.transactions': 'giao dịch',
  'ds.pagination.label': 'Phân trang',
  'ds.pagination.show': 'Hiển thị',
  'ds.pagination.pageSize': 'Số mục mỗi trang',
  'ds.pagination.perPage': '/ trang',
  'ds.pagination.cursorSummary': 'Trang {page} · {count} {itemLabel}',
  'ds.pagination.previous': 'Trang trước',
  'ds.pagination.next': 'Trang sau',
  'ds.pagination.page': 'Trang {page}',
};

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    language: 'vi',
    t: (key: string) => messages[key] ?? key,
  }),
}));

const transaction = {
  id: 'transaction-id',
  ownerType: 0 as const,
  ownerId: 'owner-id',
  delta: 10,
  reason: 5,
  sessionId: null,
  orderId: 'order-id',
  createdAt: '2026-07-28T05:00:00Z',
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const view = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <EmployerTransactionsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { ...view, queryClient };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('EmployerTransactionsPage', () => {
  it('shows only the initial loading skeleton while the request is pending', () => {
    vi.spyOn(employerPaymentService, 'getCreditTransactions').mockReturnValue(
      new Promise<CreditTransactionPage>(() => {}),
    );
    renderPage();

    expect(screen.getByLabelText('Đang tải dữ liệu')).toBeInTheDocument();
    expect(screen.queryByText('Chưa có biến động credit')).not.toBeInTheDocument();
    expect(screen.queryByText('Không thể tải biến động credit')).not.toBeInTheDocument();
  });

  it('renders 200 plus an empty array as empty state without retry and without refetch loop', async () => {
    const request = vi
      .spyOn(employerPaymentService, 'getCreditTransactions')
      .mockResolvedValue({ items: [], nextCursor: null });
    renderPage();

    expect(await screen.findByText('Chưa có biến động credit')).toBeInTheDocument();
    expect(screen.queryByText('Không thể tải biến động credit')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Thử lại' })).not.toBeInTheDocument();
    expect(screen.getByText('Trang 1 · 0 giao dịch')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang trước' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Trang sau' })).toBeDisabled();
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('renders signed delta, known reason, time, and reference for a successful page', async () => {
    vi.spyOn(employerPaymentService, 'getCreditTransactions').mockResolvedValue({
      items: [transaction],
      nextCursor: 'next-cursor',
    });
    renderPage();

    expect(await screen.findAllByText('+10 credit')).not.toHaveLength(0);
    expect(screen.getAllByText('Credit khuyến mãi')).not.toHaveLength(0);
    expect(screen.getAllByText('Đơn order-id')).not.toHaveLength(0);
    expect(screen.queryByText('Không thể tải biến động credit')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang sau' })).toBeEnabled();
  });

  it('shows a real error and refetches exactly once when retry is clicked', async () => {
    const request = vi
      .spyOn(employerPaymentService, 'getCreditTransactions')
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 401 },
      })
      .mockResolvedValueOnce({ items: [], nextCursor: null });
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Không thể tải biến động credit')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Chưa có biến động credit')).toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('navigates by cursor, returns to the previous cursor, and resets cursor when limit changes', async () => {
    const request = vi
      .spyOn(employerPaymentService, 'getCreditTransactions')
      .mockImplementation(async ({ cursor, limit } = {}) => ({
        items: [{ ...transaction, id: `${cursor ?? 'first'}-${limit}` }],
        nextCursor: cursor ? null : 'cursor-2',
      }));
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Trang 1 · 1 giao dịch');
    await user.click(screen.getByRole('button', { name: 'Trang sau' }));
    await screen.findByText('Trang 2 · 1 giao dịch');
    await waitFor(() =>
      expect(request).toHaveBeenLastCalledWith({ cursor: 'cursor-2', limit: 5 }),
    );

    await user.click(screen.getByRole('button', { name: 'Trang trước' }));
    await screen.findByText('Trang 1 · 1 giao dịch');
    await waitFor(() =>
      expect(request).toHaveBeenLastCalledWith({ cursor: null, limit: 5 }),
    );

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Số mục mỗi trang' }),
      '10',
    );
    await waitFor(() =>
      expect(request).toHaveBeenLastCalledWith({ cursor: null, limit: 10 }),
    );
    expect(screen.getByText('Trang 1')).toBeInTheDocument();
  });
});
