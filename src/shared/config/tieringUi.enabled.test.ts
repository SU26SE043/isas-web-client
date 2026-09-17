import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { paymentService } from '@/features/payment/services/payment.service';
import { employerPaymentService } from '@/features/employer-billing/services/employerPayment.service';

vi.mock('@/shared/mock', () => ({ usesMockData: () => false, isPlaywrightRuntime: () => false, mockDelay: () => Promise.resolve() }));
vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));
// Bật lại tiering UI: catalog phải trả CẢ gói thuê bao — khoá để bộ lọc không thành "luôn ẩn" khi ai đó gỡ cờ.
vi.mock('@/shared/config', async (importOriginal) => ({ ...(await importOriginal<typeof import('@/shared/config')>()), isTieringUiEnabled: () => true }));

const oneTime = { id: 'pk-1', name: 'Gói 5 credit', type: 1, priceVnd: 100000, interviewCredits: 5, durationDays: null, isActive: true };
const subscription = { id: 'pk-2', name: 'Plus tháng', type: 2, priceVnd: 99000, interviewCredits: null, durationDays: 30, isActive: true, planId: 'plan-plus', audience: 0 };

afterEach(() => { vi.mocked(apiClient.get).mockReset(); });

describe('VITE_ENABLE_TIERING_UI=true — catalog giữ gói thuê bao', () => {
  it('paymentService.listCatalogPackages trả cả 2 loại', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [oneTime, subscription], headers: {} });
    expect((await paymentService.listCatalogPackages()).map((p) => p.id)).toEqual(['pk-1', 'pk-2']);
  });

  it('employerPaymentService.getPackages trả cả 2 loại', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [oneTime, subscription], headers: {} });
    expect((await employerPaymentService.getPackages()).map((p) => p.id)).toEqual(['pk-1', 'pk-2']);
  });
});
