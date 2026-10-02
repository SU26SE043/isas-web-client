import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { ExamRoomEntryFailure } from '../../hooks/enterExamRoom';

const MESSAGE_KEY: Record<ExamRoomEntryFailure, string> = {
  questions_locked: 'practice.room.entryError.questionsLocked',
  session_ended: 'practice.room.entryError.sessionEnded',
  failed: 'practice.room.entryError.failed',
};

/**
 * ATT1-F4 — không vào được phòng thi B2B: đề vẫn khoá sau 2 lần begin, buổi đã kết thúc (409
 * SESSION_ENDED) hoặc begin/GET lỗi. Thay cả phòng (không hiện câu hỏi rỗng); buổi đã kết thúc thì
 * không có nút tải lại — chỉ quay về.
 */
export function ExamRoomEntryErrorPanel({ reason, backPath }: { reason: ExamRoomEntryFailure; backPath: string }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center surface-base px-4">
      <section role="alert" className="frame-satin w-full max-w-md rounded-2xl bg-surface-raised p-6 text-center">
        <AlertCircle className="mx-auto size-8 text-error" aria-hidden />
        <h1 className="mt-3 text-lg font-semibold text-foreground">{t('practice.room.entryError.title')}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(MESSAGE_KEY[reason])}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          {reason === 'session_ended' ? null : (
            <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
              {t('practice.room.entryError.reload')}
            </button>
          )}
          <button type="button" className="btn-primary" onClick={() => navigate(backPath, { replace: true })}>
            {t('practice.room.entryError.back')}
          </button>
        </div>
      </section>
    </div>
  );
}
