// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/shared/languages';
import { CampaignFilters } from './CampaignFilters';

afterEach(cleanup);

describe('CampaignFilters — một bộ lọc trạng thái duy nhất', () => {
  it('không còn <select> trạng thái đứng cạnh nhóm chip; chip có đủ 6 trạng thái', () => {
    render(
      <LanguageProvider>
        <CampaignFilters value={{ query: '', status: 'all' }} onChange={() => undefined} />
      </LanguageProvider>,
    );
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    const chips = screen.getAllByRole('button');
    expect(chips).toHaveLength(6);
    expect(chips.map((chip) => chip.textContent)).toEqual(['Tất cả trạng thái', 'Đang mở', 'Bản nháp', 'Tạm dừng', 'Đã kết thúc', 'Đã lưu trữ']);
  });

  it('bấm chip → onChange với status tương ứng; chip đang chọn có aria-pressed', () => {
    const onChange = vi.fn();
    render(
      <LanguageProvider>
        <CampaignFilters value={{ query: 'abc', status: 'active' }} onChange={onChange} />
      </LanguageProvider>,
    );
    expect(screen.getByRole('button', { name: 'Đang mở' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Đã kết thúc' }));
    expect(onChange).toHaveBeenCalledWith({ query: 'abc', status: 'closed' });
  });
});
