import { describe, expect, it } from 'vitest';
import type { PracticeSessionResultViewModel } from './practiceSessionResultViewModel';
import { buildFocusBreakdownLabel, buildFocusSummaryMessage, countFocusGroups } from './focusTrackingSummary';

// Mock t trả TEMPLATE thật để {{n}}/{{detail}}/{{placement}} được thay — trả key thì mutation "thay sai số" XANH.
const DICT: Record<string, string> = {
  'practice.result.focusTracking.message': 'LEAVE {{n}}{{placement}}.',
  'practice.result.focusTracking.frameMessage': 'FRAME {{n}} ({{detail}}).',
  'practice.result.focusTracking.frameOnly': 'ONLY-FRAME {{n}} ({{detail}}).',
  'practice.result.focusTracking.empty': 'EMPTY',
  'practice.result.focusTracking.spread': 'spread',
  'practice.result.focusTracking.detail.no_face': '{{n}} no-face',
  'practice.result.focusTracking.detail.multiple_faces': '{{n}} multi',
  'practice.result.focusTracking.detail.camera_blocked': '{{n}} covered',
  'practice.result.focusTracking.short.leave': 'L{{n}}',
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
    ], { focusLeaveCount: 1, focusFrameCount: 3, focusLeavePlacement: 'spread' }), t);
    expect(message).toBe('LEAVE 1, spread. FRAME 3 (1 multi, 2 covered).');
  });

  it('chỉ khung hình → câu frameOnly, không có câu rời buổi', () => {
    expect(buildFocusSummaryMessage(view([
      { signalType: 'no_face', count: 4, firstAt: at, lastAt: at },
    ], { focusLeaveCount: 0, focusFrameCount: 4 }), t)).toBe('ONLY-FRAME 4 (4 no-face).');
  });

  it('không có gì → câu rỗng', () => {
    expect(buildFocusSummaryMessage(view([], { focusLeaveCount: 0, focusFrameCount: 0 }), t)).toBe('EMPTY');
  });
});

describe('buildFocusBreakdownLabel', () => {
  it('chỉ nhóm có xảy ra, theo thứ tự rời buổi · khuôn mặt · che cam; dán tính vào rời buổi', () => {
    expect(buildFocusBreakdownLabel(view([
      { signalType: 'camera_blocked', count: 3, firstAt: at, lastAt: at },
      { signalType: 'paste', count: 1, firstAt: at, lastAt: at },
      { signalType: 'tab_switch', count: 1, firstAt: at, lastAt: at },
    ]), t)).toBe('L2 · C3');
  });
});
