import type { CampaignResultFlagEvent } from '../types/campaign.api.types';
import { isServerMarkedNote } from './flagNoteText';
import {
  getReviewPriority,
  normalizeFlagType,
  REVIEW_PRIORITY_ORDER,
  type ReviewPriority,
} from './proctoringFlagPriority';

/**
 * Hai lượt kiểm mặt liên tiếp cùng kết quả cách nhau tối đa bấy nhiêu thì vẫn coi là MỘT sự việc.
 *
 * Trong lúc một hiện tượng còn kéo dài, phòng thi kiểm ở nhịp báo động 10s (đo trên prod: các dòng
 * cách nhau 11–14s), lượt kiểm bị hoãn trong lúc upload câu trả lời có thể kéo lên ~25–30s. 30s = 2×
 * nhịp thường 15s — cùng ngưỡng phòng thi dùng cho `monitoring_gap`.
 *
 * Hằng số RIÊNG, cố ý không import từ phòng thi: HR đọc dữ liệu đã ghi ở nhịp của THỜI ĐIỂM đó, không
 * phải nhịp hôm nay; đổi nhịp phòng thi không được lặng lẽ đổi cách gộp dữ liệu cũ.
 */
export const FACE_INCIDENT_MAX_GAP_MS = 30_000;

/**
 * Cờ do lượt KIỂM MẶT định kỳ sinh ra. Server ghi MỘT dòng cho MỖI lượt kiểm còn thấy hiện tượng, nên
 * vắng mặt 1 phút 26 giây thành 8 dòng "Không thấy khuôn mặt". Chỉ nhóm này được gộp; tab/focus/paste/
 * camera là sự kiện rời rạc — mỗi dòng đúng là một lần ứng viên làm việc đó.
 */
const FACE_CHECK_SIGNALS = new Set(['noface', 'multiplefaces', 'facemismatch', 'identityunverified']);

export function isFaceCheckSignal(type: string): boolean {
  return FACE_CHECK_SIGNALS.has(normalizeFlagType(type));
}

export type ProctoringIncident = {
  /** Loại cờ như server trả (giữ nguyên để tra nhãn / in khoá thô khi loại lạ). */
  type: string;
  /** Loại đã chuẩn hoá — khoá so khớp. */
  key: string;
  priority: ReviewPriority;
  faceCheck: boolean;
  startAt: string;
  endAt: string;
  startMs: number;
  endMs: number;
  /** Số dòng cờ gộp vào sự việc này (với cờ kiểm mặt = số lượt kiểm thấy hiện tượng). */
  checks: number;
  /** Ghi chú khác nhau theo thứ tự xuất hiện. */
  notes: string[];
  /** Có dòng do server suy ra (marker `[gap#…]`/`[monitor#none]`) ⇒ mốc giờ là lúc server QUÉT. */
  serverRecorded: boolean;
};

/**
 * Gộp các dòng cờ theo giây thành SỰ VIỆC. Cờ kiểm mặt cùng loại nối vào sự việc đang mở khi cách sự
 * kiện CUỐI của nó ≤ `maxGapMs` (so với sự kiện đầu thì vắng mặt dài bị cắt vụn); mỗi loại có sự việc
 * đang mở RIÊNG, nên một cờ khác loại chen giữa không cắt chuỗi. Kết quả theo thứ tự bắt đầu.
 */
export function buildProctoringIncidents(
  events: readonly CampaignResultFlagEvent[],
  maxGapMs: number = FACE_INCIDENT_MAX_GAP_MS,
): ProctoringIncident[] {
  const sorted = events
    .map((event, index) => ({ event, index, ms: Date.parse(event.detectedAt) }))
    .filter((item) => Number.isFinite(item.ms))
    .sort((a, b) => a.ms - b.ms || a.index - b.index);

  const incidents: ProctoringIncident[] = [];
  const open = new Map<string, ProctoringIncident>();
  for (const { event, ms } of sorted) {
    const key = normalizeFlagType(event.signalType);
    const faceCheck = FACE_CHECK_SIGNALS.has(key);
    const note = event.note?.trim() || null;
    const current = faceCheck ? open.get(key) : undefined;
    if (current && ms - current.endMs <= maxGapMs) {
      current.endMs = ms;
      current.endAt = event.detectedAt;
      current.checks += 1;
      if (note && !current.notes.includes(note)) current.notes.push(note);
      current.serverRecorded ||= isServerMarkedNote(note);
      continue;
    }
    const incident: ProctoringIncident = {
      type: event.signalType,
      key,
      priority: getReviewPriority(event.signalType),
      faceCheck,
      startAt: event.detectedAt,
      endAt: event.detectedAt,
      startMs: ms,
      endMs: ms,
      checks: 1,
      notes: note ? [note] : [],
      serverRecorded: isServerMarkedNote(note),
    };
    incidents.push(incident);
    if (faceCheck) open.set(key, incident);
  }
  return incidents;
}

/** Từ lượt kiểm đầu tới lượt kiểm cuối của sự việc, giây. Giữa hai lượt kiểm không ai quan sát. */
export function incidentSpanSeconds(incident: Pick<ProctoringIncident, 'startMs' | 'endMs'>): number {
  return Math.max(0, Math.round((incident.endMs - incident.startMs) / 1000));
}

export type ProctoringTypeSummary = {
  type: string;
  key: string;
  faceCheck: boolean;
  incidents: number;
  checks: number;
  /** Tổng khoảng của các sự việc (chỉ có nghĩa với cờ kiểm mặt). */
  spanSeconds: number;
};

export type ProctoringTierGroup = {
  priority: ReviewPriority;
  items: ProctoringTypeSummary[];
};

/** Ba tầng theo thứ tự đọc, LUÔN đủ ba (tầng trống vẫn hiện "Không có" — HR cần biết đã xét). */
export function summarizeIncidentsByTier(incidents: readonly ProctoringIncident[]): ProctoringTierGroup[] {
  const byKey = new Map<string, ProctoringTypeSummary & { priority: ReviewPriority }>();
  for (const incident of incidents) {
    const summary = byKey.get(incident.key) ?? {
      type: incident.type,
      key: incident.key,
      faceCheck: incident.faceCheck,
      priority: incident.priority,
      incidents: 0,
      checks: 0,
      spanSeconds: 0,
    };
    summary.incidents += 1;
    summary.checks += incident.checks;
    summary.spanSeconds += incidentSpanSeconds(incident);
    byKey.set(incident.key, summary);
  }
  const all = [...byKey.values()];
  return REVIEW_PRIORITY_ORDER.map((priority) => ({
    priority,
    items: all
      .filter((item) => item.priority === priority)
      .sort((a, b) => b.incidents - a.incidents || b.checks - a.checks || a.key.localeCompare(b.key))
      .map(({ priority: _priority, ...item }) => item),
  }));
}
