// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { StatCard, StatGrid } from './StatCard';

afterEach(cleanup);

describe('StatCard', () => {
  it('render nhãn · giá trị · ghi chú', () => {
    render(<StatCard label="Chiến dịch đang mở" value={12} hint="3 nháp" />);
    expect(screen.getByText('Chiến dịch đang mở')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3 nháp')).toBeInTheDocument();
  });

  it('tone chỉ tô GIÁ TRỊ, không tô nền/viền thẻ (UI monochrome)', () => {
    const { container } = render(<StatCard label="Đạt" value="8" tone="success" />);
    expect(screen.getByText('8').className).toMatch(/\btext-success\b/);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toMatch(/\b(bg|border)-success/);
    expect(root.className).toMatch(/\bframe-satin\b/);
  });

  it('có `to` → thẻ là link tới trang chi tiết', () => {
    render(
      <MemoryRouter>
        <StatCard label="Credit" value="5" to="/candidate/credits" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/candidate/credits');
  });

  it('`aside` thay chỗ icon (badge trạng thái) và `size="sm"` giảm cỡ giá trị', () => {
    const { container } = render(<StatCard label="Phiên" value="3" size="sm" aside={<span data-testid="badge">OK</span>} icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="icon"]')).toBeNull();
    expect(screen.getByText('3').className).toMatch(/\btext-xl\b/);
  });
});

describe('StatGrid', () => {
  it('2 cột từ mobile với mọi số cột', () => {
    const { container } = render(
      <StatGrid columns={5}>
        <span />
      </StatGrid>,
    );
    expect((container.firstElementChild as HTMLElement).className).toMatch(/\bgrid-cols-2\b/);
    expect((container.firstElementChild as HTMLElement).className).toMatch(/\blg:grid-cols-5\b/);
  });
});
