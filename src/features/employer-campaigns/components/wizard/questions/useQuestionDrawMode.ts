import { useEffect } from 'react';
import type { CampaignQuestion } from '../../../types/campaignManagement.types';

interface UseQuestionDrawModeArgs {
  questions: CampaignQuestion[];
  questionsPerSession?: number | null;
  onToggleRequired: (id: string, isRequired: boolean) => void;
  onQuestionsPerSession: (count: number | null) => void;
}

/**
 * Chế độ "ai cũng làm trọn bộ" ↔ "rút thăm K câu" của bước 4 — tách khỏi `CampaignQuestionsStep` (đã chạm trần
 * 250 dòng sau SC2 · T9), hành vi giữ NGUYÊN: effect ép mọi câu thành cố định khi không rút thăm, kẹp K không
 * vượt rổ; `selectMode` thả câu ra rổ khi chuyển sang rút thăm với rổ rỗng (không thì K kẹt ở 0, kẹt cứng từ
 * bước 5 vì backend từ chối 0).
 */
export function useQuestionDrawMode({ questions, questionsPerSession, onToggleRequired, onQuestionsPerSession }: UseQuestionDrawModeArgs) {
  const drawMode = questionsPerSession != null;
  const fixedCount = questions.filter((question) => question.isRequired).length;
  const poolCount = questions.length - fixedCount;
  const drawCount = Math.min(Math.max(questionsPerSession ?? 0, 0), poolCount);
  const totalPerCandidate = drawMode ? fixedCount + drawCount : questions.length;
  useEffect(() => {
    if (!drawMode && poolCount > 0) {
      questions.forEach((question) => {
        if (!question.isRequired) onToggleRequired(question.id, true);
      });
    }
    if (drawMode && questionsPerSession != null && questionsPerSession > poolCount) {
      onQuestionsPerSession(poolCount);
    }
  }, [drawMode, onQuestionsPerSession, onToggleRequired, poolCount, questions, questionsPerSession]);

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
        onQuestionsPerSession(questions.length);
        return;
      }
      onQuestionsPerSession(Math.min(Math.max(questionsPerSession ?? poolCount, 1), poolCount));
      return;
    }
    questions.forEach((question) => {
      if (!question.isRequired) onToggleRequired(question.id, true);
    });
    onQuestionsPerSession(null);
  };

  return { drawMode, fixedCount, poolCount, drawCount, totalPerCandidate, selectMode };
}
