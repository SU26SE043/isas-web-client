import { describe, expect, it } from 'vitest';
import {
  brokenRun,
  goodRun,
  narrowRun,
  positiveBiasRun,
  previewQuestions,
  rubricMissingLevels,
  rubricWithLevels,
  sample,
} from '../mocks/rubricPreview.fixtures';
import {
  BIAS_DELTA_PCT,
  compareRuns,
  computeBlocker,
  computeVerdict,
  criteriaMissingLevels,
  defaultPreviewQuestion,
  DISCRIMINATION_RANGE_PCT,
  FREE_RUNS_PER_VERSION,
  freeRunsForVersion,
  hasVerifiedRun,
  latestSeenRubricVersion,
} from './rubricPreviewVerdict';

describe('computeVerdict — thứ tự + biên độ, không phải |Δ|', () => {
  it('thứ tự đúng và biên độ ≥ 30 ⇒ discriminates, range = Excellent − Weak', () => {
    const verdict = computeVerdict(goodRun(), null);
    expect(verdict.ordering).toBe('ok');
    expect(verdict.range).toBe(70);
    expect(verdict.verdict).toBe('discriminates');
    expect(verdict.threshold).toBeNull();
  });

  it('thứ tự vỡ (Khá > Xuất sắc) ⇒ weak, kể cả khi biên độ vẫn ≥ 30', () => {
    const run = goodRun({ samples: [sample('Weak', 20, 10), sample('Good', 60, 95), sample('Excellent', 100, 80)] });
    const verdict = computeVerdict(run, null);
    expect(verdict.ordering).toBe('broken');
    expect(verdict.range).toBe(70);
    expect(verdict.verdict).toBe('weak');
    expect(computeVerdict(brokenRun(), null).verdict).toBe('weak');
  });

  it('bằng điểm cũng là thứ tự vỡ — nghiêm ngặt, không phải ≤', () => {
    const run = goodRun({ samples: [sample('Weak', 20, 40), sample('Good', 60, 40), sample('Excellent', 100, 90)] });
    expect(computeVerdict(run, null).ordering).toBe('broken');
  });

  it('thứ tự đúng nhưng biên độ dưới 30 ⇒ inconclusive; đúng 30 ⇒ discriminates', () => {
    expect(computeVerdict(narrowRun(), null)).toMatchObject({ ordering: 'ok', range: 12, verdict: 'inconclusive' });
    const edge = goodRun({ samples: [sample('Weak', 20, 40), sample('Good', 60, 55), sample('Excellent', 100, 70)] });
    expect(computeVerdict(edge, null).range).toBe(DISCRIMINATION_RANGE_PCT);
    expect(computeVerdict(edge, null).verdict).toBe('discriminates');
    const under = goodRun({ samples: [sample('Weak', 20, 40), sample('Good', 60, 55), sample('Excellent', 100, 69.9)] });
    expect(computeVerdict(under, null).verdict).toBe('inconclusive');
  });

  it('bias positive chỉ khi CẢ BA bài lệch > +3; một bài lệch không đủ', () => {
    expect(computeVerdict(positiveBiasRun(), null).bias).toBe('positive');
    const onlyOne = goodRun({ samples: [sample('Weak', 20, 30), sample('Good', 60, 61), sample('Excellent', 100, 100)] });
    expect(computeVerdict(onlyOne, null).bias).toBe('none');
    const twoOfThree = goodRun({ samples: [sample('Weak', 20, 30), sample('Good', 60, 70), sample('Excellent', 100, 100)] });
    expect(computeVerdict(twoOfThree, null).bias).toBe('none');
  });

  it('bias negative khi cả ba lệch < −3; đúng ±3 là nhiễu, không phải thiên lệch', () => {
    const negative = goodRun({ samples: [sample('Weak', 20, 10), sample('Good', 60, 50), sample('Excellent', 100, 90)] });
    expect(computeVerdict(negative, null).bias).toBe('negative');
    const atNoise = goodRun({ samples: [sample('Weak', 20, 23), sample('Good', 60, 63), sample('Excellent', 100, 103)] });
    expect(computeVerdict(atNoise, null).bias).toBe('none');
    expect(BIAS_DELTA_PCT).toBe(3);
  });

  it('bài Custom không tham gia bias nhưng có tham gia ngưỡng Đạt', () => {
    const run = positiveBiasRun({ samples: [...positiveBiasRun().samples, sample('Custom', 0, 40)] });
    const verdict = computeVerdict(run, 50);
    expect(verdict.bias).toBe('positive');
    expect(verdict.threshold).toEqual({ pct: 50, failing: ['Weak', 'Custom'] });
  });

  it('maxAbsDelta là |Δ| lớn nhất trên 3 bài AI', () => {
    expect(computeVerdict(goodRun(), null).maxAbsDelta).toBe(12);
  });

  it('ngưỡng Đạt: liệt kê band có điểm thật < pct; đúng bằng pct thì đạt', () => {
    const verdict = computeVerdict(goodRun(), 62);
    expect(verdict.threshold).toEqual({ pct: 62, failing: ['Weak'] });
    expect(computeVerdict(goodRun(), 10)?.threshold?.failing).toEqual([]);
  });

  it('thiếu một band AI (lượt lỗi) ⇒ thứ tự vỡ, không ném', () => {
    const run = goodRun({ status: 'Failed', samples: [sample('Weak', 20, 18)] });
    expect(computeVerdict(run, null)).toMatchObject({ ordering: 'broken', range: 0, bias: 'none', verdict: 'weak' });
  });
});

describe('compareRuns — cùng thước đo chỉ khi CẢ fingerprint LẪN promptVersion trùng', () => {
  const a = goodRun({ rubricFingerprint: 'fp-a', promptVersion: 7 });
  it.each([
    ['same', { rubricFingerprint: 'fp-a', promptVersion: 7 }],
    ['rubricChanged', { rubricFingerprint: 'fp-b', promptVersion: 7 }],
    ['promptChanged', { rubricFingerprint: 'fp-a', promptVersion: 8 }],
    ['bothChanged', { rubricFingerprint: 'fp-b', promptVersion: 8 }],
  ] as const)('%s', (expected, overrides) => {
    expect(compareRuns(a, goodRun(overrides))).toBe(expected);
  });

  it('promptVersion null so với số ⇒ không khẳng định "cùng"', () => {
    expect(compareRuns(a, goodRun({ promptVersion: null }))).toBe('promptChanged');
    expect(compareRuns(goodRun({ promptVersion: null }), goodRun({ promptVersion: null }))).toBe('same');
  });
});

describe('computeBlocker — ưu tiên noCampaign → closed → running → missingLevels → noQuestions', () => {
  const base = { campaignId: 'cmp-1', campaignStatus: 'draft' as const, rubric: rubricWithLevels, questions: previewQuestions, isRunning: false };

  it('đủ điều kiện ⇒ null', () => {
    expect(computeBlocker(base)).toBeNull();
  });

  it('chưa có campaign thắng mọi thứ khác', () => {
    expect(computeBlocker({ ...base, campaignId: null, campaignStatus: 'closed', isRunning: true, rubric: rubricMissingLevels, questions: [] })).toEqual({ kind: 'noCampaign' });
  });

  it('chưa có campaign nhưng có đường lưu (wizard tạo mới) ⇒ KHÔNG chặn vì thiếu campaign, vẫn chặn vế sau', () => {
    expect(computeBlocker({ ...base, campaignId: null, canPersist: true })).toBeNull();
    expect(computeBlocker({ ...base, campaignId: null, canPersist: true, rubric: rubricMissingLevels })).toMatchObject({ kind: 'missingLevels' });
    expect(computeBlocker({ ...base, campaignId: null, canPersist: true, questions: [] })).toEqual({ kind: 'noQuestions' });
  });

  it('closed/archived thắng running; paused và active không chặn', () => {
    expect(computeBlocker({ ...base, campaignStatus: 'closed', isRunning: true })).toEqual({ kind: 'closed' });
    expect(computeBlocker({ ...base, campaignStatus: 'archived' })).toEqual({ kind: 'closed' });
    expect(computeBlocker({ ...base, campaignStatus: 'paused' })).toBeNull();
    expect(computeBlocker({ ...base, campaignStatus: 'active' })).toBeNull();
  });

  it('đang chạy thắng thiếu mốc', () => {
    expect(computeBlocker({ ...base, isRunning: true, rubric: rubricMissingLevels })).toEqual({ kind: 'running' });
  });

  it('thiếu mốc liệt kê ĐÚNG tên tiêu chí (< 2 mốc), thắng thiếu câu hỏi', () => {
    expect(computeBlocker({ ...base, rubric: rubricMissingLevels, questions: [] })).toEqual({ kind: 'missingLevels', criteria: ['Giao tiếp'] });
    const oneLevel: typeof rubricWithLevels = [{ ...rubricWithLevels[0], levels: [{ score: 0, descriptor: 'x' }] }];
    expect(criteriaMissingLevels(oneLevel)).toEqual(['Chiều sâu kỹ thuật']);
    expect(criteriaMissingLevels([{ ...rubricWithLevels[0], levels: undefined }])).toEqual(['Chiều sâu kỹ thuật']);
  });

  it('không câu hỏi ⇒ noQuestions', () => {
    expect(computeBlocker({ ...base, questions: [] })).toEqual({ kind: 'noQuestions' });
  });
});

describe('helpers', () => {
  it('hasVerifiedRun: theo bản hiện tại nếu biết, còn không thì chỉ hỏi có Succeeded không', () => {
    const runs = [goodRun({ rubricVersion: 1 }), goodRun({ id: 'r2', rubricVersion: 2, status: 'Failed' })];
    expect(hasVerifiedRun(runs, 1)).toBe(true);
    expect(hasVerifiedRun(runs, 2)).toBe(false);
    expect(hasVerifiedRun(runs, null)).toBe(true);
    expect(hasVerifiedRun([], null)).toBe(false);
  });

  it('defaultPreviewQuestion: câu bắt buộc ĐẦU TIÊN, không có thì câu đầu', () => {
    expect(defaultPreviewQuestion(previewQuestions)?.id).toBe('q-2');
    expect(defaultPreviewQuestion([previewQuestions[0]])?.id).toBe('q-1');
    expect(defaultPreviewQuestion([])).toBeNull();
  });

  it('latestSeenRubricVersion: max qua các lượt', () => {
    expect(latestSeenRubricVersion([goodRun({ rubricVersion: 1 }), goodRun({ rubricVersion: 3 })])).toBe(3);
    expect(latestSeenRubricVersion([])).toBeNull();
  });

  // Quota là thứ HR nhìn trước khi bấm; BE chỉ trả nó KÈM lượt ⇒ trước lượt đầu phải tự biết còn nguyên 3.
  it('freeRunsForVersion: chưa lượt nào ⇒ 3; lượt mới nhất cùng bản ⇒ tin số BE; bản khác ⇒ quota mới 3', () => {
    expect(freeRunsForVersion(null, null, 1)).toBe(FREE_RUNS_PER_VERSION);
    expect(freeRunsForVersion(2, goodRun({ rubricVersion: 1, freeRunsRemaining: 2 }), 1)).toBe(2);
    expect(freeRunsForVersion(0, goodRun({ rubricVersion: 1, freeRunsRemaining: 0 }), 2)).toBe(FREE_RUNS_PER_VERSION);
    // Không biết bản hiện tại ⇒ không suy "bản khác" từ "không biết" — tin số của lượt mới nhất.
    expect(freeRunsForVersion(1, goodRun({ rubricVersion: 4, freeRunsRemaining: 1 }), null)).toBe(1);
  });
});
