import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/shared/languages';
import type { EmployerCampaign } from '../../types/campaignManagement.types';
import { EmailInviteCampaignSummary } from './EmailInviteCampaignSummary';

afterEach(() => cleanup());

const campaign = {
  id: 'c-1',
  title: 'Backend .NET',
  status: 'active',
  capacity: 5,
  deadline: '2026-09-21T13:45:00Z',
  startsAt: '2026-09-11T13:48:00Z',
  domain: 'Backend',
} as unknown as EmployerCampaign;

describe('EmailInviteCampaignSummary', () => {
  // Hai trạng thái để bắt cả phép "ghi cứng khoá status.active" (fixture một trạng thái thì mutation
  // đó XANH). Nhãn mong đợi lấy TỪ badge cùng màn — không ghi cứng chuỗi dịch để đổi copy không đỏ oan.
  it.each(['active', 'closed'] as const)('trạng thái %s: hàng "Trạng thái" hiện đúng nhãn của badge, không in chuỗi thô', (status) => {
    render(
      <LanguageProvider>
        <EmailInviteCampaignSummary campaign={{ ...campaign, status } as EmployerCampaign} />
      </LanguageProvider>,
    );
    const badge = screen.getAllByText((_, el) => el?.tagName === 'SPAN' && /Đang mở|Đã đóng|Bản nháp|Đã lưu trữ|Lên lịch|Đã kết thúc/.test(el.textContent ?? '')).at(0);
    expect(badge).toBeDefined();
    const label = badge!.textContent!.trim();
    // Trước bản vá: hàng "Trạng thái" in nguyên 'active' ngay dưới badge đã dịch.
    expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(new RegExp(`^${status}$`))).toBeNull();
  });
});
