// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { adminPaymentService } from '../services/adminPayment.service';
import type { CreditAccount } from '../types/adminApi.types';
import { AdminBillingPage } from './AdminBillingPage';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));

const ORG = '0610da24-1111-2222-3333-444444444444';
// Shape theo `CreditAccountResponse` (Payment): enum là SỐ — Prepaid=0, Postpaid=1.
const prepaidWallet: CreditAccount = { ownerType: 0, ownerId: ORG, paymentMode: 0, status: 0, remainingCredits: 5, reservedCredits: 2, freeCreditsGranted: 0, walletExists: true };
const postpaidWallet: CreditAccount = { ...prepaidWallet, paymentMode: 1, remainingCredits: 0, reservedCredits: 3 };

const renderPage = (initialEntry = '/admin/billing') =>
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><MemoryRouter initialEntries={[initialEntry]}><AdminBillingPage /></MemoryRouter></QueryClientProvider>);
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminBillingPage — ví hiện TRƯỚC khi cho thao tác', () => {
  it('nhận ?orgId= từ màn Tổ chức, GET ví và hiện chế độ/credit thật (bản cũ không GET gì, form mặc định Postpaid mù)', async () => {
    const getSpy = vi.spyOn(adminPaymentService, 'getCreditAccount').mockResolvedValue(prepaidWallet);
    renderPage(`/admin/billing?orgId=${ORG}`);
    await waitFor(() => expect(getSpy).toHaveBeenCalledWith(0, ORG));
    expect((await screen.findAllByText('admin.billing.prepaid')).length).toBeGreaterThan(0);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    // Không còn <pre> JSON nào trên trang.
    expect(document.querySelector('pre')).toBeNull();
  });

  it('mã tổ chức không phải GUID ⇒ không gọi API, báo lỗi định dạng; chưa chọn tổ chức thì form bị khoá', async () => {
    const getSpy = vi.spyOn(adminPaymentService, 'getCreditAccount').mockResolvedValue(prepaidWallet);
    renderPage();
    expect(screen.getByText('admin.billing.formsLocked')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('admin.billing.orgId'), { target: { value: 'not-a-guid' } });
    fireEvent.keyDown(screen.getByLabelText('admin.billing.orgId'), { key: 'Enter' });
    expect(screen.getByText('admin.billing.orgIdInvalid')).toBeInTheDocument();
    expect(getSpy).not.toHaveBeenCalled();
  });

  it('ví chưa tồn tại ⇒ nói rõ, không hiện form duyệt', async () => {
    vi.spyOn(adminPaymentService, 'getCreditAccount').mockResolvedValue({ ...prepaidWallet, walletExists: false, remainingCredits: 0, reservedCredits: 0 });
    renderPage(`/admin/billing?orgId=${ORG}`);
    expect(await screen.findByText('admin.billing.wallet.missing')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'admin.billing.saveMode' })).toBeInTheDocument();
  });
});

describe('AdminBillingPage — duyệt chế độ có confirm, kết quả có cấu trúc', () => {
  it('Prepaid → Postpaid: cần hạn mức + lý do, CONFIRM rồi mới POST đúng payload; kết quả hiện chế độ/hạn mức/credit; form reset', async () => {
    vi.spyOn(adminPaymentService, 'getCreditAccount').mockResolvedValue(prepaidWallet);
    const setSpy = vi.spyOn(adminPaymentService, 'setPaymentMode').mockResolvedValue({ ownerType: 0, ownerId: ORG, paymentMode: 1, creditLimit: 100, remainingCredits: 5, reservedCredits: 2 });
    renderPage(`/admin/billing?orgId=${ORG}`);
    const save = await screen.findByRole('button', { name: 'admin.billing.saveMode' });
    expect(save).toBeDisabled();
    fireEvent.change(screen.getByLabelText('admin.billing.creditLimit'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('admin.billing.note'), { target: { value: 'Hợp đồng 12/2026' } });
    // Ví còn 5+2 credit ⇒ phải có ô xác nhận "credit sẽ không dùng được".
    const stranded = screen.getByRole('checkbox');
    fireEvent.click(stranded);
    expect(save).toBeEnabled();
    fireEvent.click(save);
    expect(setSpy).not.toHaveBeenCalled();
    expect(await screen.findByText('admin.billing.modeConfirmPostpaid')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'admin.billing.saveMode' }).at(-1)!);
    await waitFor(() => expect(setSpy).toHaveBeenCalledTimes(1));
    expect(setSpy.mock.calls[0][0]).toEqual({ ownerType: 0, ownerId: ORG, paymentMode: 1, creditLimit: 100, note: 'Hợp đồng 12/2026', allowStrandedCredits: true });
    expect(await screen.findByText('admin.billing.modeResult')).toBeInTheDocument();
    expect(document.querySelector('pre')).toBeNull();
    await waitFor(() => expect(screen.getByLabelText('admin.billing.note')).toHaveValue(''));
  });

  it('lỗi client trước khi gọi mạng (mã `CREDIT_LIMIT_REQUIRED`) hiện câu tiếng người, không phải "kiểm tra phản hồi backend"', async () => {
    vi.spyOn(adminPaymentService, 'getCreditAccount').mockResolvedValue(prepaidWallet);
    vi.spyOn(adminPaymentService, 'setPaymentMode').mockRejectedValue(new Error('CREDIT_LIMIT_REQUIRED'));
    renderPage(`/admin/billing?orgId=${ORG}`);
    await screen.findByRole('button', { name: 'admin.billing.saveMode' });
    fireEvent.change(screen.getByLabelText('admin.billing.creditLimit'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('admin.billing.note'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'admin.billing.saveMode' }));
    fireEvent.click((await screen.findAllByRole('button', { name: 'admin.billing.saveMode' })).at(-1)!);
    expect(await screen.findByText('admin.billing.error.creditLimitRequired')).toBeInTheDocument();
  });
});

describe('AdminBillingPage — chốt kỳ', () => {
  it('ví Prepaid ⇒ nút chốt kỳ bị khoá kèm lý do; ví Postpaid ⇒ confirm rồi POST và hiện hoá đơn có cấu trúc', async () => {
    vi.spyOn(adminPaymentService, 'getCreditAccount').mockResolvedValue(prepaidWallet);
    renderPage(`/admin/billing?orgId=${ORG}`);
    expect(await screen.findByRole('button', { name: 'admin.billing.closeInvoice' })).toBeDisabled();
    expect(screen.getByText('admin.billing.invoiceNotPostpaid')).toBeInTheDocument();
    cleanup();

    vi.spyOn(adminPaymentService, 'getCreditAccount').mockResolvedValue(postpaidWallet);
    const closeSpy = vi.spyOn(adminPaymentService, 'closeInvoice').mockResolvedValue({ id: 'inv-1', ownerType: 0, ownerId: ORG, periodStart: '2026-08-01T00:00:00Z', periodEnd: '2026-09-01T00:00:00Z', interviewCount: 12, unitPrice: 50000, amount: 600000, status: 0, createdAt: '2026-09-01T00:00:01Z' });
    renderPage(`/admin/billing?orgId=${ORG}`);
    const close = await screen.findByRole('button', { name: 'admin.billing.closeInvoice' });
    await waitFor(() => expect(close).toBeEnabled());
    fireEvent.click(close);
    expect(await screen.findByText('admin.billing.invoiceConfirmDescription')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'admin.billing.closeInvoice' }).at(-1)!);
    await waitFor(() => expect(closeSpy).toHaveBeenCalledWith({ orgId: ORG }));
    expect(await screen.findByText(/admin.billing.invoiceResult/)).toBeInTheDocument();
    expect(document.querySelector('pre')).toBeNull();
  });
});
