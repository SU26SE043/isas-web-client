import { useEffect } from 'react';
import type { CampaignQuestion } from '../../../types/campaignManagement.types';
import { drawBounds, drawFromK, kFromDraw, normalizeK, questionsReceived } from '../../../utils/questionDrawCount';

interface UseQuestionDrawModeArgs {
  questions: CampaignQuestion[];
  questionsPerSession?: number | null;
  onToggleRequired: (id: string, isRequired: boolean) => void;
  onQuestionsPerSession: (count: number | null) => void;
}

/**
 * Chế độ "ai cũng làm trọn bộ" ↔ "bốc từ rổ". K luôn là tổng câu mỗi ứng viên;
 * chỉ ô Bốc nhập/hiển thị phần lấy từ rổ.
 */
export function useQuestionDrawMode({ questions, questionsPerSession, onToggleRequired, onQuestionsPerSession }: UseQuestionDrawModeArgs) {
  const drawMode = questionsPerSession != null;
  const fixedCount = questions.filter((question) => question.isRequired).length;
  const poolCount = questions.length - fixedCount;
  const drawCount = drawFromK(questionsPerSession ?? questions.length, fixedCount, questions.length);
  const totalPerCandidate = questionsReceived(questionsPerSession ?? null, fixedCount, questions.length);
  const { min: drawMin, max: drawMax } = drawBounds(fixedCount, questions.length);
  useEffect(() => {
    if (!drawMode && poolCount > 0) {
      questions.forEach((question) => {
        if (!question.isRequired) onToggleRequired(question.id, true);
      });
    }
    if (drawMode && questionsPerSession != null) {
      const normalized = normalizeK(questionsPerSession, fixedCount, questions.length);
      if (normalized !== questionsPerSession) onQuestionsPerSession(normalized);
    }
  }, [drawMode, fixedCount, onQuestionsPerSession, onToggleRequired, poolCount, questions, questionsPerSession]);

  const setDrawCount = (draw: number) => {
    onQuestionsPerSession(kFromDraw(draw, fixedCount, questions.length));
  };

  const selectMode = (nextDrawMode: boolean) => {
    if (nextDrawMode) {
      // Ở chế độ "ai cũng làm trọn bộ", effect trên ép MỌI câu thành cố định ⇒ rổ rỗng.
      // Chuyển sang rút thăm mà không thả câu nào ra rổ thì số bốc kẹt ở 0, ô nhập bị
      // max={0} nên không nâng lên được, và backend từ chối 0 ⇒ kẹt cứng từ bước 5 trở đi.
      if (poolCount === 0) {
        if (questions.length === 0) return;
        questions.forEach((question) => {
          if (question.isRequired) onToggleRequired(question.id, false);
        });
        onQuestionsPerSession(normalizeK(questions.length, 0, questions.length));
        return;
      }
      onQuestionsPerSession(normalizeK(questionsPerSession ?? questions.length, fixedCount, questions.length));
      return;
    }
    questions.forEach((question) => {
      if (!question.isRequired) onToggleRequired(question.id, true);
    });
    onQuestionsPerSession(null);
  };

  return { drawMode, fixedCount, drawCount, drawMin, drawMax, totalPerCandidate, setDrawCount, selectMode };
}
