// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PracticeHistoryResultPage } from './PracticeHistoryResultPage';

const mockUsesMockData = vi.fn();
const mockGetPracticeSession = vi.fn();

vi.mock('@/shared/mock', () => ({
  usesMockData: (...args: unknown[]) => mockUsesMockData(...args),
}));

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('./InterviewResultPage', () => ({
  InterviewResultPage: () => <div>Legacy result</div>,
}));

vi.mock('../services/b2cPracticeSession.service', () => ({
  getPracticeSession: (...args: unknown[]) => mockGetPracticeSession(...args),
}));

vi.mock('../components/result/PracticeLiveResultReport', () => ({
  PracticeLiveResultReport: ({ session }: { session: { id: string } }) => (
    <div>Live result {session.id}</div>
  ),
}));

function renderRoute() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/candidate/practice/history/session-123']}>
        <Routes>
          <Route
            path="/candidate/practice/history/:id"
            element={<PracticeHistoryResultPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PracticeHistoryResultPage', () => {
  it('gets an existing live session once and renders its AI result', async () => {
    mockUsesMockData.mockReturnValue(false);
    mockGetPracticeSession.mockResolvedValue({
      id: 'session-123',
      status: 'Scored',
      result: { overallScore: 85 },
    });
    renderRoute();

    expect(await screen.findByText('Live result session-123')).toBeInTheDocument();
    expect(mockGetPracticeSession).toHaveBeenCalledOnce();
    expect(mockGetPracticeSession).toHaveBeenCalledWith('session-123');
    expect(mockUsesMockData).toHaveBeenCalledWith('practice');
  });

  it('keeps the legacy result page in mock mode', () => {
    mockUsesMockData.mockReturnValue(true);
    renderRoute();

    expect(screen.getByText('Legacy result')).toBeInTheDocument();
  });

  it('does not render a report when the session has no AI evaluation', async () => {
    mockUsesMockData.mockReturnValue(false);
    mockGetPracticeSession.mockResolvedValue({
      id: 'session-123',
      status: 'Scoring',
      result: null,
    });
    renderRoute();

    expect(await screen.findByText('practice.result.notAvailable')).toBeInTheDocument();
    expect(screen.queryByText(/Live result/)).not.toBeInTheDocument();
    expect(mockGetPracticeSession).toHaveBeenCalledOnce();
  });
});
