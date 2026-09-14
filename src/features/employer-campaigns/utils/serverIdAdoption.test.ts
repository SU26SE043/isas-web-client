import { describe, expect, it } from 'vitest';
import type { CampaignQuestion, RubricCriterion } from '../types/campaignManagement.types';
import { adoptServerCriterionIds, adoptServerRubric, buildQuestionIdAliases, pruneQuestionTargetIds, remapQuestionTargetIds } from './serverIdAdoption';

const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const C = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const crit = (id: string, name: string): RubricCriterion => ({ id, name, description: '', weight: 50, maxScore: 5 });
const q = (id: string, prompt: string, targets?: string[] | null): CampaignQuestion => ({ id, prompt, skill: '', difficulty: 'middle', source: 'manual', isRequired: true, targetCriterionIds: targets });

describe('adoptServerCriterionIds — quyết định (a): id tạm → id server theo TÊN', () => {
  it('thay id tạm bằng id server cùng tên (trim, không phân biệt hoa/thường); giữ nguyên field local; GUID có sẵn không đổi', () => {
    const local = [crit(A, 'Giao tiếp'), { ...crit('criterion-1', '  Kỹ Thuật '), levels: [{ score: 0, descriptor: 'x' }] }];
    const server = [crit(A, 'Giao tiếp'), crit(B, 'kỹ thuật')];
    const { rubric, idMap } = adoptServerCriterionIds(local, server);
    expect(rubric[0]).toBe(local[0]);
    expect(rubric[1]).toEqual({ ...local[1], id: B });
    expect([...idMap]).toEqual([['criterion-1', B]]);
  });
  it('tên không khớp ⇒ giữ id tạm, idMap rỗng; id server đã bị GUID local khác chiếm không bị dùng lại', () => {
    const { rubric, idMap } = adoptServerCriterionIds([crit(A, 'Giao tiếp'), crit('new-x', 'Khác')], [crit(A, 'Giao tiếp')]);
    expect(rubric[1].id).toBe('new-x');
    expect(idMap.size).toBe(0);
  });
});

describe('remapQuestionTargetIds — I2 giữ null ≠ []', () => {
  const idMap = new Map([['criterion-1', B]]);
  it('null giữ null (cùng tham chiếu); id tạm resolve được → GUID; id tạm không resolve được → bỏ (như BE cắt nhãn dangling)', () => {
    const questions = [q('q1', 'Q1', null), q('q2', 'Q2', ['criterion-1', A]), q('q3', 'Q3', ['criterion-9'])];
    const result = remapQuestionTargetIds(questions, idMap);
    expect(result[0]).toBe(questions[0]);
    expect(result[1].targetCriterionIds).toEqual([B, A]);
    expect(result[2].targetCriterionIds).toEqual([]);
  });
  it('idMap rỗng ⇒ trả đúng mảng cũ', () => {
    const questions = [q('q1', 'Q1', ['criterion-1'])];
    expect(remapQuestionTargetIds(questions, new Map())).toBe(questions);
  });
});

describe('buildQuestionIdAliases — client-… → id server từ response PUT', () => {
  it('ghép theo NỘI DUNG, bỏ qua câu đã echo id; câu mới chèn giữa vẫn resolve đúng dù BE trả nó ở cuối', () => {
    const sent = [q(A, 'Cũ 1'), q('client-x', 'Mới chèn giữa'), q(B, 'Cũ 2')];
    const saved = [q(A, 'Cũ 1'), q(B, 'Cũ 2'), q(C, 'Mới chèn giữa')];
    expect([...buildQuestionIdAliases(sent, saved)]).toEqual([['client-x', C]]);
  });
  it('trùng nội dung ⇒ ghép theo thứ tự xuất hiện; prompt rỗng (không được PUT) không nhận alias', () => {
    const D = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
    const sent = [q('client-1', 'Trùng'), q('client-2', 'Trùng'), q('client-3', '   ')];
    const saved = [q(C, 'Trùng'), q(D, 'Trùng')];
    expect([...buildQuestionIdAliases(sent, saved)]).toEqual([['client-1', C], ['client-2', D]]);
  });
});

describe('pruneQuestionTargetIds — R2 cắt nhãn về ⊆ id tiêu chí còn tồn tại', () => {
  it('GUID/id không còn ⇒ bỏ; null giữ null (cùng tham chiếu); cắt hết ⇒ [] chứ không về null; không đổi ⇒ giữ nguyên mảng', () => {
    const questions = [q('q1', 'Q1', [A, B]), q('q2', 'Q2', null), q('q3', 'Q3', [B]), q('q4', 'Q4', [A])];
    const result = pruneQuestionTargetIds(questions, new Set([A]));
    expect(result[0].targetCriterionIds).toEqual([A]);
    expect(result[1]).toBe(questions[1]);
    expect(result[2].targetCriterionIds).toEqual([]);
    expect(result[3]).toBe(questions[3]);
    expect(pruneQuestionTargetIds(questions, new Set([A, B]))).toBe(questions);
  });
});

describe('adoptServerRubric — R1/R2 một chỗ ghép + cắt cho mọi đường nhận rubric server', () => {
  it('ghép id tạm theo tên, viết lại nhãn câu, VÀ cắt GUID chết không có trong rubric server', () => {
    const local = { rubric: [crit(A, 'Giao tiếp'), crit('new-x', 'Kỹ thuật'), crit(C, 'Đã xoá')], questions: [q('q1', 'Q1', ['new-x', C, A]), q('q2', 'Q2', null)] };
    const server = [crit(A, 'Giao tiếp'), crit(B, 'kỹ thuật')];
    const result = adoptServerRubric(local, server);
    expect(result.adopted).toBe(true);
    expect(result.rubric.map((item) => item.id)).toEqual([A, B, C]);
    expect(result.questions[0].targetCriterionIds).toEqual([B, A]);
    expect(result.questions[1]).toBe(local.questions[1]);
    expect([...result.idMap]).toEqual([['new-x', B]]);
  });
  it('server không echo id nào (rubric rỗng / bản merge-fallback mang id tạm) ⇒ KHÔNG ghép, KHÔNG cắt mù, trả nguyên tham chiếu', () => {
    const local = { rubric: [crit('new-x', 'Kỹ thuật')], questions: [q('q1', 'Q1', ['new-x'])] };
    for (const server of [[], null, undefined, [crit('criterion-0', 'Kỹ thuật')]]) {
      const result = adoptServerRubric(local, server);
      expect(result.adopted).toBe(false);
      expect(result.rubric).toBe(local.rubric);
      expect(result.questions).toBe(local.questions);
    }
  });
});
