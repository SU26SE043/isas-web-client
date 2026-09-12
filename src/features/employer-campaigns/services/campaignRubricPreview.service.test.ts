import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import {
  campaignRubricPreviewEndpoints,
  extractMissingLevelCriteria,
  getRubricPreviewHistory,
  mapRubricPreviewError,
  parseRubricPreviewHistory,
  parseRubricPreviewRun,
  runRubricPreview,
} from './campaignRubricPreview.service';

function axiosError(status: number, data: unknown) {
  const error = new axios.AxiosError('Request failed');
  error.response = { status, statusText: '', headers: {}, config: {} as never, data };
  return error;
}

const fullRun = {
  id: 'run-1',
  status: 'Succeeded',
  questionId: 'q-1',
  questionText: 'Giải thích REST',
  rubricFingerprint: 'fp-1',
  rubricVersion: 2,
  promptVersion: 7,
  deliveryMetricsAvailable: false,
  lengthParityWarning: true,
  billed: false,
  // Cố ý KHÁC rubricVersion (2): fixture hai số bằng nhau làm phép hoán đổi field lọt qua toEqual.
  freeRunsRemaining: 3,
  rubric: [{
    criterionId: 'c-1', name: 'Giao tiếp', weight: 0.4, maxScore: 10,
    levels: [{ score: 0, descriptor: 'Không có' }, { score: 10, descriptor: 'Xuất sắc' }],
  }],
  samples: [{
    band: 'Weak', answerText: 'bài yếu', wordCount: 12, expectedWeightedPct: 20, actualWeightedPct: 25,
    scores: [{
      criterionId: 'c-1', criterionName: 'Giao tiếp', maxScore: 10, expectedLevel: 2, actualScore: 2.5,
      levelMatched: 2, reasoning: 'Trích: "…"',
    }],
  }],
  errorReason: null,
  createdAt: '2026-09-12T10:00:00Z',
  completedAt: '2026-09-12T10:00:40Z',
};

describe('parseRubricPreviewRun', () => {
  it('giữ nguyên mọi field camelCase của BE', () => {
    expect(parseRubricPreviewRun(fullRun)).toEqual(fullRun);
  });

  it('nhận PascalCase và bọc {data}', () => {
    const parsed = parseRubricPreviewRun({
      data: {
        Id: 'run-2', Status: 'Running', QuestionId: null, QuestionText: 'Q', RubricFingerprint: 'fp',
        RubricVersion: 1, PromptVersion: null, FreeRunsRemaining: 3, Billed: true,
        Rubric: [{ CriterionId: 'c', Name: 'N', Weight: 1, MaxScore: 5, Levels: [{ Score: 5, Descriptor: 'Tốt' }] }],
        Samples: [{ Band: 'Excellent', AnswerText: 'x', WordCount: 1, ExpectedWeightedPct: 90, ActualWeightedPct: 88, Scores: [] }],
        CreatedAt: '2026-09-12T11:00:00Z',
      },
    });
    expect(parsed).toMatchObject({
      id: 'run-2', status: 'Running', questionId: null, promptVersion: null, freeRunsRemaining: 3, billed: true,
      rubric: [{ criterionId: 'c', name: 'N', weight: 1, maxScore: 5, levels: [{ score: 5, descriptor: 'Tốt' }] }],
      samples: [{ band: 'Excellent', scores: [] }],
      completedAt: null, errorReason: null,
    });
  });

  it('mảng thiếu → [], status lạ → Failed (không phải Running, kẻo poll vô hạn), band lạ → Custom', () => {
    const parsed = parseRubricPreviewRun({ id: 'r', status: 'Weird', samples: [{ band: 'Nope' }] });
    expect(parsed.rubric).toEqual([]);
    expect(parsed.status).toBe('Failed');
    expect(parsed.samples[0]?.band).toBe('Custom');
    expect(parsed.samples[0]?.scores).toEqual([]);
  });
});

describe('parseRubricPreviewHistory', () => {
  it('nhận mảng trần hoặc bọc {data}, sắp createdAt giảm dần để runs[0] là lượt mới nhất', () => {
    const older = { ...fullRun, id: 'old', createdAt: '2026-09-11T10:00:00Z' };
    const newer = { ...fullRun, id: 'new', createdAt: '2026-09-12T10:00:00Z' };
    expect(parseRubricPreviewHistory([older, newer]).map((r) => r.id)).toEqual(['new', 'old']);
    expect(parseRubricPreviewHistory({ data: [newer, older] }).map((r) => r.id)).toEqual(['new', 'old']);
    expect(parseRubricPreviewHistory({ data: 'garbage' })).toEqual([]);
  });
});

describe('endpoints', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('POST đúng URL, chuẩn hoá body, timeout đủ cho lượt đồng bộ 20–60s', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: fullRun } as never);
    await expect(runRubricPreview('camp 1', { questionId: undefined, customAnswer: '  ' })).resolves.toMatchObject({ id: 'run-1' });
    expect(post).toHaveBeenCalledWith(
      campaignRubricPreviewEndpoints.run('camp 1'),
      { questionId: null, customAnswer: null },
      expect.objectContaining({ timeout: 180_000 }),
    );
    expect(campaignRubricPreviewEndpoints.run('camp 1')).toBe('/api/v1/campaign/camp%201/rubric-preview');
  });

  it('GET lịch sử đúng URL', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [fullRun] } as never);
    await expect(getRubricPreviewHistory('c1')).resolves.toHaveLength(1);
    expect(get).toHaveBeenCalledWith('/api/v1/campaign/c1/rubric-preview');
  });
});

describe('extractMissingLevelCriteria', () => {
  it('tách tên sau "tiêu chí:" theo dấu phẩy, dừng ở dấu chấm kết câu chứ không ở "Node.js"', () => {
    expect(extractMissingLevelCriteria(
      'Chưa khai mốc điểm cho tiêu chí: Giao tiếp, Node.js , Tư duy. Chấm thử cần mốc để kiểm chứng.',
    )).toEqual(['Giao tiếp', 'Node.js', 'Tư duy']);
  });

  it('một tiêu chí, hoặc không có marker', () => {
    expect(extractMissingLevelCriteria('Chưa khai mốc điểm cho tiêu chí: Giao tiếp. Chấm thử…')).toEqual(['Giao tiếp']);
    expect(extractMissingLevelCriteria('Chưa khai mốc điểm.')).toEqual([]);
  });
});

describe('mapRubricPreviewError', () => {
  const missing = 'Chưa khai mốc điểm cho tiêu chí: Giao tiếp, Tư duy. Chấm thử cần mốc để kiểm chứng.';

  it.each([
    [400, missing, { code: 'missingLevels', criteria: ['Giao tiếp', 'Tư duy'], message: missing }],
    [400, 'Chiến dịch chưa có câu hỏi để chấm thử.', { code: 'noQuestions', message: 'Chiến dịch chưa có câu hỏi để chấm thử.' }],
    [400, 'Chiến dịch chưa có tiêu chí chấm.', { code: 'noCriteria', message: 'Chiến dịch chưa có tiêu chí chấm.' }],
    [400, 'Lỗi khác', { code: 'unknown', message: 'Lỗi khác' }],
    [402, 'Ví tổ chức hết credit.', { code: 'noCredit', message: 'Ví tổ chức hết credit.' }],
    [409, 'Đang có một lượt chấm thử chạy cho chiến dịch này. Đợi nó xong rồi thử lại.', { code: 'running', message: 'Đang có một lượt chấm thử chạy cho chiến dịch này. Đợi nó xong rồi thử lại.' }],
    [409, 'Chiến dịch Closed không chạy chấm thử được.', { code: 'closed', message: 'Chiến dịch Closed không chạy chấm thử được.' }],
    [502, 'AIService lỗi', { code: 'aiFailed', message: 'AIService lỗi' }],
    [404, 'Campaign x not found.', { code: 'notFound', message: 'Campaign x not found.' }],
    [500, 'Failed to run rubric preview: boom', { code: 'unknown', message: 'Failed to run rubric preview: boom' }],
  ] as const)('%s "%s" → %o', (status, body, expected) => {
    expect(mapRubricPreviewError(axiosError(status, body))).toEqual(expected);
  });

  it('thân JSON {message} vẫn giữ nguyên văn BE', () => {
    expect(mapRubricPreviewError(axiosError(402, { message: 'Hết credit' }))).toEqual({ code: 'noCredit', message: 'Hết credit' });
  });

  it('lỗi không phải HTTP → unknown kèm message', () => {
    expect(mapRubricPreviewError(new Error('network down'))).toEqual({ code: 'unknown', message: 'network down' });
    expect(mapRubricPreviewError(undefined)).toEqual({ code: 'unknown', message: '' });
  });
});
