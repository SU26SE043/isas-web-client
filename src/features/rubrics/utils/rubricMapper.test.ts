import { describe, expect, it } from 'vitest';
import { createEmptyCriterion, mapEditableToUpdateRequest, mapResponseToEditable } from './rubricMapper';
import type { RubricResponse } from '../types/rubric.types';

const LEVELS = [
  { score: 0, descriptor: 'Không trả lời được hoặc trả lời sai hoàn toàn nội dung câu hỏi.' },
  { score: 10, descriptor: 'Trả lời đầy đủ, có ví dụ cụ thể và nêu được đánh đổi của phương án.' },
];

function response(overrides: Partial<RubricResponse['criteria'][number]> = {}): RubricResponse {
  return {
    jobCategory: 'BE',
    isCustom: false,
    criteria: [
      {
        id: 'c1',
        name: 'Chiều sâu kỹ thuật',
        description: 'mô tả',
        weight: 0.4,
        maxScore: 10,
        levels: LEVELS,
        ...overrides,
      },
    ],
  };
}

describe('rubricMapper — mốc điểm đi qua vòng đọc-sửa-lưu', () => {
  it('giữ mốc điểm khi nhận từ server', () => {
    const [editable] = mapResponseToEditable(response());
    expect(editable.levels).toEqual(LEVELS);
    expect(editable.originalMaxScore).toBe(10);
  });

  it('gửi LẠI mốc điểm khi maxScore không đổi — nếu không, lưu = xoá thang neo của admin', () => {
    const editable = mapResponseToEditable(response());
    const payload = mapEditableToUpdateRequest(editable);
    expect(payload.criteria[0].levels).toEqual(LEVELS);
  });

  it('BỎ mốc khi người dùng đổi maxScore — server bắt buộc có mốc = maxScore, echo nguyên xi sẽ thành 400', () => {
    const editable = mapResponseToEditable(response());
    const payload = mapEditableToUpdateRequest([{ ...editable[0], maxScore: 5 }]);
    expect(payload.criteria[0].levels).toBeUndefined();
  });

  it('server bản cũ không trả levels → không phát sinh field lạ trong payload', () => {
    const editable = mapResponseToEditable(response({ levels: undefined }));
    const payload = mapEditableToUpdateRequest(editable);
    expect('levels' in payload.criteria[0]).toBe(false);
  });

  it('tiêu chí người dùng tự thêm không có mốc → không gửi levels', () => {
    const payload = mapEditableToUpdateRequest([{ ...createEmptyCriterion(), name: 'Mới', maxScore: 10 }]);
    expect(payload.criteria[0].levels).toBeUndefined();
  });

  it('vẫn giữ nguyên các trường cũ (không đổi hợp đồng sẵn có)', () => {
    const editable = mapResponseToEditable(response());
    const [criterion] = mapEditableToUpdateRequest(editable).criteria;
    expect(criterion.name).toBe('Chiều sâu kỹ thuật');
    expect(criterion.description).toBe('mô tả');
    expect(criterion.weight).toBeCloseTo(0.4);
    expect(criterion.maxScore).toBe(10);
  });
});
