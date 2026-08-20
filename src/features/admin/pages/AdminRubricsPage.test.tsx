// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { adminRubricService } from '../services/adminRubric.service';
import { AdminRubricsPage } from './AdminRubricsPage';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
const rubric = { category: 'Frontend', language: 'vi' as const, version: 1, criteria: [{ key: 'communication', name: 'Communication', levels: [0, 1, 2, 3, 4, 5].map((score) => ({ score, description: `level-${score}` })) }] };
const renderPage = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><MemoryRouter><AdminRubricsPage /></MemoryRouter></QueryClientProvider>);
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminRubricsPage', () => {
  it('shows the AI 502 error and warns before saving a new version', async () => {
    vi.spyOn(adminRubricService, 'list').mockResolvedValue([rubric]);
    vi.spyOn(adminRubricService, 'get').mockResolvedValue(rubric);
    vi.spyOn(adminRubricService, 'history').mockResolvedValue([]);
    vi.spyOn(adminRubricService, 'suggest').mockRejectedValue(new Error('502'));
    renderPage();
    expect(await screen.findByDisplayValue('level-0')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.suggest' }));
    expect(await screen.findByText(/admin.rubrics.suggestError/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'admin.rubrics.save' }));
    expect(await screen.findByText('admin.rubrics.saveDescription')).toBeInTheDocument();
    expect(screen.getByText('admin.rubrics.saveDescription')).toBeInTheDocument();
  });
});
