// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/shared/languages';
import type { EmployerCampaign } from '@/features/employer-campaigns/types/campaignManagement.types';
import { EmployerDashboardPage } from './EmployerDashboardPage';

let role = 'OrgAdmin';
vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) => selector({ user: { id: 'u1', role, orgName: 'NovaWorks' } }),
}));

const campaignsMock = vi.fn();
vi.mock('@/features/employer-campaigns/hooks/useEmployerCampaigns', () => ({
  useEmployerCampaigns: () => campaignsMock(),
}));
const accountMock = vi.fn();
vi.mock('@/features/employer-billing/hooks/useEmployerPaymentQueries', () => ({
  useEmployerPaymentAccount: () => accountMock(),
}));
const teamMock = vi.fn();
vi.mock('@/features/engagement/hooks/useEngagement', () => ({
  useEmployerTeam: () => teamMock(),
}));

function campaign(partial: Partial<EmployerCampaign> & Pick<EmployerCampaign, 'id' | 'status'>): EmployerCampaign {
  return { title: partial.id, updatedAt: '2026-09-01T00:00:00Z', createdAt: '2026-09-01T00:00:00Z', ...partial } as EmployerCampaign;
}
const campaigns = [
  campaign({ id: 'a', title: 'Backend .NET', status: 'active', invitedCount: 12, completedCount: 4 }),
  campaign({ id: 'b', title: 'Frontend', status: 'active', invitedCount: 9, completedCount: 1 }),
  campaign({ id: 'c', title: 'Nháp QA', status: 'draft', invitedCount: 0 }),
];

/** Thẻ StatCard chứa nhãn — assert trên cả thẻ vì nhãn và giá trị là hai <p> anh em khác cấp. */
function card(label: string): HTMLElement {
  return screen.getByText(label).closest('.rounded-xl') as HTMLElement;
}

function renderPage() {
  return render(
    <LanguageProvider>
      <MemoryRouter>
        <EmployerDashboardPage />
      </MemoryRouter>
    </LanguageProvider>,
  );
}

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  role = 'OrgAdmin';
  campaignsMock.mockReturnValue({ campaigns, isLoading: false, isError: false, errorStatus: undefined, reload: vi.fn() });
  accountMock.mockReturnValue({ data: { paymentMode: 0, remainingCredits: 7, periodUsage: null, creditLimit: null }, isError: false });
  teamMock.mockReturnValue({ team: [{ id: 1 }, { id: 2 }, { id: 3 }], isLoading: false, errorKey: null });
});

describe('EmployerDashboardPage — dữ liệu thật', () => {
  it('số liệu từ danh sách chiến dịch + ví: 2 đang mở (1 nháp) · 21 đã mời · 7 credit · 3 thành viên (OrgAdmin)', () => {
    renderPage();
    expect(card('Chiến dịch đang mở')).toHaveTextContent(/^Chiến dịch đang mở2 ?1 bản nháp$/);
    expect(card('Ứng viên đã mời')).toHaveTextContent(/Ứng viên đã mời21/);
    expect(card('Credit còn lại')).toHaveTextContent(/Credit còn lại7/);
    expect(card('Thành viên')).toHaveTextContent(/Thành viên3/);
    expect(screen.queryByText(/Độ hoàn thiện hồ sơ|Giai đoạn|Phase/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Không gian nhà tuyển dụng');
    expect(screen.getByText(/của NovaWorks/)).toBeInTheDocument();
  });

  it('HR (không phải OrgAdmin) không thấy thẻ Thành viên — thay bằng Đã hoàn thành, không gọi useEmployerTeam', () => {
    role = 'HrMember';
    renderPage();
    expect(screen.queryByText('Thành viên')).not.toBeInTheDocument();
    expect(card('Đã hoàn thành')).toHaveTextContent(/Đã hoàn thành5/);
    expect(teamMock).not.toHaveBeenCalled();
  });

  it('"Bước tiếp theo" đổi theo tín hiệu: ví trống → Nạp credit; chưa có chiến dịch → Tạo chiến dịch đầu tiên', () => {
    accountMock.mockReturnValue({ data: { paymentMode: 0, remainingCredits: 0, periodUsage: null, creditLimit: null }, isError: false });
    renderPage();
    expect(screen.getByRole('button', { name: /Nạp credit/ })).toHaveAttribute('href', '/employer/billing/packages');
    cleanup();
    campaignsMock.mockReturnValue({ campaigns: [], isLoading: false, isError: false, errorStatus: undefined, reload: vi.fn() });
    renderPage();
    expect(screen.getByRole('button', { name: /Tạo chiến dịch đầu tiên/ })).toHaveAttribute('href', '/employer/campaigns/new');
    expect(screen.getByText('Chưa có chiến dịch nào.')).toBeInTheDocument();
  });

  it('"Chiến dịch gần đây" liệt kê đúng tên + link overview; không còn CTA tới trang mock Hồ sơ công ty/Xác minh', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /Backend \.NET/ })).toHaveAttribute('href', '/employer/campaigns/a/overview');
    expect(screen.queryByRole('button', { name: /Hoàn thiện hồ sơ|Gửi xác minh/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Hoàn thiện hồ sơ|Gửi xác minh/)).not.toBeInTheDocument();
  });
});
