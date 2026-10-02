import { getApiStatusCode } from '@/shared/api/apiError';
import { beginPracticeSession, getPracticeSession } from '../services/b2cPracticeSession.service';
import type {
  PracticeSessionBeginResponse,
  PracticeSessionResponse,
} from '../types/b2cPracticeSession.types';
import { computeServerOffsetMs, type ExamClockEntry } from '../utils/examSessionClock';
import { getPracticeApiErrorCode } from '../utils/practiceApiErrorCode';
import { loadRoomSession } from './loadRoomSession';

/**
 * ATT1-F4 — vào phòng thi B2B: begin [I1] → (đề mở khoá) → GET session [I2].
 *
 * - begin chạy ĐÚNG 1 lần khi vào phòng (sau trang chuẩn bị — KHÔNG bao giờ ở trang chuẩn bị, nếu không
 *   đồng hồ chạy trong lúc kiểm thiết bị). StrictMode chạy effect hai lần ⇒ `beginSessionOnce` gộp hai lời
 *   gọi đang bay của cùng một buổi thành một request.
 * - begin 404 / chế độ mock ⇒ `null` ⇒ đường cũ y nguyên (`loadRoomSession`, marker dự phòng, deadlineAt).
 * - Đề vẫn khoá sau begin ⇒ begin lại 1 lần rồi đọc lại; vẫn khoá ⇒ lỗi tải phòng (`questions_locked`).
 * - 409 SESSION_ENDED ⇒ `session_ended`: buổi đã kết thúc (hết giờ / đã nộp) — phòng không mở, báo rõ.
 */

export type ExamRoomEntryFailure = 'questions_locked' | 'session_ended' | 'failed';

export class ExamRoomEntryError extends Error {
  readonly reason: ExamRoomEntryFailure;

  constructor(reason: ExamRoomEntryFailure, cause?: unknown) {
    super(`EXAM_ROOM_ENTRY_${reason.toUpperCase()}`);
    this.name = 'ExamRoomEntryError';
    this.reason = reason;
    if (cause !== undefined) (this as { cause?: unknown }).cause = cause;
  }
}

export interface ExamRoomEntry {
  session: PracticeSessionResponse;
  clock: ExamClockEntry;
}

type BeginOutcome = { begin: PracticeSessionBeginResponse | null; receivedAtMs: number };

export type EnterExamRoomDeps = {
  begin: typeof beginPracticeSession;
  fetchSession: typeof getPracticeSession;
  loadLegacy: typeof loadRoomSession;
  /** Begin có kết quả ⇒ đề đã mở khoá: caller invalidate cache phiên (khoá trang chuẩn bị dùng chung). */
  onBegun?: () => void;
  now?: () => number;
};

// Bọc arrow: chỉ chạm export của service lúc GỌI (test mock một phần service không vỡ lúc nạp module).
const DEFAULT_DEPS: EnterExamRoomDeps = {
  begin: (sessionId) => beginPracticeSession(sessionId),
  fetchSession: (sessionId) => getPracticeSession(sessionId),
  loadLegacy: (sessionId) => loadRoomSession(sessionId),
};

const inflightBegins = new Map<string, Promise<BeginOutcome>>();

/** Gộp các lời gọi begin ĐANG BAY của cùng buổi (StrictMode / re-render) thành một request. */
export function beginSessionOnce(
  sessionId: string,
  begin: EnterExamRoomDeps['begin'] = beginPracticeSession,
  now: () => number = Date.now,
): Promise<BeginOutcome> {
  const existing = inflightBegins.get(sessionId);
  if (existing) return existing;
  const pending = begin(sessionId)
    .then((result) => ({ begin: result, receivedAtMs: now() }))
    .finally(() => inflightBegins.delete(sessionId));
  inflightBegins.set(sessionId, pending);
  return pending;
}

/** Test-only: quên các begin đang bay (test để promise treo không được rò sang test sau). */
export function resetExamRoomBeginsForTests() {
  inflightBegins.clear();
}

function toEntryError(error: unknown): ExamRoomEntryError {
  if (error instanceof ExamRoomEntryError) return error;
  const ended = getPracticeApiErrorCode(error) === 'SESSION_ENDED' || getApiStatusCode(error) === 409;
  return new ExamRoomEntryError(ended ? 'session_ended' : 'failed', error);
}

async function fetchUnlockedSession(sessionId: string, deps: EnterExamRoomDeps, now: () => number) {
  try {
    // Không rơi về marker: sau ATT1 marker của start có content rỗng — dùng nó là hiện đề trống.
    const session = await deps.fetchSession(sessionId);
    return { session, sessionOffsetMs: computeServerOffsetMs(session.serverNow, now()) };
  } catch (error) {
    throw toEntryError(error);
  }
}

async function beginOrThrow(sessionId: string, deps: EnterExamRoomDeps, now: () => number) {
  try {
    return await beginSessionOnce(sessionId, deps.begin, now);
  } catch (error) {
    throw toEntryError(error);
  }
}

/** `null` ⇒ caller đã huỷ (unmount / StrictMode) — không được đụng store. */
export async function enterExamRoom(
  sessionId: string,
  overrides: Partial<EnterExamRoomDeps> = {},
  isCancelled: () => boolean = () => false,
): Promise<ExamRoomEntry | null> {
  const deps: EnterExamRoomDeps = { ...DEFAULT_DEPS, ...overrides };
  const now = deps.now ?? Date.now;
  const first = await beginOrThrow(sessionId, deps, now);
  if (isCancelled()) return null;

  if (!first.begin) {
    // Backend cũ: đường cũ (GET, marker dự phòng). Lỗi ⇒ bảng lỗi thay vì phòng trống không lời nào.
    const session = await deps.loadLegacy(sessionId).catch((error: unknown) => {
      throw toEntryError(error);
    });
    return isCancelled() ? null : { session, clock: { kind: 'legacy' } };
  }

  deps.onBegun?.();
  let begin = first.begin;
  let beginOffsetMs = computeServerOffsetMs(begin.serverNow, first.receivedAtMs);
  let loaded = await fetchUnlockedSession(sessionId, deps, now);
  if (isCancelled()) return null;

  if (loaded.session.questionsLocked) {
    const again = await beginOrThrow(sessionId, deps, now);
    if (isCancelled()) return null;
    if (again.begin) {
      begin = again.begin;
      beginOffsetMs = computeServerOffsetMs(begin.serverNow, again.receivedAtMs);
    }
    loaded = await fetchUnlockedSession(sessionId, deps, now);
    if (isCancelled()) return null;
    if (loaded.session.questionsLocked) throw new ExamRoomEntryError('questions_locked');
  }

  return {
    session: loaded.session,
    clock: { kind: 'begun', begin, beginOffsetMs, sessionOffsetMs: loaded.sessionOffsetMs },
  };
}
