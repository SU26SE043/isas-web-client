// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InterviewCompletePage } from './InterviewCompletePage';

const mockGetPracticeSession = vi.fn();

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('../services/b2cPracticeSession.service', () => ({
  getPracticeSession: (...args: unknown[]) => mockGetPracticeSession(...args),
}));

function LocationProbe() {
  const location = useLocation();
  return <div>{`${location.pathname}${location.search}`}</div>;
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

const SESSION_ID = '685d10e7-af3c-4971-a207-54abfb6d7dee';

function renderCompletePage(sessionId = SESSION_ID) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/interview/${sessionId}/complete`]}>
        <Routes>
          <Route path="/interview/:sessionId/complete" element={<InterviewCompletePage />} />
          <Route path="/practice/result" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('InterviewCompletePage', () => {
  it('redirects a scored session using the backend session id without an assessment prefix', async () => {
    const sessionId = '685d10e7-af3c-4971-a207-54abfb6d7dee';
    mockGetPracticeSession.mockResolvedValue({
      id: sessionId,
      status: 'Scored',
      questions: [],
      answers: [],
      result: { overallScore: 85 },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/interview/${sessionId}/complete`]}>
          <Routes>
            <Route path="/interview/:sessionId/complete" element={<InterviewCompletePage />} />
            <Route path="/practice/result" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText(`/practice/result?sessionId=${sessionId}`),
    ).toBeInTheDocument();
    expect(mockGetPracticeSession).toHaveBeenCalledWith(sessionId);
    expect(screen.queryByText(/assessment-/)).not.toBeInTheDocument();
  });

  it('redirects when the API uses lowercase scored status', async () => {
    const sessionId = '685d10e7-af3c-4971-a207-54abfb6d7dee';
    mockGetPracticeSession.mockResolvedValue({
      id: sessionId,
      status: 'scored',
      questions: [],
      answers: [],
      result: { overallScore: 85 },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/interview/${sessionId}/complete`]}>
          <Routes>
            <Route path="/interview/:sessionId/complete" element={<InterviewCompletePage />} />
            <Route path="/practice/result" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText(`/practice/result?sessionId=${sessionId}`),
    ).toBeInTheDocument();
  });

  it('redirects as soon as a report is present during a transitional status', async () => {
    const sessionId = '685d10e7-af3c-4971-a207-54abfb6d7dee';
    mockGetPracticeSession.mockResolvedValue({
      id: sessionId,
      status: 'Completed',
      questions: [],
      answers: [],
      result: { overallScore: 85 },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/interview/${sessionId}/complete`]}>
          <Routes>
            <Route path="/interview/:sessionId/complete" element={<InterviewCompletePage />} />
            <Route path="/practice/result" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText(`/practice/result?sessionId=${sessionId}`),
    ).toBeInTheDocument();
    expect(mockGetPracticeSession).toHaveBeenCalledTimes(1);
  });

  it('shows how many answers have finished scoring', async () => {
    mockGetPracticeSession.mockResolvedValue({
      id: SESSION_ID,
      status: 'Scoring',
      questions: [
        { id: 'q1', orderNo: 1, content: 'One?', timeLimitSec: 60, kind: 'Seed' },
        { id: 'q2', orderNo: 2, content: 'Two?', timeLimitSec: 60, kind: 'Seed' },
        { id: 'q3', orderNo: 3, content: 'Three?', timeLimitSec: 60, kind: 'Seed' },
      ],
      answers: [
        { questionId: 'q1', answerId: 'a1', status: 'Scored' },
        { questionId: 'q2', answerId: 'a2', status: 'Skipped' },
        { questionId: 'q3', answerId: 'a3', status: 'Scoring' },
      ],
      result: null,
    });

    renderCompletePage();

    expect(await screen.findByText('practice.scoring.progress')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67');
    expect(screen.queryByText('practice.scoring.progressPending')).not.toBeInTheDocument();
  });

  it('falls back to a preparing message instead of rendering 0/0', async () => {
    mockGetPracticeSession.mockResolvedValue({
      id: SESSION_ID,
      status: 'Submitted',
      questions: [],
      answers: [],
      result: null,
    });

    renderCompletePage();

    expect(await screen.findByText('practice.scoring.progressPending')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.queryByText('practice.scoring.progress')).not.toBeInTheDocument();
  });

  it('keeps polling past the 120s notice instead of stopping', async () => {
    vi.useFakeTimers();
    mockGetPracticeSession.mockResolvedValue({
      id: SESSION_ID,
      status: 'Scoring',
      questions: [{ id: 'q1', orderNo: 1, content: 'One?', timeLimitSec: 60, kind: 'Seed' }],
      answers: [{ questionId: 'q1', answerId: 'a1', status: 'Scoring' }],
      result: null,
    });

    renderCompletePage();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    // p50 is ~19s, so the first 10 seconds poll once per second.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(mockGetPracticeSession.mock.calls.length).toBeGreaterThanOrEqual(10);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(115_000);
    });
    expect(screen.getByText('practice.scoring.stillScoring')).toBeInTheDocument();

    const callsAtTimeout = mockGetPracticeSession.mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(mockGetPracticeSession.mock.calls.length).toBeGreaterThan(callsAtTimeout);
  });

  it('redirects when a slow report lands after the timeout notice', async () => {
    vi.useFakeTimers();
    mockGetPracticeSession.mockResolvedValue({
      id: SESSION_ID,
      status: 'Scoring',
      questions: [],
      answers: [],
      result: null,
    });

    renderCompletePage();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(125_000);
    });
    expect(screen.getByText('practice.scoring.stillScoring')).toBeInTheDocument();

    mockGetPracticeSession.mockResolvedValue({
      id: SESSION_ID,
      status: 'Scored',
      questions: [],
      answers: [],
      result: { overallScore: 85 },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });

    expect(screen.getByText(`/practice/result?sessionId=${SESSION_ID}`)).toBeInTheDocument();
  });
});
