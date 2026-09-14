import { readCampaignInterviewSession } from '@/features/campaigns/utils/campaignInterviewSession';
import { getPracticeSession } from '../services/b2cPracticeSession.service';
import type { PracticeSessionResponse } from '../types/b2cPracticeSession.types';

type Deps = {
  readMarker: typeof readCampaignInterviewSession;
  fetchSession: typeof getPracticeSession;
};

/**
 * Nạp buổi cho phòng thi. Buổi B2B có marker trong sessionStorage (ghi lúc Start) nhưng marker chỉ chứa
 * bộ câu GỐC lúc bắt đầu và KHÔNG có câu trả lời ⇒ dùng nó làm nguồn sự thật thì "Tiếp tục" buổi dở sẽ
 * hiện mọi câu như chưa trả lời và bắt đầu lại từ câu 1 (lỗi đo được trên dev 2026-09-12). Server mới
 * biết câu nào đã nộp và câu đào sâu nào đã sinh ⇒ hỏi server trước; marker chỉ là dự phòng khi server lỗi.
 */
export async function loadRoomSession(
  sessionId: string,
  deps: Deps = { readMarker: readCampaignInterviewSession, fetchSession: getPracticeSession },
): Promise<PracticeSessionResponse> {
  const marker = deps.readMarker(sessionId);
  if (!marker) return deps.fetchSession(sessionId);
  try {
    return await deps.fetchSession(sessionId);
  } catch {
    return {
      id: sessionId,
      status: 'InProgress',
      questions: marker.questions.map((question) => ({ ...question, kind: 'question' as const })),
      answers: [],
      result: null,
    };
  }
}
