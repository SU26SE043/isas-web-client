import { describe, expect, it } from 'vitest';
import { mapApiRoadmapDetail } from './roadmapMapper';

function detail(lesson: Record<string, unknown>) {
  return mapApiRoadmapDetail({
    id: 'rm-1',
    milestones: [{ id: 'ms-1', orderNo: 1, title: 'M1', lessons: [{ id: 'ls-1', title: 'L1', ...lesson }] }],
  }).milestones[0].lessons[0];
}

describe('roadmapMapper — attemptCount/canRetry', () => {
  it('đọc canRetry THẲNG từ server', () => {
    expect(detail({ status: 'Done', canRetry: true }).canRetry).toBe(true);
  });

  it('bài Done mà server nói canRetry=false thì KHÔNG được suy ra true', () => {
    // Điều kiện thật của backend gồm cả ví credit + quyền sở hữu. Suy từ status
    // ở FE là hai bên lệch nhau, triệu chứng là nút hiện ra rồi bấm vào báo lỗi.
    expect(detail({ status: 'Done', canRetry: false }).canRetry).toBe(false);
  });

  it('server KHÔNG gửi canRetry ⇒ false (không đoán hộ)', () => {
    expect(detail({ status: 'Done' }).canRetry).toBe(false);
  });

  it('bài chưa Done mà server nói canRetry=true thì vẫn tôn trọng server', () => {
    expect(detail({ status: 'Theory', canRetry: true }).canRetry).toBe(true);
  });

  it('đọc attemptCount đúng TÊN field của hợp đồng', () => {
    expect(detail({ status: 'Done', attemptCount: 3 }).attemptCount).toBe(3);
  });

  it('thiếu attemptCount ⇒ 0', () => {
    expect(detail({ status: 'Theory' }).attemptCount).toBe(0);
  });
});
