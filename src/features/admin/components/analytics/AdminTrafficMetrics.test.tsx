// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { adminPaymentService } from '../../services/adminPayment.service';
import type { AdminRevenueAnalytics, AdminTrafficAnalytics } from '../../types/adminApi.types';
import { AdminTrafficMetrics, rankRoutes } from './AdminTrafficMetrics';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));

const revenue = { from: '2026-08-17T00:00:00Z', to: '2026-09-16T00:00:00Z', granularity: 'Day', grossRevenueVnd: 0, paidOrderCount: 0, refundedVnd: 0, refundedOrderCount: 0, netRevenueVnd: 0, aiCostUsd: 0, aiCostVnd: 0, grossMarginVnd: 0, refundRatePct: 0, payingOwnerCount: 0, arpuVnd: 0, buckets: [], funnel: { createdCount: 0, paidCount: 0, failedCount: 0, expiredCount: 0, cancelledCount: 0, pendingCount: 0, conversionRatePct: 0 } } satisfies AdminRevenueAnalytics;
const summary = (requests: number, errors5xx: number) => ({ requests, errors4xx: 0, errors5xx, avgDurationMs: 700.5, maxDurationMs: 101_639 });
// Shape object ẩn danh của `AdminTrafficController` (FR18).
const traffic: AdminTrafficAnalytics = {
  from: revenue.from, to: revenue.to, granularity: 'day', totals: summary(12_711, 32),
  byRoute: [{ routeId: 'auth-route', summary: summary(9000, 0) }, { routeId: 'interview-route', summary: summary(2000, 30) }, { routeId: 'payment-route', summary: summary(1711, 2) }],
  buckets: [],
};
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminTrafficMetrics', () => {
  it('rankRoutes: nhiều 5xx trước, rồi nhiều request — route cháy không bị route khoẻ nhấn chìm', () => {
    expect(rankRoutes(traffic.byRoute).map((r) => r.routeId)).toEqual(['interview-route', 'payment-route', 'auth-route']);
  });

  it('hiện tổng + badge "Cần xem" khi 5xx > 0, gọi traffic với đúng kỳ của revenue', async () => {
    vi.spyOn(adminPaymentService, 'getRevenue').mockResolvedValue(revenue);
    vi.spyOn(adminPaymentService, 'getFinanceSnapshot').mockResolvedValue({ asOf: '', outstandingReceivables: { issuedVnd: 0, issuedCount: 0, overdueVnd: 0, overdueCount: 0, totalVnd: 0 }, mrrVnd: 0, activeSubscriptionCount: 0 });
    const spy = vi.spyOn(adminPaymentService, 'getTraffic').mockResolvedValue(traffic);
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><AdminTrafficMetrics groupBy="day" /></QueryClientProvider>);
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ from: revenue.from, to: revenue.to, groupBy: 'day' }));
    expect(await screen.findByText('12.711')).toBeInTheDocument();
    expect(screen.getByText('admin.traffic.needsAttention')).toBeInTheDocument();
    const cells = screen.getAllByRole('cell').map((c) => c.textContent);
    expect(cells.indexOf('interview-route')).toBeLessThan(cells.indexOf('auth-route'));
  });
});
