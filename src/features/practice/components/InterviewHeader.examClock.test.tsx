// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { InterviewHeader } from './InterviewHeader';

vi.mock('../../../shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));
vi.mock('@/components/BrandLogo', () => ({ BrandLogo: () => <span>logo</span> }));

afterEach(() => cleanup());

/**
 * ATT1-F4 CẤM đổi phòng B2C luyện tập. Hai chuỗi dưới lấy NGUYÊN VĂN từ db8ec0e1 (trước F4):
 * `git show db8ec0e1:src/features/practice/components/InterviewHeader.tsx`. Không có slot đồng hồ ⇒
 * header phải render y hệt — thêm class (dù chỉ flex-wrap) là đổi bố cục B2C.
 */
const HEADER_CLASS_BEFORE_F4 =
  'sticky top-0 z-50 flex items-center justify-between border-b border-satin bg-surface-raised/95 px-4 py-3 backdrop-blur-md sm:px-6';
const LEFT_CLASS_BEFORE_F4 = 'flex min-w-0 items-center gap-4 sm:gap-6';

function renderHeader(examClock?: React.ReactNode) {
  return render(
    <MemoryRouter>
      <InterviewHeader sessionId="s1" isRecording={false} examClock={examClock} />
    </MemoryRouter>,
  );
}

describe('InterviewHeader — slot đồng hồ cả buổi (ATT1-F4)', () => {
  it.each([
    ['vắng', undefined],
    ['null', null],
  ])('slot %s (B2C) ⇒ header + khối trái giữ ĐÚNG class trước F4, không thêm khối nào', (_label, slot) => {
    renderHeader(slot);
    const header = screen.getByRole('banner');

    expect(header.className).toBe(HEADER_CLASS_BEFORE_F4);
    expect(header.children).toHaveLength(2);
    expect((header.children[0] as HTMLElement).className).toBe(LEFT_CLASS_BEFORE_F4);
  });

  it('có slot (phòng thi B2B) ⇒ slot được render trong header', () => {
    renderHeader(<span data-testid="exam-clock-slot">24:13</span>);
    const header = screen.getByRole('banner');

    expect(within(header).getByTestId('exam-clock-slot')).toHaveTextContent('24:13');
    expect(header.children).toHaveLength(3);
  });
});
