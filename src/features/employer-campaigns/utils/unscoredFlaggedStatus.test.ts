import { describe, expect, it } from 'vitest';
import type { CampaignUnscoredFlaggedResult } from '../types/campaign.api.types';
import { getUnscoredFlaggedStatusKeys } from './unscoredFlaggedStatus';

const base: CampaignUnscoredFlaggedResult = { candidateId: 'c1', sessionId: 'session-guid', flags: [] };

describe('getUnscoredFlaggedStatusKeys', () => {
  it.each([
    [{ interviewStatus: 'Abandoned', abandonReason: 'generation_failed' }, 'generationFailed', 'notCandidateFault'],
    [{ interviewStatus: 'Abandoned', abandonReason: 'no_scored_answer' }, 'noScoredAnswer', undefined],
    [{ interviewStatus: 'Abandoned', abandonReason: 'expired_no_answer' }, 'expiredNoAnswer', undefined],
    [{ interviewStatus: 'Abandoned', abandonReason: null }, 'abandoned', undefined],
    [{ interviewStatus: 'Abandoned', abandonReason: 'unknown_reason' }, 'abandoned', undefined],
    [{ interviewStatus: 'InProgress' }, 'inProgress', undefined],
    [{ isLatestAttempt: false }, 'previousAttempt', undefined],
    [{}, 'noScore', undefined],
  ] as const)('maps %j', (fields, label, detail) => {
    const result = getUnscoredFlaggedStatusKeys({ ...base, ...fields });
    expect(result.label).toContain(`unscoredFlagged.${label}`);
    expect(result.detail).toBe(detail ? `employer.campaigns.results.unscoredFlagged.${detail}` : undefined);
  });
});
