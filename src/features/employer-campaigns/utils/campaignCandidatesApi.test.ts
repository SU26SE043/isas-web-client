import { describe, expect, it } from 'vitest';
import {
  buildCandidateListParams,
  isAbsoluteHttpUrl,
  parseCandidateUploadResponse,
  parseInviteByCandidateIdsResponse,
} from './campaignCandidatesApi';

describe('campaignCandidatesApi', () => {
  it('omits empty candidate list query params', () => {
    expect(buildCandidateListParams({ status: '', skill: '  ', sort: 'score' })).toEqual({
      sort: 'score',
    });
    expect(buildCandidateListParams({ minScore: 70, status: 'Filtered' })).toEqual({
      minScore: 70,
      status: 'Filtered',
    });
  });

  it('parses upload response with nested data', () => {
    const parsed = parseCandidateUploadResponse({
      data: {
        received: 2,
        filtered: 1,
        rejected: 1,
        skipped: 0,
        candidates: [
          { id: 'a', status: 'Filtered', email: 'a@x.com' },
          { id: 'b', status: 'Rejected', rejectReason: 'Low score' },
        ],
      },
    });
    expect(parsed.received).toBe(2);
    expect(parsed.candidates).toHaveLength(2);
    expect(parsed.candidates[1]?.rejectReason).toBe('Low score');
  });

  it('parses invite by candidateIds response', () => {
    const parsed = parseInviteByCandidateIdsResponse({
      invited: [{ candidateId: 'c1', invitationId: 'i1', email: 'a@x.com' }],
      failed: [{ candidateId: 'c2', reason: 'No email' }],
    });
    expect(parsed.invited).toHaveLength(1);
    expect(parsed.failed[0]?.reason).toBe('No email');
  });

  it('detects absolute http urls only', () => {
    expect(isAbsoluteHttpUrl('https://cdn.example/cv.pdf')).toBe(true);
    expect(isAbsoluteHttpUrl('campaigns/x/cv.pdf')).toBe(false);
  });
});
