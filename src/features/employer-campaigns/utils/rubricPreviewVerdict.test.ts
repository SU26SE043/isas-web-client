import { describe, expect, it } from 'vitest';
import {
  goodRun,
  previewQuestions,
  rubricMissingLevels,
  rubricWithLevels,
  sample,
} from '../mocks/rubricPreview.fixtures';
import {
  compareRuns,
  computeBlocker,
  criteriaMissingLevels,
  customSampleOf,
  defaultPreviewQuestion,
  FREE_RUNS_PER_QUESTION,
  FREE_RUNS_PER_VERSION,
  freeRunsForQuestion,
  RUBRIC_PREVIEW_HISTORY_WINDOW,
  freeRunsForVersion,
  hasVerifiedRun,
  latestSeenRubricVersion,
  passesThreshold,
  scopedCriteriaForQuestion,
} from './rubricPreviewVerdict';
import type { CampaignQuestion, RubricCriterion } from '../types/campaignManagement.types';

describe('customSampleOf / passesThreshold — chấm thử chỉ còn bài người dùng tự nhập (2026-10-03)', () => {
  it('lấy đúng bài Custom; lượt cũ chỉ có 3 bài AI ⇒ null (UI nói là lượt cũ, không vẽ bảng 3 bài)', () => {
    const mine = sample('Custom', 0, 62);
    expect(customSampleOf(goodRun({ samples: [mine] }))).toBe(mine);
    expect(customSampleOf(goodRun({ samples: [sample('Weak', 20, 18), sample('Good', 60, 62), sample('Excellent', 100, 88)] }))).toBeNull();
    expect(customSampleOf(goodRun({ samples: [sample('Weak', 20, 18), mine] }))).toBe(mine);
  });

  it('Đạt khi ≥ ngưỡng (cùng quy ước bảng xếp hạng); không có ngưỡng ⇒ null', () => {
    expect(passesThreshold(50, 50)).toBe(true);
    expect(passesThreshold(49.99, 50)).toBe(false);
    expect(passesThreshold(80, null)).toBeNull();
    expect(passesThreshold(80, Number.NaN)).toBeNull();
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
  // Ca thật đo trên dev 4/4 lượt: Yếu +24…+36, Xuất sắc −30…−33 ⇒ bias gộp = none (trái dấu) nhưng đó chính là
  // thứ HR sửa được: mốc thấp quá dễ, mốc cao quá khó. Đếm theo TIÊU CHÍ, so theo MỐC chọn (levelMatched).
  it('freeRunsForVersion: chưa lượt nào ⇒ 3; lượt mới nhất cùng bản ⇒ tin số BE; bản khác ⇒ quota mới 3', () => {
    expect(freeRunsForVersion(null, null, 1)).toBe(FREE_RUNS_PER_VERSION);
    expect(freeRunsForVersion(2, goodRun({ rubricVersion: 1, freeRunsRemaining: 2 }), 1)).toBe(2);
    expect(freeRunsForVersion(0, goodRun({ rubricVersion: 1, freeRunsRemaining: 0 }), 2)).toBe(FREE_RUNS_PER_VERSION);
    // Không biết bản hiện tại ⇒ không suy "bản khác" từ "không biết" — tin số của lượt mới nhất.
    expect(freeRunsForVersion(1, goodRun({ rubricVersion: 4, freeRunsRemaining: 1 }), null)).toBe(1);
  });

  it('freeRunsForQuestion: không có questionId ⇒ null; chưa lượt nào của câu đó ⇒ trần mặc định 1; bản khác ⇒ trần mới', () => {
    const runs = [
      goodRun({ id: 'r1', questionId: 'q-1', rubricVersion: 2, freeRunsRemaining: 0 }),
      goodRun({ id: 'r2', questionId: 'q-2', rubricVersion: 1, freeRunsRemaining: 5 }),
    ];
    expect(freeRunsForQuestion(runs, 2, null)).toBeNull();
    expect(freeRunsForQuestion(runs, 2, 'q-1')).toBe(0);
    // Lượt mới nhất của q-1 thuộc bản 2; đang hỏi cho bản 5 (khác) ⇒ quota của bản 5 còn nguyên.
    expect(freeRunsForQuestion(runs, 5, 'q-1')).toBe(FREE_RUNS_PER_QUESTION);
    // Chưa có lượt nào của q-3 ⇒ trần mặc định.
    expect(freeRunsForQuestion(runs, 2, 'q-3')).toBe(FREE_RUNS_PER_QUESTION);
    // Trần tuỳ chỉnh qua tham số thứ 4.
    expect(freeRunsForQuestion(runs, 2, 'q-3', { freeRunsPerQuestion: 3 })).toBe(3);
  });

  // R3(a)/I7 — "không thấy lượt" ≠ "chưa dùng lượt": trả 1 ở hai ca này là đoán, và đoán sai thì POST không
  // confirm ⇒ trừ credit im lặng. `null` = không biết ⇒ UI hỏi; BE đếm thật.
  it('freeRunsForQuestion: KHÔNG thấy lượt của câu ⇒ null khi lịch sử đang tải HOẶC cửa sổ 20 lượt đã đầy; THẤY lượt thì vẫn tin số dù cửa sổ đầy', () => {
    const others = Array.from({ length: RUBRIC_PREVIEW_HISTORY_WINDOW }, (_, i) => goodRun({ id: `o${i}`, questionId: 'q-other', rubricVersion: 2, freeRunsRemaining: 0 }));
    expect(freeRunsForQuestion([], 2, 'q-1', { historyLoading: true })).toBeNull();
    expect(freeRunsForQuestion(others, 2, 'q-1', { historyWindowFull: true })).toBeNull();
    // Chưa tải xong nhưng đã có sẵn lượt của câu này trong cache ⇒ số thật vẫn dùng được.
    expect(freeRunsForQuestion([goodRun({ questionId: 'q-1', rubricVersion: 2, freeRunsRemaining: 0 })], 2, 'q-1', { historyLoading: true })).toBe(0);
    expect(freeRunsForQuestion([goodRun({ questionId: 'q-1', rubricVersion: 2, freeRunsRemaining: 1 }), ...others], 2, 'q-1', { historyWindowFull: true })).toBe(1);
    // Không tải, cửa sổ chưa đầy, không thấy lượt ⇒ chưa dùng thật ⇒ trần mặc định.
    expect(freeRunsForQuestion(others.slice(0, 3), 2, 'q-1', { historyLoading: false, historyWindowFull: false })).toBe(FREE_RUNS_PER_QUESTION);
  });
});

describe('scopedCriteriaForQuestion — SC2 chấm theo phạm vi câu hỏi', () => {
  const rubric: RubricCriterion[] = [
    { id: 'c-always', name: 'Cách nói', description: '', weight: 40, maxScore: 5, scoringScope: 'Always' },
    { id: 'c-target-1', name: 'Nội dung A', description: '', weight: 30, maxScore: 5, scoringScope: 'WhenTargeted' },
    { id: 'c-target-2', name: 'Nội dung B', description: '', weight: 30, maxScore: 5, scoringScope: 'WhenTargeted' },
    // Tiêu chí chưa từng đọc qua mapper (scoringScope undefined) ⇒ coi như 'Always'.
    { id: 'c-legacy', name: 'Legacy', description: '', weight: 0, maxScore: 5 },
  ];
  const question = (targetCriterionIds: string[] | null): CampaignQuestion => ({
    id: 'q-1', prompt: 'Câu hỏi', skill: '', difficulty: 'middle', source: 'ai', isRequired: true, targetCriterionIds,
  });

  it('question null/targetCriterionIds null (chưa gắn nhãn) ⇒ KHÔNG thu hẹp, trả nguyên rubric', () => {
    expect(scopedCriteriaForQuestion(rubric, null)).toEqual(rubric);
    expect(scopedCriteriaForQuestion(rubric, question(null))).toEqual(rubric);
  });

  it('[] (đã gắn nhãn rỗng) ⇒ chỉ còn tiêu chí Always/chưa-đọc-scope', () => {
    expect(scopedCriteriaForQuestion(rubric, question([]))).toEqual([rubric[0], rubric[3]]);
  });

  it('[ids] ⇒ Always ∪ đúng những WhenTargeted có trong danh sách', () => {
    expect(scopedCriteriaForQuestion(rubric, question(['c-target-1']))).toEqual([rubric[0], rubric[1], rubric[3]]);
  });
});

describe('computeBlocker — scopedCriteria (SC2), tương thích ngược với call site chưa truyền câu cụ thể', () => {
  const rubricMixed: RubricCriterion[] = [
    { id: 'c-always', name: 'Cách nói', description: '', weight: 50, maxScore: 5, scoringScope: 'Always', levels: [{ score: 0, descriptor: 'x' }, { score: 5, descriptor: 'y' }] },
    // WhenTargeted, THIẾU mốc — nhưng không câu nào trong `questions` nhắm tới nó.
    { id: 'c-target', name: 'Nội dung', description: '', weight: 50, maxScore: 5, scoringScope: 'WhenTargeted', levels: [] },
  ];
  const base = { campaignId: 'cmp-1', campaignStatus: 'draft' as const, rubric: rubricMixed, questions: previewQuestions, isRunning: false };

  it('KHÔNG truyền scopedCriteria (call site cũ) ⇒ hành vi TRƯỚC SC2: đòi mốc cho CẢ rubric', () => {
    expect(computeBlocker(base)).toEqual({ kind: 'missingLevels', criteria: ['Nội dung'] });
  });

  it('truyền scopedCriteria đã loại tiêu chí không được nhắm tới ⇒ thiếu mốc của nó KHÔNG chặn', () => {
    expect(computeBlocker({ ...base, scopedCriteria: [rubricMixed[0]] })).toBeNull();
  });

  it('scopedCriteria vẫn chứa tiêu chí thiếu mốc (câu này CÓ nhắm tới) ⇒ vẫn chặn', () => {
    expect(computeBlocker({ ...base, scopedCriteria: rubricMixed })).toEqual({ kind: 'missingLevels', criteria: ['Nội dung'] });
  });
});
