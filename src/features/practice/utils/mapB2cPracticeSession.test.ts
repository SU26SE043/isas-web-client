import { describe, expect, it } from 'vitest';
import {
  mapPracticeSessionResponse,
  mapSubmitPracticeAnswerResponse,
} from './mapB2cPracticeSession';

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
