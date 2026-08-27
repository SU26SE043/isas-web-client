import { describe, expect, it } from 'vitest';
import {
  mapPracticeSessionResponse,
  mapSubmitPracticeAnswerResponse,
} from './mapB2cPracticeSession';
import {
  MOCK_SESSION_TOPICS_EIGHT,
  MOCK_SESSION_TOPICS_EMPTY,
  MOCK_SESSION_TOPICS_NULL,
} from '../mocks/sessionTopics.fixtures';

describe('mapPracticeSessionResponse', () => {
  it('maps session id, questions, and result fields', () => {
    const mapped = mapPracticeSessionResponse({
      sessionId: 's1',
      status: 'Scored',
      questions: [
        { id: 'q1', orderNo: 1, content: 'Hello?', timeLimitSec: 60, kind: 'warmup' },
      ],
      result: {
        overallScore: 82,
        criteriaScores: [{ name: 'Comm', score: 80, maxScore: 100 }],
        needsImprovement: ['Be concise'],
        overallComment: 'Good',
        cvVsAnswer: { consistencyScore: 70, summary: 'Aligned' },
      },
    });

    expect(mapped.id).toBe('s1');
    expect(mapped.status).toBe('Scored');
    expect(mapped.questions[0]?.content).toBe('Hello?');
    expect(mapped.result?.overallScore).toBe(82);
    expect(mapped.result?.criteriaScores[0]?.name).toBe('Comm');
    expect(mapped.result?.cvVsAnswer?.summary).toBe('Aligned');
  });

  it('maps nullable session topics and filters malformed topic records', () => {
    expect(mapPracticeSessionResponse({ topics: MOCK_SESSION_TOPICS_NULL, questions: [] }).topics).toBeNull();
    expect(mapPracticeSessionResponse({ topics: MOCK_SESSION_TOPICS_EMPTY, questions: [] }).topics).toEqual([]);

    const mapped = mapPracticeSessionResponse({
      topics: [
        ...MOCK_SESSION_TOPICS_EIGHT,
        { key: '', label: 'Invalid', source: 'Catalog' },
        { key: 'invalid-source', label: 'Invalid', source: 'Other' },
      ],
      questions: [],
    });

    expect(mapped.topics).toEqual(MOCK_SESSION_TOPICS_EIGHT);
    expect(mapped.topics).toHaveLength(8);
    expect(mapped.topics?.[0]).toMatchObject({
      key: 'be.middle.db_schema_design',
      label: 'Thiết kế schema database cho một module',
      source: 'Catalog',
      cvLevel: null,
      cvEvidence: null,
    });
  });

  it('preserves v8 evidence, RAG citations, language, seniority, and metrics version', () => {
    const mapped = mapPracticeSessionResponse({
      id: 'session-v8',
      status: 'Scored',
      language: 'en',
      seniority: 'Senior',
      criterionEvidence: [
        {
          criterionId: 'c1',
          criterionName: 'Architecture',
          state: 'PARTIAL',
          evidenceFound: ['Designed a service boundary'],
          missingEvidence: ['Trade-off analysis'],
          deepCount: 1,
          updatedAt: '2026-08-10T00:00:00Z',
        },
      ],
      questions: [
        {
          id: 'q1',
          orderNo: 5,
          content: 'Explain the design.',
          timeLimitSec: 120,
          kind: 'Seed',
          citations: [{ chunkId: 'chunk-1', sourceUrl: 'https://example.com', sourceTitle: 'Docs' }],
        },
      ],
      answers: [
        {
          answerId: 'a1',
          questionId: 'q1',
          status: 'Scored',
          transcript: 'Answer',
          deliveryMetrics: { metricsVersion: 2, wordCount: 10 },
        },
      ],
      result: { overallScore: 80, criteriaScores: [], needsImprovement: [] },
    });

    expect(mapped.language).toBe('en');
    expect(mapped.seniority).toBe('Senior');
    expect(mapped.criterionEvidence?.[0]?.state).toBe('PARTIAL');
    expect(mapped.questions[0]?.citations?.[0]?.sourceUrl).toBe('https://example.com');
    expect(mapped.answers?.[0]?.speakingMetrics?.metricsVersion).toBe(2);
  });

  it('preserves full AI evaluation details for each answer', () => {
    const mapped = mapPracticeSessionResponse({
      id: 'session-1',
      status: 'Scored',
      createdAt: '2026-07-22T23:57:00Z',
      completedAt: '2026-07-22T23:58:00Z',
      questions: [
        {
          id: 'q1',
          orderNo: 1,
          content: 'Describe your API design process.',
          timeLimitSec: 120,
        },
      ],
      answers: [
        {
          answerId: 'a1',
          questionId: 'q1',
          transcript: 'My answer',
          status: 'Scored',
          evaluation: {
            score: 7,
            comment: 'Clear but brief.',
            criteriaScores: [
              { name: 'Communication', score: 3, maxScore: 5, comment: 'Well structured.' },
            ],
            speakingMetrics: {
              syllablesPerMinute: 220,
              longestPauseSeconds: 1.2,
              hesitationCount: 2,
              silenceRatio: 4,
              fillerWordsCount: 1,
            },
            suggestedAnswer: 'A stronger sample answer.',
          },
        },
      ],
      result: {
        overallScore: 70,
        criteriaScores: [],
        needsImprovement: [],
      },
    });

    expect(mapped.createdAt).toBe('2026-07-22T23:57:00Z');
    expect(mapped.completedAt).toBe('2026-07-22T23:58:00Z');
    expect(mapped.answers?.[0]).toMatchObject({
      score: 7,
      comment: 'Clear but brief.',
      suggestedAnswer: 'A stronger sample answer.',
      speakingMetrics: {
        speechRate: 220,
        longestPauseSec: 1.2,
        hesitationCount: 2,
        silenceRatio: 4,
        fillerWordCount: 1,
      },
    });
    expect(mapped.answers?.[0]?.criteriaScores?.[0]).toMatchObject({
      name: 'Communication',
      score: 3,
      maxScore: 5,
      comment: 'Well structured.',
    });
  });

  it('resolves criterionId scores, speech metrics, and UUID needsImprovement', () => {
    const communicationId = '0be00000-0000-0000-0000-000000000001';
    const technicalId = '0be00000-0000-0000-0000-000000000002';
    const fluencyId = '0be00000-0000-0000-0000-000000000003';
    const mapped = mapPracticeSessionResponse({
      id: 'session-uuid',
      status: 'Scored',
      jobCategory: 'BE',
      rubric: [
        { id: communicationId, name: 'Giao tiếp & trình bày', maxScore: 5 },
        { id: technicalId, name: 'Chiều sâu kỹ thuật', maxScore: 5 },
        { id: fluencyId, name: 'Độ trôi chảy & tự tin', maxScore: 5 },
      ],
      questions: [
        {
          id: 'q1',
          orderNo: 1,
          content: 'Describe REST API flow.',
          timeLimitSec: 120,
          kind: 'question',
        },
      ],
      answers: [
        {
          questionId: 'q1',
          transcript: 'Cảm ơn các bạn đã theo dõi và hẹn gặp lại.',
          status: 'Scored',
          evaluation: {
            criteria: [
              {
                criterionId: communicationId,
                score: 0,
                comment: 'Không giải thích giải pháp kỹ thuật.',
              },
              {
                criterionId: technicalId,
                score: 0,
                comment: 'Không có thông tin kỹ thuật.',
              },
              {
                criterionId: fluencyId,
                score: 1,
                comment: 'Câu quá ngắn.',
              },
            ],
            speakingMetrics: {
              speechRate: { value: 22, note: 'chậm hơn dải tham khảo' },
              longestPauseSec: 0,
              hesitationCount: { value: 0, note: 'tính lần dừng lâu hơn 0.7 giây' },
              silenceRatio: 0,
              fillerWordCount: 0,
              notes: [
                'Số từ đệm là mức tối thiểu — máy nhận dạng giọng nói thường bỏ bớt từ đệm.',
                'Tham khảo: tiếng Việt nói tự nhiên thường vào khoảng 180–320 âm tiết/phút.',
              ],
            },
            sampleAnswer: 'A sample answer.',
          },
        },
      ],
      result: {
        overallScore: 5.7,
        maxScore: 100,
        needsImprovement: [communicationId, technicalId, fluencyId],
        overallComment: 'Cần cải thiện chiều sâu kỹ thuật.',
      },
    });

    expect(mapped.answers?.[0]?.criteriaScores).toHaveLength(3);
    expect(mapped.answers?.[0]?.criteriaScores?.[0]).toMatchObject({
      name: 'Giao tiếp & trình bày',
      score: 0,
      comment: 'Không giải thích giải pháp kỹ thuật.',
    });
    expect(mapped.answers?.[0]?.speakingMetrics).toMatchObject({
      speechRate: 22,
      speechRateNote: 'chậm hơn dải tham khảo',
      hesitationCount: 0,
      hesitationNote: 'tính lần dừng lâu hơn 0.7 giây',
    });
    expect(mapped.answers?.[0]?.suggestedAnswer).toBe('A sample answer.');
    expect(mapped.result?.criteriaScores.length).toBeGreaterThanOrEqual(3);
    expect(mapped.result?.needsImprovement).toEqual([
      'Giao tiếp & trình bày',
      'Chiều sâu kỹ thuật',
      'Độ trôi chảy & tự tin',
    ]);
    expect(mapped.result?.passThreshold).toBe(50);
  });

  it('maps v5 sampleAnswer, deliveryMetrics, and benchmark without coercing nulls to 0', () => {
    const mapped = mapPracticeSessionResponse({
      id: 'session-v5',
      status: 'Scored',
      jobCategory: 'FE',
      questions: [
        {
          id: 'q1',
          orderNo: 1,
          content: 'Tell me about yourself',
          timeLimitSec: 120,
          kind: 'Seed',
          answer: {
            id: 'a1',
            status: 'Scored',
            durationSec: 45,
            transcript: 'Candidate transcript',
            needsReview: false,
            sampleAnswer: 'Reference answer text',
            deliveryMetrics: {
              audioSec: 46,
              speechSec: 40,
              wordCount: 120,
              speechRateWpm: 150,
              longestPauseSec: null,
              pauseCount: 3,
              silenceRatio: null,
              fillerCount: 2,
              fillerPer100Words: 1.6,
              fillerBreakdown: { um: 1, like: 1 },
            },
            scores: [],
          },
        },
      ],
      result: {
        overallScore: 78,
        answeredCount: 1,
        totalQuestions: 1,
        criteriaScores: [
          {
            criterionId: 'c1',
            name: 'Communication',
            averageScore: 4,
            maxScore: 5,
            percentage: 80,
            weight: 1,
          },
          {
            criterionId: 'c2',
            name: 'Technical',
            averageScore: 3.5,
            maxScore: 5,
            percentage: 70,
            weight: 1,
          },
          {
            criterionId: 'c3',
            name: 'Confidence',
            averageScore: 4.2,
            maxScore: 5,
            percentage: 84,
            weight: 1,
          },
        ],
        needsImprovement: ['Be more specific'],
        overallComment: 'Solid',
        benchmark: {
          source: 'PeerAverage',
          label: 'Peer average (FE Junior)',
          sampleSize: 42,
          criteria: [
            { criterionId: 'c1', name: 'Communication', targetPercentage: 72 },
            { criterionId: 'c2', name: 'Technical', targetPercentage: 68 },
            { criterionId: 'c3', name: 'Confidence', targetPercentage: 70 },
          ],
        },
      },
    });

    expect(mapped.answers?.[0]?.sampleAnswer).toBe('Reference answer text');
    expect(mapped.answers?.[0]?.suggestedAnswer).toBe('Reference answer text');
    expect(mapped.answers?.[0]?.speakingMetrics).toMatchObject({
      audioDurationSec: 46,
      speechSec: 40,
      wordCount: 120,
      speechRate: 150,
      hesitationCount: 3,
      fillerWordCount: 2,
      fillerPer100Words: 1.6,
      longestPauseSec: null,
      silenceRatio: null,
    });
    expect(mapped.answers?.[0]?.speakingMetrics?.fillerBreakdown).toEqual({ um: 1, like: 1 });
    expect(mapped.result?.benchmark?.label).toBe('Peer average (FE Junior)');
    expect(mapped.result?.benchmark?.source).toBe('PeerAverage');
    expect(mapped.result?.answeredCount).toBe(1);
  });

  it('keeps sampleAnswer and benchmark null-safe for v4 payloads', () => {
    const mapped = mapPracticeSessionResponse({
      id: 'session-v4',
      status: 'Scored',
      questions: [{ id: 'q1', orderNo: 1, content: 'Q', timeLimitSec: 60 }],
      answers: [
        {
          questionId: 'q1',
          transcript: 'Hello',
          sampleAnswer: null,
          deliveryMetrics: null,
        },
      ],
      result: {
        overallScore: 50,
        criteriaScores: [{ name: 'A', score: 1, maxScore: 5 }],
        needsImprovement: [],
        overallComment: '',
        cvVsAnswer: null,
      },
    });

    expect(mapped.answers?.[0]?.suggestedAnswer).toBeNull();
    expect(mapped.answers?.[0]?.speakingMetrics).toBeNull();
    expect(mapped.result?.benchmark).toBeNull();
  });
});

describe('mapSubmitPracticeAnswerResponse', () => {
  it('maps nextQuestion and nextAction', () => {
    const mapped = mapSubmitPracticeAnswerResponse({
      answerId: 'a1',
      questionId: 'q1',
      status: 'ok',
      transcript: null,
      nextAction: 'follow_up',
      nextQuestion: {
        id: 'q2',
        orderNo: 2,
        content: 'Follow up?',
        timeLimitSec: 120,
        kind: 'follow_up',
      },
      interviewComplete: false,
    });

    expect(mapped.answerId).toBe('a1');
    expect(mapped.nextAction).toBe('follow_up');
    expect(mapped.nextQuestion?.id).toBe('q2');
    expect(mapped.interviewComplete).toBe(false);
  });
});
