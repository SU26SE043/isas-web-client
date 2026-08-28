import { describe, expect, it } from 'vitest';
import {
  buildCandidateListParams,
  isAbsoluteHttpUrl,
  parseCampaignResultsResponse,
  parseCandidateDetail,
  parseCandidateListItem,
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
          flags: [{
            type: 'TabSwitch',
            count: 1,
            note: 'Switched once',
            source: 'Server',
            firstAt: '2026-08-27T10:01:57Z',
            lastAt: '2026-08-27T10:22:36Z',
          }],
        },
      ],
      unscoredFlagged: [
        {
          candidateId: 'c2',
          sessionId: 's2',
          fullName: null,
          email: null,
          flags: [{
            type: 'FaceMissing',
            count: 2,
            FirstAt: '2026-08-27T09:00:00Z',
            LastAt: '2026-08-27T09:30:00Z',
          }],
        },
      ],
    });

    expect(parsed.results).toHaveLength(1);
    expect(parsed.results[0]?.totalScore).toBe(91.5);
    expect(parsed.results[0]?.flags[0]?.note).toBe('Switched once');
    expect(parsed.results[0]?.flags[0]?.firstAt).toBe('2026-08-27T10:01:57Z');
    expect(parsed.results[0]?.flags[0]?.lastAt).toBe('2026-08-27T10:22:36Z');
    expect(parsed.unscoredFlagged).toHaveLength(1);
    expect(parsed.unscoredFlagged[0]?.fullName).toBeNull();
    expect(parsed.unscoredFlagged[0]?.email).toBeNull();
    expect(parsed.unscoredFlagged[0]?.flags[0]?.firstAt).toBe('2026-08-27T09:00:00Z');
    expect(parsed.unscoredFlagged[0]?.flags[0]?.lastAt).toBe('2026-08-27T09:30:00Z');
    expect(parsed.results[0]?.flags[0]?.source).toBe('Server');
    expect(parsed.unscoredFlagged[0]?.flags[0]?.source).toBe('Client');
  });

  it('accepts Source casing and safely defaults missing or unknown source to Client', () => {
    const parsed = parseCampaignResultsResponse({
      results: [
        {
          candidateId: 'c1',
          sessionId: 's1',
          scoredAt: '2026-07-25T09:30:00Z',
          flags: [
            { type: 'ServerPascal', count: 1, Source: 'Server' },
            { type: 'Missing', count: 1 },
            { type: 'Unknown', count: 1, source: 'Operator' },
          ],
        },
      ],
    });

    expect(parsed.results[0]?.flags.map((flag) => flag.source)).toEqual([
      'Server',
      'Client',
      'Client',
    ]);
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

  it('parses the latest CV screening ranking fields', () => {
    const item = parseCandidateListItem({
      id: 'c1',
      fullName: 'Nguyen A',
      overallMatchScore: 75,
      verificationRisk: 'High',
      screeningVersion: 2,
    });
    expect(item).toMatchObject({ verificationRisk: 'High', screeningVersion: 2 });

    const detail = parseCandidateDetail({
      id: 'c1',
      screeningVersion: 2,
      fitSummary: 'Strong backend fit',
      strengths: [{ needId: 'n1', area: 'Backend .NET', level: 'Strong', evidence: '3 years of .NET APIs' }],
      gaps: [{ needId: 'n2', area: 'Kafka', level: 'Weak', evidence: 'No evidence found' }],
      bonusSignals: ['CI/CD'],
      verificationRisk: 'Low',
      verifyQuestions: ['What was your role?'],
      criterionScores: [{ criterionId: 'old', matchScore: 1 }],
    });
    expect(detail?.strengths[0]?.evidence).toBe('3 years of .NET APIs');
    expect(detail?.gaps).toHaveLength(1);
    expect(detail?.verifyQuestions).toEqual(['What was your role?']);
    expect(detail && 'criterionScores' in detail).toBe(false);
  });

  it('derives pass/fail from passScorePct when the API omits result', () => {
    const parsed = parseCampaignResultsResponse({
      passScorePct: 70,
      results: [
        {
          candidateId: 'pass',
          sessionId: 's-pass',
          totalScore: 70,
          aiScore: 70,
          scoredAt: '2026-07-25T09:30:00Z',
        },
        {
          candidateId: 'fail',
          sessionId: 's-fail',
          totalScore: 69.9,
          aiScore: 69.9,
          scoredAt: '2026-07-25T09:30:00Z',
        },
      ],
    });

    expect(parsed.results.map((item) => item.result)).toEqual(['Pass', 'Fail']);
  });
});
