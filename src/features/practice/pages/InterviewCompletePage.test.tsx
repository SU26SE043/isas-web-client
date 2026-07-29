// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
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
  vi.clearAllMocks();
});

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
});
