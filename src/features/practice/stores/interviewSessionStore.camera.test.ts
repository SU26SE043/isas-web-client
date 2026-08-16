import { beforeEach, describe, expect, it } from 'vitest';
import { B2B_PROCTORING_CONFIG, B2C_PROCTORING_CONFIG } from '../types/proctoring.types';
import { useInterviewSessionStore } from '../stores/interviewSessionStore';

describe('interview camera toggle policy', () => {
  beforeEach(() => {
    useInterviewSessionStore.getState().reset();
  });

  it('allows camera toggle for B2C / learning proctoring config', () => {
    useInterviewSessionStore.getState().initSession('Practice', [], B2C_PROCTORING_CONFIG);
    expect(B2C_PROCTORING_CONFIG.cameraAlwaysOn).toBe(false);
    expect(useInterviewSessionStore.getState().cameraEnabled).toBe(true);

    useInterviewSessionStore.getState().toggleCamera();
    expect(useInterviewSessionStore.getState().cameraEnabled).toBe(false);

    useInterviewSessionStore.getState().toggleCamera();
    expect(useInterviewSessionStore.getState().cameraEnabled).toBe(true);
  });

  it('keeps camera forced on for B2B campaign exam config', () => {
    useInterviewSessionStore.getState().initSession('Campaign', [], B2B_PROCTORING_CONFIG);
    expect(B2B_PROCTORING_CONFIG.cameraAlwaysOn).toBe(true);
    expect(useInterviewSessionStore.getState().cameraEnabled).toBe(true);

    useInterviewSessionStore.getState().toggleCamera();
    expect(useInterviewSessionStore.getState().cameraEnabled).toBe(true);
  });
});

describe('learning question progression', () => {
  beforeEach(() => {
    useInterviewSessionStore.getState().reset();
  });

  it('shows the next question immediately without the legacy generation delay', () => {
    useInterviewSessionStore.getState().initSession(
      'Learning practice',
      [
        { id: 'question-1', content: 'Question one', timeLimitSeconds: 120 },
        { id: 'question-2', content: 'Question two', timeLimitSeconds: 90 },
      ],
      B2C_PROCTORING_CONFIG,
    );

    const isComplete = useInterviewSessionStore.getState().advanceToNextQuestion();
    const state = useInterviewSessionStore.getState();

    expect(isComplete).toBe(false);
    expect(state.currentIndex).toBe(1);
    expect(state.status).toBe('active');
    expect(state.aiState).toBe('speaking');
    expect(state.remainingSeconds).toBe(90);
    expect(state.messages.at(-1)?.content).toBe('Question two');
  });
});
