// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOCK_SESSION_TOPICS_EIGHT } from '../../mocks/sessionTopics.fixtures';
import type { PracticeSession } from '../../mocks/session.fixtures';
import { WaitingRoomStep } from './WaitingRoomStep';

const mocks = vi.hoisted(() => ({
  pollQuestions: vi.fn(),
}));

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({
    t: (key: string) => ({
      'practice.flow.waiting.title': 'Waiting room',
      'practice.flow.waiting.position': 'Position',
      'practice.flow.waiting.questions': 'Questions',
      'practice.flow.waiting.polling': 'Preparing questions',
      'practice.flow.waiting.ready': '{count} questions ready',
      'practice.flow.waiting.startInterview': 'Start interview',
      'practice.flow.back': 'Back',
      'practice.topics.title': 'Practice session topic catalog',
      'practice.topics.listLabel': 'Topics that will be explored',
      'practice.topics.level': 'Topics at {seniority} level',
      'practice.wizard.level.middle': 'Middle',
    }[key] ?? key),
  }),
}));

vi.mock('../../hooks/useInterviewGate', () => ({
  useInterviewGate: () => ({
    hasSufficientTokens: true,
    creditsRemaining: 1000,
  }),
}));

vi.mock('../../hooks/useInterviewFullscreen', () => ({
  requestInterviewFullscreen: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../services/practiceSession.service', () => ({
  practiceSessionService: {
    pollQuestions: (...args: unknown[]) => mocks.pollQuestions(...args),
  },
}));

vi.mock('@/features/campaigns/utils/campaignInterviewSession', () => ({
  readCampaignInterviewSession: () => null,
}));

const session: PracticeSession = {
  sessionId: 'session-topics',
  title: 'Backend practice',
  description: '',
  jobCategory: 'BE',
  seniority: 'Middle',
  topics: MOCK_SESSION_TOPICS_EIGHT,
  status: 'initializing',
  questions: [{ id: 'question-1', content: 'Question', timeLimitSeconds: 120 }],
};

function renderWaitingRoom() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <WaitingRoomStep
          sessionId={session.sessionId}
          session={session}
          onBack={vi.fn()}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('WaitingRoomStep F3 topics', () => {
  it('shows the full topic catalog while polling questions', async () => {
    mocks.pollQuestions.mockResolvedValue(session.questions);
    renderWaitingRoom();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Practice session topic catalog' })).toBeInTheDocument());
    expect(screen.getAllByRole('listitem')).toHaveLength(8);
    expect(screen.getByText('Topics at Middle level')).toBeInTheDocument();
  });
});
