import { describe, expect, it } from 'vitest';
import { mapQuestionsToApiRequest } from './buildCampaignCreateRequest';
import type { CampaignQuestion } from '../types/campaignManagement.types';

describe('mapQuestionsToApiRequest', () => {
  it('preserves server GUIDs and omits client ids', () => {
    const questions: CampaignQuestion[] = [
      {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        prompt: 'AI question',
        skill: '',
        difficulty: 'middle',
        source: 'ai',
        isRequired: true,
      },
      {
        id: 'client-abc',
        prompt: 'Manual question',
        skill: '',
        difficulty: 'junior',
        source: 'manual',
        isRequired: false,
      },
    ];

    expect(mapQuestionsToApiRequest(questions)).toEqual([
      {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        questionText: 'AI question',
        isRequired: true,
      },
      {
        questionText: 'Manual question',
        isRequired: false,
      },
    ]);
  });
});
