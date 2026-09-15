import { describe, expect, it } from 'vitest';
import { flagTypeLabelKey, getReviewPriority, isWindowFlag } from './proctoringFlagPriority';

describe('proctoring flag review priority', () => {
  it('keeps identity_unverified in the environment tier', () => {
    expect(getReviewPriority('identity_unverified')).toBe('environment');
  });

  it('normalizes PascalCase and separators before resolving a tier', () => {
    expect(getReviewPriority('FaceMismatch')).toBe('identity');
    expect(getReviewPriority('TabSwitch')).toBe('behavior');
    expect(getReviewPriority('MonitoringGap')).toBe('environment');
  });
});

describe('isWindowFlag — ô "Vi phạm cửa sổ" chỉ đếm cờ rời màn thi', () => {
  it('nhận tab/focus/fullscreen, kể cả PascalCase', () => {
    for (const t of ['tab_switch', 'focus_lost', 'fullscreen_exit', 'TabSwitch', 'FocusLost']) {
      expect(isWindowFlag(t)).toBe(true);
    }
  });

  it('KHÔNG nhận cờ mặt/camera/monitoring/paste — trước đây bị cộng vào "cửa sổ" (13 thay vì 5)', () => {
    for (const t of ['face_mismatch', 'no_face', 'multiple_faces', 'identity_unverified', 'camera_blocked', 'monitoring_gap', 'paste', 'multi_voice']) {
      expect(isWindowFlag(t)).toBe(false);
    }
  });
});

describe('flagTypeLabelKey — nhãn người-đọc cho từng loại cờ', () => {
  it('có khoá cho đủ 10 loại whitelist BE + fullscreen_exit', () => {
    for (const t of ['tab_switch', 'focus_lost', 'paste', 'camera_blocked', 'monitoring_gap', 'face_mismatch', 'no_face', 'multiple_faces', 'identity_unverified', 'multi_voice', 'fullscreen_exit']) {
      expect(flagTypeLabelKey(t)).toBe(`employer.campaigns.results.flags.type.${t}`);
    }
  });

  it('chuẩn hoá PascalCase về cùng khoá; loại lạ → null (UI in khoá thô, không nuốt)', () => {
    expect(flagTypeLabelKey('FaceMismatch')).toBe('employer.campaigns.results.flags.type.face_mismatch');
    expect(flagTypeLabelKey('weird_new_signal')).toBeNull();
  });
});
