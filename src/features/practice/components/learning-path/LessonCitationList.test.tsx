// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

import { LessonCitationList, normalizeCitations } from './LessonCitationList';

const cite = (sourceUrl: string, sourceTitle: string, chunkId = 'c1') => ({
  chunkId,
  sourceUrl,
  sourceTitle,
});

afterEach(() => cleanup());

describe('normalizeCitations', () => {
  it('giữ nguyên tên nguồn và URL http(s)', () => {
    expect(normalizeCitations([cite('https://developer.mozilla.org/aria', 'MDN — ARIA')])).toEqual([
      { key: 'https://developer.mozilla.org/aria', label: 'MDN — ARIA', href: 'https://developer.mozilla.org/aria' },
    ]);
  });

  it('gộp trùng theo URL — cite nhiều chunk cùng một trang chỉ hiện một dòng', () => {
    const items = normalizeCitations([
      cite('https://scrumguides.org/', 'Scrum Guide', 'c1'),
      cite('https://scrumguides.org/', 'Scrum Guide', 'c2'),
    ]);
    expect(items).toHaveLength(1);
  });

  it('URL không mở được thì vẫn giữ tên nguồn, chỉ bỏ link', () => {
    expect(normalizeCitations([cite('javascript:alert(1)', 'Nguồn lạ')])).toEqual([
      { key: 'javascript:alert(1)', label: 'Nguồn lạ', href: null },
    ]);
  });

  it('thiếu tên thì lấy hostname làm nhãn, không để trống', () => {
    expect(normalizeCitations([cite('https://www.nngroup.com/articles/x', '')])[0]?.label).toBe('nngroup.com');
  });

  it('mục không có cả tên lẫn URL thì bỏ — không kiểm chứng được gì', () => {
    expect(normalizeCitations([cite('', '')])).toEqual([]);
  });

  it('null và [] đều ra danh sách rỗng', () => {
    expect(normalizeCitations(null)).toEqual([]);
    expect(normalizeCitations(undefined)).toEqual([]);
    expect(normalizeCitations([])).toEqual([]);
  });
});

describe('LessonCitationList', () => {
  it('render mỗi nguồn thành một link mở tab mới, an toàn', () => {
    render(
      <LessonCitationList
        citations={[
          cite('https://developer.mozilla.org/aria', 'MDN — ARIA'),
          cite('https://scrumguides.org/', 'Scrum Guide', 'c2'),
        ]}
      />,
    );
    const link = screen.getByRole('link', { name: 'MDN — ARIA' });
    expect(link).toHaveAttribute('href', 'https://developer.mozilla.org/aria');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('link', { name: 'Scrum Guide' })).toBeInTheDocument();
    expect(screen.queryByText('practice.learningPath.citationsEmpty')).not.toBeInTheDocument();
  });

  it('citations = null → NÓI RÕ là chưa có nguồn kiểm chứng, không im lặng', () => {
    render(<LessonCitationList citations={null} />);
    expect(screen.getByText('practice.learningPath.citationsEmpty')).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('citations = [] (corpus không phủ) → cũng nói rõ là chưa có nguồn', () => {
    render(<LessonCitationList citations={[]} />);
    expect(screen.getByText('practice.learningPath.citationsEmpty')).toBeInTheDocument();
  });

  it('CÓ nguồn thì KHÔNG được hiện nhãn "chưa có nguồn"', () => {
    render(<LessonCitationList citations={[cite('https://developer.mozilla.org/aria', 'MDN — ARIA')]} />);
    expect(screen.queryByText('practice.learningPath.citationsEmpty')).not.toBeInTheDocument();
    expect(screen.getByText('practice.learningPath.citationsHint')).toBeInTheDocument();
  });

  it('luôn có tiêu đề khối riêng — không lẫn vào khối tài nguyên học thêm', () => {
    render(<LessonCitationList citations={[]} />);
    expect(screen.getByRole('heading', { name: 'practice.learningPath.citationsTitle' })).toBeInTheDocument();
    expect(screen.queryByText('practice.learningPath.resourcesTitle')).not.toBeInTheDocument();
  });
});
