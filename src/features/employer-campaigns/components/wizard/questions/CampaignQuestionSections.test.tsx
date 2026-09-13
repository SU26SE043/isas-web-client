/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignQuestion } from '../../../types/campaignManagement.types';
import { CampaignQuestionSections } from './CampaignQuestionSections';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
afterEach(() => cleanup());

const q = (id: string, prompt = `Prompt ${id}`): CampaignQuestion => ({ id, prompt, skill: '', difficulty: 'middle', source: 'manual', isRequired: true });
const handlers = { onChangePrompt: vi.fn(), onToggleRequired: vi.fn(), onChangeGroup: vi.fn(), onMoveQuestion: vi.fn(), onRemoveQuestion: vi.fn() };
const panelOf = (id: string) => document.getElementById(`question-card-${id}`)?.querySelector('[data-testid="question-card-panel"]') as HTMLElement;

describe('CampaignQuestionSections — trạng thái mở/đóng cục bộ + deep-link', () => {
  it('mặc định chỉ MỘT card mở (card đầu); bấm hàng đầu card 2 ⇒ mở thêm; bấm lại card 1 ⇒ đóng', () => {
    render(<CampaignQuestionSections questions={[q('a'), q('b'), q('c')]} isDraft drawMode={false} {...handlers} />);
    expect(panelOf('a')).not.toHaveAttribute('hidden');
    expect(panelOf('b')).toHaveAttribute('hidden');
    expect(panelOf('c')).toHaveAttribute('hidden');
    fireEvent.click(screen.getByRole('button', { name: /Prompt b/ }));
    expect(panelOf('b')).not.toHaveAttribute('hidden');
    fireEvent.click(screen.getByRole('button', { name: /Prompt a/ }));
    expect(panelOf('a')).toHaveAttribute('hidden');
  });

  it('deep-link ?question=<id>: mở ĐÚNG card đó (card đầu đóng) + scrollIntoView; id lạ ⇒ bỏ qua, mở card đầu', () => {
    const scrollSpy = vi.fn();
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = scrollSpy;
    try {
      const { unmount } = render(<CampaignQuestionSections questions={[q('a'), q('b'), q('c')]} isDraft drawMode={false} initialOpenQuestionId="c" {...handlers} />);
      expect(panelOf('c')).not.toHaveAttribute('hidden');
      expect(panelOf('a')).toHaveAttribute('hidden');
      expect(scrollSpy).toHaveBeenCalledTimes(1);
      unmount();
      scrollSpy.mockClear();
      render(<CampaignQuestionSections questions={[q('a'), q('b')]} isDraft drawMode={false} initialOpenQuestionId="khong-ton-tai" {...handlers} />);
      expect(panelOf('a')).not.toHaveAttribute('hidden');
      expect(panelOf('b')).toHaveAttribute('hidden');
      expect(scrollSpy).not.toHaveBeenCalled();
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });

  it('câu mới thêm với prompt RỖNG tự mở; gõ ký tự đầu không làm nó đóng lại', () => {
    const { rerender } = render(<CampaignQuestionSections questions={[q('a')]} isDraft drawMode={false} {...handlers} />);
    rerender(<CampaignQuestionSections questions={[q('a'), q('new', '')]} isDraft drawMode={false} {...handlers} />);
    expect(panelOf('new')).not.toHaveAttribute('hidden');
    rerender(<CampaignQuestionSections questions={[q('a'), q('new', 'C')]} isDraft drawMode={false} {...handlers} />);
    expect(panelOf('new')).not.toHaveAttribute('hidden');
  });

  it('không previewCtx ⇒ card thường (không panel chấm thử, không cần QueryClient); không rubric ⇒ không picker', () => {
    render(<CampaignQuestionSections questions={[q('a')]} isDraft drawMode={false} {...handlers} />);
    expect(screen.queryByTestId('question-preview-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('question-scope-picker')).not.toBeInTheDocument();
  });
});
