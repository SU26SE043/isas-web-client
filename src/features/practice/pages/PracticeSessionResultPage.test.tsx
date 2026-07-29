// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PracticeSessionResultPage } from './PracticeSessionResultPage';

const mockGetPracticeSession = vi.fn();

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/api/apiError', () => ({
  getApiStatusCode: (error: unknown) => (error as { status?: number })?.status,
}));

vi.mock('../services/b2cPracticeSession.service', () => ({
  getPracticeSession: (...args: unknown[]) => mockGetPracticeSession(...args),
}));

vi.mock('../components/result/PracticeResultSkeleton', () => ({
  PracticeResultSkeleton: () => <div>result-loading</div>,
}));

vi.mock('../components/result/ResultScoringPanel', () => ({
  ResultScoringPanel: () => <div>report-generating</div>,
}));

vi.mock('../components/result/PracticeLiveResultReport', () => ({
  PracticeLiveResultReport: ({ session }: { session: { id: string } }) => (
    <div>report-ready:{session.id}</div>
  ),
}));

const sessionId = '685d10e7-af3c-4971-a207-54abfb6d7dee';

function renderPage(url = `/practice/result?sessionId=${sessionId}`) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <PracticeSessionResultPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('PracticeSessionResultPage', () => {
  it('loads a report with the raw session GUID and renders completed data', async () => {
    mockGetPracticeSession.mockResolvedValue({
      id: sessionId,
      status: 'Scored',
      questions: [],
      answers: [],
      result: { overallScore: 85 },
    });

    renderPage();

    expect(screen.getByText('result-loading')).toBeInTheDocument();
    expect(await screen.findByText(`report-ready:${sessionId}`)).toBeInTheDocument();
    expect(mockGetPracticeSession).toHaveBeenCalledWith(sessionId);
    expect(mockGetPracticeSession).toHaveBeenCalledTimes(1);
  });

  it('does not call the API for a missing or prefixed session id', async () => {
    renderPage(`/practice/result?sessionId=assessment-${sessionId}`);

    expect(screen.getByText('practice.result.invalidSessionTitle')).toBeInTheDocument();
    await waitFor(() => expect(mockGetPracticeSession).not.toHaveBeenCalled());
  });

  it('shows the generating state while scoring instead of an error', async () => {
    mockGetPracticeSession.mockResolvedValue({
      id: sessionId,
      status: 'Scoring',
      questions: [],
      answers: [],
      result: null,
    });

    renderPage();

    expect(await screen.findByText('report-generating')).toBeInTheDocument();
    expect(screen.queryByText('practice.result.loadErrorTitle')).not.toBeInTheDocument();
  });

  it('polls while scoring and stops after the report is completed', async () => {
    mockGetPracticeSession
      .mockResolvedValueOnce({
        id: sessionId,
        status: 'Scoring',
        questions: [],
        answers: [],
        result: null,
      })
      .mockResolvedValue({
        id: sessionId,
        status: 'Scored',
        questions: [],
        answers: [],
        result: { overallScore: 85 },
      });

    renderPage();

    expect(await screen.findByText('report-generating')).toBeInTheDocument();
    expect(
      await screen.findByText(`report-ready:${sessionId}`, {}, { timeout: 4500 }),
    ).toBeInTheDocument();
    expect(mockGetPracticeSession).toHaveBeenCalledTimes(2);

    await new Promise((resolve) => setTimeout(resolve, 3200));
    expect(mockGetPracticeSession).toHaveBeenCalledTimes(2);
  }, 10_000);

  it.each([
    [401, 'practice.result.unauthorizedTitle'],
    [403, 'practice.result.forbiddenTitle'],
    [404, 'practice.result.notFoundTitle'],
    [500, 'practice.result.loadErrorTitle'],
  ])('maps HTTP %s to its dedicated state', async (status, titleKey) => {
    mockGetPracticeSession.mockRejectedValue({ status });

    renderPage();

    expect(
      await screen.findByText(titleKey, {}, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('renders a dedicated failed-generation state', async () => {
    mockGetPracticeSession.mockResolvedValue({
      id: sessionId,
      status: 'Failed',
      questions: [],
      answers: [],
      result: null,
    });

    renderPage();

    expect(await screen.findByText('practice.result.generationFailedTitle')).toBeInTheDocument();
  });
});
