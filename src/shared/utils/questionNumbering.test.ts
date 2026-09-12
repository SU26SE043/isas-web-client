import { describe, expect, it } from 'vitest';
import { groupQuestionsByRoot, isDeepDiveKind, numberQuestions } from './questionNumbering';

const q = (id: string, kind?: string) => ({ id, kind });
const labelsOf = (items: { id: string; kind?: string }[]) => {
  const { labels } = numberQuestions(items);
  return items.map((item) => labels.get(item.id));
};

describe('numberQuestions — đánh số phân cấp câu gốc / câu đào sâu', () => {
  it('chỉ câu gốc ⇒ 1..N, mẫu số = N', () => {
    const items = [q('s1', 'Seed'), q('s2', 'Seed'), q('s3', 'Seed')];
    expect(labelsOf(items)).toEqual(['1', '2', '3']);
    expect(numberQuestions(items).rootCount).toBe(3);
  });

  it('câu đào sâu xen sau câu gốc ⇒ số con; câu gốc phía sau KHÔNG bị đẩy lùi', () => {
    const items = [q('s1', 'Seed'), q('f1', 'Clarify'), q('f2', 'FollowUp'), q('s2', 'Seed'), q('f3', 'Clarify'), q('s3', 'Seed')];
    expect(labelsOf(items)).toEqual(['1', '1.1', '1.2', '2', '2.1', '3']);
    expect(numberQuestions(items).rootCount).toBe(3);
  });

  it('NewQuestion (chế độ frontier) và kind "question" của marker/mock là câu gốc', () => {
    const items = [q('a', 'question'), q('b', 'question'), q('c', 'NewQuestion')];
    expect(labelsOf(items)).toEqual(['1', '2', '3']);
  });

  it('câu đào sâu đứng trước mọi câu gốc (dữ liệu lệch) ⇒ coi là câu gốc, không sinh "0.1"', () => {
    expect(labelsOf([q('f0', 'Clarify'), q('s1', 'Seed')])).toEqual(['1', '2']);
  });

  it('mảng rỗng ⇒ 0 câu gốc', () => {
    expect(numberQuestions([]).rootCount).toBe(0);
  });

  it('isDeepDiveKind nhận mọi cách viết FollowUp/Clarify, từ chối Seed/NewQuestion/rỗng', () => {
    for (const kind of ['FollowUp', 'follow_up', 'followup', 'Clarify', 'clarification']) expect(isDeepDiveKind(kind)).toBe(true);
    for (const kind of ['Seed', 'NewQuestion', 'question', '', undefined, null]) expect(isDeepDiveKind(kind)).toBe(false);
  });
});

describe('groupQuestionsByRoot — gom câu đào sâu về câu gốc, cùng luật với numberQuestions', () => {
  const kindOf = (item: { kind?: string }) => item.kind;
  const ids = (group: { root: { id: string }; children: { id: string }[] }) => [group.root.id, group.children.map((c) => c.id)];

  it('mỗi câu gốc một nhóm; câu đào sâu rơi vào nhóm của câu gốc NGAY TRƯỚC nó', () => {
    const items = [q('s1', 'Seed'), q('f1', 'Clarify'), q('f2', 'FollowUp'), q('s2', 'Seed'), q('f3', 'Clarify'), q('s3', 'Seed')];
    expect(groupQuestionsByRoot(items, kindOf).map(ids)).toEqual([
      ['s1', ['f1', 'f2']],
      ['s2', ['f3']],
      ['s3', []],
    ]);
  });

  it('nhóm khớp nhãn: mọi câu con của nhóm k mang nhãn "k.x"', () => {
    const items = [q('s1', 'Seed'), q('f1', 'Clarify'), q('s2', 'Seed'), q('f2', 'FollowUp'), q('f3', 'Clarify')];
    const { labels } = numberQuestions(items);
    groupQuestionsByRoot(items, kindOf).forEach((group) => {
      const rootLabel = labels.get(group.root.id);
      expect(rootLabel).not.toContain('.');
      group.children.forEach((child) => expect(labels.get(child.id)?.split('.')[0]).toBe(rootLabel));
    });
  });

  it('câu đào sâu đứng đầu (dữ liệu lệch) thành nhóm riêng, không bị bỏ rơi', () => {
    expect(groupQuestionsByRoot([q('f0', 'Clarify'), q('s1', 'Seed')], kindOf).map(ids)).toEqual([['f0', []], ['s1', []]]);
  });

  it('kind "question" (marker/mock) và NewQuestion đều là câu gốc', () => {
    expect(groupQuestionsByRoot([q('a', 'question'), q('b', 'NewQuestion')], kindOf)).toHaveLength(2);
  });
});
