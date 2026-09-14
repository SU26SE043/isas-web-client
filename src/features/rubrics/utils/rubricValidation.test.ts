import { describe, expect, it } from 'vitest';
import type { EditableRubricCriterion } from '../types/rubric.types';
import { computeTotalMaxScore, validateRubric } from './rubricValidation';

function criterion(name: string, weightPercent: number, maxScore = 5): EditableRubricCriterion {
  return { clientId: name, name, description: '', weightPercent, maxScore };
}

/** Bộ chuẩn B2C thật trên server: 7 tiêu chí × maxScore 5 = 35 (đo `rubric_criteria` seed, cả 6 tổ hợp nghề × ngôn ngữ). */
const seed = [
  criterion('Giao tiếp & trình bày', 15),
  criterion('Trôi chảy', 10),
  criterion('Ngữ pháp & dùng từ', 10),
  criterion('Thuật ngữ chuyên ngành', 10),
  criterion('Chiều sâu kỹ thuật', 20),
  criterion('Giải quyết vấn đề & thuật toán', 20),
  criterion('Thiết kế hệ thống & CSDL', 15),
];

describe('validateRubric — không có luật "Σ điểm tối đa = 100"', () => {
  it('bộ chuẩn 7 × 5 = 35 hợp lệ (trước đây bị chặn invalidTotalMaxScore ⇒ không lưu được bất kỳ sửa đổi nào)', () => {
    expect(computeTotalMaxScore(seed)).toBe(35);
    expect(validateRubric(seed)).toBeNull();
  });

  it('tổng điểm tối đa bất kỳ (10 hay 700) đều không phải lỗi — backend chỉ đòi maxScore ≥ 1', () => {
    expect(validateRubric(seed.map((c) => ({ ...c, maxScore: 10 })))).toBeNull();
    expect(validateRubric(seed.map((c) => ({ ...c, maxScore: 100 })))).toBeNull();
    expect(validateRubric([criterion('Một tiêu chí', 100, 7)])).toBeNull();
  });

  it('vẫn chặn: maxScore ≤ 0 · trọng số âm · Σ trọng số ≠ 100% · thiếu tên · rỗng', () => {
    expect(validateRubric(seed.map((c, i) => (i === 0 ? { ...c, maxScore: 0 } : c)))).toBe('invalidMaxScore');
    expect(validateRubric(seed.map((c, i) => (i === 0 ? { ...c, weightPercent: -1 } : c)))).toBe('negativeWeight');
    expect(validateRubric(seed.map((c, i) => (i === 0 ? { ...c, weightPercent: 30 } : c)))).toBe('invalidWeight');
    expect(validateRubric(seed.map((c, i) => (i === 0 ? { ...c, name: '  ' } : c)))).toBe('missingName');
    expect(validateRubric([])).toBe('empty');
  });
});
