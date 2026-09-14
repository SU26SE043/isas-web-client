// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { PageHeader } from './PageHeader';

afterEach(cleanup);

describe('PageHeader', () => {
  it('h1 là heading-primary cỡ 2xl mobile / 3xl từ sm (không 4xl)', () => {
    render(<PageHeader title="Chiến dịch" />);
    const h1 = screen.getByRole('heading', { level: 1, name: 'Chiến dịch' });
    expect(h1.className).toMatch(/\bheading-primary\b/);
    expect(h1.className).toMatch(/\btext-2xl\b/);
    expect(h1.className).toMatch(/\bsm:text-3xl\b/);
    expect(h1.className).not.toMatch(/text-4xl/);
  });

  it('eyebrow · description · actions · backLink đều tuỳ chọn và render đúng chỗ', () => {
    render(
      <MemoryRouter>
        <PageHeader
          eyebrow="Tuyển dụng"
          title="Chiến dịch"
          description="Quản lý các đợt đánh giá."
          actions={<button type="button">Tạo</button>}
          backLink={{ to: '/employer/campaigns', label: 'Quay lại' }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('Tuyển dụng')).toBeInTheDocument();
    expect(screen.getByText('Quản lý các đợt đánh giá.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tạo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /quay lại/i })).toHaveAttribute('href', '/employer/campaigns');
  });

  it('không có eyebrow/description thì không render phần tử rỗng', () => {
    const { container } = render(<PageHeader title="Chỉ tiêu đề" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });
});
