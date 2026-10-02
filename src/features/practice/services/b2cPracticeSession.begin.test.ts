import { AxiosError, AxiosHeaders } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { beginPracticeSession, getPracticeSession } from './b2cPracticeSession.service';
import { getPracticeApiErrorCode } from '../utils/practiceApiErrorCode';

const mockMode = { practice: false };

vi.mock('@/shared/mock', () => ({
  mockDelay: vi.fn(),
  usesMockData: () => mockMode.practice,
}));

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

const SESSION_ID = '685d10e7-af3c-4971-a207-54abfb6d7dee';

function httpError(status: number, data: unknown) {
  return new AxiosError('boom', String(status), undefined, undefined, {
    status,
    statusText: String(status),
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockMode.practice = false;
});

describe('beginPracticeSession — [I1]', () => {
  it('POST …/sessions/{id}/begin không body, parse đủ 5 khoá', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        sessionId: SESSION_ID,
        beganAt: '2026-10-02T03:00:00Z',
        deadline: '2026-10-02T03:30:00Z',
        serverNow: '2026-10-02T03:00:01Z',
        durationMinutes: 30,
      },
    });

    const result = await beginPracticeSession(SESSION_ID);

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    const [url, body] = vi.mocked(apiClient.post).mock.calls[0]!;
    expect(url).toBe(`/api/v1/interview/practice/sessions/${SESSION_ID}/begin`);
    expect(body).toBeUndefined();
    expect(result).toEqual({
      sessionId: SESSION_ID,
      beganAt: '2026-10-02T03:00:00Z',
      deadline: '2026-10-02T03:30:00Z',
      serverNow: '2026-10-02T03:00:01Z',
      durationMinutes: 30,
    });
  });

  it('buổi không tính giờ: beganAt / durationMinutes / deadline null giữ null', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { sessionId: SESSION_ID, beganAt: null, deadline: null, serverNow: '2026-10-02T03:00:01Z', durationMinutes: null },
    });
    await expect(beginPracticeSession(SESSION_ID)).resolves.toEqual({
      sessionId: SESSION_ID,
      beganAt: null,
      deadline: null,
      serverNow: '2026-10-02T03:00:01Z',
      durationMinutes: null,
    });
  });

  it('404 (Backend cũ) ⇒ null', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(httpError(404, { error: 'Not found' }));
    await expect(beginPracticeSession(SESSION_ID)).resolves.toBeNull();
  });

  it.each([403, 500])('%i ⇒ ném nguyên (KHÔNG null — chỉ 404 mới là Backend cũ)', async (status) => {
    const error = httpError(status, { error: 'x' });
    vi.mocked(apiClient.post).mockRejectedValue(error);
    await expect(beginPracticeSession(SESSION_ID)).rejects.toBe(error);
  });

  it('409 SESSION_ENDED ném nguyên — code đọc được', async () => {
    const error = httpError(409, { code: 'SESSION_ENDED', error: 'Buổi đã kết thúc' });
    vi.mocked(apiClient.post).mockRejectedValue(error);
    await expect(beginPracticeSession(SESSION_ID)).rejects.toBe(error);
    expect(getPracticeApiErrorCode(error)).toBe('SESSION_ENDED');
    expect(getPracticeApiErrorCode(httpError(409, { data: { code: 'SESSION_ENDED' } }))).toBe('SESSION_ENDED');
    expect(getPracticeApiErrorCode(new Error('x'))).toBeNull();
  });

  it('chế độ mock / mã buổi không phải GUID ⇒ null, không gọi API', async () => {
    mockMode.practice = true;
    await expect(beginPracticeSession(SESSION_ID)).resolves.toBeNull();
    mockMode.practice = false;
    await expect(beginPracticeSession('campaign-e2e-1')).resolves.toBeNull();
    expect(apiClient.post).not.toHaveBeenCalled();
  });
});

describe('getPracticeSession — [I2] bốn khoá mới', () => {
  it('đọc durationMinutes / beganAt / serverNow / questionsLocked', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        id: SESSION_ID,
        status: 'InProgress',
        questions: [{ id: 'q-1', orderNo: 1, content: '', timeLimitSec: 120, kind: 'Seed' }],
        answers: [],
        durationMinutes: 30,
        beganAt: null,
        serverNow: '2026-10-02T03:00:00Z',
        questionsLocked: true,
      },
    });

    const session = await getPracticeSession(SESSION_ID);

    expect(session).toMatchObject({
      durationMinutes: 30,
      beganAt: null,
      serverNow: '2026-10-02T03:00:00Z',
      questionsLocked: true,
    });
  });

  it('Backend cũ (khoá vắng) ⇒ undefined / false — hành vi cũ', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { id: SESSION_ID, status: 'InProgress', questions: [], answers: [] },
    });

    const session = await getPracticeSession(SESSION_ID);

    expect(session.durationMinutes).toBeUndefined();
    expect(session.beganAt).toBeUndefined();
    expect(session.serverNow).toBeUndefined();
    expect(session.questionsLocked).toBe(false);
  });
});
