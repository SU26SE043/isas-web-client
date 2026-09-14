// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SectionPanel } from './section-panel';

afterEach(cleanup);

/**
 * Đầu mục panel chỉ được có MỘT dấu hiệu (chip icon tuỳ chọn).
 * Bộ test này khoá việc gỡ thanh dọc `before:` cạnh <h2> — thứ vốn chồng lên
 * chip icon và đẩy title lệch 16px so với description.
 */
describe('SectionPanel header', () => {
  it('không vẽ thanh dọc trang trí cạnh tiêu đề', () => {
    render(
      <SectionPanel icon={<span data-testid="icon" />} title="Chọn CV">
        <p>body</p>
      </SectionPanel>,
    );

    const heading = screen.getByRole('heading', { name: 'Chọn CV' });
    const className = heading.getAttribute('class') ?? '';

    expect(className).not.toMatch(/\bbefore:/);
    expect(className).not.toMatch(/\bpl-4\b/);
    expect(className).not.toMatch(/\brelative\b/);
  });

  it('title và description dùng chung một mép trái (không thụt lề riêng)', () => {
    render(
      <SectionPanel icon={<span />} title="Chọn CV" description="Mô tả bước">
        <p>body</p>
      </SectionPanel>,
    );

    const heading = screen.getByRole('heading', { name: 'Chọn CV' });
    const description = screen.getByText('Mô tả bước');

    // Cùng một khối text; không bên nào được tự thêm padding/margin trái.
    expect(heading.parentElement).toBe(description.parentElement);
    expect(heading.getAttribute('class') ?? '').not.toMatch(/\b[pm]l-\d/);
    expect(description.getAttribute('class') ?? '').not.toMatch(/\b[pm]l-\d/);
  });

  it('có icon thì hiện chip, không icon thì tiêu đề đứng một mình', () => {
    const { unmount } = render(
      <SectionPanel icon={<span data-testid="icon" />} title="Có icon">
        <p>body</p>
      </SectionPanel>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    unmount();

    render(
      <SectionPanel title="Không icon">
        <p>body</p>
      </SectionPanel>,
    );
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Không icon' })).toBeInTheDocument();
  });
});
