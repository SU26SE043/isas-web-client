import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CampaignJobNeed } from '../types/campaign.api.types';
import { CampaignJobNeedsCard } from './CampaignJobNeedsCard';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (k: string) => k, language: 'vi' }) }));

const need = (text: string): CampaignJobNeed => ({ needId: text, category: 'Technical', text });

// Thẻ này giữ nháp cục bộ (`useState(initialNeeds)`) cho bản SỬA ĐƯỢC. Route employer là
// `campaigns/:id/overview` — đổi chiến dịch A→B giữ NGUYÊN route pattern, nên React tái dùng
// instance và nháp của A sống sót sang B. Hại không dừng ở hiển thị: `save()` gửi `localNeeds`
// lên `campaignId` HIỆN TẠI bằng PUT replace-all ⇒ điều kiện sàng CV của B bị thay bằng của A.
// Cách chữa theo tài liệu React ("Resetting state with a key prop"), KHÔNG phải useEffect.
describe('CampaignJobNeedsCard — đổi chiến dịch phải reset nháp', () => {
  it('nháp của chiến dịch trước KHÔNG sống sót sang chiến dịch sau', () => {
    const { rerender } = render(
      <CampaignJobNeedsCard key="camp-a" campaignId="camp-a" initialNeeds={[need('nhu-cau-cua-A')]} editable />,
    );
    expect(screen.getByText('nhu-cau-cua-A')).toBeTruthy();

    rerender(
      <CampaignJobNeedsCard key="camp-b" campaignId="camp-b" initialNeeds={[need('nhu-cau-cua-B')]} editable />,
    );
    expect(screen.getByText('nhu-cau-cua-B')).toBeTruthy();
    expect(screen.queryByText('nhu-cau-cua-A')).toBeNull();
  });

  // Hàng rào thật: `key` là trách nhiệm của NƠI GỌI, nên chỗ gọi thứ ba quên là bug quay lại
  // trong im lặng. Quét mã nguồn để quên = ĐỎ, không phải = phát hiện sau khi đã hỏng dữ liệu.
  it('mọi nơi mount thẻ này đều truyền key', () => {
    const sourceFiles = import.meta.glob('/src/features/employer-campaigns/**/*.tsx', {
      query: '?raw', import: 'default', eager: true,
    }) as Record<string, string>;

    const sites = Object.entries(sourceFiles).filter(
      ([file, src]) => !file.includes('.test.') && src.includes('<CampaignJobNeedsCard'),
    );

    const missing = sites.flatMap(([file, src]) =>
      src
        .split('<CampaignJobNeedsCard')
        .slice(1)
        .filter((tag: string) => !/^\s+key=/.test(tag))
        .map(() => file),
    );
    expect(missing, `thiếu key ở: ${missing.join(', ')}`).toEqual([]);
    // đối chứng dương: phép quét phải thật sự tìm thấy chỗ mount, không phải "0 vi phạm" rỗng tuếch
    expect(sites.length).toBe(2);
  });
});
