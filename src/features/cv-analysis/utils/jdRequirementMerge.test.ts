import { describe, expect, it } from 'vitest';
import {
  findDuplicateRequirement,
  mergeRequirementSuggestions,
  normalizeRequirementKey,
  requirementSimilarity,
  splitRequirementInputs,
  type RequirementItem,
  type RequirementSuggestion,
} from './jdRequirementMerge';

let sequence = 0;
const createId = () => `id-${(sequence += 1)}`;

function item(partial: Partial<RequirementItem> & { text: string }): RequirementItem {
  return {
    id: partial.id ?? createId(),
    text: partial.text,
    group: partial.group ?? 'must',
    origin: partial.origin ?? 'user',
    jdQuote: partial.jdQuote ?? null,
    ...(partial.sourceJdHash ? { sourceJdHash: partial.sourceJdHash } : {}),
  };
}

function suggestion(text: string, group: 'must' | 'nice' = 'must'): RequirementSuggestion {
  return { text, group, jdQuote: `${text} (JD)` };
}

function merge(existing: RequirementItem[], incoming: RequirementSuggestion[], maxItems?: number) {
  return mergeRequirementSuggestions({ existing, incoming, maxItems, createId });
}

describe('normalizeRequirementKey', () => {
  it('folds case, diacritics, separators and trailing punctuation', () => {
    expect(normalizeRequirementKey('  Kỹ   năng   React  ')).toBe('ky nang react');
    expect(normalizeRequirementKey('KỸ NĂNG REACT.')).toBe('ky nang react');
    expect(normalizeRequirementKey('Ky nang / React')).toBe('ky nang react');
    expect(normalizeRequirementKey('Ky nang - React')).toBe('ky nang react');
    expect(normalizeRequirementKey('Ky nang – React')).toBe('ky nang react');
    expect(normalizeRequirementKey('Ky nang, React!')).toBe('ky nang react');
    expect(normalizeRequirementKey('Đọc hiểu tài liệu')).toBe('doc hieu tai lieu');
  });

  it('does not fold two genuinely different requirements', () => {
    expect(normalizeRequirementKey('React')).not.toBe(normalizeRequirementKey('Reactive'));
  });
});

// I6 — the client dedupe must be at least as strict as the backend.
// Backend key: Trim → Normalize(FormKC) → ToUpperInvariant → collapse whitespace
// (CvAnalysisService.NormalizeRequirements), compared with OrdinalIgnoreCase.
function backendDedupeKey(text: string): string {
  return text
    .trim()
    .normalize('NFKC')
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');
}

describe('I6 — client dedupe is at least as strict as the backend', () => {
  const corpus = [
    '3 năm kinh nghiệm React',
    '3 NĂM KINH NGHIỆM REACT',
    '3   năm kinh nghiệm   React',
    '  3 năm kinh nghiệm React  ',
    '3 nam kinh nghiem react',
    '3 năm kinh nghiệm React.',
    '3 năm kinh nghiệm - React',
    'Thành thạo TypeScript',
    'thành thạo typescript',
    'Kinh nghiệm Docker',
    'Giao tiếp tiếng Anh',
  ];

  it('collapses every pair the backend would collapse', () => {
    for (const left of corpus) {
      for (const right of corpus) {
        const backendCollapses = backendDedupeKey(left) === backendDedupeKey(right);
        if (!backendCollapses) continue;
        expect(
          normalizeRequirementKey(left),
          `backend merges "${left}" and "${right}" but the client would keep both`,
        ).toBe(normalizeRequirementKey(right));
      }
    }
  });

  it('never emits the same normalized text twice across groups', () => {
    const { mustHave, niceToHave } = splitRequirementInputs([
      item({ text: 'React', group: 'must' }),
      item({ text: 'react.', group: 'nice' }),
      item({ text: 'Docker', group: 'nice' }),
    ]);

    expect(mustHave).toEqual([{ text: 'React' }]);
    expect(niceToHave).toEqual([{ text: 'Docker' }]);
  });

  it('drops the AI item the backend would have silently deduped', () => {
    const result = merge([item({ text: 'Kỹ năng React' })], [suggestion('KY NANG REACT')]);

    expect(result.items).toHaveLength(1);
    expect(result.addedCount).toBe(0);
    expect(result.skippedDuplicateCount).toBe(1);
  });
});

describe('mergeRequirementSuggestions — exact duplicates', () => {
  it('drops the AI item and keeps the existing row untouched', () => {
    const existing = [item({ text: 'Thành thạo React', group: 'nice', origin: 'user' })];
    const result = merge(existing, [suggestion('thành thạo react.', 'must')]);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(existing[0]);
    expect(result.addedCount).toBe(0);
    expect(result.skippedDuplicateCount).toBe(1);
  });

  it('keeps the user group on a must/nice conflict, without asking', () => {
    const existing = [item({ text: 'Docker', group: 'nice', origin: 'user' })];
    const result = merge(existing, [suggestion('Docker', 'must')]);

    expect(result.items[0].group).toBe('nice');
    expect(result.items[0].origin).toBe('user');
    expect(result.skippedDuplicateCount).toBe(1);
  });
});

describe('mergeRequirementSuggestions — containment', () => {
  it('keeps the longer existing text', () => {
    const existing = [item({ text: 'Kinh nghiệm React và Redux', origin: 'ai' })];
    const result = merge(existing, [suggestion('React')]);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].text).toBe('Kinh nghiệm React và Redux');
    expect(result.skippedDuplicateCount).toBe(1);
  });

  it('upgrades a shorter AI row to the longer AI text', () => {
    const existing = [item({ id: 'ai-1', text: 'Kinh nghiệm React', origin: 'ai' })];
    const result = merge(existing, [suggestion('Kinh nghiệm React và Redux')]);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('ai-1');
    expect(result.items[0].text).toBe('Kinh nghiệm React và Redux');
    expect(result.replacedCount).toBe(1);
    expect(result.replaced[0].previous.text).toBe('Kinh nghiệm React');
    expect(result.addedCount).toBe(0);
  });

  it('keeps the shorter text when the user owns it', () => {
    const existing = [item({ id: 'user-1', text: 'Kinh nghiệm React', origin: 'user' })];
    const result = merge(existing, [suggestion('Kinh nghiệm React và Redux')]);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].text).toBe('Kinh nghiệm React');
    expect(result.items[0].origin).toBe('user');
    expect(result.replacedCount).toBe(0);
    expect(result.skippedDuplicateCount).toBe(1);
  });
});

describe('mergeRequirementSuggestions — near duplicates', () => {
  it('keeps both when similarity sits inside the 0.6–0.85 band', () => {
    const existing = [item({ text: '3 năm kinh nghiệm React', origin: 'user' })];
    const incoming = suggestion('3 năm kinh nghiệm TypeScript');
    const similarity = requirementSimilarity(existing[0].text, incoming.text);

    expect(similarity).toBeGreaterThanOrEqual(0.6);
    expect(similarity).toBeLessThan(0.85);

    const result = merge(existing, [incoming]);
    expect(result.items).toHaveLength(2);
    expect(result.addedCount).toBe(1);
    expect(result.skippedDuplicateCount).toBe(0);
  });

  it('drops a reordered restatement of the same requirement', () => {
    const existing = [item({ text: 'React và TypeScript', origin: 'user' })];
    const result = merge(existing, [suggestion('TypeScript và React')]);

    expect(result.items).toHaveLength(1);
    expect(result.skippedDuplicateCount).toBe(1);
  });
});

describe('mergeRequirementSuggestions — cap and validation', () => {
  it('fills up to the cap with mustHave first and reports the rest', () => {
    const existing = Array.from({ length: 18 }, (_, index) =>
      item({ text: `Yêu cầu ${index}`, group: 'nice', origin: 'user' }),
    );
    const result = merge(existing, [
      suggestion('Điểm cộng A', 'nice'),
      suggestion('Bắt buộc A', 'must'),
      suggestion('Bắt buộc B', 'must'),
      suggestion('Điểm cộng B', 'nice'),
    ]);

    expect(result.items).toHaveLength(20);
    expect(result.addedCount).toBe(2);
    expect(result.skippedOverLimitCount).toBe(2);
    expect(result.items.slice(18).map((entry) => entry.text)).toEqual([
      'Bắt buộc A',
      'Bắt buộc B',
    ]);
  });

  it('reports over-limit separately from duplicates', () => {
    const existing = Array.from({ length: 20 }, (_, index) =>
      item({ text: `Yêu cầu ${index}` }),
    );
    const result = merge(existing, [suggestion('Yêu cầu 0'), suggestion('Điều gì đó mới')]);

    expect(result.skippedDuplicateCount).toBe(1);
    expect(result.skippedOverLimitCount).toBe(1);
    expect(result.items).toHaveLength(20);
  });

  it('drops blank and over-long suggestions (I3)', () => {
    const result = merge([], [
      suggestion('   '),
      suggestion('a'.repeat(501)),
      suggestion('Yêu cầu hợp lệ'),
    ]);

    expect(result.addedCount).toBe(1);
    expect(result.skippedInvalidCount).toBe(2);
    expect(result.items[0].text).toBe('Yêu cầu hợp lệ');
  });

  it('trims stored text and carries the AI quote plus the JD hash', () => {
    const result = mergeRequirementSuggestions({
      existing: [],
      incoming: [{ text: '  Thành thạo React  ', group: 'must', jdQuote: 'React is required' }],
      sourceJdHash: 'hash-1',
      createId,
    });

    expect(result.items[0]).toMatchObject({
      text: 'Thành thạo React',
      origin: 'ai',
      group: 'must',
      jdQuote: 'React is required',
      sourceJdHash: 'hash-1',
    });
    expect(result.addedIds).toEqual([result.items[0].id]);
  });
});

describe('mergeRequirementSuggestions — repeated AI runs', () => {
  it('applies the rules against the whole current list on the second run', () => {
    const first = merge([item({ text: 'Docker', origin: 'user' })], [
      suggestion('Kinh nghiệm React'),
      suggestion('Viết unit test', 'nice'),
    ]);
    expect(first.addedCount).toBe(2);

    const second = merge(first.items, [
      suggestion('docker'),
      suggestion('KINH NGHIỆM REACT'),
      suggestion('Kinh nghiệm CI/CD'),
    ]);

    expect(second.addedCount).toBe(1);
    expect(second.skippedDuplicateCount).toBe(2);
    expect(second.items).toHaveLength(4);
    expect(second.items[0]).toEqual(first.items[0]);
  });

  it('never mutates the list passed in', () => {
    const existing = [item({ text: 'Docker', origin: 'user' })];
    const snapshot = structuredClone(existing);
    merge(existing, [suggestion('Kubernetes')]);

    expect(existing).toEqual(snapshot);
  });
});

describe('findDuplicateRequirement', () => {
  it('matches normalized text and can ignore the row being edited', () => {
    const items = [item({ id: 'a', text: 'Kỹ năng React' }), item({ id: 'b', text: 'Docker' })];

    expect(findDuplicateRequirement(items, 'ky nang react.')?.id).toBe('a');
    expect(findDuplicateRequirement(items, 'Ky nang React', 'a')).toBeNull();
    expect(findDuplicateRequirement(items, 'Kubernetes')).toBeNull();
  });
});

describe('splitRequirementInputs', () => {
  it('emits trimmed text only, must group first', () => {
    const { mustHave, niceToHave } = splitRequirementInputs([
      item({ text: '  Docker  ', group: 'nice' }),
      item({ text: 'React', group: 'must' }),
      item({ text: '   ', group: 'must' }),
    ]);

    expect(mustHave).toEqual([{ text: 'React' }]);
    expect(niceToHave).toEqual([{ text: 'Docker' }]);
  });
});
