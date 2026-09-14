import { describe, expect, it } from 'vitest';
import { formatDuration, questionAverageScore, resultNeighbors, totalAnswerDuration } from './resultDetailViewModel';
import type { CampaignResultItem, TranscriptQuestion } from '../types/campaign.api.types';

const question = (overrides: Partial<TranscriptQuestion> = {}): TranscriptQuestion => ({
  questionId: 'q1', orderNo: 1, content: 'Q', transcript: null, needsReview: false,
  answerId: null, kind: 'Seed', answerStatus: null, rejectReason: null, durationSec: null,
  hasAudio: false, sampleAnswer: null, deliveryMetrics: null, scores: [], ...overrides,
});
const result = (sessionId: string, rank: number): CampaignResultItem => ({
  sessionId, rank, candidateId: sessionId, totalScore: 80, aiScore: 80, result: 'Pass', scoredAt: '2026-09-11', flags: [],
});

describe('result detail view model', () => {
  it('calculates question score out of ten and handles no score', () => {
    expect(questionAverageScore(question({ scores: [{ criterionId: 'c', score: 4, maxScore: 5 }] }))).toBe(8);
    expect(questionAverageScore(question())).toBeNull();
  });
  it('formats and sums nullable durations', () => {
    expect(formatDuration(125)).toBe('2 phút 5 giây');
    expect(totalAnswerDuration([question({ durationSec: 60 }), question(), question({ durationSec: 5 })])).toBe(65);
    expect(totalAnswerDuration([question()])).toBeNull();
  });
  it('uses server result order for neighbors', () => {
    const rows = [result('s2', 2), result('s1', 1), result('s3', 3)];
    expect(resultNeighbors(rows, 's1')).toMatchObject({ previous: { sessionId: 's2' }, next: { sessionId: 's3' } });
  });
});
