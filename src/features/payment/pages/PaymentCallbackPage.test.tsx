import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/shared/languages';
import { paymentService } from '../services/payment.service';
import { PaymentCallbackPage } from './PaymentCallbackPage';

vi.mock('../services/payment.service', () => ({
  paymentService: {
    pollOrderStatus: vi.fn(),
    getOrderStatus: vi.fn(),
  },
}));

const service = vi.mocked(paymentService);
const ORDER_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

/**
 * Trang callback sau khi PayOS chuyển hướng về. PayOS đính `cancel=true&status=CANCELLED` vào cancelUrl
 * (doc payOS "Return URL"); bản cũ bỏ qua nên cứ poll 45×2s (mỗi lần = 1 call PayOS phía server + 1
 * dòng bằng chứng đối soát) rồi mới báo thất bại.
 */
function renderAt(search: string) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <LanguageProvider>
        <MemoryRouter initialEntries={[`/payment/callback${search}`]}>
          <Routes>
            <Route path="/payment/callback" element={<PaymentCallbackPage />} />
            <Route path="/payment/failed" element={<div data-testid="failed-page" />} />
            <Route path="/payment/success" element={<div data-testid="success-page" />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  window.sessionStorage.clear();
});
afterEach(() => cleanup());

describe('PaymentCallbackPage', () => {
  it('huỷ trên PayOS (cancel=true) ⇒ hỏi trạng thái ĐÚNG 1 lần, KHÔNG poll, sang trang thất bại', async () => {
    service.getOrderStatus.mockResolvedValue('Cancelled');

    // PayOS đính thêm code/id/orderCode; orderId của ta nằm trong sessionStorage (không có trên URL).
    window.sessionStorage.setItem('payment.return.orderId', ORDER_ID);
    renderAt('?code=00&id=abc&cancel=true&status=CANCELLED&orderCode=803347');

    await waitFor(() => expect(screen.getByTestId('failed-page')).toBeInTheDocument());
    expect(service.getOrderStatus).toHaveBeenCalledTimes(1);
    expect(service.getOrderStatus).toHaveBeenCalledWith(ORDER_ID);
    expect(service.pollOrderStatus).not.toHaveBeenCalled();
  });

  it('status=CANCELLED (không có cancel=true) cũng coi là huỷ', async () => {
    service.getOrderStatus.mockResolvedValue('Pending');
    renderAt(`?orderId=${ORDER_ID}&status=CANCELLED`);

    await waitFor(() => expect(screen.getByTestId('failed-page')).toBeInTheDocument());
    expect(service.pollOrderStatus).not.toHaveBeenCalled();
  });

  it('huỷ mà hỏi trạng thái lỗi ⇒ vẫn sang trang thất bại (không treo, không poll)', async () => {
    service.getOrderStatus.mockRejectedValue(new Error('network'));
    renderAt(`?orderId=${ORDER_ID}&cancel=true`);

    await waitFor(() => expect(screen.getByTestId('failed-page')).toBeInTheDocument());
    expect(service.pollOrderStatus).not.toHaveBeenCalled();
  });

  it('về từ returnUrl (không cancel) ⇒ vẫn poll như cũ, Paid ⇒ trang thành công', async () => {
    service.pollOrderStatus.mockResolvedValue('Paid');
    renderAt(`?orderId=${ORDER_ID}&code=00&cancel=false&status=PAID`);

    await waitFor(() => expect(screen.getByTestId('success-page')).toBeInTheDocument());
    expect(service.pollOrderStatus).toHaveBeenCalledWith(ORDER_ID);
    expect(service.getOrderStatus).not.toHaveBeenCalled();
  });

  it('không có orderId hợp lệ ⇒ trang thất bại, không gọi API nào', async () => {
    renderAt('?cancel=true&status=CANCELLED');

    await waitFor(() => expect(screen.getByTestId('failed-page')).toBeInTheDocument());
    expect(service.getOrderStatus).not.toHaveBeenCalled();
    expect(service.pollOrderStatus).not.toHaveBeenCalled();
  });
});
