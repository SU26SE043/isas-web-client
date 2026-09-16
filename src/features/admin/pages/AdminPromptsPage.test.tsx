// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { adminInterviewService } from '../services/adminInterview.service';
import { AdminPromptsPage } from './AdminPromptsPage';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

const prompt = { key: 'seniority.Senior.profile', version: 1, body: null };
const renderPage = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><MemoryRouter><AdminPromptsPage /></MemoryRouter></QueryClientProvider>);

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminPromptsPage', () => {
  it('shows loading state', () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockReturnValue(new Promise(() => undefined));
    renderPage();
    expect(screen.getByText('admin.prompts.loading')).toBeInTheDocument();
  });

  it('shows a forbidden error without retry', async () => {
    const error = new axios.AxiosError('Forbidden', 'ERR_BAD_REQUEST', undefined, undefined, { status: 403, statusText: 'Forbidden', headers: {}, config: {} as never, data: {} });
    vi.spyOn(adminInterviewService, 'listPrompts').mockRejectedValue(error);
    renderPage();
    expect(await screen.findByText('admin.prompts.forbidden')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'admin.prompts.retry' })).not.toBeInTheDocument();
  });

  it('shows the empty state', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('admin.prompts.emptyTitle')).toBeInTheDocument();
  });

  it('shows default badge and saves the selected prompt', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([prompt]);
    vi.spyOn(adminInterviewService, 'getPromptHistory').mockResolvedValue([]);
    const update = vi.spyOn(adminInterviewService, 'updatePrompt').mockResolvedValue({ ...prompt, body: 'new body', version: 2 });
    renderPage();
    expect((await screen.findAllByText('admin.prompts.defaultBadge')).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('admin.prompts.body'), { target: { value: 'new body' } });
    fireEvent.change(screen.getByLabelText(/admin\.prompts\.changeNote/), { target: { value: 'explain change' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.prompts.save' }));
    await waitFor(() => expect(update).toHaveBeenCalledWith('seniority.Senior.profile', { body: 'new body', changeNote: 'explain change' }));
  });

  it('ẨN 5 khoá chết (khai ở .NET nhưng không builder Python nào đọc) — sửa chúng không có tác dụng', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([
      prompt,
      { key: 'roadmap.guidance', version: 0, body: null },
      { key: 'lesson_theory.guidance', version: 0, body: null },
      { key: 'summarize_session.guidance', version: 0, body: null },
      { key: 'decide_next.guidance', version: 0, body: null },
      { key: 'criteria.guidance', version: 0, body: null },
      { key: 'questions.guidance', version: 1, body: 'Mỗi câu ≤ 20 từ.' },
    ]);
    vi.spyOn(adminInterviewService, 'getPromptHistory').mockResolvedValue([]);
    renderPage();
    expect((await screen.findAllByText('admin.prompts.key.questions.guidance')).length).toBeGreaterThan(0);
    for (const dead of ['roadmap.guidance', 'lesson_theory.guidance', 'summarize_session.guidance', 'decide_next.guidance', 'criteria.guidance']) {
      expect(screen.queryByText(dead)).not.toBeInTheDocument();
    }
    // Nhãn người đọc thay khoá máy ở sidebar; khoá máy chỉ còn ở header editor (font-mono).
    expect(screen.getByRole('button', { name: /admin\.prompts\.key\.seniority\.profile/ })).toBeInTheDocument();
  });

  it('khoá ĐẦU tự chọn cũng tải lịch sử (bản cũ: selectedKey khởi tạo rỗng ⇒ history disabled)', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([prompt]);
    const history = vi.spyOn(adminInterviewService, 'getPromptHistory').mockResolvedValue([
      { key: prompt.key, version: 1, body: 'x', updatedBy: '11111111-2222-3333-4444-555555555555', changeNote: 'lý do đổi', createdAt: '2026-09-16T01:02:03Z' },
    ]);
    renderPage();
    expect(await screen.findByText('lý do đổi')).toBeInTheDocument();
    expect(history).toHaveBeenCalledWith(prompt.key);
    // Không in Guid thô ra mặt admin.
    expect(screen.queryByText('11111111-2222-3333-4444-555555555555')).not.toBeInTheDocument();
    expect(screen.getByText('admin.prompts.adminActor')).toBeInTheDocument();
  });

  it('khe CHẤM mang cảnh báo "ảnh hưởng điểm số"; khe SINH thì không', async () => {
    vi.spyOn(adminInterviewService, 'listPrompts').mockResolvedValue([
      { key: 'scoring.extra_guidance', version: 0, body: null },
      { key: 'questions.guidance', version: 0, body: null },
    ]);
    vi.spyOn(adminInterviewService, 'getPromptHistory').mockResolvedValue([]);
    renderPage();
    // Sắp theo nhóm: questions trước scoring ⇒ khoá đầu là questions.guidance (không cảnh báo).
    await screen.findAllByText('admin.prompts.key.questions.guidance');
    expect(screen.queryByText('admin.prompts.riskHint.scoring')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /admin\.prompts\.key\.scoring\.extra_guidance/ }));
    expect(await screen.findByText('admin.prompts.riskHint.scoring')).toBeInTheDocument();
  });
});
