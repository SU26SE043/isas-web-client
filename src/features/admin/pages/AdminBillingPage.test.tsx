// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { adminDirectoryService } from '../services/adminDirectory.service';
import { adminPaymentService } from '../services/adminPayment.service';
import type { CreditAccount, PostpaidOverviewRow } from '../types/adminApi.types';
import { AdminBillingPage } from './AdminBillingPage';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));

const ORG = '0610da24-1111-2222-3333-444444444444';
const ORG_B = '1687cb73-aaaa-bbbb-cccc-dddddddddddd';
// Shape theo `CreditAccountResponse` (Payment): enum là SỐ — Prepaid=0, Postpaid=1.
const prepaidWallet: CreditAccount = { ownerType: 0, ownerId: ORG, paymentMode: 0, status: 0, remainingCredits: 5, reservedCredits: 2, freeCreditsGranted: 0, walletExists: true };
const postpaidWallet: CreditAccount = { ...prepaidWallet, paymentMode: 1, remainingCredits: 0, reservedCredits: 3 };
// Shape `PostpaidOverviewRow`: alertLevel số tăng theo mức khẩn (4 = Overdue).
const rowCalm: PostpaidOverviewRow = { ownerId: ORG, creditLimit: 50, periodUsage: 3, reservedCredits: 1, headroom: 46, pendingAmountVnd: 150_000, unpaidInvoiceCount: 0, hasOverdue: false, lastInvoicePeriodEnd: null, alertLevel: 0 };
const rowOverdue: PostpaidOverviewRow = { ownerId: ORG_B, creditLimit: 20, periodUsage: 18, reservedCredits: 2, headroom: 0, pendingAmountVnd: 900_000, unpaidInvoiceCount: 1, hasOverdue: true, lastInvoicePeriodEnd: '2026-08-31T00:00:00Z', alertLevel: 4 };

const renderPage = (initialEntry = '/admin/billing') =>
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><MemoryRouter initialEntries={[initialEntry]}><AdminBillingPage /></MemoryRouter></QueryClientProvider>);

beforeEach(() => {
  // Trang nay mount thêm 2 query nền: danh sách tổ chức (picker + tên) và worklist postpaid.
  vi.spyOn(adminDirectoryService, 'getAdminOrganizations').mockResolvedValue({ items: [{ id: ORG, name: 'ISAS Demo Co', createdAt: '2026-07-01T00:00:00Z', memberCount: 1 }, { id: ORG_B, name: 'Acme HR', createdAt: '2026-07-02T00:00:00Z', memberCount: 3 }], nextCursor: null });
  vi.spyOn(adminPaymentService, 'getPostpaidOverview').mockResolvedValue([]);
  vi.spyOn(adminPaymentService, 'getCreditTransactions').mockResolvedValue({ items: [], nextCursor: null });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminBillingPage — ví hiện TRƯỚC khi cho thao tác', () => {
  it('nhận ?orgId= từ màn Tổ chức, GET ví và hiện chế độ/credit thật (không <pre> JSON)', async () => {
    const getSpy = vi.spyOn(adminPaymentService, 'getCreditAccount').mockResolvedValue(prepaidWallet);
    renderPage(`/admin/billing?orgId=${ORG}`);
    await waitFor(() => expect(getSpy).toHaveBeenCalledWith(0, ORG));
    expect((await screen.findAllByText('admin.billing.prepaid')).length).toBeGreaterThan(0);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(document.querySelector('pre')).toBeNull();
  });

  it('chưa chọn tổ chức ⇒ form khoá + KHÔNG GET ví; chọn theo TÊN trong picker ⇒ GET ví đúng id (hết gõ GUID)', async () => {
    const getSpy = vi.spyOn(adminPaymentService, 'getCreditAccount').mockResolvedValue(prepaidWallet);
    renderPage();
    expect(screen.getByText('admin.billing.formsLocked')).toBeInTheDocument();
    const select = (await screen.findByLabelText('admin.picker.org.label')) as HTMLSelectElement;
    await waitFor(() => expect(select.options.length).toBe(3));
    expect(getSpy).not.toHaveBeenCalled();
    fireEvent.change(select, { target: { value: ORG_B } });
    await waitFor(() => expect(getSpy).toHaveBeenCalledWith(0, ORG_B));
    expect(screen.queryByText('admin.billing.formsLocked')).toBeNull();
  });

  it('ví chưa tồn tại ⇒ nói rõ, không hiện form duyệt', async () => {
    vi.spyOn(adminPaymentService, 'getCreditAccount').mockResolvedValue({ ...prepaidWallet, walletExists: false, remainingCredits: 0, reservedCredits: 0 });
    renderPage(`/admin/billing?orgId=${ORG}`);
    expect(await screen.findByText('admin.billing.wallet.missing')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'admin.billing.saveMode' })).toBeInTheDocument();
  });
});

describe('AdminBillingPage — worklist postpaid', () => {
  it('khẩn nhất trên cùng (Overdue trước None), tên tổ chức từ directory, bấm Chọn ⇒ GET ví của đúng dòng đó', async () => {
    vi.spyOn(adminPaymentService, 'getPostpaidOverview').mockResolvedValue([rowCalm, rowOverdue]);
    const getSpy = vi.spyOn(adminPaymentService, 'getCreditAccount').mockResolvedValue(postpaidWallet);
    renderPage();
    const table = await screen.findByRole('table', { name: 'admin.billing.worklist.title' });
    const bodyRows = within(table).getAllByRole('row').slice(1);
    expect(within(bodyRows[0]).getByText('Acme HR')).toBeInTheDocument();
    expect(within(bodyRows[0]).getByText('admin.money.alert.overdue')).toBeInTheDocument();
    expect(within(bodyRows[1]).getByText('ISAS Demo Co')).toBeInTheDocument();
    fireEvent.click(within(bodyRows[0]).getByRole('button', { name: 'admin.billing.worklist.select' }));
    await waitFor(() => expect(getSpy).toHaveBeenCalledWith(0, ORG_B));
  });

  it('0 tổ chức postpaid ⇒ nói cách bật, không bảng trống câm', async () => {
    renderPage();
    expect(await screen.findByText('admin.billing.worklist.empty')).toBeInTheDocument();
  });
});

describe('AdminBillingPage — sổ cái credit', () => {
  it('có ví ⇒ tải sổ cái trang đầu (limit 20), hiện loại theo bảng tra enum số và dấu +; còn trang ⇒ "Xem thêm" gọi tiếp bằng cursor', async () => {
    vi.spyOn(adminPaymentService, 'getCreditAccount').mockResolvedValue(prepaidWallet);
    const txSpy = vi.spyOn(adminPaymentService, 'getCreditTransactions')
      .mockResolvedValueOnce({ items: [{ id: 't1', delta: 5, reason: 4, orderId: null, sessionId: null, reversesTransactionId: null, createdAt: '2026-09-14T10:00:00Z' }, { id: 't2', delta: -1, reason: 1, orderId: null, sessionId: '8c0bfd02-0000-0000-0000-000000000000', reversesTransactionId: null, createdAt: '2026-09-15T10:00:00Z' }], nextCursor: 'CURSOR-2' })
      .mockResolvedValueOnce({ items: [{ id: 't3', delta: 10, reason: 0, orderId: 'a610d707-0000-0000-0000-000000000000', sessionId: null, reversesTransactionId: null, createdAt: '2026-09-13T10:00:00Z' }], nextCursor: null });
    renderPage(`/admin/billing?orgId=${ORG}`);
    await waitFor(() => expect(txSpy).toHaveBeenCalledWith(0, ORG, { limit: 20 }));
    expect(await screen.findByText('admin.money.reason.promoGrant')).toBeInTheDocument();
    expect(screen.getByText('+5')).toBeInTheDocument();
    expect(screen.getByText('admin.money.reason.consume')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'admin.billing.ledger.more' }));
    await waitFor(() => expect(txSpy).toHaveBeenCalledWith(0, ORG, { limit: 20, cursor: 'CURSOR-2' }));
    expect(await screen.findByText('admin.money.reason.purchase')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'admin.billing.ledger.more' })).toBeNull();
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
    fireEvent.click(screen.getByRole('checkbox'));
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

  it('lỗi client trước khi gọi mạng (mã `CREDIT_LIMIT_REQUIRED`) hiện câu tiếng người', async () => {
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
