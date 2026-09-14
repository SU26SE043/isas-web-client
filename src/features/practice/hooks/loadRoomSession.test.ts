import { describe, expect, it, vi } from 'vitest';
import type { StoredCampaignInterview } from '@/features/campaigns/utils/campaignInterviewSession';
import { loadRoomSession } from './loadRoomSession';
import type { PracticeSessionResponse } from '../types/b2cPracticeSession.types';

const marker: StoredCampaignInterview = {
  mode: 'b2b-campaign',
  campaignId: 'camp-1',
  sessionId: 'sess-1',
  antiCheatEnabled: true,
  faceEnrollRequired: false,
  adaptiveEnabled: true,
  deadlineAt: null,
  questions: [
    { id: 'q-1', orderNo: 1, content: 'Câu 1', timeLimitSec: 120 },
    { id: 'q-2', orderNo: 5, content: 'Câu 2', timeLimitSec: 120 },
  ],
  startedAt: '2026-09-12T00:00:00Z',
};

const serverSession: PracticeSessionResponse = {
  id: 'sess-1',
  status: 'InProgress',
  questions: [
    { id: 'q-1', orderNo: 1, content: 'Câu 1', timeLimitSec: 120, kind: 'question' },
    { id: 'q-1b', orderNo: 2, content: 'Đào sâu', timeLimitSec: 120, kind: 'follow_up' },
    { id: 'q-2', orderNo: 5, content: 'Câu 2', timeLimitSec: 120, kind: 'question' },
  ],
  answers: [{ questionId: 'q-1', answerId: 'a-1', status: 'Scored' }],
  result: null,
};

describe('loadRoomSession', () => {
  it('có marker B2B vẫn hỏi server — marker không có câu trả lời lẫn câu đào sâu', async () => {
    const fetchSession = vi.fn().mockResolvedValue(serverSession);
    const result = await loadRoomSession('sess-1', { readMarker: () => marker, fetchSession });

    expect(fetchSession).toHaveBeenCalledWith('sess-1');
    expect(result).toBe(serverSession);
    expect(result.answers).toHaveLength(1);
    expect(result.questions.map((q) => q.id)).toEqual(['q-1', 'q-1b', 'q-2']);
  });

  it('server lỗi ⇒ rơi về marker (answers rỗng, câu gốc gắn kind=question)', async () => {
    const fetchSession = vi.fn().mockRejectedValue(new Error('network'));
    const result = await loadRoomSession('sess-1', { readMarker: () => marker, fetchSession });

    expect(result).toMatchObject({ id: 'sess-1', status: 'InProgress', answers: [], result: null });
    expect(result.questions).toEqual([
      { id: 'q-1', orderNo: 1, content: 'Câu 1', timeLimitSec: 120, kind: 'question' },
      { id: 'q-2', orderNo: 5, content: 'Câu 2', timeLimitSec: 120, kind: 'question' },
    ]);
  });

  it('không marker (B2C) ⇒ hỏi server, lỗi thì ném ra cho hook xử lý', async () => {
    const fetchSession = vi.fn().mockResolvedValue(serverSession);
    await expect(loadRoomSession('sess-1', { readMarker: () => null, fetchSession })).resolves.toBe(serverSession);

    const failing = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(loadRoomSession('sess-1', { readMarker: () => null, fetchSession: failing })).rejects.toThrow('boom');
  });
});
