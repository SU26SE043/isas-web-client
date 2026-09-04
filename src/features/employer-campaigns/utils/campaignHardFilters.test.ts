import { describe, expect, it } from 'vitest';
import { buildCampaignCreateRequest, buildCampaignUpdateRequest } from './buildCampaignCreateRequest';
import type { CampaignWizardSubmitSnapshot } from './buildCampaignCreateRequest';
import { createEmptyHardFiltersState } from '../types/campaignWizard.types';

const snapshot = (hardFilters = createEmptyHardFiltersState()): CampaignWizardSubmitSnapshot => ({
  info: {
    title: 'Frontend engineer',
    domain: 'frontend',
    maxCandidates: null,
    timeLimitMinutes: 30,
    passScorePct: null,
    startsAt: '2099-01-01T10:00:00.000Z',
    expiresAt: '2099-01-02T10:00:00.000Z',
    timezone: 'UTC',
  },
  jd: {
    inputMethod: 'text',
    jdFile: null,
    fileName: null,
    fileSize: null,
    jdText: 'Build accessible frontend experiences.',
    fileStatus: 'idle',
    fileError: null,
    uploadProgress: null,
    serverUploaded: false,
    isDownloading: false,
  },
  hardFilters,
  rubric: [{ id: 'r1', name: 'Technical', weight: 100, description: '', maxScore: 10 }],
  questions: [{ id: 'q1', prompt: 'Tell us about your work.', skill: '', difficulty: 'middle', source: 'manual', isRequired: true }],
  settings: {
    antiCheatEnabled: true,
    faceVerifyEnabled: false,
    adaptiveEnabled: false,
    maxFollowUps: 0,
    maxQuestions: 5,
  },
});

describe('campaign hard filter payloads', () => {
  it('omits untouched rules', () => {
    const payload = buildCampaignCreateRequest(snapshot());
    expect(payload).not.toHaveProperty('requiredSkills');
    expect(payload).not.toHaveProperty('keywordsAny');
    expect(payload).not.toHaveProperty('minYearsExperience');
  });

  it('sends cleared lists and zero years when the employer clears rules', () => {
    const hardFilters = {
      ...createEmptyHardFiltersState(),
      requiredSkillsTouched: true,
      keywordsAnyTouched: true,
      minYearsExperienceTouched: true,
    };
    expect(buildCampaignUpdateRequest(snapshot(hardFilters))).toMatchObject({
      requiredSkills: [],
      keywordsAny: [],
      minYearsExperience: 0,
    });
  });

  it('sends entered values exactly', () => {
    const hardFilters = {
      ...createEmptyHardFiltersState(),
      requiredSkills: ['Kubernetes'],
      keywordsAny: ['GraphQL', 'REST'],
      minYearsExperience: 3,
      requiredSkillsTouched: true,
      keywordsAnyTouched: true,
      minYearsExperienceTouched: true,
    };
    expect(buildCampaignCreateRequest(snapshot(hardFilters))).toMatchObject({
      requiredSkills: ['Kubernetes'],
      keywordsAny: ['GraphQL', 'REST'],
      minYearsExperience: 3,
    });
  });
});
