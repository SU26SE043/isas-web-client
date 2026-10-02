import { describe, expect, it } from 'vitest';
import {
  computeExamRemainingSeconds,
  computeServerOffsetMs,
  getExamClockMilestone,
  getExamClockSeverity,
  resolveExamClockAnchor,
  type ExamClockEntry,
} from './examSessionClock';

const SERVER_NOW = '2026-10-02T03:00:00.000Z';
const SERVER_MS = Date.parse(SERVER_NOW);
const TEN_MIN = 10 * 60_000;

function begun(overrides: Partial<Extract<ExamClockEntry, { kind: 'begun' }>> = {}): ExamClockEntry {
  return {
    kind: 'begun',
    begin: {
      sessionId: 's-1',
      beganAt: SERVER_NOW,
      deadline: '2026-10-02T03:30:00.000Z',
      serverNow: SERVER_NOW,
      durationMinutes: 30,
    },
    beginOffsetMs: 0,
    sessionOffsetMs: null,
    ...overrides,
  };
}

describe('examSessionClock — giờ server', () => {
  it('offset = serverNow − giờ máy lúc nhận (máy chạy NHANH 10 phút ⇒ offset −10 phút)', () => {
    expect(computeServerOffsetMs(SERVER_NOW, SERVER_MS + TEN_MIN)).toBe(-TEN_MIN);
    expect(computeServerOffsetMs(SERVER_NOW, SERVER_MS - TEN_MIN)).toBe(TEN_MIN);
    expect(computeServerOffsetMs(null, SERVER_MS)).toBeNull();
    expect(computeServerOffsetMs('không phải ngày', SERVER_MS)).toBeNull();
  });

  it('còn lại = deadline − (giờ máy + offset): máy lệch +10 phút vẫn ra đúng 30:00', () => {
    const deadlineMs = SERVER_MS + 30 * 60_000;
    const machineNow = SERVER_MS + TEN_MIN;
    const offset = computeServerOffsetMs(SERVER_NOW, machineNow)!;

    expect(computeExamRemainingSeconds(deadlineMs, offset, machineNow)).toBe(1800);
    // 61 giây sau theo giờ máy ⇒ 1739 (làm tròn lên từng giây).
    expect(computeExamRemainingSeconds(deadlineMs, offset, machineNow + 61_000)).toBe(1739);
    expect(computeExamRemainingSeconds(deadlineMs, offset, machineNow + 999)).toBe(1800);
  });

  it('quá hạn ⇒ 0, không âm', () => {
    expect(computeExamRemainingSeconds(SERVER_MS, 0, SERVER_MS + 5_000)).toBe(0);
  });

  it('mốc màu: > 5 phút bình thường · ≤ 5 phút cảnh báo · ≤ 1 phút lỗi', () => {
    expect(getExamClockSeverity(301)).toBe('normal');
    expect(getExamClockSeverity(300)).toBe('warning');
    expect(getExamClockSeverity(61)).toBe('warning');
    expect(getExamClockSeverity(60)).toBe('critical');
    expect(getExamClockSeverity(0)).toBe('critical');
  });

  it('mốc thông báo chỉ có ở 5 phút / 1 phút / 0', () => {
    expect(getExamClockMilestone(301)).toBeNull();
    expect(getExamClockMilestone(300)).toBe('fiveMinutes');
    expect(getExamClockMilestone(61)).toBe('fiveMinutes');
    expect(getExamClockMilestone(60)).toBe('oneMinute');
    expect(getExamClockMilestone(1)).toBe('oneMinute');
    expect(getExamClockMilestone(0)).toBe('timeUp');
  });
});

describe('resolveExamClockAnchor', () => {
  const START_DEADLINE = '2026-10-05T00:00:00.000Z'; // hạn cứng chiến dịch (deadlineAt của start)

  it('đang begin ⇒ CHƯA có đồng hồ (không lấy tạm deadlineAt của start)', () => {
    expect(resolveExamClockAnchor({ kind: 'pending' }, START_DEADLINE)).toBeNull();
  });

  it('begin có kết quả ⇒ dùng begin.deadline, KHÔNG dùng deadlineAt của start', () => {
    const anchor = resolveExamClockAnchor(begun(), START_DEADLINE);
    expect(anchor).toEqual({ deadlineMs: Date.parse('2026-10-02T03:30:00.000Z'), offsetMs: 0, timed: true });
  });

  it('offset của GET (mới hơn) được ưu tiên hơn offset của begin', () => {
    expect(resolveExamClockAnchor(begun({ beginOffsetMs: -5, sessionOffsetMs: -7 }), null)?.offsetMs).toBe(-7);
    expect(resolveExamClockAnchor(begun({ beginOffsetMs: -5, sessionOffsetMs: null }), null)?.offsetMs).toBe(-5);
  });

  it('buổi không tính giờ (durationMinutes null) ⇒ không hiện đồng hồ header, vẫn chặn theo deadline của begin', () => {
    const entry = begun();
    if (entry.kind !== 'begun') throw new Error('fixture');
    entry.begin = { ...entry.begin, beganAt: null, durationMinutes: null, deadline: '2026-10-03T00:00:00.000Z' };
    expect(resolveExamClockAnchor(entry, START_DEADLINE)).toEqual({
      deadlineMs: Date.parse('2026-10-03T00:00:00.000Z'),
      offsetMs: 0,
      timed: false,
    });
  });

  it('begin 404 / không begin ⇒ đường cũ: deadlineAt của start, giờ máy, không tính giờ', () => {
    expect(resolveExamClockAnchor({ kind: 'legacy' }, START_DEADLINE)).toEqual({
      deadlineMs: Date.parse(START_DEADLINE),
      offsetMs: 0,
      timed: false,
    });
    expect(resolveExamClockAnchor({ kind: 'legacy' }, undefined)).toEqual({ deadlineMs: null, offsetMs: 0, timed: false });
  });
});
