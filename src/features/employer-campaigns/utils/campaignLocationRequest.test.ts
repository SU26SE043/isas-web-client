import { describe, expect, it } from 'vitest';
import type { CampaignWizardPersistedState } from '../types/campaignWizard.types';
import {
  buildCampaignCreateRequest,
  buildDirtyUpdateRequest,
  type CampaignWizardSubmitSnapshot,
} from './buildCampaignCreateRequest';
import { validateCampaignWizardStep } from './validateCampaignWizard';

function snapshot(location = '  2 Hải Triều, Quận 1  '): CampaignWizardSubmitSnapshot {
  return {
    info: {
      title: 'Frontend hiring',
      domain: 'frontend',
      location,
      locationCoordinates: { latitude: 10.7769, longitude: 106.7009 },
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

function persisted(location: string): CampaignWizardPersistedState {
  const base = snapshot(location);
  return {
    ...base,
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

describe('campaign location request contract', () => {
  it('trims location in create payload and excludes transient coordinates', () => {
    const request = buildCampaignCreateRequest(snapshot());
    expect(request.location).toBe('2 Hải Triều, Quận 1');
    expect(request).not.toHaveProperty('locationCoordinates');
  });

  it('includes only a changed location in a dirty update', () => {
    const dirty = buildDirtyUpdateRequest(snapshot('Old address'), snapshot('New address'));
    expect(dirty).toEqual({ location: 'New address' });
  });

  it('requires a non-blank campaign location', () => {
    expect(validateCampaignWizardStep(persisted('  '), 0)).toBe(
      'employer.campaigns.wizard.locationRequired',
    );
  });
});
