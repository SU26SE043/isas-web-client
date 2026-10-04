import { describe, expect, it } from 'vitest';
import type { PracticeSessionResultViewModel } from './practiceSessionResultViewModel';
import { buildFocusBreakdownLabel, buildFocusSummaryMessage, countFocusGroups } from './focusTrackingSummary';

// Mock t trả TEMPLATE thật để {{n}}/{{detail}}/{{placement}} được thay — trả key thì mutation "thay sai số" XANH.
const DICT: Record<string, string> = {
  'practice.result.focusTracking.message': 'LEAVE {{n}}{{placement}}.',
  'practice.result.focusTracking.pasteMessage': 'PASTE {{n}}.',
  'practice.result.focusTracking.frameMessage': 'FRAME {{n}} ({{detail}}).',
  'practice.result.focusTracking.frameOnly': 'ONLY-FRAME {{n}} ({{detail}}).',
  'practice.result.focusTracking.empty': 'EMPTY',
  'practice.result.focusTracking.spread': 'spread',
  'practice.result.focusTracking.detail.no_face': '{{n}} no-face',
  'practice.result.focusTracking.detail.multiple_faces': '{{n}} multi',
  'practice.result.focusTracking.detail.camera_blocked': '{{n}} covered',
  'practice.result.focusTracking.short.leave': 'L{{n}}',
  'practice.result.focusTracking.short.paste': 'P{{n}}',
  'practice.result.focusTracking.short.face': 'F{{n}}',
  'practice.result.focusTracking.short.camera': 'C{{n}}',
};
const t = (key: string) => DICT[key] ?? key;

function view(focusEvents: PracticeSessionResultViewModel['focusEvents'], over: Partial<PracticeSessionResultViewModel> = {}) {
  return { focusEvents, ...over } as PracticeSessionResultViewModel;
}

const at = '2026-10-03T02:17:00Z';

describe('countFocusGroups', () => {
  it('tách 4 nhóm; che cam là nhóm RIÊNG, không gộp vào khuôn mặt', () => {
    expect(countFocusGroups([
      { signalType: 'tab_switch', count: 2, firstAt: at, lastAt: at },
      { signalType: 'focus_lost', count: 1, firstAt: at, lastAt: at },
      { signalType: 'paste', count: 4, firstAt: at, lastAt: at },
      { signalType: 'no_face', count: 5, firstAt: at, lastAt: at },
      { signalType: 'multiple_faces', count: 6, firstAt: at, lastAt: at },
      { signalType: 'camera_blocked', count: 7, firstAt: at, lastAt: at },
    ])).toEqual({ window: 3, paste: 4, face: 11, camera: 7, total: 25 });
  });

  it('null/undefined → toàn 0', () => {
    expect(countFocusGroups(null)).toEqual({ window: 0, paste: 0, face: 0, camera: 0, total: 0 });
  });
});

describe('buildFocusSummaryMessage', () => {
  it('có cả rời buổi lẫn khung hình → nêu CẢ HAI, liệt kê đúng từng loại khung hình có xảy ra', () => {
    // Ca 2026-10-03 (buổi 49488bfc): rời cửa sổ 1, có 2 người 1, không thấy mặt 1. Bản cũ chỉ in câu rời buổi.
    const message = buildFocusSummaryMessage(view([
      { signalType: 'focus_lost', count: 1, firstAt: at, lastAt: at },
      { signalType: 'multiple_faces', count: 1, firstAt: at, lastAt: at },
      { signalType: 'camera_blocked', count: 2, firstAt: at, lastAt: at },
    ], { focusLeavePlacement: 'spread' }), t);
    expect(message).toBe('LEAVE 1, spread. FRAME 3 (1 multi, 2 covered).');
  });

  it('chỉ khung hình → câu frameOnly, không có câu rời buổi', () => {
    expect(buildFocusSummaryMessage(view([
      { signalType: 'no_face', count: 4, firstAt: at, lastAt: at },
    ]), t)).toBe('ONLY-FRAME 4 (4 no-face).');
  });

  it('không có gì → câu rỗng', () => {
    expect(buildFocusSummaryMessage(view([]), t)).toBe('EMPTY');
  });
});

describe('dán là nhóm RIÊNG — câu nhận xét và nhãn nút cùng số với ô "Rời tab / cửa sổ"', () => {
  // Lỗi báo trên buổi d872fb98 (có dán): nút "Rời buổi N" và câu nhận xét cộng cả dán, ô "Rời tab / cửa sổ" thì không.
  const events = [
    { signalType: 'focus_lost', count: 1, firstAt: at, lastAt: at },
    { signalType: 'paste', count: 2, firstAt: at, lastAt: at },
    { signalType: 'no_face', count: 1, firstAt: at, lastAt: at },
  ] as const;

  it('câu nhận xét: rời 1 (= ô Rời tab), dán 2 câu riêng, rồi khung hình', () => {
    const message = buildFocusSummaryMessage(view([...events], { focusLeavePlacement: 'spread' }), t);
    expect(message).toBe('LEAVE 1, spread. PASTE 2. FRAME 1 (1 no-face).');
    expect(countFocusGroups([...events]).window).toBe(1);
  });

  it('chỉ dán (không rời) ⇒ không có câu rời buổi; khung hình dùng câu frameOnly', () => {
    expect(buildFocusSummaryMessage(view([events[1], events[2]]), t)).toBe('PASTE 2. ONLY-FRAME 1 (1 no-face).');
  });

  it('nhãn nút: L1 · P2 · F1 — tổng các nhóm = ×tổng của ô Tổng quan', () => {
    expect(buildFocusBreakdownLabel(view([...events]), t)).toBe('L1 · P2 · F1');
    expect(countFocusGroups([...events]).total).toBe(4);
  });
});

describe('buildFocusBreakdownLabel', () => {
  it('chỉ nhóm có xảy ra, theo thứ tự rời buổi · dán · khuôn mặt · che cam', () => {
    expect(buildFocusBreakdownLabel(view([
      { signalType: 'camera_blocked', count: 3, firstAt: at, lastAt: at },
      { signalType: 'paste', count: 1, firstAt: at, lastAt: at },
      { signalType: 'tab_switch', count: 1, firstAt: at, lastAt: at },
    ]), t)).toBe('L1 · P1 · C3');
  });
});
