import { describe, expect, it } from 'vitest';
import {
  distinctFlagTypeCount,
  flagTypeLabel,
  flagTypeLabelKey,
  getReviewPriority,
  normalizeFlagType,
  pickTopFlag,
} from './proctoringFlagPriority';

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

describe('pickTopFlag — loại HR nên thấy đầu tiên trên một hàng', () => {
  const f = (type: string, count: number) => ({ type, count });

  it('tầng nặng hơn thắng dù ít lượt hơn và đứng sau', () => {
    expect(pickTopFlag([f('tab_switch', 9), f('camera_blocked', 9), f('multiple_faces', 1)])?.type).toBe('multiple_faces');
  });

  it('cùng tầng: nhiều lượt hơn thắng; bằng nhau thì theo tên (ổn định, không phụ thuộc thứ tự mảng)', () => {
    expect(pickTopFlag([f('paste', 1), f('no_face', 5)])?.type).toBe('no_face');
    expect(pickTopFlag([f('tab_switch', 2), f('paste', 2)])?.type).toBe('paste');
    expect(pickTopFlag([f('paste', 2), f('tab_switch', 2)])?.type).toBe('paste');
  });

  it('mảng rỗng ⇒ null', () => {
    expect(pickTopFlag([])).toBeNull();
  });
});

describe('distinctFlagTypeCount / normalizeFlagType', () => {
  it('Client và Server cùng loại, khác cách viết vẫn là MỘT loại', () => {
    expect(distinctFlagTypeCount([{ type: 'monitoring_gap' }, { type: 'MonitoringGap' }, { type: 'paste' }])).toBe(2);
    expect(normalizeFlagType('No-Face')).toBe('noface');
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

describe('flagTypeLabel', () => {
  it('loại biết ⇒ dịch; loại lạ ⇒ in khoá thô', () => {
    const t = (key: string) => `T(${key})`;
    expect(flagTypeLabel('NoFace', t)).toBe('T(employer.campaigns.results.flags.type.no_face)');
    expect(flagTypeLabel('weird_new_signal', t)).toBe('weird_new_signal');
  });
});
