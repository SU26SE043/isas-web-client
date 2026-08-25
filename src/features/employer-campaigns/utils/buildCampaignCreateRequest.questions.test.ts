import { describe, expect, it } from 'vitest';
import { mapQuestionsToApiRequest, mapRubricToCreateCriteria } from './buildCampaignCreateRequest';
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

describe('mapRubricToCreateCriteria', () => {
  it('converts UI percentage weights to decimal API weights', () => {
    expect(
      mapRubricToCreateCriteria([
        { id: 'r1', name: 'Communication', description: '', weight: 1, maxScore: 10 },
        { id: 'r2', name: 'Technical', description: '', weight: 99, maxScore: 10 },
      ]),
    ).toEqual([
      { name: 'Communication', description: null, weight: 0.01, maxScore: 10 },
      { name: 'Technical', description: null, weight: 0.99, maxScore: 10 },
    ]);
  });

  it('preserves fractional max scores instead of rounding them', () => {
    expect(
      mapRubricToCreateCriteria([
        { id: 'r1', name: 'Depth', description: '', weight: 100, maxScore: 2.5 },
      ]),
    ).toEqual([{ name: 'Depth', description: null, weight: 1, maxScore: 2.5 }]);
  });
});
