// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import toast from 'react-hot-toast';
import { employerPaymentService } from '../services/employerPayment.service';
import { InvoiceStatus, type InvoiceResponse } from '../types/employerPayment.types';
import { EmployerInvoicesPage } from './EmployerInvoicesPage';

const messages: Record<string, string> = {
  'employerBilling.invoices.pay': 'Thanh toán',
  'employerBilling.invoices.download': 'Tải xuống',
  'employerBilling.invoices.errors.conflict': 'Không tạo được thanh toán mới cho hoá đơn này',
  'employerBilling.invoices.errors.payFailed': 'Không thể tạo thanh toán cho hoá đơn.',
};

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => messages[key] ?? key }),
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: 'OrgAdmin' } }),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

const invoice: InvoiceResponse = {
  id: 'inv-1',
  ownerType: 0,
  ownerId: 'org-1',
  accountId: null,
  periodStart: '2026-07-01T00:00:00Z',
  periodEnd: '2026-07-31T00:00:00Z',
  interviewCount: 3,
  amount: 300000,
  status: InvoiceStatus.Issued,
} as InvoiceResponse;

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <EmployerInvoicesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function apiError(status: number) {
  return Object.assign(new Error('request failed'), {
    isAxiosError: true,
    response: { status, data: { message: 'A payment is already in progress for this invoice.' } },
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.mocked(toast.error).mockClear();
});

describe('EmployerInvoicesPage — nút Thanh toán khi server từ chối', () => {
  it('409 → hiện thông báo, KHÔNG đứng im', async () => {
    vi.spyOn(employerPaymentService, 'getInvoices').mockResolvedValue([invoice]);
    vi.spyOn(employerPaymentService, 'payInvoice').mockRejectedValue(apiError(409));

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Thanh toán' }));

    // Trước bản vá, mutation không có onError → bấm xong KHÔNG có gì xảy ra.
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(vi.mocked(toast.error).mock.calls[0][0]).toBe(
      'Không tạo được thanh toán mới cho hoá đơn này',
    );
  });

  it('lỗi khác cũng phải báo (không nuốt im lặng)', async () => {
    vi.spyOn(employerPaymentService, 'getInvoices').mockResolvedValue([invoice]);
    vi.spyOn(employerPaymentService, 'payInvoice').mockRejectedValue(apiError(500));

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Thanh toán' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(vi.mocked(toast.error).mock.calls[0][0]).toBe('Không thể tạo thanh toán cho hoá đơn.');
  });
});
