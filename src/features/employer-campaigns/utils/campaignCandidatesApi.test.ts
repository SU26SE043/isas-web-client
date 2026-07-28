import { describe, expect, it } from 'vitest';
import {
  buildCandidateListParams,
  isAbsoluteHttpUrl,
  parseCampaignResultsResponse,
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

  it('parses campaign results with unscoredFlagged and missing names', () => {
    const parsed = parseCampaignResultsResponse({
      campaignId: 'camp-1',
      passScorePct: 70,
      totalCandidates: 3,
      results: [
        {
          rank: 1,
          candidateId: 'c1',
          sessionId: 's1',
          fullName: 'A',
          email: 'a@x.com',
          totalScore: 91.5,
          aiScore: 88,
          result: 'Pass',
          scoredAt: '2026-07-25T09:30:00Z',
          flags: [{ type: 'TabSwitch', count: 1, note: 'Switched once' }],
        },
      ],
      unscoredFlagged: [
        {
          candidateId: 'c2',
          sessionId: 's2',
          fullName: null,
          email: null,
          flags: [{ type: 'FaceMissing', count: 2 }],
        },
      ],
    });

    expect(parsed.results).toHaveLength(1);
    expect(parsed.results[0]?.totalScore).toBe(91.5);
    expect(parsed.results[0]?.flags[0]?.note).toBe('Switched once');
    expect(parsed.unscoredFlagged).toHaveLength(1);
    expect(parsed.unscoredFlagged[0]?.fullName).toBeNull();
    expect(parsed.unscoredFlagged[0]?.email).toBeNull();
  });

  it('defaults unscoredFlagged to [] when backend omits the field', () => {
    const parsed = parseCampaignResultsResponse({
      campaignId: 'camp-2',
      totalCandidates: 1,
      results: [
        {
          rank: 1,
          candidateId: 'c1',
          sessionId: 's1',
          totalScore: 70,
          aiScore: 70,
          result: 'Fail',
          scoredAt: '2026-07-25T09:30:00Z',
          flags: [],
        },
      ],
    });
    expect(parsed.unscoredFlagged).toEqual([]);
  });
});
