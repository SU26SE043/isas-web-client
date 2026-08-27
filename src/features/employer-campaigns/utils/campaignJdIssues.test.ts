import { describe, expect, it } from 'vitest';
import { buildCampaignCreateRequest, buildCampaignUpdateRequest } from './buildCampaignCreateRequest';
import { validateCampaignWizardStep } from './validateCampaignWizard';
import type { CampaignWizardPersistedState } from '../types/campaignWizard.types';

const shortJdState = (jdText: string): CampaignWizardPersistedState =>
  ({
    jd: {
      inputMethod: 'text',
      jdText,
    },
    rubric: [],
    questions: [],
    settings: {},
  } as unknown as CampaignWizardPersistedState);

const snapshot = (inputMethod: 'file' | 'text') => ({
  info: {
    title: 'Campaign',
    domain: 'frontend' as const,
    location: 'Remote',
    locationCoordinates: null,
    maxCandidates: null,
    timeLimitMinutes: 30,
    passScorePct: null,
    startsAt: '2030-01-01T10:00:00.000Z',
    expiresAt: '2030-01-02T10:00:00.000Z',
    timezone: 'UTC',
  },
  jd: {
    inputMethod,
    jdFile: null,
    fileName: inputMethod === 'file' ? 'jd.pdf' : null,
    fileSize: inputMethod === 'file' ? 100 : null,
    jdText: 'Short JD retained after switching to file mode.',
    criteriaText: '',
    fileStatus: inputMethod === 'file' ? ('uploaded' as const) : ('idle' as const),
    fileError: null,
    uploadProgress: null,
    serverUploaded: inputMethod === 'file',
    isDownloading: false,
  },
  rubric: [{ id: 'criterion-1', name: 'Skills', description: '', weight: 100, maxScore: 10 }],
  questions: [{ id: 'question-1', prompt: 'Tell us about your experience.', skill: '', difficulty: 'middle' as const, source: 'manual' as const, isRequired: true }],
  settings: {
    antiCheatEnabled: true,
    faceVerifyEnabled: false,
    adaptiveEnabled: false,
    maxFollowUps: 2,
    maxQuestions: 5,
  },
});

describe('campaign JD fixes', () => {
  it('accepts non-empty text shorter than 50 characters', () => {
    expect(validateCampaignWizardStep(shortJdState('A short JD'), 1)).toBeNull();
  });

  it('keeps entered jdText in create and update payloads after switching to file mode', () => {
    const fileSnapshot = snapshot('file');

    expect(buildCampaignCreateRequest(fileSnapshot).jdText).toBe(fileSnapshot.jd.jdText);
    expect(buildCampaignUpdateRequest(fileSnapshot).jdText).toBe(fileSnapshot.jd.jdText);
  });
});
