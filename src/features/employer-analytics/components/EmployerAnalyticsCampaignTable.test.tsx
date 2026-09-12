// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmployerAnalyticsCampaignRow } from '../types/employerAnalytics.types';
import { EmployerAnalyticsCampaignTable } from './EmployerAnalyticsCampaignTable';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));

afterEach(cleanup);

const row = (id: string, title: string, n: Partial<EmployerAnalyticsCampaignRow> = {}): EmployerAnalyticsCampaignRow => ({
  campaignId: id, title, status: 'Draft', createdAt: '2026-09-01T00:00:00Z',
  invited: 0, joined: 0, started: 0, scored: 0, passed: 0, medianScore: null, ...n,
});
// 1 chiến dịch có phễu · 2 bản nháp toàn 0 — số CỐ Ý bất đối xứng để "lọc đúng" khác "không lọc".
const rows = [row('a', 'Có ứng viên', { invited: 3, joined: 1 }), row('b', 'Nháp một'), row('c', 'Nháp hai')];
const renderTable = (data = rows) => render(<MemoryRouter><EmployerAnalyticsCampaignTable rows={data} /></MemoryRouter>);

describe('Bảng theo từng chiến dịch — ẩn chiến dịch chưa có ứng viên theo mặc định', () => {
  it('mặc định chỉ hiện chiến dịch có hoạt động, kèm công tắc ghi đúng số bản còn ẩn (2)', () => {
    renderTable();
    expect(screen.getByRole('link', { name: 'Có ứng viên' })).toBeInTheDocument();
    expect(screen.queryByText('Nháp một')).not.toBeInTheDocument();
    expect(screen.getByLabelText('employerAnalytics.campaigns.showIdle'.replace('{{count}}', '2'))).not.toBeChecked();
  });

  it('bật công tắc ⇒ hiện đủ 3 dòng; tắt lại ⇒ về 1', () => {
    renderTable();
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);
    expect(screen.getAllByRole('row')).toHaveLength(1 + 3);
    expect(screen.getByText('Nháp hai')).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.getAllByRole('row')).toHaveLength(1 + 1);
  });

  it('mọi chiến dịch đều trống ⇒ câu "chưa chiến dịch nào có ứng viên" + công tắc, KHÔNG phải câu "chưa có chiến dịch"', () => {
    renderTable([row('b', 'Nháp một'), row('c', 'Nháp hai')]);
    expect(screen.getByText('employerAnalytics.campaigns.allIdle')).toBeInTheDocument();
    expect(screen.queryByText('employerAnalytics.campaigns.empty')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('không có chiến dịch nào ⇒ câu "chưa có chiến dịch", không có công tắc', () => {
    renderTable([]);
    expect(screen.getByText('employerAnalytics.campaigns.empty')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
