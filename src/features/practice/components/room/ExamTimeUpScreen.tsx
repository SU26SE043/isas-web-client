import { useEffect, useRef } from 'react';
import { Check, Info, Loader2, Timer } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { ExamTimeUpStatus } from '../../hooks/useExamTimeUp';

interface ExamTimeUpScreenProps {
  status: ExamTimeUpStatus;
  answered: number;
  total: number;
  onBack: () => void;
}

const STATUS_KEY: Record<ExamTimeUpStatus, string> = {
  saving: 'practice.examTimeUp.saving',
  submitting: 'practice.examTimeUp.submitting',
  submitted: 'practice.examTimeUp.submitted',
  submitFailed: 'practice.examTimeUp.autoSubmit',
};

function StatusIcon({ status }: { status: ExamTimeUpStatus }) {
  if (status === 'submitted') return <Check className="size-4 shrink-0 text-success" aria-hidden />;
  if (status === 'submitFailed') return <Info className="size-4 shrink-0 text-info" aria-hidden />;
  return <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />;
}

/**
 * ATT1-F5 — màn "Đã hết giờ làm bài": toàn màn, KHÔNG đóng được (không nút đóng, Escape / bấm nền không làm gì),
 * nằm TRÊN mọi overlay của phòng thi (vi phạm z-50, toàn màn hình z-110, đếm ngược z-100).
 * Nộp bài lỗi KHÔNG hiện "nộp thất bại" — server tự chốt buổi sau hạn + 30 giây, nên chỉ nói hệ thống sẽ tự nộp.
 * Nút về trang chiến dịch khoá trong lúc lưu câu cuối (rời trang lúc đó là mất đoạn ghi âm đang chốt).
 */
export function ExamTimeUpScreen({ status, answered, total, onBack }: ExamTimeUpScreenProps) {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[130] grid place-items-center bg-black/90 px-4 backdrop-blur-sm" data-testid="exam-time-up-screen">
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="exam-time-up-title"
        aria-describedby="exam-time-up-summary"
        className="frame-satin w-full max-w-md rounded-2xl bg-surface-raised p-6 text-center shadow-2xl outline-none"
      >
        <div className="mx-auto grid size-12 place-items-center rounded-full border border-satin bg-surface-overlay">
          <Timer className="size-6 text-foreground" aria-hidden />
        </div>
        <h1 id="exam-time-up-title" className="mt-4 text-xl font-semibold text-foreground">
          {t('practice.examTimeUp.title')}
        </h1>
        <p
          role="status"
          aria-live="polite"
          data-testid="exam-time-up-status"
          data-status={status}
          className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-foreground"
        >
          <StatusIcon status={status} />
          <span data-testid="exam-time-up-status-text">{t(STATUS_KEY[status])}</span>
        </p>
        <p id="exam-time-up-summary" data-testid="exam-time-up-summary" className="mt-3 text-sm leading-6 text-muted-foreground">
          {t('practice.examTimeUp.summary')
            .replace('{answered}', String(answered))
            .replace('{total}', String(total))}
        </p>
        <button
          type="button"
          className="btn-primary mt-6 w-full"
          disabled={status === 'saving'}
          onClick={onBack}
        >
          {t('practice.examTimeUp.back')}
        </button>
      </section>
    </div>
  );
}
