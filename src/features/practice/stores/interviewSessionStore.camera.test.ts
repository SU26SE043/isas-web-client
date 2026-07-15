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
