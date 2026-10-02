import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  PracticeSessionBeginResponse,
  PracticeSessionResponse,
} from '../types/b2cPracticeSession.types';
import {
  beginSessionOnce,
  enterExamRoom,
  ExamRoomEntryError,
  resetExamRoomBeginsForTests,
} from './enterExamRoom';

const SERVER_NOW = '2026-10-02T03:00:00.000Z';
const MACHINE_MS = Date.parse(SERVER_NOW) + 10 * 60_000; // máy chạy nhanh 10 phút

const BEGIN: PracticeSessionBeginResponse = {
  sessionId: 's-1',
  beganAt: SERVER_NOW,
  deadline: '2026-10-02T03:30:00.000Z',
  serverNow: SERVER_NOW,
  durationMinutes: 30,
};

function session(overrides: Partial<PracticeSessionResponse> = {}): PracticeSessionResponse {
  return {
    id: 's-1',
    status: 'InProgress',
    questions: [{ id: 'q-1', orderNo: 1, content: 'Câu 1', timeLimitSec: 120, kind: 'question' }],
    answers: [],
    result: null,
    serverNow: SERVER_NOW,
    questionsLocked: false,
    ...overrides,
  };
}

function conflict(code: string) {
  return new AxiosError('409', '409', undefined, undefined, {
    status: 409,
    statusText: 'Conflict',
    data: { code, error: 'ended' },
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

afterEach(() => resetExamRoomBeginsForTests());

describe('enterExamRoom — begin TRƯỚC khi đọc câu', () => {
  it('begin → onBegun → GET (đúng thứ tự), offset tính theo giờ server', async () => {
    const begin = vi.fn().mockResolvedValue(BEGIN);
    const onBegun = vi.fn();
    const fetchSession = vi.fn().mockResolvedValue(session());
    const loadLegacy = vi.fn();

    const entry = await enterExamRoom('s-1', { begin, fetchSession, loadLegacy, onBegun, now: () => MACHINE_MS });

    expect(begin).toHaveBeenCalledTimes(1);
    expect(fetchSession).toHaveBeenCalledTimes(1);
    expect(begin.mock.invocationCallOrder[0]).toBeLessThan(onBegun.mock.invocationCallOrder[0]!);
    expect(onBegun.mock.invocationCallOrder[0]).toBeLessThan(fetchSession.mock.invocationCallOrder[0]!);
    expect(loadLegacy).not.toHaveBeenCalled();
    expect(entry?.clock).toEqual({
      kind: 'begun',
      begin: BEGIN,
      beginOffsetMs: -10 * 60_000,
      sessionOffsetMs: -10 * 60_000,
    });
    expect(entry?.session.questions[0]?.content).toBe('Câu 1');
  });

  it('begin 404 (null) ⇒ đường cũ loadRoomSession, không onBegun', async () => {
    const legacySession = session({ serverNow: undefined, questionsLocked: false });
    const begin = vi.fn().mockResolvedValue(null);
    const onBegun = vi.fn();
    const fetchSession = vi.fn();
    const loadLegacy = vi.fn().mockResolvedValue(legacySession);

    const entry = await enterExamRoom('s-1', { begin, fetchSession, loadLegacy, onBegun });

    expect(entry).toEqual({ session: legacySession, clock: { kind: 'legacy' } });
    expect(fetchSession).not.toHaveBeenCalled();
    expect(onBegun).not.toHaveBeenCalled();
  });

  it('begin 404 + đường cũ lỗi ⇒ failed (bảng lỗi thay vì phòng trống)', async () => {
    await expect(enterExamRoom('s-1', {
      begin: vi.fn().mockResolvedValue(null),
      fetchSession: vi.fn(),
      loadLegacy: vi.fn().mockRejectedValue(new Error('network')),
    })).rejects.toMatchObject({ reason: 'failed' });
  });

  it('đề vẫn khoá sau begin ⇒ begin lại ĐÚNG 1 lần rồi đọc lại', async () => {
    const begin = vi.fn().mockResolvedValue(BEGIN);
    const fetchSession = vi.fn()
      .mockResolvedValueOnce(session({ questionsLocked: true }))
      .mockResolvedValueOnce(session());

    const entry = await enterExamRoom('s-1', { begin, fetchSession, loadLegacy: vi.fn() });

    expect(begin).toHaveBeenCalledTimes(2);
    expect(fetchSession).toHaveBeenCalledTimes(2);
    expect(entry?.session.questionsLocked).toBe(false);
  });

  it('vẫn khoá sau lần begin thứ hai ⇒ lỗi tải phòng questions_locked (không begin lần 3)', async () => {
    const begin = vi.fn().mockResolvedValue(BEGIN);
    const fetchSession = vi.fn().mockResolvedValue(session({ questionsLocked: true }));

    await expect(enterExamRoom('s-1', { begin, fetchSession, loadLegacy: vi.fn() }))
      .rejects.toMatchObject({ reason: 'questions_locked' });
    expect(begin).toHaveBeenCalledTimes(2);
  });

  it('409 SESSION_ENDED ⇒ session_ended, không GET', async () => {
    const begin = vi.fn().mockRejectedValue(conflict('SESSION_ENDED'));
    const fetchSession = vi.fn();

    const error = await enterExamRoom('s-1', { begin, fetchSession, loadLegacy: vi.fn() }).catch((e) => e);

    expect(error).toBeInstanceOf(ExamRoomEntryError);
    expect(error.reason).toBe('session_ended');
    expect(fetchSession).not.toHaveBeenCalled();
  });

  it('GET lỗi sau begin ⇒ failed (không rơi về marker có đề rỗng)', async () => {
    const loadLegacy = vi.fn();
    await expect(enterExamRoom('s-1', {
      begin: vi.fn().mockResolvedValue(BEGIN),
      fetchSession: vi.fn().mockRejectedValue(new Error('network')),
      loadLegacy,
    })).rejects.toMatchObject({ reason: 'failed' });
    expect(loadLegacy).not.toHaveBeenCalled();
  });

  it('caller huỷ sau begin ⇒ null, không GET', async () => {
    const fetchSession = vi.fn();
    const entry = await enterExamRoom(
      's-1',
      { begin: vi.fn().mockResolvedValue(BEGIN), fetchSession, loadLegacy: vi.fn() },
      () => true,
    );
    expect(entry).toBeNull();
    expect(fetchSession).not.toHaveBeenCalled();
  });
});

describe('beginSessionOnce — StrictMode / re-render', () => {
  it('hai lời gọi đang bay của cùng buổi ⇒ MỘT request', async () => {
    let resolve!: (value: PracticeSessionBeginResponse) => void;
    const begin = vi.fn(() => new Promise<PracticeSessionBeginResponse>((r) => { resolve = r; }));

    const first = beginSessionOnce('s-1', begin);
    const second = beginSessionOnce('s-1', begin);
    resolve(BEGIN);

    await expect(first).resolves.toMatchObject({ begin: BEGIN });
    await expect(second).resolves.toMatchObject({ begin: BEGIN });
    expect(begin).toHaveBeenCalledTimes(1);
  });

  it('đã xong thì lần vào phòng sau gọi lại (lấy serverNow mới)', async () => {
    const begin = vi.fn().mockResolvedValue(BEGIN);
    await beginSessionOnce('s-1', begin);
    await beginSessionOnce('s-1', begin);
    expect(begin).toHaveBeenCalledTimes(2);
  });
});
