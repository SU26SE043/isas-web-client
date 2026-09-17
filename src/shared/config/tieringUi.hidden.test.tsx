// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { apiClient } from '@/shared/api/apiClient';
import { isTieringUiEnabled } from '@/shared/config';
import { paymentService } from '@/features/payment/services/payment.service';
import { paymentEndpoints } from '@/features/payment/services/payment.endpoints';
import { employerPaymentService } from '@/features/employer-billing/services/employerPayment.service';
import { adminDirectoryService } from '@/features/admin/services/adminDirectory.service';
import { adminPaymentService } from '@/features/admin/services/adminPayment.service';
import { AdminGrantsPage } from '@/features/admin/pages/AdminGrantsPage';
import { AdminPlansPage } from '@/features/admin/pages/AdminPlansPage';
import { CreditsWalletPage } from '@/features/payment/pages/CreditsWalletPage';
import { AdminDashboardLayout } from '@/layouts/AdminDashboardLayout';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));
vi.mock('@/shared/mock', () => ({ usesMockData: () => false, isPlaywrightRuntime: () => false, mockDelay: () => Promise.resolve() }));
vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
vi.mock('@/layouts/LanguageToggle', () => ({ LanguageToggle: () => <div data-testid="language-toggle" /> }));
vi.mock('@/layouts/components/SidebarLogoutButton', () => ({ SidebarLogoutButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button> }));

/**
 * Tiering UI TẠM ẨN (chốt 2026-09-17, `VITE_ENABLE_TIERING_UI` mặc định tắt): mọi chỗ bán/hiện gói
 * thuê bao, tier, thẻ "thuê bao hiện tại" phải biến mất KHÔNG cần xoá code. File này khoá trạng thái
 * MẶC ĐỊNH; hành vi khi bật giữ trong AdminPlansPage/AdminGrantsPage.test (mock cờ = true).
 * Vì sao test ở tầng service cho catalog: một bộ lọc dùng chung cho bảng giá public · /candidate/subscription
 * · tab Gói credit · catalog employer — lọc ở đây thì không màn nào lệch nhau.
 */
const oneTime = { id: 'pk-1', name: 'Gói 5 credit', type: 1, priceVnd: 100000, interviewCredits: 5, durationDays: null, isActive: true, planId: null, audience: null };
const subscription = { id: 'pk-2', name: 'Plus tháng', type: 2, priceVnd: 99000, interviewCredits: null, durationDays: 30, isActive: true, planId: 'plan-plus', audience: 0 };
const client = () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
const wrap = (ui: React.ReactElement, entry = '/') => render(<QueryClientProvider client={client()}><MemoryRouter initialEntries={[entry]}>{ui}</MemoryRouter></QueryClientProvider>);

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.mocked(apiClient.get).mockReset(); });

describe('cờ mặc định', () => {
  it('VITE_ENABLE_TIERING_UI không đặt ⇒ isTieringUiEnabled() = false', () => {
    expect(isTieringUiEnabled()).toBe(false);
  });
});

describe('catalog — gói thuê bao bị lọc khỏi cả hai service', () => {
  it('paymentService.listCatalogPackages chỉ còn gói credit (type 1)', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [oneTime, subscription], headers: {} });
    const items = await paymentService.listCatalogPackages();
    expect(items.map((p) => p.id)).toEqual(['pk-1']);
  });

  it('employerPaymentService.getPackages chỉ còn gói credit', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [oneTime, subscription], headers: {} });
    const items = await employerPaymentService.getPackages();
    expect(items.map((p) => p.id)).toEqual(['pk-1']);
  });
});

describe('/candidate/credits — thẻ "Thuê bao hiện tại" ẩn và KHÔNG gọi /me/subscription', () => {
  it('overview chỉ còn thẻ ví; getSubscription không được gọi', async () => {
    vi.mocked(apiClient.get).mockImplementation(((url: string) => {
      if (url === paymentEndpoints.walletAccount) return Promise.resolve({ data: { ownerType: 1, ownerId: 'u1', remainingCredits: 42, reservedCredits: 0, paymentMode: 0, status: 0, freeCreditsGranted: 3, walletExists: true, pendingFreeCredits: 0 }, headers: {} });
      if (url === paymentEndpoints.creditTransactions) return Promise.resolve({ data: [], headers: {} });
      if (url === paymentEndpoints.subscription) throw new Error('KHÔNG được gọi /me/subscription khi tiering UI tắt');
      return Promise.resolve({ data: [], headers: {} });
    }) as unknown as typeof apiClient.get);
    const subSpy = vi.spyOn(paymentService, 'getSubscription');
    wrap(<CreditsWalletPage />);
    await screen.findByText('payment.wallet.balanceLabel');
    expect(screen.queryByText('payment.wallet.subscriptionTitle')).not.toBeInTheDocument();
    // Gỡ gate JSX mà quên hook ⇒ khối thuê bao thành ô "không tải được" (query bị disabled) — phải bắt cả ca đó.
    expect(screen.queryByText('payment.result.loadError')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'payment.result.retry' })).not.toBeInTheDocument();
    expect(subSpy).not.toHaveBeenCalled();
  });
});

describe('admin — Gói & Tier chỉ còn Gói bán; Cấp chỉ còn credit; nav đổi nhãn', () => {
  beforeEach(() => {
    vi.spyOn(adminPaymentService, 'listPlans').mockResolvedValue([]);
    vi.spyOn(adminPaymentService, 'listPackages').mockResolvedValue([{ ...oneTime, createdAt: '2026-09-01T00:00:00Z' } as never]);
    vi.spyOn(adminDirectoryService, 'getAdminOrganizations').mockResolvedValue({ items: [], nextCursor: null } as never);
  });

  it('AdminPlansPage: không có tablist, tiêu đề "Gói bán", `?tab=plans` vẫn ra bảng gói; form tạo gói không có loại Thuê bao', async () => {
    wrap(<AdminPlansPage />, '/admin/plans?tab=plans');
    expect(await screen.findByRole('heading', { name: 'admin.plans.titlePackagesOnly' })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'admin.money.audience.b2c' })).not.toBeInTheDocument();
    await screen.findByText('Gói 5 credit');
    expect(screen.queryByRole('columnheader', { name: 'admin.plans.package.plan' })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'admin.plans.package.audience' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'admin.plans.createPackage' }));
    const typeSelect = await screen.findByLabelText('admin.plans.package.type');
    const options = within(typeSelect).getAllByRole('option').map((o) => o.getAttribute('value'));
    expect(options).toEqual(['1']);
  });

  it('AdminGrantsPage: có form cấp credit, KHÔNG có form cấp thuê bao', async () => {
    wrap(<AdminGrantsPage />, '/admin/grants');
    expect(await screen.findByRole('heading', { name: 'admin.grants.titleCreditOnly' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'admin.grants.credit.submit' })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'admin.grants.subscription.submit' })).not.toBeInTheDocument();
  });

  it('sidebar: mục Tiền vẫn đủ 4 link nhưng nhãn không nhắc tier/thuê bao', () => {
    render(<MemoryRouter initialEntries={['/admin/dashboard']}><AdminDashboardLayout /></MemoryRouter>);
    const nav = screen.getByRole('navigation', { name: 'Admin' });
    expect(within(nav).getByRole('link', { name: 'admin.nav.plansPackagesOnly' })).toHaveAttribute('href', '/admin/plans');
    expect(within(nav).getByRole('link', { name: 'admin.nav.grantsCreditOnly' })).toHaveAttribute('href', '/admin/grants');
    expect(within(nav).queryByRole('link', { name: 'admin.nav.plans' })).not.toBeInTheDocument();
  });
});
