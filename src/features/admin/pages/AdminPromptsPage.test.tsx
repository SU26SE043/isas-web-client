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

const prompt = { key: 'seniority.frontend.senior', version: 1, body: null };
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
    expect(await screen.findByText('admin.prompts.defaultBadge')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('admin.prompts.body'), { target: { value: 'new body' } });
    fireEvent.change(screen.getByLabelText(/admin\.prompts\.changeNote/), { target: { value: 'explain change' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.prompts.save' }));
    await waitFor(() => expect(update).toHaveBeenCalledWith('seniority.frontend.senior', { body: 'new body', changeNote: 'explain change' }));
  });
});
