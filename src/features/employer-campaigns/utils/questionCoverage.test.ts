import { describe, expect, it } from 'vitest';
import type { CampaignQuestion, RubricCriterion } from '../types/campaignManagement.types';
import { computeLocalCoverageWarnings, computeLocalKRule, formatKRuleMessage, isKRuleWarning, primaryCriteriaCount, splitQuestionBankWarnings } from './questionCoverage';

const rubric: RubricCriterion[] = [
  { id: 'c-always', name: 'Giao tiếp', description: '', weight: 30, maxScore: 5, scoringScope: 'Always' },
  { id: 'c-depth', name: 'Chiều sâu', description: '', weight: 40, maxScore: 5, scoringScope: 'WhenTargeted' },
  { id: 'c-design', name: 'Thiết kế', description: '', weight: 30, maxScore: 5, scoringScope: 'WhenTargeted' },
  { id: 'c-legacy', name: 'Không rõ phạm vi', description: '', weight: 0, maxScore: 5 },
];
const question = (id: string, targets: string[] | null | undefined): CampaignQuestion => ({
  id, prompt: `Q ${id}`, skill: '', difficulty: 'middle', source: 'manual', isRequired: true, targetCriterionIds: targets,
});

describe('computeLocalCoverageWarnings — SC2 bao phủ cục bộ', () => {
  it('chỉ tiêu chí WhenTargeted KHÔNG câu nào nhắm mới vào cảnh báo; Always và vắng scope không bao giờ vào', () => {
    const result = computeLocalCoverageWarnings(rubric, [question('q1', ['c-depth']), question('q2', null), question('q3', [])]);
    expect(result).toEqual([{ criterionId: 'c-design', name: 'Thiết kế' }]);
  });
  it('nhãn ở BẤT KỲ vị trí đều tính là đã nhắm (không chỉ phần tử đầu)', () => {
    expect(computeLocalCoverageWarnings(rubric, [question('q1', ['c-depth', 'c-design'])])).toEqual([]);
  });
  it('không câu hỏi ⇒ mọi WhenTargeted đều chưa được nhắm', () => {
    expect(computeLocalCoverageWarnings(rubric, []).map((item) => item.criterionId)).toEqual(['c-depth', 'c-design']);
  });
});

describe('K-rule cục bộ + tách warning server', () => {
  it('primaryCriteriaCount đếm distinct targetCriterionIds[0]; K null ⇒ không vi phạm; K < primary ⇒ vi phạm', () => {
    // Câu KHÔNG bắt buộc (helper mặc định isRequired=true — với BUG-2 câu bắt buộc phủ tiêu chí nên phải tắt).
    const questions = [question('q1', ['c-depth', 'c-design']), question('q2', ['c-design']), question('q3', ['c-depth']), question('q4', [])]
      .map((q) => ({ ...q, isRequired: false }));
    expect(primaryCriteriaCount(questions)).toBe(2);
    expect(computeLocalKRule(questions, null)).toBeNull();
    expect(computeLocalKRule(questions, 2)).toBeNull();
    expect(computeLocalKRule(questions, 1)).toEqual({ k: 1, required: 0, uncovered: 2 });
    // Tất cả bắt buộc ⇒ luôn được rút ⇒ không tiêu chí nào rơi ⇒ K-rule im (cảnh báo "bắt buộc > K" là chuyện khác).
    expect(computeLocalKRule(questions.map((q) => ({ ...q, isRequired: true })), 1)).toBeNull();
  });
  // SC2 · BUG-2 (mirror BE): câu bắt buộc chiếm khe và phủ tiêu chí nó nhắm. Ca đo trên dev: K=2, q4 bắt buộc [C],
  // q3 [], q1 [B], q2 [C] ⇒ khe còn 1 ≥ 1 tiêu chí chưa phủ (B) ⇒ KHÔNG chặn; nhưng q4 bắt buộc KHÔNG nhãn ⇒ 1 < 2 ⇒ chặn.
  it('K-rule trừ câu bắt buộc và tiêu chí chúng đã phủ (BUG-2)', () => {
    const req = (id: string, targets: string[] | null) => ({ ...question(id, targets ?? []), targetCriterionIds: targets, isRequired: true });
    const opt = (id: string, targets: string[] | null) => ({ ...question(id, targets ?? []), targetCriterionIds: targets, isRequired: false });
    expect(computeLocalKRule([req('q4', ['C']), opt('q3', []), opt('q1', ['B']), opt('q2', ['C'])], 2)).toBeNull();
    expect(computeLocalKRule([req('q4', null), opt('q1', ['B']), opt('q2', ['C'])], 2)).toEqual({ k: 2, required: 1, uncovered: 2 });
    // required phủ cả B lẫn C ⇒ 0 tiêu chí chưa phủ ⇒ không chặn dù K = |required|
    expect(computeLocalKRule([req('q1', ['B']), req('q2', ['C']), opt('q3', ['B'])], 2)).toBeNull();
    // required nhiều hơn K ⇒ khe âm ⇒ chặn nếu còn tiêu chí chưa phủ
    expect(computeLocalKRule([req('q1', []), req('q2', []), opt('q3', ['B'])], 1)).toEqual({ k: 1, required: 2, uncovered: 1 });
  });
  // R4 (mirror BE): chỉ id tiêu chí `WhenTargeted` mới là "tiêu chí chính". HR gắn nhãn xong rồi LẬT scope tiêu chí
  // về Always ⇒ nhãn[0] còn trỏ id đó nhưng nó chấm mọi câu — không cần rổ riêng ⇒ không đếm, không chặn oan.
  it('R4: có rubric ⇒ chỉ đếm nhãn[0] ∈ WhenTargeted; lật cả hai về Always ⇒ không chặn; không rubric ⇒ đếm mọi nhãn như cũ', () => {
    const wt = (id: string, scope: 'Always' | 'WhenTargeted'): RubricCriterion => ({ id, name: id, description: '', weight: 50, maxScore: 5, scoringScope: scope });
    const opt = (id: string, targets: string[]) => ({ ...question(id, targets), isRequired: false });
    const questions = [opt('q1', ['A']), opt('q2', ['B'])];
    expect(computeLocalKRule(questions, 1, [wt('A', 'WhenTargeted'), wt('B', 'WhenTargeted')])).toEqual({ k: 1, required: 0, uncovered: 2 });
    expect(computeLocalKRule(questions, 1, [wt('A', 'Always'), wt('B', 'Always')])).toBeNull();
    // Một id Always lọt vào nhãn ⇒ không đếm ⇒ uncovered = 1 ≤ K=1 ⇒ không chặn (không rubric thì chặn như cũ).
    expect(computeLocalKRule(questions, 1, [wt('A', 'Always'), wt('B', 'WhenTargeted')])).toBeNull();
    expect(computeLocalKRule(questions, 1)).toEqual({ k: 1, required: 0, uncovered: 2 });
    expect(primaryCriteriaCount(questions, [wt('A', 'Always'), wt('B', 'WhenTargeted')])).toBe(1);
    expect(primaryCriteriaCount(questions)).toBe(2);
    // Câu bắt buộc phủ bằng nhãn[0] ∈ WT vẫn tính là ĐÃ phủ: K=2, r bắt buộc [B] chiếm 1 khe, còn 1 khe ≥ 1 tiêu chí
    // chưa phủ (A) ⇒ không chặn. K=1 thì khe còn 0 < 1 ⇒ chặn (đúng công thức `K − |required| < |uncovered|`).
    const req = (id: string, targets: string[]) => ({ ...question(id, targets), isRequired: true });
    const WT = [wt('A', 'WhenTargeted'), wt('B', 'WhenTargeted')];
    expect(computeLocalKRule([req('r', ['B']), opt('q1', ['B']), opt('q2', ['A'])], 2, WT)).toBeNull();
    expect(computeLocalKRule([req('r', ['B']), opt('q1', ['B']), opt('q2', ['A'])], 1, WT)).toEqual({ k: 1, required: 1, uncovered: 1 });
  });

  it('splitQuestionBankWarnings: dòng K_BELOW_CRITERIA_GROUPS thành blocking (bỏ tiền tố mã), còn lại soft', () => {
    const { blocking, soft } = splitQuestionBankWarnings([
      'Số câu bắt buộc (3) nhiều hơn số câu mỗi buổi (2).',
      'K_BELOW_CRITERIA_GROUPS: questions_per_session (2) nhỏ hơn số tiêu chí chính (3).',
    ]);
    expect(isKRuleWarning('K_BELOW_CRITERIA_GROUPS: x')).toBe(true);
    expect(blocking).toEqual(['questions_per_session (2) nhỏ hơn số tiêu chí chính (3).']);
    expect(soft).toEqual(['Số câu bắt buộc (3) nhiều hơn số câu mỗi buổi (2).']);
  });
});

describe('formatKRuleMessage — chữ cho người đọc (bước 4 + bước 8 dùng chung)', () => {
  const t = (key: string) => ({
    'employer.campaigns.questionCard.coverage.kRule': 'K={{k}}{{req}} N={{n}} NEED={{need}}',
    'employer.campaigns.questionCard.coverage.kRuleRequired': ' R={{r}}',
  })[key] ?? key;
  it('không câu bắt buộc ⇒ không chèn vế R; need = R + N', () => {
    expect(formatKRuleMessage(t, { k: 2, required: 0, uncovered: 3 })).toBe('K=2 N=3 NEED=3');
  });
  it('có câu bắt buộc ⇒ chèn vế R và need cộng cả R', () => {
    expect(formatKRuleMessage(t, { k: 2, required: 1, uncovered: 2 })).toBe('K=2 R=1 N=2 NEED=3');
  });
  it('bản vi/en thật không chứa mã máy hay tên cột', () => {
    // Nhắc: câu này hiện thẳng cho HR; mã `K_BELOW_CRITERIA_GROUPS`/`questions_per_session` là của API.
    const bad = /K_BELOW_CRITERIA_GROUPS|questions_per_session|nhãn\[0\]/;
    const vi = 'Mỗi ứng viên chỉ thi {{k}} câu{{req}}, nhưng các câu hỏi đang nhắm tới {{n}} tiêu chí khác nhau';
    expect(vi).not.toMatch(bad);
  });
});
