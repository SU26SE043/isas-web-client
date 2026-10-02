// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CandidateRubricsPage } from './CandidateRubricsPage';

const mocks = vi.hoisted(() => ({ getRubric: vi.fn(), getDefaultRubric: vi.fn(), resetRubric: vi.fn() }));

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key === 'rubrics.defaultUpdated.banner' ? 'Default rubric updated to version {version}' : key, language: 'en', setLanguage: vi.fn() }) }));
vi.mock('@/shared/hooks/usePageTitle', () => ({ usePageTitle: vi.fn() }));
vi.mock('../services/candidateRubrics.service', () => ({
  getRubric: (...args: unknown[]) => mocks.getRubric(...args),
  getDefaultRubric: (...args: unknown[]) => mocks.getDefaultRubric(...args),
  resetRubric: (...args: unknown[]) => mocks.resetRubric(...args),
  updateRubric: vi.fn(),
  getRubricErrorStatus: () => undefined,
  isRubricValidationError: () => false,
}));

const level = (descriptor: string) => [{ score: 0, descriptor }, { score: 5, descriptor: `Strong: ${descriptor}` }];
const defaultRubric = {
  jobCategory: 'BE' as const, isCustom: false, defaultVersion: 3, basedOnDefaultVersion: null,
  criteria: [{ id: 'c-1', name: 'Communication', description: 'Default description', weight: 1, maxScore: 5, levels: level('Default level') }],
};
const customRubric = {
  jobCategory: 'BE' as const, isCustom: true, defaultVersion: 3, basedOnDefaultVersion: 1,
  criteria: [{ id: 'c-1', name: 'My communication', description: 'My description', weight: 1, maxScore: 5, levels: level('Custom level') }],
};

function renderPage() {
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 5 * 60_000 } } })}>
    <MemoryRouter initialEntries={['/candidate/rubrics?category=BE&language=en']}><CandidateRubricsPage /></MemoryRouter>
  </QueryClientProvider>);
}

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('CandidateRubricsPage default version update', () => {
  it('loads the default for a comparison and applies it through the confirmed reset flow', async () => {
    mocks.getRubric.mockResolvedValueOnce(customRubric).mockResolvedValue(defaultRubric);
    mocks.getDefaultRubric.mockResolvedValue(defaultRubric);
    mocks.resetRubric.mockResolvedValue(undefined);
    renderPage();

    expect(await screen.findByText(/Default rubric updated to version 3/)).toBeInTheDocument();
    expect(mocks.getDefaultRubric).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'rubrics.defaultUpdated.diff' }));
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText('rubrics.defaultDiff.title')).toBeInTheDocument();
    expect(within(dialog).getByText(/0: Default level/)).toBeInTheDocument();
    expect(within(dialog).getByText(/0: Custom level/)).toBeInTheDocument();
    expect(mocks.getDefaultRubric).toHaveBeenCalledWith('BE', 'en', expect.anything());
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));

    fireEvent.click(screen.getByRole('button', { name: 'rubrics.defaultUpdated.apply' }));
    const resetDialog = await screen.findByRole('dialog', { name: 'rubrics.reset.title' });
    fireEvent.click(within(resetDialog).getByRole('button', { name: 'rubrics.reset.confirm' }));
    await waitFor(() => expect(mocks.resetRubric).toHaveBeenCalledWith('BE', 'en'));
    await waitFor(() => expect(screen.queryByText(/Default rubric updated to version 3/)).not.toBeInTheDocument());
  });
});
