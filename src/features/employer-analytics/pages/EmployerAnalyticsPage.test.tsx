import '@testing-library/jest-dom/vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/shared/languages';
import { employerAnalyticsService } from '../services/employerAnalytics.service';
import { parseEmployerAnalytics } from '../utils/employerAnalyticsApi';
import { buildAnalyticsPayload, buildEmptyAnalyticsPayload } from '../utils/employerAnalyticsTestFixture';
import { EmployerAnalyticsPage } from './EmployerAnalyticsPage';

vi.mock('../services/employerAnalytics.service', () => ({
  employerAnalyticsService: { getEmployerAnalytics: vi.fn() },
}));

const service = vi.mocked(employerAnalyticsService);

function httpError(status: number) {
  return new AxiosError('x', undefined, undefined, undefined, {
    status, statusText: 'x', headers: {}, config: { headers: new AxiosHeaders() }, data: {},
  });
}

function renderPage() {
  // retryDelay 0: hook tự quyết `retry` (500 ⇒ 2 lần), client chỉ bỏ độ trễ để test không chờ 3s thật.
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, retryDelay: 0 } } })}>
      <LanguageProvider>
        <MemoryRouter initialEntries={['/employer/analytics']}>
          <EmployerAnalyticsPage />
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

function statCard(label: string) {
  const stats = within(screen.getByTestId('employer-analytics-stats'));
  return stats.getByText(label).closest('[class*="rounded-xl"]') as HTMLElement;
}

beforeEach(() => {
  vi.resetAllMocks();
  window.localStorage.clear();
});
afterEach(() => cleanup());

describe('EmployerAnalyticsPage', () => {
  it('đang tải ⇒ skeleton, chưa có thẻ số', () => {
    service.getEmployerAnalytics.mockReturnValue(new Promise(() => undefined));
    renderPage();
    expect(screen.getByTestId('employer-analytics-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Chiến dịch đang mở')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Phân tích tuyển dụng' })).toBeInTheDocument();
  });

  it('403 ⇒ "phiên không thuộc tổ chức" + nút thử lại gọi lại service', async () => {
    service.getEmployerAnalytics.mockRejectedValueOnce(httpError(403));
    renderPage();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Phiên đăng nhập không thuộc tổ chức nào');
    service.getEmployerAnalytics.mockResolvedValueOnce(parseEmployerAnalytics(buildAnalyticsPayload()));
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    await screen.findByText('Chiến dịch đang mở');
    expect(service.getEmployerAnalytics).toHaveBeenCalledTimes(2);
  });

  it('400 ⇒ kỳ không hợp lệ; lỗi khác ⇒ câu lỗi tải', async () => {
    service.getEmployerAnalytics.mockRejectedValueOnce(httpError(400));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Kỳ không hợp lệ');
    cleanup();
    service.getEmployerAnalytics.mockRejectedValue(httpError(500));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Không tải được số liệu phân tích');
    // 500 được thử lại 2 lần rồi mới báo lỗi (hook), 400 thì không.
    expect(service.getEmployerAnalytics).toHaveBeenCalledTimes(1 + 3);
  });

  it('thành công ⇒ 6 thẻ đúng số liệu (tỷ lệ đạt không tính undetermined, trung vị 1 chữ số)', async () => {
    service.getEmployerAnalytics.mockResolvedValue(parseEmployerAnalytics(buildAnalyticsPayload()));
    renderPage();
    await screen.findByText('Chiến dịch đang mở');
    expect(statCard('Chiến dịch đang mở')).toHaveTextContent('5');
    expect(statCard('Chiến dịch đang mở')).toHaveTextContent('23 chiến dịch, 12 bản nháp');
    expect(statCard('Đã mời')).toHaveTextContent('50');
    expect(statCard('Đã vào thi')).toHaveTextContent('30');
    expect(statCard('Đã chấm')).toHaveTextContent('20');
    expect(statCard('Đã chấm')).toHaveTextContent('2 đã nộp, chờ chấm');
    expect(statCard('Tỷ lệ đạt')).toHaveTextContent('66,7%');
    expect(statCard('Tỷ lệ đạt')).toHaveTextContent('12 đạt · 6 không đạt · 2 chưa có ngưỡng');
    expect(statCard('Điểm trung vị')).toHaveTextContent('55,5');
    expect(screen.getByTestId('employer-analytics-range')).toHaveTextContent('theo giờ UTC');
  });

  it('thành công ⇒ phễu, cờ (nhãn dịch + cờ lạ in nguyên tên), bảng chiến dịch link tới overview', async () => {
    service.getEmployerAnalytics.mockResolvedValue(parseEmployerAnalytics(buildAnalyticsPayload()));
    renderPage();
    await screen.findByText('Chiến dịch đang mở');

    const funnel = within(screen.getByTestId('employer-analytics-funnel-table'));
    expect(funnel.getAllByRole('row').map((row) => row.textContent)).toEqual([
      'Mời50', 'Tham gia30', 'Bắt đầu25', 'Hoàn thành22', 'Đã chấm20', 'Đạt12',
    ]);
    expect(screen.getByText(/Lời mời: 40 đã gửi · 1 chờ gửi · 5 hết hạn · 4 đã thu hồi/)).toBeInTheDocument();

    expect(screen.getByText('Rời tab thi')).toBeInTheDocument();
    expect(screen.getByText('Khuôn mặt không khớp')).toBeInTheDocument();
    expect(screen.getByText('weird_new_signal')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Backend Engineer' });
    expect(link).toHaveAttribute('href', '/employer/campaigns/c-1/overview');
    // c-2 toàn số 0 ⇒ mặc định bị ẩn (bảng chỉ hiện chiến dịch có ứng viên); bật công tắc mới thấy — tiền đề
    // đổi có chủ đích khi thêm công tắc, KHÔNG phải test nới ra cho xanh.
    expect(screen.queryByRole('link', { name: 'Chiến dịch chưa đặt tên' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: /chưa có ứng viên/ }));
    expect(screen.getByRole('link', { name: 'Chiến dịch chưa đặt tên' })).toHaveAttribute('href', '/employer/campaigns/c-2/overview');
    expect(screen.getByText('SQL')).toBeInTheDocument();
    expect(screen.getByText('Cao')).toBeInTheDocument();
  });

  it('bucket thiếu được điền 0: kỳ 30 ngày nhóm theo ngày ⇒ bảng xu hướng đủ 30 dòng', async () => {
    service.getEmployerAnalytics.mockResolvedValue(parseEmployerAnalytics(buildAnalyticsPayload()));
    renderPage();
    await screen.findByText('Chiến dịch đang mở');
    const rows = within(screen.getByTestId('employer-analytics-trend-table')).getAllByRole('row');
    // 1 dòng tiêu đề + 30 ngày [2026-08-14, 2026-09-13)
    expect(rows).toHaveLength(31);
  });

  it('đổi nhóm sang tháng khi kỳ mới CHƯA về ⇒ vẫn vẽ lưới NGÀY của dữ liệu cũ (không trộn hai lưới) + báo đang tải', async () => {
    service.getEmployerAnalytics
      .mockResolvedValueOnce(parseEmployerAnalytics(buildAnalyticsPayload()))
      .mockReturnValueOnce(new Promise(() => undefined));
    renderPage();
    await screen.findByText('Chiến dịch đang mở');
    fireEvent.change(screen.getByLabelText('Nhóm theo'), { target: { value: 'month' } });
    await waitFor(() => expect(screen.getByTestId('employer-analytics-range')).toHaveTextContent('Đang tải kỳ mới'));
    // keepPreviousData giữ payload `granularity: 'day'` ⇒ lưới vẫn 30 ngày; điền theo select 'month'
    // sẽ ra 2 mốc tháng + 2 bucket ngày của BE = lưới trộn.
    const rows = within(screen.getByTestId('employer-analytics-trend-table')).getAllByRole('row');
    expect(rows).toHaveLength(31);
  });

  it('org chưa có chiến dịch ⇒ empty-state có link Tạo chiến dịch, không thẻ số', async () => {
    service.getEmployerAnalytics.mockResolvedValue(parseEmployerAnalytics(buildEmptyAnalyticsPayload()));
    renderPage();
    await screen.findByText('Tổ chức chưa có chiến dịch nào');
    // `Button render={<Link/>}` gắn role="button" lên <a> ⇒ tìm theo role button rồi kiểm href.
    expect(screen.getByRole('button', { name: 'Tạo chiến dịch' })).toHaveAttribute('href', '/employer/campaigns/new');
    expect(screen.queryByText('Chiến dịch đang mở')).not.toBeInTheDocument();
  });

  it('đổi kỳ / nhóm ⇒ gọi service với from/to ISO UTC mới và groupBy mới', async () => {
    service.getEmployerAnalytics.mockResolvedValue(parseEmployerAnalytics(buildAnalyticsPayload()));
    renderPage();
    await screen.findByText('Chiến dịch đang mở');
    const first = service.getEmployerAnalytics.mock.calls[0]![0]!;
    expect(first.groupBy).toBe('day');
    expect(first.from).toMatch(/T00:00:00\.000Z$/);
    expect(first.to).toMatch(/T00:00:00\.000Z$/);
    expect(Date.parse(first.to!) - Date.parse(first.from!)).toBe(30 * 24 * 60 * 60 * 1000);

    fireEvent.change(screen.getByLabelText('Nhóm theo'), { target: { value: 'month' } });
    await waitFor(() => expect(service.getEmployerAnalytics).toHaveBeenLastCalledWith(expect.objectContaining({ groupBy: 'month' })));

    fireEvent.change(screen.getByLabelText('Kỳ'), { target: { value: '90d' } });
    await waitFor(() => {
      const last = service.getEmployerAnalytics.mock.calls.at(-1)![0]!;
      expect(Date.parse(last.to!) - Date.parse(last.from!)).toBe(90 * 24 * 60 * 60 * 1000);
    });
  });
});
