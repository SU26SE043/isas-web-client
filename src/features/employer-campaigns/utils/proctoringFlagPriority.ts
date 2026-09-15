export type ReviewPriority = 'identity' | 'behavior' | 'environment';

function normalizedFlagType(type: string) {
  return type.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const REVIEW_PRIORITY_BY_FLAG: Record<string, ReviewPriority> = {
  facemismatch: 'identity',
  multiplefaces: 'identity',
  multivoice: 'identity',
  noface: 'behavior',
  tabswitch: 'behavior',
  paste: 'behavior',
  focuslost: 'behavior',
  focusswitch: 'behavior',
  fullexit: 'behavior',
  fullscreenexit: 'behavior',
  camerablocked: 'environment',
  monitoringgap: 'environment',
  identityunverified: 'environment',
};

export function getReviewPriority(type: string): ReviewPriority {
  return REVIEW_PRIORITY_BY_FLAG[normalizedFlagType(type)] ?? 'environment';
}

/**
 * Cờ "cửa sổ" = ứng viên rời khỏi màn thi (chuyển tab, mất focus, thoát toàn màn hình). CHỈ nhóm này
 * được cộng vào ô "Vi phạm cửa sổ" — trước 2026-09-15 ô đó cộng MỌI cờ không-phải-thời-gian (kể cả
 * face_mismatch, camera_blocked, monitoring_gap) trong khi nhãn nói "Lần chuyển tab hoặc rời cửa sổ",
 * nên buổi có 5 lần rời tab hiện thành 13 (đo trên dev: 1+1+4+2+1+1+1+1+1).
 */
const WINDOW_FLAG_TYPES = new Set(['tabswitch', 'focuslost', 'focusswitch', 'fullscreenexit', 'fullexit']);

export function isWindowFlag(type: string): boolean {
  return WINDOW_FLAG_TYPES.has(normalizedFlagType(type));
}

/**
 * Khoá i18n nhãn người-đọc cho từng loại cờ (`employer.campaigns.results.flags.type.<loại>`); loại lạ
 * (backend thêm sau) → null để UI in khoá thô thay vì nuốt im lặng. Danh sách khớp whitelist
 * SessionFlagController (FeSignals ∪ AiSignals) + `fullscreen_exit` FE dùng nội bộ.
 */
const LABELLED_FLAG_TYPES: Record<string, string> = {
  tabswitch: 'tab_switch',
  focuslost: 'focus_lost',
  focusswitch: 'focus_lost',
  paste: 'paste',
  camerablocked: 'camera_blocked',
  monitoringgap: 'monitoring_gap',
  facemismatch: 'face_mismatch',
  noface: 'no_face',
  multiplefaces: 'multiple_faces',
  identityunverified: 'identity_unverified',
  multivoice: 'multi_voice',
  fullscreenexit: 'fullscreen_exit',
  fullexit: 'fullscreen_exit',
};

export function flagTypeLabelKey(type: string): string | null {
  const canonical = LABELLED_FLAG_TYPES[normalizedFlagType(type)];
  return canonical ? `employer.campaigns.results.flags.type.${canonical}` : null;
}

export const REVIEW_PRIORITY_CLASS: Record<ReviewPriority, string> = {
  identity: 'border-error/35 bg-error/10 text-error',
  behavior: 'border-warning/35 bg-warning/10 text-warning',
  environment: 'border-satin bg-surface-overlay text-muted-foreground',
};
