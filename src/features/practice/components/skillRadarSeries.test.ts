import { describe, expect, it } from 'vitest';
import { hasStartLayer, shouldFillThreshold } from './skillRadarSeries';
import type { RadarData } from '../types/result.types';

function row(overrides: Partial<RadarData> = {}): RadarData {
  return { subject: 'S', subjectVi: 'S', A: 50, B: 60, fullMark: 100, ...overrides };
}

describe('hasStartLayer', () => {
  it('bật lớp "lúc bắt đầu" khi có ít nhất một tiêu chí mang mốc xuất phát', () => {
    expect(hasStartLayer([row({ C: null }), row({ C: 30 })])).toBe(true);
  });

  it('KHÔNG bật khi mọi tiêu chí đều thiếu mốc — tránh vẽ series rỗng kèm chú thích ma', () => {
    expect(hasStartLayer([row({ C: null }), row({ C: null })])).toBe(false);
  });

  it('không bật cho dữ liệu cũ không có field C (trang kết quả phỏng vấn dùng chung component)', () => {
    expect(hasStartLayer([row(), row()])).toBe(false);
  });

  it('mốc 0 là số đo THẬT, không phải thiếu dữ liệu ⇒ vẫn bật lớp', () => {
    expect(hasStartLayer([row({ C: 0 })])).toBe(true);
  });

  it('mảng rỗng thì không có lớp nào', () => {
    expect(hasStartLayer([])).toBe(false);
  });
});

describe('shouldFillThreshold', () => {
  it('giữ nền ngưỡng khi chỉ có hai lớp (hành vi cũ của trang kết quả phỏng vấn)', () => {
    expect(shouldFillThreshold([row(), row()])).toBe(true);
  });

  it('bỏ nền ngưỡng khi có lớp thứ ba — ba vùng tô đặc chồng nhau thì không đọc được', () => {
    expect(shouldFillThreshold([row({ C: 20 }), row({ C: 40 })])).toBe(false);
  });
});
