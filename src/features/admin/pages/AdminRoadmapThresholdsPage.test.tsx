// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { adminRoadmapThresholdService } from '../services/adminRoadmapThreshold.service';
import type { RoadmapThreshold } from '../types/adminApi.types';
import { AdminRoadmapThresholdsPage } from './AdminRoadmapThresholdsPage';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

const row = (overrides: Partial<RoadmapThreshold> & { level: string }): RoadmapThreshold => ({
  effectivePct: 50, defaultPct: 50, isOverridden: false, updatedBy: null, updatedAt: null, isKnownLevel: true, ...overrides,
});

// Fresher: đã chỉnh NHƯNG trùng giá trị mặc định. Junior: KHÁC mặc định nhưng chưa ai chỉnh.
// Hai hàng này tồn tại để bắt đúng lỗi "suy isOverridden từ effectivePct !== defaultPct".
const rows: RoadmapThreshold[] = [
  row({ level: 'Fresher', effectivePct: 50, defaultPct: 50, isOverridden: true, updatedBy: 'admin@isas.local', updatedAt: '2026-08-20T09:00:00Z' }),
  row({ level: 'Junior', effectivePct: 65, defaultPct: 60, isOverridden: false }),
  row({ level: 'Senior', effectivePct: 80, defaultPct: 80, isOverridden: false }),
];

const apiError = (status: number, message = 'server said no') =>
  Object.assign(new Error('request failed'), { isAxiosError: true, response: { status, data: { message } } });

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}>
      <MemoryRouter><AdminRoadmapThresholdsPage /></MemoryRouter>
    </QueryClientProvider>,
  );

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminRoadmapThresholdsPage', () => {
  it('hiện đủ ba thông tin (đang hiệu lực · mặc định · đã chỉnh hay chưa) và nói rõ không hồi tố', async () => {
    vi.spyOn(adminRoadmapThresholdService, 'list').mockResolvedValue(rows);
    renderPage();

    expect(await screen.findByLabelText('admin.roadmapThresholds.column.effective Fresher')).toHaveValue(50);
    expect(screen.getByLabelText('admin.roadmapThresholds.column.effective Junior')).toHaveValue(65);
    expect(screen.getAllByText('admin.roadmapThresholds.overridden')).toHaveLength(1);
    expect(screen.getAllByText('admin.roadmapThresholds.usingDefault')).toHaveLength(2);
    // Thiếu câu này thì admin sửa xong đi tìm xem sao báo cáo cũ không đổi.
    expect(screen.getByText('admin.roadmapThresholds.notRetroactive')).toBeInTheDocument();
  });

  it('nút trả-về-mặc-định bám isOverridden của SERVER, không suy từ effectivePct !== defaultPct', async () => {
    vi.spyOn(adminRoadmapThresholdService, 'list').mockResolvedValue(rows);
    renderPage();

    // Fresher trùng mặc định nhưng vẫn là override -> phải có nút.
    expect(await screen.findByRole('button', { name: 'admin.roadmapThresholds.reset Fresher' }, { timeout: 5000 })).toBeInTheDocument();
    // Junior lệch mặc định nhưng chưa ai chỉnh -> KHÔNG được có nút.
    expect(screen.queryByRole('button', { name: 'admin.roadmapThresholds.reset Junior' })).not.toBeInTheDocument();
  });

  it('hàng mồ côi (isKnownLevel=false) hiện ra để dọn và không cho sửa giá trị', async () => {
    vi.spyOn(adminRoadmapThresholdService, 'list').mockResolvedValue([
      ...rows,
      row({ level: 'Intern', effectivePct: 30, defaultPct: 0, isOverridden: true, isKnownLevel: false }),
    ]);
    renderPage();

    expect(await screen.findByText('admin.roadmapThresholds.unknownLevel')).toBeInTheDocument();
    expect(screen.getByLabelText('admin.roadmapThresholds.column.effective Intern')).toBeDisabled();
    // Vẫn phải dọn được.
    expect(screen.getByRole('button', { name: 'admin.roadmapThresholds.reset Intern' })).toBeInTheDocument();
  });

  it('chỉ gửi cấp độ ĐÃ SỬA, và nạp thẳng kết quả PUT trả về (không gọi lại GET)', async () => {
    const list = vi.spyOn(adminRoadmapThresholdService, 'list').mockResolvedValue(rows);
    const update = vi.spyOn(adminRoadmapThresholdService, 'update').mockResolvedValue([
      rows[0], rows[1], row({ level: 'Senior', effectivePct: 95, defaultPct: 80, isOverridden: true }),
    ]);
    renderPage();

    fireEvent.change(await screen.findByLabelText('admin.roadmapThresholds.column.effective Senior'), { target: { value: '95' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.roadmapThresholds.save' }));

    await waitFor(() => expect(update).toHaveBeenCalledWith({ Senior: 95 }));
    await waitFor(() => expect(screen.getByLabelText('admin.roadmapThresholds.column.effective Senior')).toHaveValue(95));
    expect(screen.getByRole('button', { name: 'admin.roadmapThresholds.reset Senior' })).toBeInTheDocument();
    expect(list).toHaveBeenCalledTimes(1);
  });

  it('ngưỡng ngoài 0–100 bị chặn ngay tại chỗ, không gửi lên server', async () => {
    vi.spyOn(adminRoadmapThresholdService, 'list').mockResolvedValue(rows);
    const update = vi.spyOn(adminRoadmapThresholdService, 'update').mockResolvedValue(rows);
    renderPage();

    fireEvent.change(await screen.findByLabelText('admin.roadmapThresholds.column.effective Senior'), { target: { value: '150' } });
    expect(screen.getByText('admin.roadmapThresholds.invalidPct')).toBeInTheDocument();

    // Chốt bằng TRẠNG THÁI NÚT, không chỉ bằng "chưa ai gọi service": `mutate()` gọi
    // mutationFn ở tick SAU, nên `not.toHaveBeenCalled()` ngay sau click là đúng KỂ CẢ
    // khi nút đang bật — nó không chứng minh được gì. (Mutation M19 phát hiện.)
    const saveButton = screen.getByRole('button', { name: 'admin.roadmapThresholds.save' });
    expect(saveButton).toBeDisabled();
    fireEvent.click(saveButton);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(update).not.toHaveBeenCalled();
  });

  it('400 khi lưu và 404 khi trả về mặc định hiện hai thông điệp KHÁC nhau', async () => {
    vi.spyOn(adminRoadmapThresholdService, 'list').mockResolvedValue(rows);
    vi.spyOn(adminRoadmapThresholdService, 'update').mockRejectedValue(apiError(400, 'Fresher phải trong [0,100]'));
    vi.spyOn(adminRoadmapThresholdService, 'reset').mockRejectedValue(apiError(404));
    renderPage();

    fireEvent.change(await screen.findByLabelText('admin.roadmapThresholds.column.effective Senior'), { target: { value: '95' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.roadmapThresholds.save' }));
    // Thông điệp của server phải tới được admin, không nuốt.
    expect(await screen.findByText(/admin\.roadmapThresholds\.saveError\.400/)).toHaveTextContent('Fresher phải trong [0,100]');

    fireEvent.click(screen.getByRole('button', { name: 'admin.roadmapThresholds.reset Fresher' }));
    expect(await screen.findByText('admin.roadmapThresholds.resetError.404')).toBeInTheDocument();
  });
});
