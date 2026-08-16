// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLearningLiveFeedback } from './useLearningLiveFeedback';

const mockNavigate = vi.fn();
const mockSubmitAnswer = vi.fn();
const mockCompletePracticeSession = vi.fn();
const mockWaitForFeedback = vi.fn();
const mockAppendAnswer = vi.fn();
const mockAdvanceLearningQuestion = vi.fn();
const mockGetLearningPracticeSession = vi.fn();

vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('../services/roadmapPractice.service', () => ({
  roadmapPracticeService: {
    maxAnswerBytes: 50 * 1024 * 1024,
    submitAnswer: (...args: unknown[]) => mockSubmitAnswer(...args),
    completePracticeSession: (...args: unknown[]) => mockCompletePracticeSession(...args),
    waitForSessionQuestionFeedback: (...args: unknown[]) => mockWaitForFeedback(...args),
  },
}));
vi.mock('../services/learningPracticeSession.registry', () => ({
  appendLearningAnswer: (...args: unknown[]) => mockAppendAnswer(...args),
  advanceLearningQuestion: (...args: unknown[]) => mockAdvanceLearningQuestion(...args),
  getLearningPracticeSession: (...args: unknown[]) => mockGetLearningPracticeSession(...args),
}));

const firstQuestion = { id: 'q-1', content: 'First question', timeLimitSeconds: 120 };
const secondQuestion = { id: 'q-2', content: 'Second question', timeLimitSeconds: 120 };

beforeEach(() => {
  mockSubmitAnswer.mockResolvedValue({ questionId: 'q-1', status: 'Pending' });
  mockCompletePracticeSession.mockResolvedValue(undefined);
  mockGetLearningPracticeSession.mockReturnValue({
    roadmapId: 'roadmap-1',
    lessonId: 'lesson-1',
    questions: [firstQuestion, secondQuestion],
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useLearningLiveFeedback', () => {
  it('advances immediately after upload instead of waiting for question scoring', async () => {
    const advanceRoom = vi.fn();
    const { result } = renderHook(() => useLearningLiveFeedback('learning-1', true, advanceRoom));

    await act(async () => {
      await result.current.submitForReport(firstQuestion, async () => ({
        blob: new Blob(['answer']),
        durationSec: 12,
      }));
    });

    expect(mockSubmitAnswer).toHaveBeenCalledWith('learning-1', expect.objectContaining({ questionId: 'q-1' }));
    expect(mockWaitForFeedback).not.toHaveBeenCalled();
    expect(mockAppendAnswer).toHaveBeenCalledWith('learning-1', expect.objectContaining({ questionId: 'q-1' }));
    expect(mockAdvanceLearningQuestion).toHaveBeenCalledWith('learning-1');
    expect(advanceRoom).toHaveBeenCalledOnce();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('completes the session and opens the aggregate report after the last upload', async () => {
    const advanceRoom = vi.fn();
    const { result } = renderHook(() => useLearningLiveFeedback('learning-1', true, advanceRoom));

    await act(async () => {
      await result.current.submitForReport(secondQuestion, async () => ({
        blob: new Blob(['answer']),
        durationSec: 12,
      }));
    });

    expect(mockCompletePracticeSession).toHaveBeenCalledWith('learning-1');
    expect(mockNavigate).toHaveBeenCalledWith(
      '/candidate/learning/roadmaps/roadmap-1/lessons/lesson-1/report?sessionId=learning-1',
      { replace: true },
    );
    expect(advanceRoom).not.toHaveBeenCalled();
  });
});
