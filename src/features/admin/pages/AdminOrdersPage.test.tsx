// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { adminDirectoryService } from '../services/adminDirectory.service';
import { adminPaymentService } from '../services/adminPayment.service';
import type { AdminOrder } from '../types/adminApi.types';
import { AdminOrdersPage } from './AdminOrdersPage';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));

const ORG = '0610da24-1111-2222-3333-444444444444';
// Shape `AdminOrderListItem` (Payment): enum SỐ — status 2=Paid 6=Refunded, kind 0=CreditPack, ownerType 0=Org 1=User.
const paid: AdminOrder = { id: 'o1', ownerType: 0, ownerId: ORG, kind: 0, status: 2, amountVnd: 2_000_000, payosOrderCode: 2609161200001, expiredAt: '2026-09-16T01:00:00Z', paidAt: '2026-09-16T00:10:00Z', createdAt: '2026-09-16T00:00:00Z' };
const refundedFailed: AdminOrder = { ...paid, id: 'o2', ownerType: 1, ownerId: 'u1000000-0000-0000-0000-000000000001', status: 6, refundedAt: '2026-09-16T02:00:00Z', refundReason: 'Khách đổi ý', refundSettledAt: null, payoutStatus: 'Failed', payoutFailureReason: 'toBin không đổi được' };

const renderPage = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><MemoryRouter><AdminOrdersPage /></MemoryRouter></QueryClientProvider>);
beforeEach(() => { vi.spyOn(adminDirectoryService, 'getAdminOrganizations').mockResolvedValue({ items: [{ id: ORG, name: 'ISAS Demo Co', createdAt: '2026-07-01T00:00:00Z', memberCount: 1 }], nextCursor: null }); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminOrdersPage — chỉ xem, nhãn từ enum số, filter reset cursor', () => {
  it('hiện đơn với tên tổ chức + nhãn trạng thái/loại từ bảng tra; không có nút hoàn tiền nào', async () => {
    const spy = vi.spyOn(adminPaymentService, 'listOrders').mockResolvedValue({ items: [paid], nextCursor: null });
    renderPage();
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ limit: 20 }));
    const table = await screen.findByRole('table');
    expect(within(table).getByText('admin.money.owner.org · ISAS Demo Co')).toBeInTheDocument();
    expect(within(table).getByText('admin.money.orderStatus.paid')).toBeInTheDocument();
    expect(within(table).getByText('admin.money.orderKind.creditPack')).toBeInTheDocument();
    expect(within(table).getByText('2609161200001')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /refund|hoàn/i })).toBeNull();
    expect(screen.getByText('admin.orders.readOnlyNote')).toBeInTheDocument();
  });

  it('lọc Đã hoàn ⇒ gọi ?status=6 từ TRANG ĐẦU (không mang cursor cũ), hiện cột chuyển tiền với lệnh chi hỏng + lý do', async () => {
    const spy = vi.spyOn(adminPaymentService, 'listOrders')
      .mockResolvedValueOnce({ items: [paid], nextCursor: 'C2' })
      .mockResolvedValue({ items: [refundedFailed], nextCursor: null });
    renderPage();
    await screen.findByRole('table');
    fireEvent.click(screen.getByRole('button', { name: 'ds.pagination.next' }));
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ limit: 20, cursor: 'C2' }));
    fireEvent.change(screen.getByLabelText('admin.orders.filter.status'), { target: { value: '6' } });
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith({ status: 6, limit: 20 }));
    const table = await screen.findByRole('table');
    expect(within(table).getByText('admin.orders.table.refund')).toBeInTheDocument();
    expect(within(table).getByText(/admin.money.payout.failed: toBin không đổi được/)).toBeInTheDocument();
    expect(within(table).getByText(/admin.money.owner.user · u1000000…/)).toBeInTheDocument();
    // Bỏ lọc Đã hoàn ⇒ cột hoàn tiền + filter chuyển tiền biến mất.
    fireEvent.change(screen.getByLabelText('admin.orders.filter.settlement'), { target: { value: '1' } });
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith({ status: 6, refundSettlement: 1, limit: 20 }));
    fireEvent.change(screen.getByLabelText('admin.orders.filter.status'), { target: { value: '2' } });
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith({ status: 2, limit: 20 }));
    expect(screen.queryByLabelText('admin.orders.filter.settlement')).toBeNull();
  });

  it('0 đơn ⇒ trạng thái rỗng có lời', async () => {
    vi.spyOn(adminPaymentService, 'listOrders').mockResolvedValue({ items: [], nextCursor: null });
    renderPage();
    expect(await screen.findByText('admin.orders.empty')).toBeInTheDocument();
  });
});
