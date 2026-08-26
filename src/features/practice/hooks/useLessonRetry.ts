import { useCallback, useState } from 'react';
import { retryLearningLessonPractice } from '../utils/launchLearningInterviewPractice';

export type LessonRetryErrorCode = 'insufficient_credits' | 'generic';

interface UseLessonRetryInput {
  roadmapId: string;
  onStarted: (sessionId: string, lessonId: string) => void;
  onCreditConsumed?: () => void;
}

/**
 * Luồng luyện LẠI một bài học.
 *
 * Bất biến: `ask()` chỉ MỞ hộp thoại, không bao giờ gọi API — thao tác này tiêu
 * credit thật nên phải có một lần xác nhận của người dùng chen vào giữa.
 */
export function useLessonRetry({ roadmapId, onStarted, onCreditConsumed }: UseLessonRetryInput) {
  const [target, setTarget] = useState<{ lessonId: string; title: string } | null>(null);
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<LessonRetryErrorCode | null>(null);

  const ask = useCallback((lessonId: string, title: string) => {
    setErrorCode(null);
    setTarget({ lessonId, title });
  }, []);

  const dismiss = useCallback(() => {
    // Không cho đóng hộp thoại khi request đang bay: đóng rồi bấm lại là hai buổi.
    setPendingLessonId((pending) => {
      if (!pending) setTarget(null);
      return pending;
    });
  }, []);

  const confirm = useCallback(async () => {
    if (!target || pendingLessonId) return;
    const current = target;
    setPendingLessonId(current.lessonId);
    setErrorCode(null);
    try {
      const result = await retryLearningLessonPractice({
        roadmapId,
        lessonId: current.lessonId,
        title: current.title,
        onCreditConsumed,
      });
      if (!result.ok) {
        setPendingLessonId(null);
        setTarget(null);
        // 402 có lối đi riêng (dẫn tới trang nạp credit) — không gộp vào lỗi chung.
        setErrorCode(result.code === 'insufficient_credits' ? 'insufficient_credits' : 'generic');
        return;
      }
      setTarget(null);
      onStarted(result.session.sessionId, current.lessonId);
    } catch {
      setPendingLessonId(null);
      setTarget(null);
      setErrorCode('generic');
    }
  }, [onCreditConsumed, onStarted, pendingLessonId, roadmapId, target]);

  return {
    /** Bài đang chờ server tạo buổi — dùng để khoá đúng nút đó trong danh sách. */
    pendingLessonId,
    ask,
    /** Gói sẵn props của hộp thoại để trang chi tiết không phải tự nối dây. */
    dialogProps: {
      open: target !== null,
      lessonTitle: target?.title ?? '',
      isPending: pendingLessonId !== null,
      errorCode,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
      onConfirm: () => {
        void confirm();
      },
    },
  };
}
