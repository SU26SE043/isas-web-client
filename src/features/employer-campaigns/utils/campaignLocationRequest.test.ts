import { describe, expect, it } from 'vitest';
import type { CampaignWizardPersistedState } from '../types/campaignWizard.types';
import { createEmptyHardFiltersState } from '../types/campaignWizard.types';
import {
  buildCampaignCreateRequest,
  buildDirtyUpdateRequest,
  type CampaignWizardSubmitSnapshot,
} from './buildCampaignCreateRequest';
import { validateCampaignWizardStep } from './validateCampaignWizard';

function snapshot(): CampaignWizardSubmitSnapshot {
  return {
    info: {
      title: 'Frontend hiring',
      domain: 'frontend',
      maxCandidates: 20,
      timeLimitMinutes: 60,
      passScorePct: 70,
      startsAt: '2030-08-04T09:00',
      expiresAt: '2030-09-04T09:00',
      timezone: 'Asia/Ho_Chi_Minh',
    },
    jd: {
      inputMethod: 'text',
      jdFile: null,
      fileName: null,
      fileSize: null,
      jdText: 'A complete frontend job description for a senior React developer role.',
      criteriaText: '',
      fileStatus: 'idle',
      fileError: null,
      uploadProgress: null,
      serverUploaded: false,
      isDownloading: false,
    },
    hardFilters: createEmptyHardFiltersState(),
    rubric: [{ id: 'r1', name: 'React', description: '', weight: 100, maxScore: 10 }],
    questions: [{
      id: 'client-q1',
      prompt: 'Explain React rendering.',
      skill: 'React',
      difficulty: 'middle',
      source: 'manual',
      isRequired: true,
    }],
    settings: {
      antiCheatEnabled: true,
      faceVerifyEnabled: false,
      adaptiveEnabled: false,
      maxFollowUps: 0,
      maxQuestions: 5,
    },
  };
}

function persisted(): CampaignWizardPersistedState {
  const base = snapshot();
  return {
    ...base,
    hardFilters: base.hardFilters ?? createEmptyHardFiltersState(),
    criteria: {
      criteriaFile: null,
      fileName: null,
      fileSize: null,
      fileStatus: 'idle',
      fileError: null,
      uploadProgress: null,
      serverUploaded: false,
      isDownloading: false,
    },
    questionCount: 5,
    currentStep: 0,
    completedSteps: [],
    errorSteps: [],
    autosaveStatus: 'idle',
  };
}

describe('campaign wizard request contract', () => {
  it('does not send the deprecated location field in the create payload', () => {
    const request = buildCampaignCreateRequest(snapshot());
    expect(request).not.toHaveProperty('location');
  });

  it('does not send deprecated location changes in a dirty update', () => {
    const dirty = buildDirtyUpdateRequest(snapshot(), snapshot());
    expect(dirty).toEqual({});
  });

  it('does not require a location in the campaign information step', () => {
    expect(validateCampaignWizardStep(persisted(), 0)).toBe(
      null,
    );
  });
});
