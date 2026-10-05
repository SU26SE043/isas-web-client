export type ReviewPriority = 'identity' | 'behavior' | 'environment';

/** `NoFace`, `no_face`, `no-face` → `noface`. Mọi so khớp loại cờ đi qua đây. */
export function normalizeFlagType(type: string) {
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
  return REVIEW_PRIORITY_BY_FLAG[normalizeFlagType(type)] ?? 'environment';
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
  const canonical = LABELLED_FLAG_TYPES[normalizeFlagType(type)];
  return canonical ? `employer.campaigns.results.flags.type.${canonical}` : null;
}

/** Nhãn người đọc; loại lạ (backend thêm sau) in khoá thô thay vì nuốt im lặng — HR vẫn thấy có cờ. */
export function flagTypeLabel(type: string, t: (key: string) => string): string {
  const key = flagTypeLabelKey(type);
  return key ? t(key) : type;
}

/** Thứ tự HR nên đọc — khớp `ReviewPriority` của backend (CampaignService, AC1): danh tính → hành vi → môi trường. */
export const REVIEW_PRIORITY_ORDER: readonly ReviewPriority[] = ['identity', 'behavior', 'environment'];

export function reviewPriorityRank(priority: ReviewPriority): number {
  return REVIEW_PRIORITY_ORDER.indexOf(priority);
}

/**
 * Loại cờ HR nên thấy đầu tiên trên MỘT hàng của bảng: tầng nặng nhất, rồi nhiều lượt nhất, rồi tên.
 * KHÔNG lấy phần tử đầu mảng — thứ tự backend đúng hôm nay, nhưng ô bảng không được phụ thuộc vào đó
 * (dữ liệu dựng tay trong test, bản cache cũ, server khác phiên bản).
 */
export function pickTopFlag<T extends { type: string; count: number }>(flags: readonly T[]): T | null {
  let top: T | null = null;
  for (const flag of flags) {
    if (!top) {
      top = flag;
      continue;
    }
    const byTier = reviewPriorityRank(getReviewPriority(flag.type)) - reviewPriorityRank(getReviewPriority(top.type));
    if (byTier < 0 || (byTier === 0 && (flag.count > top.count
      || (flag.count === top.count && normalizeFlagType(flag.type) < normalizeFlagType(top.type))))) {
      top = flag;
    }
  }
  return top;
}

/** Số LOẠI cờ khác nhau — cùng loại mà có cả dòng Client lẫn Server (MON1-B4) chỉ tính một. */
export function distinctFlagTypeCount(flags: readonly { type: string }[]): number {
  return new Set(flags.map((flag) => normalizeFlagType(flag.type))).size;
}

export const REVIEW_PRIORITY_CLASS: Record<ReviewPriority, string> = {
  identity: 'border-error/35 bg-error/10 text-error',
  behavior: 'border-warning/35 bg-warning/10 text-warning',
  environment: 'border-satin bg-surface-overlay text-muted-foreground',
};

/** Chấm màu theo tầng — dùng ở dòng thời gian và ô bảng, nơi cả khung màu thì quá nặng. */
export const REVIEW_PRIORITY_DOT_CLASS: Record<ReviewPriority, string> = {
  identity: 'bg-error',
  behavior: 'bg-warning',
  environment: 'bg-muted-foreground',
};
