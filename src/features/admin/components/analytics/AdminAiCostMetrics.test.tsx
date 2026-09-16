// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { adminPaymentService } from '../../services/adminPayment.service';
import type { AdminAiUsageAnalytics, AdminRevenueAnalytics } from '../../types/adminApi.types';
import { AdminAiCostMetrics } from './AdminAiCostMetrics';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));
vi.mock('recharts', async () => { const actual = await vi.importActual<typeof import('recharts')>('recharts'); return { ...actual, ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }; });

// Shape `RevenueReportResponse` — chỉ điền field khối này đọc; kỳ [from,to) là thứ phải truyền tiếp.
const revenue: AdminRevenueAnalytics = {
  from: '2026-08-17T00:00:00Z', to: '2026-09-16T00:00:00Z', granularity: 'Day', grossRevenueVnd: 0, paidOrderCount: 0, refundedVnd: 0, refundedOrderCount: 0,
  netRevenueVnd: 0, aiCostUsd: 7.32, aiCostVnd: 190_320, grossMarginVnd: -190_320, refundRatePct: 0, payingOwnerCount: 0, arpuVnd: 0, buckets: [],
  funnel: { createdCount: 0, paidCount: 0, failedCount: 0, expiredCount: 0, cancelledCount: 0, pendingCount: 0, conversionRatePct: 0 },
};
const op = (operation: string, costUsd: number) => ({ operation, calls: 1, promptTokens: 1, outputTokens: 1, totalTokens: 2, audioSeconds: 0, costUsd });
// Shape `AiUsageReportResponse` (F22): 8 operation để kiểm hàng "n việc khác" (trần 6).
const usage: AdminAiUsageAnalytics = {
  from: revenue.from, to: revenue.to, granularity: 'Day', totalCalls: 1278, promptTokens: 3_000_000, outputTokens: 967_530, totalTokens: 3_967_530, audioSeconds: 2405, totalCostUsd: 7.3184753,
  byOperation: [op('score', 3.1), op('generate_questions', 0.5), op('transcribe', 2.4), op('decide_next', 0.4), op('analyze_cv', 0.3), op('lesson_theory', 0.2), op('embed', 0.05), op('tts', 0.01)],
  buckets: [{ periodStart: '2026-09-15T00:00:00Z', calls: 10, totalTokens: 1000, costUsd: 0.5 }],
};
const renderBlock = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><AdminAiCostMetrics groupBy="day" /></QueryClientProvider>);
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminAiCostMetrics — chi phí AI đọc CÙNG kỳ với doanh thu', () => {
  it('gọi ai-usage với ĐÚNG from/to của revenue (dependent query), hiện VND từ revenue và USD từ ai-usage', async () => {
    vi.spyOn(adminPaymentService, 'getRevenue').mockResolvedValue(revenue);
    vi.spyOn(adminPaymentService, 'getFinanceSnapshot').mockResolvedValue({ asOf: '', outstandingReceivables: { issuedVnd: 0, issuedCount: 0, overdueVnd: 0, overdueCount: 0, totalVnd: 0 }, mrrVnd: 0, activeSubscriptionCount: 0 });
    const usageSpy = vi.spyOn(adminPaymentService, 'getAiUsage').mockResolvedValue(usage);
    renderBlock();
    await waitFor(() => expect(usageSpy).toHaveBeenCalledWith({ from: revenue.from, to: revenue.to, groupBy: 'day' }));
    // KHÔNG có lời gọi nào với from/to trống (gọi trống = BE tự lấy kỳ mặc định ⇒ lệch kỳ với revenue).
    expect(usageSpy.mock.calls.every(([params]) => typeof params?.from === 'string' && typeof params?.to === 'string')).toBe(true);
    // 190.320 ₫ — số VND đến từ revenue.aiCostVnd, không tự quy đổi ở FE.
    expect((await screen.findByText(/190\.320/)).textContent).toMatch(/190\.320/);
    expect(screen.getByText('1.278')).toBeInTheDocument();
    // Bảng "tiền đi đâu" sắp theo USD giảm dần, 6 hàng + hàng gộp "2 việc khác".
    const cells = screen.getAllByRole('cell').map((cell) => cell.textContent);
    expect(cells.indexOf('score')).toBeLessThan(cells.indexOf('transcribe'));
    expect(cells.indexOf('transcribe')).toBeLessThan(cells.indexOf('generate_questions'));
    expect(cells).not.toContain('tts');
    expect(screen.getByText('admin.aiCost.othersRow')).toBeInTheDocument();
  });

  it('revenue lỗi ⇒ KHÔNG gọi ai-usage (không tự bịa kỳ mặc định khác)', async () => {
    vi.spyOn(adminPaymentService, 'getRevenue').mockRejectedValue(new Error('boom'));
    vi.spyOn(adminPaymentService, 'getFinanceSnapshot').mockResolvedValue({ asOf: '', outstandingReceivables: { issuedVnd: 0, issuedCount: 0, overdueVnd: 0, overdueCount: 0, totalVnd: 0 }, mrrVnd: 0, activeSubscriptionCount: 0 });
    const usageSpy = vi.spyOn(adminPaymentService, 'getAiUsage').mockResolvedValue(usage);
    renderBlock();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(usageSpy).not.toHaveBeenCalled();
  });
});
